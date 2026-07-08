import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

const PatchSchema = z
  .object({
    type: z.enum(["percent", "fixed"]).optional(),
    value: z.number().positive().max(100000).optional(),
    active: z.boolean().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    // Explicit null clears the cap (unlimited); omit to leave unchanged.
    maxUses: z.number().int().positive().max(1_000_000).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No changes" });

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

/** PATCH /api/admin/coupons/[code] — toggle active / update value / expiry. */
export async function PATCH(
  req: Request,
  { params }: { params: { code: string } }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!prisma) return NextResponse.json({ ok: true });

  const code = params.code.toUpperCase();
  try {
    const updated = await prisma.coupon.update({
      where: { code },
      data: {
        ...parsed.data,
        expiresAt:
          parsed.data.expiresAt === undefined
            ? undefined
            : parsed.data.expiresAt
              ? new Date(parsed.data.expiresAt)
              : null,
        // undefined = don't touch. null = clear the cap. number = set it.
        maxUses:
          parsed.data.maxUses === undefined ? undefined : parsed.data.maxUses,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }
}

/** DELETE /api/admin/coupons/[code]. */
export async function DELETE(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!prisma) return NextResponse.json({ ok: true });

  const code = params.code.toUpperCase();
  try {
    await prisma.coupon.delete({ where: { code } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }
}
