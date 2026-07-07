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
});

const CODE_TTL_MS = 15 * 60_000;

function generateCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

/**
 * Generate a short, easy-to-type but random password for the guest account
 * we'll auto-create. Format: two 4-character blocks separated by a hyphen,
 * drawn from a Base32-ish alphabet (letters + digits, no lookalikes like
 * `0` / `O` / `1` / `l`). Example: `K7QP-3XM9`.
 */
function generatePassword(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint32Array(8);
  crypto.getRandomValues(bytes);
  const pick = (i: number) => alphabet[bytes[i] % alphabet.length];
  return `${pick(0)}${pick(1)}${pick(2)}${pick(3)}-${pick(4)}${pick(5)}${pick(6)}${pick(7)}`;
}

/**
 * POST /api/checkout/verify-init
 *
 * Kicks off the guest-checkout verification flow: creates a customer row
 * behind the scenes (or reuses a stale unverified one), stashes a random
 * password we'll email later, and mails a 6-digit code the customer types
 * into the modal on the checkout page.
 *
 * Returning users (with a verified account) are asked to sign in instead —
 * we don't want to silently reset their password.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();
  const name = parsed.data.name.trim();

  // 5 code sends per IP+email per hour. Protects both the transactional
  // email budget and third parties from being spammed with codes they
  // didn't ask for.
  const limit = await rateLimit({
    key: `checkout-verify-init:${ip}:${email}`,
    max: 5,
    windowMs: 60 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  if (!prisma) {
    // Mock mode: pretend a code went out so the modal shows up locally.
    return NextResponse.json({ ok: true, email });
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, emailVerified: true },
  });

  // Case A: verified account with a password → real returning customer.
  // Redirect them to sign-in instead of silently taking over the account.
  if (existing?.passwordHash && existing.emailVerified) {
    return NextResponse.json(
      {
        error:
          "This email already has an account. Please sign in first to keep your order tied to it.",
        code: "SIGN_IN_REQUIRED",
      },
      { status: 409 }
    );
  }

  // Case B: Google-only account (no password). Ask them to use Google.
  if (existing && !existing.passwordHash) {
    return NextResponse.json(
      {
        error:
          "This email is linked to a Google account. Please sign in with Google to checkout.",
        code: "SIGN_IN_REQUIRED",
      },
      { status: 409 }
    );
  }

  // Case C: no user yet (or unverified credentials stub). Generate a fresh
  // password + code, upsert everything, and mail the code.
  const plaintextPassword = generatePassword();
  const passwordHash = await bcrypt.hash(plaintextPassword, 12);

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { name, passwordHash },
        select: { id: true, name: true, email: true },
      })
    : await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "customer",
        },
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
      guestPasswordDisplay: plaintextPassword,
    },
    create: {
      userId: user.id,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
      guestPasswordDisplay: plaintextPassword,
    },
  });

  // Await so Vercel's serverless runtime doesn't kill the SMTP request
  // when we return. Failures are swallowed inside sendEmail.
  await sendVerificationCode(user.email, user.name, code);

  return NextResponse.json({ ok: true, email: user.email });
}
