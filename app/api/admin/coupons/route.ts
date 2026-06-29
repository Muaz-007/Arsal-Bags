import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

const Schema = z.object({
  code: z.string().min(2).max(40).regex(/^[A-Z0-9_-]+$/, "Use A-Z, 0-9, _ or -"),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive().max(100000),
  active: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

/**
 * POST /api/admin/coupons — create a new coupon code. The code is the
 * primary key, so attempting to create a duplicate returns 409.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Invalid coupon" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const code = data.code.toUpperCase();

  if (!prisma) return NextResponse.json({ ok: true, code });

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json(
      { error: "A coupon with that code already exists." },
      { status: 409 }
    );
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      type: data.type,
      value: data.value,
      active: data.active ?? true,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
  return NextResponse.json(coupon, { status: 201 });
}
