import { NextResponse } from "next/server";
import { listProducts } from "@/lib/queries";

/**
 * GET /api/search?q=...&category=...&price=0-20000&sale=1
 *
 * Lightweight live-search endpoint for the navbar overlay. Returns the top
 * 6 matches. When the shopper is already on `/products` with filters
 * applied, the search panel forwards those filters here so the results
 * stay inside the visible catalogue slice — searching "leather" inside
 * "Totes under Rs 20k" returns totes under Rs 20k, not the whole catalogue.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ products: [] });

  const category = url.searchParams.get("category")?.trim() || undefined;
  const saleOnly = url.searchParams.get("sale") === "1";

  // Same `min-max` format the products page uses. Malformed input falls
  // through to `undefined` so a bad param doesn't turn into `NaN` bounds
  // that reject every row.
  const priceRaw = url.searchParams.get("price");
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  if (priceRaw) {
    const [lo, hi] = priceRaw.split("-");
    const loNum = Number(lo);
    const hiNum = Number(hi);
    if (Number.isFinite(loNum)) minPrice = loNum;
    if (Number.isFinite(hiNum) && hiNum > 0) maxPrice = hiNum;
  }

  const { products } = await listProducts({
    search: q,
    category,
    saleOnly,
    minPrice,
    maxPrice,
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
