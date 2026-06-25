/**
 * Sliding-window rate limiter, backed by an in-memory Map.
 *
 * Works fine for early-stage Vercel deployments — most consecutive requests
 * from a single visitor land on the same Lambda warm instance, so the limit
 * works in practice. For real horizontal scale, swap the `store` for Upstash
 * Redis / Vercel KV — the call sites won't change.
 *
 * Each consumer calls:
 *
 *   const { ok, retryAfter } = await rateLimit({
 *     key: `auth:${ip}`,
 *     max: 5,
 *     windowMs: 15 * 60_000,
 *   });
 *
 * `ok=false` means the caller should respond with 429 + Retry-After header.
 */

interface Bucket {
  hits: number[];
}

interface RateLimitOptions {
  /** Unique bucket id — combine the route name with the IP/userId/email. */
  key: string;
  /** Max hits allowed in the window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds
  limit: number;
}

const store = new Map<string, Bucket>();

// Background sweep: drop entries that have aged out, so the map doesn't
// grow unbounded across days of traffic. Runs every 5 minutes.
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const cutoff = Date.now() - 60 * 60_000; // 1h
      for (const [key, bucket] of store.entries()) {
        const newest = bucket.hits[bucket.hits.length - 1] ?? 0;
        if (newest < cutoff) store.delete(key);
      }
    },
    5 * 60_000
  ).unref?.();
}

export async function rateLimit({
  key,
  max,
  windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();
  const cutoff = now - windowMs;

  let bucket = store.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    store.set(key, bucket);
  }

  // Prune timestamps that fell out of the window.
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= max) {
    const oldest = bucket.hits[0];
    const retryAfterMs = Math.max(0, windowMs - (now - oldest));
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil(retryAfterMs / 1000),
      limit: max,
    };
  }

  bucket.hits.push(now);
  return {
    ok: true,
    remaining: max - bucket.hits.length,
    retryAfter: 0,
    limit: max,
  };
}

/**
 * Pull the client IP out of standard reverse-proxy headers. Vercel always
 * sets x-forwarded-for; we also accept Cloudflare and Fastly headers in
 * case the site is fronted by them later.
 */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;
  return "0.0.0.0";
}

/**
 * Convenience: enforce a rate limit and immediately return a NextResponse
 * 429 when it trips. Pass the result if you want to add limit headers to
 * a success response.
 */
export function rateLimitedResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again in a moment.",
    }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(result.retryAfter),
        "x-ratelimit-limit": String(result.limit),
        "x-ratelimit-remaining": "0",
      },
    }
  );
}
