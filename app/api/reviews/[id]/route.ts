import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

/**
 * Edit / delete a review — only the review's author (or an admin) may act.
 *
 * On both operations we recompute the product's rolling `rating` and
 * `reviewCount` inside the same transaction so those aggregates never drift
 * out of sync with the underlying reviews.
 */

// Same Cloudinary-only allowlist as the POST endpoint — an edit shouldn't
// be a back-door for hostile URLs the create path already rejects.
const cloudinaryUrl = z
  .string()
  .url()
  .refine(
    (v) => /^https:\/\/res\.cloudinary\.com\//i.test(v),
    { message: "Only Cloudinary URLs are allowed" }
  );

const PatchSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2).max(120),
  body: z.string().min(8).max(2000),
  images: z.array(cloudinaryUrl).max(3).default([]),
});

async function loadReviewForActor(id: string, actorId: string, isAdmin: boolean) {
  if (!prisma) return null;
  const review = await prisma.review.findUnique({
    where: { id },
    select: { id: true, userId: true, productId: true },
  });
  if (!review) return { review: null, forbidden: false };
  const owns = review.userId === actorId;
  return { review, forbidden: !owns && !isAdmin };
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  if (!prisma) return NextResponse.json({ ok: true });

  const lookup = await loadReviewForActor(
    params.id,
    user.id,
    user.role === "admin"
  );
  if (!lookup?.review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
  if (lookup.forbidden) {
    return NextResponse.json({ error: "Not your review" }, { status: 403 });
  }

  const { rating, title, body: text, images } = parsed.data;
  const productId = lookup.review.productId;

  await prisma.$transaction(async (tx) => {
    await tx.review.update({
      where: { id: params.id },
      data: { rating, title, body: text, images },
    });
    const agg = await tx.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await tx.product.update({
      where: { id: productId },
      data: {
        rating: agg._avg.rating ?? rating,
        reviewCount: agg._count._all,
      },
    });
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!prisma) return NextResponse.json({ ok: true });

  const lookup = await loadReviewForActor(
    params.id,
    user.id,
    user.role === "admin"
  );
  if (!lookup?.review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
  if (lookup.forbidden) {
    return NextResponse.json({ error: "Not your review" }, { status: 403 });
  }

  const productId = lookup.review.productId;
  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: params.id } });
    const agg = await tx.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    // If no reviews are left, reset rating to 0 rather than leaving the
    // stale last average sitting on the product row.
    await tx.product.update({
      where: { id: productId },
      data: {
        rating: agg._count._all > 0 ? (agg._avg.rating ?? 0) : 0,
        reviewCount: agg._count._all,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
