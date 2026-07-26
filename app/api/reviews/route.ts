import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import {
  getClientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

// Review photos can ONLY come from our Cloudinary bucket — the customer
// upload endpoint (/api/upload/review) pipes files through Cloudinary and
// returns res.cloudinary.com URLs. Restricting the shape here prevents a
// bypassed client from stuffing arbitrary URLs (phishing sites, tracker
// pixels, SVGs with embedded scripts) into a review that then renders on
// every buyer's product page.
const cloudinaryUrl = z
  .string()
  .url()
  .refine(
    (v) => /^https:\/\/res\.cloudinary\.com\//i.test(v),
    { message: "Only Cloudinary URLs are allowed" }
  );

const Schema = z.object({
  productId: z.string().min(1).max(64),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2).max(120),
  body: z.string().min(8).max(2000),
  images: z.array(cloudinaryUrl).max(3).default([]),
});

/**
 * POST /api/reviews — create a review for a product. Requires sign-in;
 * stamps the review with the user's display name.
 *
 * After insertion, we update the product's `rating` (running average) and
 * `reviewCount` so the PDP doesn't have to recompute on every read.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to leave a review." }, { status: 401 });
  }

  // 10 reviews per user-day. Combats sock-puppet review spam.
  const limit = await rateLimit({
    key: `review:${user.id}:${getClientIp(req)}`,
    max: 10,
    windowMs: 24 * 60 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }
  const { productId, rating, title, body: text, images } = parsed.data;

  if (!prisma) {
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        productId,
        userId: user.id,
        author: user.name ?? "Customer",
        rating,
        title,
        body: text,
        images,
        // Reviews start as unapproved — admin moderates them from
        // /admin/orders. Only approved reviews count toward the product's
        // public rating aggregate.
        approved: false,
      },
    });

    // Recompute using ONLY approved reviews so pending / rejected content
    // doesn't skew the star rating shoppers see on the storefront.
    const agg = await tx.review.aggregate({
      where: { productId, approved: true },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count._all,
      },
    });
  });

  // Signal to the client that the review is queued for moderation so the
  // form can show a friendlier "we'll publish it once approved" toast.
  return NextResponse.json({ ok: true, pending: true });
}
