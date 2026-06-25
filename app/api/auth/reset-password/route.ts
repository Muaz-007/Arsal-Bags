import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const Schema = z.object({
  token: z.string().min(10),
  password: z.string().min(6).max(128),
});

export async function POST(req: Request) {
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

  const passwordHash = await bcrypt.hash(password, 10);
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
