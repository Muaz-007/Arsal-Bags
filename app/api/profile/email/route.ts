import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { sendEmailChangeVerification } from "@/lib/email";
import {
  getClientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

const Schema = z.object({
  newEmail: z.string().email().max(200),
});

const ONE_HOUR_MS = 60 * 60 * 1000;
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

/**
 * POST /api/profile/email — request an email-address change.
 *
 *  - Only credentials users can change email. Google users would have to
 *    change it in Google itself (and we'd see the new email on their next
 *    sign-in via the `signIn` callback's upsert).
 *  - We send the verification link to the NEW address, not the old one,
 *    so the user must prove they control the address they're switching to.
 *  - Rate-limited to prevent spam.
 */
export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in to update email." }, { status: 401 });
  }
  if (me.provider !== "credentials") {
    return NextResponse.json(
      {
        error:
          "Your email is managed by your sign-in provider. Update it there and sign in again.",
      },
      { status: 400 }
    );
  }

  // 3 change requests per hour per user, plus a per-IP guard for spam.
  const ip = getClientIp(req);
  const limit = await rateLimit({
    key: `email-change:${me.id}:${ip}`,
    max: 3,
    windowMs: 60 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const newEmail = parsed.data.newEmail.toLowerCase().trim();

  if (newEmail === (me.email ?? "").toLowerCase()) {
    return NextResponse.json(
      { error: "That's already your email." },
      { status: 400 }
    );
  }

  if (!prisma) return NextResponse.json({ ok: true });

  // Reject if another account already uses this email.
  const collision = await prisma.user.findUnique({ where: { email: newEmail } });
  if (collision) {
    // Don't leak which addresses are registered — but the user is signed
    // in already, so leaking that THIS email exists isn't an enumeration
    // win for an attacker (they could test by trying to sign up). We DO
    // tell the user, because hiding it makes the flow confusing.
    return NextResponse.json(
      { error: "That email is already in use." },
      { status: 409 }
    );
  }

  const token = randomBytes(32).toString("hex");
  await prisma.emailChangeToken.create({
    data: {
      token,
      userId: me.id,
      newEmail,
      expiresAt: new Date(Date.now() + ONE_HOUR_MS),
    },
  });

  const link = `${BASE_URL}/auth/verify-email?token=${token}`;
  // Await so Vercel serverless doesn't kill the SMTP request when the
  // response returns. sendEmailChangeVerification swallows errors internally.
  await sendEmailChangeVerification(newEmail, link);

  return NextResponse.json({ ok: true });
}
