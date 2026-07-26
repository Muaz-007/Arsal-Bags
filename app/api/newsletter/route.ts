import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendNewsletterWelcome } from "@/lib/email";
import { unsubscribeUrl } from "@/lib/newsletter-token";
import { SITE_URL } from "@/lib/site";
import {
  getClientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

const Schema = z.object({
  email: z.string().email().max(200),
  source: z.string().max(40).optional(),
});

/**
 * POST /api/newsletter — subscribe an email to the BagsArt letter.
 * Idempotent: re-subscribing an existing email returns 200 without error.
 * Rate-limited per IP to prevent list bombing.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = await rateLimit({
    key: `newsletter:${ip}`,
    max: 10,
    windowMs: 60 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();
  const source = parsed.data.source ?? "footer";

  // Track whether this address is genuinely new so we only send the
  // welcome email once — re-subscribing an existing address is a common
  // no-op that shouldn't re-fire the welcome.
  let newSubscriber = false;

  if (prisma) {
    try {
      const existing = await prisma.subscriber.findUnique({
        where: { email },
        select: { id: true, active: true },
      });
      newSubscriber = !existing;
      await prisma.subscriber.upsert({
        where: { email },
        update: { active: true },
        create: { email, source, active: true },
      });
    } catch (err) {
      console.error("[newsletter] db error", err);
      // Don't surface DB errors to the user — pretend success so they see
      // the friendly "thanks" toast either way.
    }
  } else {
    console.info("[newsletter/mock] subscribed", email);
    newSubscriber = true;
  }

  // Fire-and-forget welcome email. Failing silently is fine — the row is
  // already saved and the user got their success toast.
  if (newSubscriber) {
    try {
      const link = unsubscribeUrl(email, SITE_URL);
      await sendNewsletterWelcome(email, link);
    } catch (err) {
      console.error("[newsletter] welcome email failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
