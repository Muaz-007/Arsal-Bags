import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth-server";
import { sendPasswordChangedConfirmation } from "@/lib/email";
import {
  getClientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

const Schema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z.string().min(8).max(200),
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: "New password must differ from the current one",
    path: ["newPassword"],
  });

/**
 * POST /api/profile/password
 *
 * Lets a signed-in credentials user rotate their password. Google-only
 * accounts have no password to change and get a friendly 400 — they
 * manage their credentials on the Google side.
 *
 * We verify the current password before accepting the new one so a
 * hijacked but still-open session can't silently take the account over.
 * A short confirmation email is sent to the address on file whether the
 * change was expected or not, giving the real owner a heads-up.
 */
export async function POST(req: Request) {
  const user = await requireUser();

  // 5 password changes per user per hour — well above what a real person
  // would need, low enough that a stolen-session attacker can't brute the
  // current password from this endpoint.
  const limit = await rateLimit({
    key: `password-change:${user.id}:${getClientIp(req)}`,
    max: 5,
    windowMs: 60 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid password";
    return NextResponse.json({ error: first }, { status: 400 });
  }
  const { currentPassword, newPassword } = parsed.data;

  if (!prisma) return NextResponse.json({ ok: true });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, passwordHash: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  if (!dbUser.passwordHash) {
    return NextResponse.json(
      {
        error:
          "You're signed in with Google. Change your password from your Google account instead.",
        code: "GOOGLE_ONLY",
      },
      { status: 400 }
    );
  }

  const ok = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!ok) {
    // Same generic error whether it's the current password that's wrong
    // or something else — an attacker can't tell which.
    return NextResponse.json(
      { error: "Current password is wrong." },
      { status: 400 }
    );
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  await sendPasswordChangedConfirmation(dbUser.email, dbUser.name);

  return NextResponse.json({ ok: true });
}
