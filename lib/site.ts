/**
 * Single source of truth for the public site URL.
 *
 * Order of precedence:
 *   1. NEXT_PUBLIC_SITE_URL — explicit override (set on Vercel to the prod domain)
 *   2. VERCEL_URL — auto-set by Vercel per deployment (previews get their own URL)
 *   3. NEXTAUTH_URL — legacy fallback; already set for auth
 *   4. localhost — dev fallback
 *
 * All URL-generating code (sitemap, robots, metadata, JSON-LD) should read
 * from here so we don't accumulate divergent fallbacks.
 */
export const SITE_URL = (() => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
})();

export const SITE_NAME = "BagsArt";
export const SITE_DESCRIPTION =
  "BagsArt is a small leather goods studio in Lahore. Premium quality bags in full-grain leather — made in small batches.";
