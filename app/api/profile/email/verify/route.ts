import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const Schema = z.object({
  token: z.string().min(10).max(128),
});

/**
 * POST /api/profile/email/verify — exchanges the token from the
 * verification link for an actual email swap on the user's account.
 *
 * Idempotent in spirit: each token is one-shot (marked used), expires in
 * 1 hour, and a final collision check ensures we never overwrite an
 * existing user's email.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
  const { token } = parsed.data;

  if (!prisma) return NextResponse.json({ ok: true });

  const row = await prisma.emailChangeToken.findUnique({ where: { token } });
  if (!row || row.used || row.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This link is no longer valid." },
      { status: 400 }
    );
  }

  // Final collision check — someone could have claimed the email in the
  // hour between the request and the click.
  const collision = await prisma.user.findFirst({
    where: { email: row.newEmail, NOT: { id: row.userId } },
  });
  if (collision) {
    return NextResponse.json(
      { error: "That email is already in use." },
      { status: 409 }
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { email: row.newEmail },
    }),
    prisma.emailChangeToken.update({
      where: { token },
      data: { used: true },
    }),
  ]);

  return NextResponse.json({ ok: true, email: row.newEmail });
}
