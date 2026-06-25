import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

const Schema = z.object({
  productId: z.string().min(1),
  stock: z.number().int().min(0).max(100000),
});

/**
 * PATCH /api/admin/inventory — admin-only stock update for one product.
 */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { productId, stock } = parsed.data;

  if (!prisma) {
    // Mock mode — pretend success.
    return NextResponse.json({ ok: true, productId, stock });
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { stock },
    select: { id: true, stock: true },
  });
  return NextResponse.json({ ok: true, ...updated });
}
