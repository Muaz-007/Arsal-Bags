import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

const PatchSchema = z.object({
  read: z.boolean(),
});

/** PATCH /api/admin/messages/[id] — toggle read/unread. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!prisma) return NextResponse.json({ ok: true });

  try {
    const updated = await prisma.contactMessage.update({
      where: { id: params.id },
      data: { readAt: parsed.data.read ? new Date() : null },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }
}

/** DELETE /api/admin/messages/[id]. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!prisma) return NextResponse.json({ ok: true });

  try {
    await prisma.contactMessage.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }
}
