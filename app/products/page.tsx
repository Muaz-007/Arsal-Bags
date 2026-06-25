import type { Metadata } from "next";
import { Suspense } from "react";
import { listProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/filters";
import { SortBar } from "@/components/product/sort-bar";
import { Pagination } from "@/components/product/pagination";

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

  const { products, total, perPage } = await listProducts({
    category: first(searchParams.category),
    collection: first(searchParams.collection),
    search: first(searchParams.q),
    sort,
    minPrice: min,
    maxPrice: max,
    inStock: first(searchParams.inStock) === "1",
    page,
    perPage: 9,
  });

  return (
    <div className="container py-8 lg:py-16">
      <header className="max-w-2xl mb-6 lg:mb-10">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          The Catalogue
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl tracking-tight">
          Every piece in the atelier.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          Filter by silhouette, price, or availability. Each piece ships from
          our Karachi studio within 48 hours.
        </p>
      </header>

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
        </div>
      </div>
    </div>
  );
}
