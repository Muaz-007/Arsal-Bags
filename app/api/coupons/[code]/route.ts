import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { COUPONS } from "@/lib/mock-data";

/**
 * GET /api/coupons/[code] — customer-facing coupon lookup.
 *
 * Reads the SAME `Coupon` table admins write to from `/admin/coupons`
 * (via `/api/admin/coupons`), so a code created in the admin panel is
 * immediately valid at checkout. Earlier this endpoint served the mock
 * COUPONS array, which meant admin-created coupons silently failed for
 * customers — a full-round-trip functional bug.
 *
 * Response mirrors the shape the cart store expects:
 * `{ code, type, value, active, expiresAt?, maxUses?, uses }`.
 */
export async function GET(
  _: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code.toUpperCase();

  if (prisma) {
    const row = await prisma.coupon.findUnique({ where: { code } });
    if (!row || !row.active) {
      return NextResponse.json({ error: "Invalid or expired" }, { status: 404 });
    }
    if (row.expiresAt && row.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired" }, { status: 404 });
    }
    if (row.maxUses != null && row.uses >= row.maxUses) {
      return NextResponse.json({ error: "Invalid or expired" }, { status: 404 });
    }
    return NextResponse.json({
      code: row.code,
      type: row.type,
      value: Number(row.value),
      active: row.active,
      expiresAt: row.expiresAt?.toISOString(),
      maxUses: row.maxUses ?? null,
      uses: row.uses,
    });
  }

  // Mock-mode fallback (no DATABASE_URL). Used only in local dev without
  // Neon — production always has prisma configured.
  const coupon = COUPONS.find((c) => c.code === code && c.active);
  if (!coupon) {
    return NextResponse.json({ error: "Invalid or expired" }, { status: 404 });
  }
  return NextResponse.json(coupon);
}
