import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

const PatchSchema = z
  .object({
    approved: z.boolean().optional(),
    featured: z.boolean().optional(),
  })
  .refine((v) => v.approved !== undefined || v.featured !== undefined, {
    message: "Nothing to update",
  });

/**
 * Recompute the parent product's cached `rating` + `reviewCount` from the
 * set of currently-APPROVED reviews. Called after every moderation action
 * so the storefront always reflects the moderated set — a rejected 1-star
 * review shouldn't keep dragging the average down.
 */
async function refreshProductAggregate(productId: string) {
  if (!prisma) return;
  const agg = await prisma.review.aggregate({
    where: { productId, approved: true },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count._all,
    },
  });
}

/** PATCH /api/admin/reviews/[id] — approve or unapprove a review. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!prisma) return NextResponse.json({ ok: true });

  // Feature-on-homepage requires an approved review — an unapproved
  // review featured on the home page would be a moderation bypass. If the
  // caller flips both flags in one PATCH we accept it; otherwise we check
  // the existing row.
  const wantsFeature = parsed.data.featured === true;
  if (wantsFeature && parsed.data.approved !== true) {
    const current = await prisma.review.findUnique({
      where: { id: params.id },
      select: { approved: true },
    });
    if (!current?.approved) {
      return NextResponse.json(
        { error: "Approve the review before featuring it on the homepage." },
        { status: 400 }
      );
    }
  }

  // Un-approving a featured review also silently drops the feature flag —
  // the storefront would filter it out anyway, keeping the DB consistent.
  const update: Record<string, unknown> = {};
  if (parsed.data.approved !== undefined) {
    update.approved = parsed.data.approved;
    if (parsed.data.approved === false) update.featured = false;
  }
  if (parsed.data.featured !== undefined) update.featured = parsed.data.featured;

  try {
    const updated = await prisma.review.update({
      where: { id: params.id },
      data: update,
      select: {
        id: true,
        approved: true,
        featured: true,
        productId: true,
      },
    });
    // Only refresh aggregate when approved state changed (featured is
    // presentation-only, doesn't affect star average).
    if (parsed.data.approved !== undefined) {
      await refreshProductAggregate(updated.productId);
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
}

/** DELETE /api/admin/reviews/[id] — hard delete a review. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!prisma) return NextResponse.json({ ok: true });

  try {
    const deleted = await prisma.review.delete({
      where: { id: params.id },
      select: { productId: true },
    });
    await refreshProductAggregate(deleted.productId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
}
