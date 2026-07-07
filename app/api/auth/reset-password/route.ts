import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  getClientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

const Schema = z.object({
  token: z.string().min(10).max(128),
  password: z.string().min(6).max(128),
});

export async function POST(req: Request) {
  // 10 reset attempts per IP per 15 min — generous enough for legitimate
  // retries, tight enough to slow brute-forcing a 256-bit token.
  const ip = getClientIp(req);
  const limit = await rateLimit({
    key: `reset:${ip}`,
    max: 10,
    windowMs: 15 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { token, password } = parsed.data;

  if (!prisma) {
    return NextResponse.json({ ok: true }); // mock mode
  }

  const row = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!row || row.used || row.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This reset link is no longer valid." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
