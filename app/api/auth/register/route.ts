import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendVerificationCode } from "@/lib/email";
import {
  getClientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

const Schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(200),
  password: z.string().min(6).max(128),
});

const CODE_TTL_MS = 15 * 60_000;

function generateCode(): string {
  // Cryptographic random over the 000000-999999 space, zero-padded to 6.
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

/**
 * POST /api/auth/register
 *
 * Creates a customer account with `emailVerified = null`, generates a
 * fresh 6-digit code, stores its bcrypt hash on `EmailVerificationCode`,
 * and emails the code to the address the user supplied.
 *
 * The client is expected to redirect to `/auth/verify-signup?email=...`
 * on a 201 with `{ needsVerification: true }`. Signing in with the new
 * account is blocked (see `lib/auth.ts`) until the code is confirmed.
 */
export async function POST(req: Request) {
  // 5 signups per IP per 15 minutes.
  const ip = getClientIp(req);
  const limit = await rateLimit({
    key: `register:${ip}`,
    max: 5,
    windowMs: 15 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }
  const { name, email: rawEmail, password } = parsed.data;
  const email = rawEmail.toLowerCase().trim();

  if (!prisma) {
    // Mock mode: pretend verification is required so the client flow works
    // end-to-end without a real DB. No email actually goes out.
    return NextResponse.json({ needsVerification: true, email });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "customer" },
    select: { id: true, name: true, email: true },
  });

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  await prisma.emailVerificationCode.upsert({
    where: { userId: user.id },
    update: {
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
      attempts: 0,
    },
    create: {
      userId: user.id,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  // Await so Vercel's serverless runtime doesn't kill the SMTP request when
  // the response returns. Failures are swallowed inside sendEmail — a
  // stuck inbox never rolls back a signup — but the response still says
  // "needsVerification" so the client can offer a resend.
  await sendVerificationCode(user.email, user.name, code);

  return NextResponse.json(
    { needsVerification: true, email: user.email },
    { status: 201 }
  );
}
