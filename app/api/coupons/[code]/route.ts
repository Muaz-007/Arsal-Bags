import { NextResponse } from "next/server";
import { COUPONS } from "@/lib/mock-data";

export async function GET(
  _: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code.toUpperCase();
  const coupon = COUPONS.find((c) => c.code === code && c.active);
  if (!coupon) {
    return NextResponse.json({ error: "Invalid or expired" }, { status: 404 });
  }
  return NextResponse.json(coupon);
}
