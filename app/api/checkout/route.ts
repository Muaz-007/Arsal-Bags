import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { sendOrderConfirmation } from "@/lib/email";

const LineSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  quantity: z.number().int().min(1),
  color: z.string().optional(),
});

const Schema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    postal: z.string().min(1),
  }),
  items: z.array(LineSchema).min(1),
  couponCode: z.string().max(40).optional(),
  paymentMethod: z.enum(["card", "cod"]).default("cod"),
});

// Same rules used on the cart store — kept in sync intentionally.
const SHIPPING_FREE_THRESHOLD = 250;
const SHIPPING_FEE = 15;
const TAX_RATE = 0.08;

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }
  const { customer, items, couponCode, paymentMethod } = parsed.data;

  // ── Server-side totals: never trust the client's numbers ─────────────────
  const subtotal = round2(items.reduce((a, i) => a + i.price * i.quantity, 0));

  let discount = 0;
  let coupon:
    | { code: string; type: "percent" | "fixed"; value: number }
    | undefined;

  if (couponCode && prisma) {
    const row = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });
    if (row?.active && (!row.expiresAt || row.expiresAt > new Date())) {
      coupon = {
        code: row.code,
        type: row.type as "percent" | "fixed",
        value: Number(row.value),
      };
      discount =
        coupon.type === "percent"
          ? subtotal * (coupon.value / 100)
          : Math.min(coupon.value, subtotal);
      discount = round2(discount);
    } else {
      return NextResponse.json(
        { error: "That coupon isn't valid right now." },
        { status: 400 }
      );
    }
  }

  const afterDiscount = subtotal - discount;
  const shipping =
    afterDiscount <= 0 ? 0 : afterDiscount >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = round2(afterDiscount * TAX_RATE);
  const total = round2(Math.max(0, afterDiscount + shipping + tax));

  // ── Optional Stripe Checkout session ─────────────────────────────────────
  // Skip Stripe entirely for COD orders — customer pays courier on delivery.
  let paymentRef: string | undefined;

  if (paymentMethod === "card" && stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/checkout`,
        customer_email: customer.email,
        line_items: items.map((i) => ({
          price_data: {
            currency: "usd",
            product_data: { name: i.name, images: [i.image] },
            unit_amount: Math.round(i.price * 100),
          },
          quantity: i.quantity,
        })),
      });
      paymentRef = session.id;
    } catch (err) {
      console.error("Stripe error", err);
      return NextResponse.json({ error: "Payment failed" }, { status: 500 });
    }
  }

  const me = await getCurrentUser();

  let id: string;
  if (prisma) {
    const db = prisma;
    try {
      const order = await db.$transaction(async (tx) => {
        // Load stock for every purchased product inside the transaction so
        // concurrent orders can't race past each other and oversell. If any
        // item is short, we throw and Prisma rolls the whole thing back.
        const productIds = items.map((i) => i.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, stock: true },
        });
        const stockMap = new Map(products.map((p) => [p.id, p]));

        for (const line of items) {
          const p = stockMap.get(line.productId);
          if (!p) {
            throw new Error(`"${line.name}" is no longer available.`);
          }
          if (p.stock < line.quantity) {
            throw new Error(
              p.stock === 0
                ? `"${p.name}" is sold out.`
                : `Only ${p.stock} left of "${p.name}" — please reduce the quantity.`
            );
          }
        }

        const created = await tx.order.create({
          data: {
            userId: me?.id,
            customerName: customer.name,
            customerEmail: customer.email,
            subtotal,
            shipping,
            tax,
            total,
            status: paymentRef ? "paid" : "pending",
            paymentMethod,
            paymentRef,
            items: {
              create: items.map((i) => ({
                productId: i.productId,
                name: i.name,
                image: i.image,
                color: i.color,
                price: i.price,
                quantity: i.quantity,
              })),
            },
          },
          select: { id: true },
        });

        // Decrement stock atomically — the checks above guarantee no product
        // drops below zero within this transaction.
        for (const line of items) {
          await tx.product.update({
            where: { id: line.productId },
            data: { stock: { decrement: line.quantity } },
          });
        }

        return created;
      });
      id = order.id;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong placing the order.";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    // Coupon uses is outside the transaction — best-effort, non-blocking.
    if (coupon) {
      await db.coupon
        .update({
          where: { code: coupon.code },
          data: { uses: { increment: 1 } },
        })
        .catch(() => null);
    }
  } else {
    id = `ord_${Date.now().toString(36)}`;
  }

  // Fire-and-forget order confirmation.
  void sendOrderConfirmation(customer.email, {
    id,
    customerName: customer.name,
    total,
    items: items.map((i) => ({ name: i.name, quantity: i.quantity })),
  });

  return NextResponse.json({
    id,
    paymentRef,
    paymentMethod,
    totals: { subtotal, discount, shipping, tax, total },
  });
}
