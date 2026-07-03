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
  email: z.string().email().max(200),
});

const CODE_TTL_MS = 15 * 60_000;

function generateCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

/**
 * POST /api/auth/verify-signup/resend
 *
 * Regenerates the signup verification code and sends a fresh email. Old
 * code is replaced via upsert, so an attacker can't stockpile codes.
 *
 * We always respond 200 { ok: true } — the caller can't learn from the
 * response whether the address is actually pending verification.
 */
export async function POST(req: Request) {
  // 3 resends per IP-per-email per hour. Keeps a rogue actor from
  // triggering bulk mail on someone else's address.
  const ip = getClientIp(req);
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    // Same generic 200 shape as the happy path — see comment above.
    return NextResponse.json({ ok: true });
  }
  const email = parsed.data.email.toLowerCase().trim();

  const limit = await rateLimit({
    key: `verify-resend:${ip}:${email}`,
    max: 3,
    windowMs: 60 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  if (!prisma) return NextResponse.json({ ok: true });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, emailVerified: true },
  });
  // Silent no-op when the address isn't awaiting verification.
  if (!user || user.emailVerified) return NextResponse.json({ ok: true });

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

  await sendVerificationCode(user.email, user.name, code);
  return NextResponse.json({ ok: true });
}
