import { NextResponse } from "next/server";
import { listProducts } from "@/lib/queries";

/**
 * GET /api/search?q=...
 *
 * Lightweight live-search endpoint for the navbar overlay. Returns the top
 * 6 matches — `listProducts` already handles the `q` filter across name,
 * tagline, and description.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ products: [] });

  const { products } = await listProducts({
    search: q,
    perPage: 6,
    sort: "popular",
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      price: p.price,
      image: p.images[0],
      category: p.category,
    })),
  });
}
