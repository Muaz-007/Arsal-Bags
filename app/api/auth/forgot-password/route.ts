import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { sendPasswordReset } from "@/lib/email";

const Schema = z.object({ email: z.string().email() });

const ONE_HOUR_MS = 60 * 60 * 1000;
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

/**
 * POST /api/auth/forgot-password
 *
 * Always returns 200 — leaking whether an email exists is a fingerprinting
 * vector. We only actually create a token + send a mail when the email is
 * known.
 */
export async function POST(req: Request) {
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
    void sendPasswordReset(email, link);
  }

  return NextResponse.json({ ok: true });
}
