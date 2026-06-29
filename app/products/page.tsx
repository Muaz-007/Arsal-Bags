import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Flame, X } from "lucide-react";
import { listProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/filters";
import { SortBar } from "@/components/product/sort-bar";
import { Pagination } from "@/components/product/pagination";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full BagsArt catalogue of leather bags and accessories.",
};

function parsePrice(value: string | null) {
  if (!value) return { min: undefined, max: undefined };
  const [a, b] = value.split("-");
  return {
    min: a ? Number(a) : undefined,
    max: b ? Number(b) : undefined,
  };
}

type SP = { [k: string]: string | string[] | undefined };
const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { min, max } = parsePrice(first(searchParams.price) ?? null);
  const page = Number(first(searchParams.page) ?? "1");
  const sort = (first(searchParams.sort) as
    | "latest"
    | "popular"
    | "price-asc"
    | "price-desc"
    | undefined) ?? "latest";

  const saleOnly = first(searchParams.sale) === "1";

  const { products, total, perPage } = await listProducts({
    category: first(searchParams.category),
    collection: first(searchParams.collection),
    search: first(searchParams.q),
    sort,
    minPrice: min,
    maxPrice: max,
    inStock: first(searchParams.inStock) === "1",
    saleOnly,
    page,
    perPage: 9,
  });

  // Build a "/products" link that preserves the OTHER active filters when
  // the customer taps "See all products" — we only clear sale, not their
  // category / sort / price choices.
  const withoutSale = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (k === "sale" || k === "page") continue;
    if (typeof v === "string") withoutSale.set(k, v);
  }
  const seeAllHref =
    withoutSale.toString().length > 0
      ? `/products?${withoutSale.toString()}`
      : "/products";

  return (
    <div className="container py-8 lg:py-16">
      <header className="max-w-2xl mb-6 lg:mb-10">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {saleOnly ? "The Sale" : "The Catalogue"}
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl tracking-tight">
          {saleOnly ? (
            <>
              Summer <span className="text-gradient-gold">sale</span>.
            </>
          ) : (
            "Every piece in the atelier."
          )}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          {saleOnly
            ? "Selected pieces, up to 25% off. Shipping from our Lahore studio within 48 hours."
            : "Filter by silhouette, price, or availability. Each piece ships from our Lahore studio within 48 hours."}
        </p>
      </header>

      {/* Active-sale chip — only when sale=1, gives a one-tap way out */}
      {saleOnly && (
        <div className="mb-6 lg:mb-8 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 pl-3 pr-1 py-1 text-xs">
          <Flame className="h-3.5 w-3.5 text-gold" />
          <span className="font-medium">Showing sale only</span>
          <Link
            href={seeAllHref}
            aria-label="Clear sale filter"
            className="ml-1 h-6 w-6 grid place-items-center rounded-full hover:bg-background/60 transition"
          >
            <X className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="lg:grid lg:gap-10 lg:grid-cols-[230px_1fr]">
        <Suspense fallback={null}>
          <ProductFilters />
        </Suspense>

        <div>
          <Suspense fallback={null}>
            <SortBar total={total} />
          </Suspense>

          {products.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl p-12 sm:p-16 text-center">
              <p className="font-display text-xl">No products match your filters</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try widening your price range or clearing the category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 3} />
              ))}
            </div>
          )}

          <Suspense fallback={null}>
            <Pagination page={page} total={total} perPage={perPage} />
          </Suspense>

          {/* "See all products" CTA — only when sale filter is active */}
          {saleOnly && (
            <div className="mt-12 pt-8 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Looking for something not on sale?
              </p>
              <div className="mt-4 inline-flex">
                <Button href={seeAllHref} size="lg" variant="outline">
                  See all products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
