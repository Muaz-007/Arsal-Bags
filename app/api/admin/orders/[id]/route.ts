import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

const Schema = z
  .object({
    status: z
      .enum([
        "pending",
        "paid",
        "fulfilled",
        "shipped",
        "delivered",
        "cancelled",
      ])
      .optional(),
    trackingNumber: z.string().max(80).nullable().optional(),
    trackingUrl: z.string().max(500).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No changes" });

/**
 * PATCH /api/admin/orders/[id] — admin-only order update.
 * Accepts status and/or tracking info. Empty strings on tracking fields are
 * coerced to null so admins can clear them by submitting a blank field.
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
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) update.status = parsed.data.status;
  if (parsed.data.trackingNumber !== undefined) {
    update.trackingNumber =
      parsed.data.trackingNumber === "" ? null : parsed.data.trackingNumber;
  }
  if (parsed.data.trackingUrl !== undefined) {
    update.trackingUrl =
      parsed.data.trackingUrl === "" ? null : parsed.data.trackingUrl;
  }

  if (!prisma) {
    return NextResponse.json({ ok: true, id: params.id, ...update });
  }

  try {
    const updated = await prisma.order.update({
      where: { id: params.id },
      data: update,
      select: {
        id: true,
        status: true,
        trackingNumber: true,
        trackingUrl: true,
      },
    });
    return NextResponse.json({ ok: true, ...updated });
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
