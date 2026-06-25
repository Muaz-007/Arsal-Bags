import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

const PatchSchema = z
  .object({
    label: z.string().max(40).nullable().optional(),
    name: z.string().min(1).max(120).optional(),
    address: z.string().min(1).max(200).optional(),
    city: z.string().min(1).max(80).optional(),
    country: z.string().min(1).max(80).optional(),
    postal: z.string().min(1).max(20).optional(),
    phone: z.string().max(40).nullable().optional(),
    isDefault: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "No changes",
  });

/**
 * Always look up the address scoped to the current user — never trust an
 * `id` alone, or one user could read/write another's addresses.
 */
async function loadOwned(id: string, userId: string) {
  if (!prisma) return null;
  return prisma.savedAddress.findFirst({ where: { id, userId } });
}

/** PATCH /api/addresses/[id] — edit fields and/or flip the default flag. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!prisma) return NextResponse.json({ ok: true });

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const existing = await loadOwned(params.id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      // Make sure no other address keeps the default flag.
      await tx.savedAddress.updateMany({
        where: { userId: user.id, isDefault: true, NOT: { id: params.id } },
        data: { isDefault: false },
      });
    }
    return tx.savedAddress.update({
      where: { id: params.id },
      data: parsed.data,
    });
  });

  return NextResponse.json(updated);
}

/** DELETE /api/addresses/[id]. If we delete the default, promote another. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!prisma) return NextResponse.json({ ok: true });

  const existing = await loadOwned(params.id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.savedAddress.delete({ where: { id: params.id } });
    if (existing.isDefault) {
      const next = await tx.savedAddress.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });
      if (next) {
        await tx.savedAddress.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
