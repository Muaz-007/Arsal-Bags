import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

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
  subtotal: z.number(),
  shipping: z.number(),
  tax: z.number(),
  discount: z.number(),
  total: z.number(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }
  const { customer, items, subtotal, shipping, tax, total } = parsed.data;

  let paymentRef: string | undefined;

  if (stripe) {
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

  let id: string;
  if (prisma) {
    const order = await prisma.order.create({
      data: {
        customerName: customer.name,
        customerEmail: customer.email,
        subtotal,
        shipping,
        tax,
        total,
        status: paymentRef ? "paid" : "pending",
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
    id = order.id;
  } else {
    id = `ord_${Date.now().toString(36)}`;
  }

  return NextResponse.json({ id, paymentRef });
}
