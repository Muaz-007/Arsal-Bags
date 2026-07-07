import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth-server";
import {
  sendOrderCancelledCustomer,
  sendOrderCancelledAdmin,
} from "@/lib/email";
import {
  getClientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

// Canonical reason keys the modal shows. `other` requires the free-text
// `otherReason` field; the rest are self-explanatory. Kept in sync with
// the client radio list in components/dashboard/cancel-order-button.
const REASON_KEYS = [
  "changed_mind",
  "wrong_item",
  "found_cheaper",
  "too_slow",
  "duplicate",
  "other",
] as const;
type ReasonKey = (typeof REASON_KEYS)[number];

const REASON_LABEL: Record<ReasonKey, string> = {
  changed_mind: "Changed my mind",
  wrong_item: "Ordered the wrong item / colour",
  found_cheaper: "Found it cheaper elsewhere",
  too_slow: "Taking too long",
  duplicate: "Duplicate order",
  other: "Other",
};

const Schema = z.object({
  reason: z.enum(REASON_KEYS),
  // Only meaningful when `reason === "other"`; capped so a customer
  // can't paste a novel into the order row.
  otherReason: z.string().max(280).optional(),
});

/**
 * POST /api/orders/[id]/cancel
 *
 * Customer-initiated cancellation for their own orders. Only works while
 * the order is still `pending` — once it's `paid`, `fulfilled`, `shipped`
 * or later, we ask the customer to contact us instead so we don't have
 * an in-flight parcel that's suddenly "cancelled" in the DB.
 *
 * Inside a single transaction we flip the order to `cancelled` and put
 * the stock we decremented at checkout back on the shelf. On success we
 * email the customer a confirmation and ping the admin address so the
 * team notices even if they aren't watching the dashboard.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await requireUser();

  // 5 cancels per user per hour. Stops abuse (e.g. a bot spamming this
  // endpoint hoping to race the stock-restore against a fresh checkout).
  const limit = await rateLimit({
    key: `order-cancel:${user.id}:${getClientIp(req)}`,
    max: 5,
    windowMs: 60 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please pick a cancellation reason." },
      { status: 400 }
    );
  }
  const { reason, otherReason } = parsed.data;

  // Compose the human-readable string we persist. "Other" reasons carry
  // the customer's own text; the rest map cleanly to the friendly labels.
  const reasonText =
    reason === "other"
      ? `Other · ${(otherReason ?? "").trim() || "no details provided"}`
      : REASON_LABEL[reason];

  if (!prisma) return NextResponse.json({ ok: true });
  // Alias to a non-null local so the type narrows inside the closures
  // and array spread we build below.
  const db = prisma;

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: { select: { productId: true, name: true, quantity: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  // Admins get their own dedicated tools — this endpoint is customer-only,
  // and non-admins can only cancel their own orders (never someone else's).
  if (user.role !== "admin" && order.userId !== user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "pending") {
    return NextResponse.json(
      {
        error:
          "This order can no longer be cancelled online. Please contact us and we'll help sort it out.",
        code: "TOO_LATE_TO_CANCEL",
      },
      { status: 409 }
    );
  }

  await db.$transaction([
    db.order.update({
      where: { id: order.id },
      data: { status: "cancelled", cancellationReason: reasonText },
    }),
    // Put stock back on the shelf. `updateMany` skips items whose product
    // has been deleted since the order was placed rather than throwing.
    ...order.items.map((item) =>
      db.product.updateMany({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    ),
  ]);

  const adminEmail = (
    process.env.ADMIN_EMAIL ?? "bags.art.pk@gmail.com"
  ).toLowerCase();

  await Promise.all([
    sendOrderCancelledCustomer(order.customerEmail, {
      id: order.id,
      customerName: order.customerName,
      total: Number(order.total),
      items: order.items.map((i) => ({ name: i.name, quantity: i.quantity })),
    }),
    sendOrderCancelledAdmin(adminEmail, {
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone ?? undefined,
      total: Number(order.total),
      itemCount: order.items.reduce((a, i) => a + i.quantity, 0),
      reason: reasonText,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
