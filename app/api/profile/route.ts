import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

const Schema = z.object({
  name: z.string().min(1).max(120),
});

/**
 * PATCH /api/profile — update the signed-in user's display name.
 *
 * Email changes go through `/api/profile/email` (verification flow).
 * Password changes will get their own endpoint when we add the
 * "change password" form.
 */
export async function PATCH(req: Request) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in to update profile." }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  const { name } = parsed.data;

  if (!prisma) return NextResponse.json({ ok: true, name });

  const updated = await prisma.user.update({
    where: { id: me.id },
    data: { name },
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json(updated);
}
