import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

const Schema = z.object({
  status: z.enum([
    "pending",
    "paid",
    "fulfilled",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

/**
 * PATCH /api/admin/orders/[id] — admin-only order status update.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (!prisma) {
    // Mock mode
    return NextResponse.json({ ok: true, id: params.id, status: parsed.data.status });
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
    select: { id: true, status: true },
  });
  return NextResponse.json({ ok: true, ...updated });
}
