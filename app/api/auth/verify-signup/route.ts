import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import {
  getClientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

const Schema = z.object({
  email: z.string().email().max(200),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

const MAX_ATTEMPTS = 5;

/**
 * POST /api/auth/verify-signup
 *
 * Confirms a 6-digit signup code. On success sets `emailVerified = now()`
 * on the user, deletes the code row, and fires the welcome email. From
 * this point login is allowed (see `lib/auth.ts` `authorize`).
 *
 * Failure modes are intentionally opaque — the same generic error covers
 * "no such account", "already verified", "expired", "wrong code", and
 * "too many attempts" — so an attacker can't enumerate account state.
 */
export async function POST(req: Request) {
  // 10 verification attempts per IP per hour — separate bucket from
  // login/register limits so an attacker can't burn either.
  const ip = getClientIp(req);
  const limit = await rateLimit({
    key: `verify-signup:${ip}`,
    max: 10,
    windowMs: 60 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();
  const { code } = parsed.data;

  if (!prisma) {
    // Mock mode: accept any 6-digit code so the UI flow works locally.
    return NextResponse.json({ ok: true });
  }

  const genericError = () =>
    NextResponse.json(
      { error: "That code isn't valid. Try again or request a new one." },
      { status: 400 }
    );

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, emailVerified: true },
  });
  if (!user || user.emailVerified) return genericError();

  const record = await prisma.emailVerificationCode.findUnique({
    where: { userId: user.id },
  });
  if (!record) return genericError();

  if (record.expiresAt < new Date()) {
    // Expired: destroy the code so a stale value can't be brute-forced
    // and force the user to request a fresh one.
    await prisma.emailVerificationCode.delete({ where: { userId: user.id } });
    return genericError();
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    // Too many wrong tries on this code — kill it and force a resend.
    await prisma.emailVerificationCode.delete({ where: { userId: user.id } });
    return genericError();
  }

  const match = await bcrypt.compare(code, record.codeHash);
  if (!match) {
    await prisma.emailVerificationCode.update({
      where: { userId: user.id },
      data: { attempts: { increment: 1 } },
    });
    return genericError();
  }

  // Success: mark verified, drop the code, welcome the user.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationCode.delete({ where: { userId: user.id } }),
  ]);

  await sendWelcomeEmail(user.email, user.name);

  return NextResponse.json({ ok: true });
}
