import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { sendPasswordReset } from "@/lib/email";
import {
  getClientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

const Schema = z.object({ email: z.string().email().max(200) });

const ONE_HOUR_MS = 60 * 60 * 1000;
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

/**
 * POST /api/auth/forgot-password
 *
 * Always returns 200 — leaking whether an email exists is a fingerprinting
 * vector. We only actually create a token + send a mail when the email is
 * known. Rate-limited per IP to prevent enumeration via timing.
 */
export async function POST(req: Request) {
  // 3 reset requests per IP per 15 minutes is plenty for legitimate users.
  const ip = getClientIp(req);
  const limit = await rateLimit({
    key: `forgot:${ip}`,
    max: 3,
    windowMs: 15 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true }); // silent fail
  }
  const email = parsed.data.email.toLowerCase().trim();

  if (!prisma) {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + ONE_HOUR_MS),
      },
    });
    const link = `${BASE_URL}/auth/reset?token=${token}`;
    // Await so Vercel serverless doesn't kill the SMTP request when the
    // response returns. sendPasswordReset swallows errors internally.
    await sendPasswordReset(email, link);
  }

  return NextResponse.json({ ok: true });
}
