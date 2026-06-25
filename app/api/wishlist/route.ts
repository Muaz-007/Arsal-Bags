import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

const Schema = z.object({
  productId: z.string().min(1),
});

/**
 * POST /api/wishlist — toggle a product in the signed-in user's wishlist.
 * Returns { wishlisted: boolean } so the client can sync its local store.
 * 401 for guests (the heart icon still works locally via Zustand).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { productId } = parsed.data;

  if (!prisma) {
    // Mock mode — pretend success.
    return NextResponse.json({ wishlisted: true });
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ wishlisted: false });
  }

  await prisma.wishlistItem.create({
    data: { userId: user.id, productId },
  });
  return NextResponse.json({ wishlisted: true });
}

/** GET /api/wishlist — return the signed-in user's product IDs. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ids: [] });

  if (!prisma) return NextResponse.json({ ids: [] });

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });
  return NextResponse.json({ ids: items.map((i) => i.productId) });
}
