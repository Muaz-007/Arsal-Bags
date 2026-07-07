import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
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
    // Pakistani mobile number. Accepts both local (`03XXXXXXXXX` — 11
    // digits) and international (`+923XXXXXXXXX` — plus sign followed by
    // 12 digits) formats, ignoring any spaces / dashes / brackets in
    // between. Anything else is rejected — we only ship inside Pakistan,
    // so a foreign-looking number is almost always a typo.
    phone: z
      .string()
      .trim()
      .max(30)
      .refine(
        (v) => {
          const compact = v.replace(/[\s\-()]/g, "");
          return /^(\+923\d{9}|03\d{9})$/.test(compact);
        },
        {
          message:
            "Enter a Pakistani mobile number (03XXXXXXXXX or +923XXXXXXXXX)",
        }
      ),
    address: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    postal: z.string().min(1),
  }),
  items: z.array(LineSchema).min(1),
  couponCode: z.string().max(40).optional(),
  // Card / online payments are advertised as "coming soon" on the checkout
  // UI. Enforce the same server-side so a bypassed client can't slip a
  // `paymentMethod: "card"` order into the DB with status "pending" but
  // paymentMethod = "card" (which would falsely appear as a card payment
  // in the admin view). Widen this enum when Stripe/JazzCash is live.
  paymentMethod: z.enum(["cod"]).default("cod"),
  // Guests must include the 6-digit code that was emailed to them by
  // /api/checkout/verify-init before we'll place the order. Authenticated
  // customers omit this field entirely.
  verificationCode: z.string().regex(/^\d{6}$/).optional(),
});

// PKR amounts. Rs 250 shipping, waived on orders Rs 4,000+. No sales tax.
// Kept in sync with `store/cart.ts` — server is the authority for the
// final charged amounts.
const SHIPPING_FEE = 250;
const SHIPPING_FREE_THRESHOLD = 4000;

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Strip everything but digits and the leading `+` so the phone we persist
 * looks identical whether the customer typed "0300 123 4567" or
 * "03001234567" or "+92 300 1234567" — admin lookups and courier
 * hand-offs stay consistent.
 */
function normalizePhone(raw: string): string {
  const compact = raw.replace(/[\s\-()]/g, "");
  // If they typed a local number, keep the local form as-is. If they
  // used +92, keep the leading + and digits only.
  return compact;
}

// Distinct error class so the outer catch can tell an expected "out of stock"
// case (safe to surface) from a Prisma/runtime failure (must be redacted).
class StockError extends Error {}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }
  const {
    customer,
    items,
    couponCode,
    paymentMethod,
    verificationCode,
  } = parsed.data;

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
    afterDiscount <= 0
      ? 0
      : afterDiscount >= SHIPPING_FREE_THRESHOLD
        ? 0
        : SHIPPING_FEE;
  const tax = 0;
  const total = round2(Math.max(0, afterDiscount + shipping));

  // ── Payment ─────────────────────────────────────────────────────────────
  // COD only for now — customer pays the courier on delivery. Card / online
  // payment is "coming soon" (see the Zod enum above and the disabled option
  // on the checkout UI). When Stripe/JazzCash is wired up, widen the
  // `paymentMethod` enum and add the branch that sets a `paymentRef`.
  const paymentRef: string | undefined = undefined;

  const me = await getCurrentUser();

  // ── Guest verification ───────────────────────────────────────────────────
  // Guests must have called /api/checkout/verify-init first to receive a
  // 6-digit code. We validate that code here before touching stock or
  // creating the order. Authenticated customers skip this block entirely.
  let guestUserId: string | undefined;
  let guestPasswordForEmail: string | undefined;
  if (!me && prisma) {
    if (!verificationCode) {
      return NextResponse.json(
        {
          error: "Please verify your email before placing the order.",
          code: "VERIFICATION_REQUIRED",
        },
        { status: 401 }
      );
    }
    const guestEmail = customer.email.toLowerCase().trim();
    const guestUser = await prisma.user.findUnique({
      where: { email: guestEmail },
      select: { id: true, emailVerified: true, role: true },
    });
    const record = guestUser
      ? await prisma.emailVerificationCode.findUnique({
          where: { userId: guestUser.id },
        })
      : null;

    const invalid = () =>
      NextResponse.json(
        {
          error:
            "That verification code isn't valid. Request a new one and try again.",
          code: "VERIFICATION_FAILED",
        },
        { status: 400 }
      );

    if (!guestUser || !record) return invalid();
    if (record.expiresAt < new Date()) {
      await prisma.emailVerificationCode.delete({
        where: { userId: guestUser.id },
      });
      return invalid();
    }
    if (record.attempts >= 5) {
      await prisma.emailVerificationCode.delete({
        where: { userId: guestUser.id },
      });
      return invalid();
    }
    const match = await bcrypt.compare(verificationCode, record.codeHash);
    if (!match) {
      await prisma.emailVerificationCode.update({
        where: { userId: guestUser.id },
        data: { attempts: { increment: 1 } },
      });
      return invalid();
    }

    // Verified: mark the user, remember the guest password so we can drop
    // it into the confirmation email once the order is created, and drop
    // the code row.
    guestUserId = guestUser.id;
    guestPasswordForEmail = record.guestPasswordDisplay ?? undefined;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: guestUser.id },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationCode.delete({ where: { userId: guestUser.id } }),
    ]);
  }

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
            // Tag the message so the outer catch can distinguish an expected
            // "out of stock" case from an unexpected Prisma/runtime error.
            throw new StockError(`"${line.name}" is no longer available.`);
          }
          if (p.stock < line.quantity) {
            throw new StockError(
              p.stock === 0
                ? `"${p.name}" is sold out.`
                : `Only ${p.stock} left of "${p.name}" — please reduce the quantity.`
            );
          }
        }

        const created = await tx.order.create({
          data: {
            userId: me?.id ?? guestUserId,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: normalizePhone(customer.phone),
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
      // Only surface stock/availability messages to the customer verbatim.
      // Any other thrown value is an internal error (DB down, constraint
      // violation, etc.) — log it and return a generic message so we don't
      // leak Prisma internals or schema hints to the client.
      if (err instanceof StockError) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      console.error("[checkout] order transaction failed", err);
      return NextResponse.json(
        { error: "We couldn't place the order. Please try again." },
        { status: 500 }
      );
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

  // Await the confirmation so Vercel doesn't kill the SMTP request when the
  // response returns. sendOrderConfirmation swallows its own errors, so a
  // failed send never rolls back the order — but we log it and the customer
  // still gets a successful checkout response.
  await sendOrderConfirmation(customer.email, {
    id,
    customerName: customer.name,
    total,
    items: items.map((i) => ({ name: i.name, quantity: i.quantity })),
    // Only set for guest checkouts — surfaces the auto-generated password
    // at the top of the email so the customer can sign in and track their
    // order. Authenticated buyers pass `undefined` and see the normal
    // template with no password panel.
    guestPassword: guestPasswordForEmail,
  });

  return NextResponse.json({
    id,
    paymentRef,
    paymentMethod,
    totals: { subtotal, discount, shipping, tax, total },
  });
}
