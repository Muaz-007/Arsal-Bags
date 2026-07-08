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
  title: "Shop leather bags",
  description:
    "Browse the full BagsArt catalogue — totes, backpacks, clutches, crossbody, and small leather goods. Premium quality, shipped from Lahore.",
  // Filter and sort params (?category=tote, ?sort=price-asc, etc.) all render
  // the same catalogue view — canonicalise them back to /products so Google
  // doesn't dilute the ranking across dozens of URL variants.
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Shop leather bags · BagsArt",
    description:
      "Totes, backpacks, clutches, crossbody bags, and wallets — made in Lahore.",
  },
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

// Human-friendly labels for the collection / category slugs the navbar
// links point at. Kept here (rather than a shared constants file) because
// the only other consumer of these strings is the admin ProductForm's
// dropdown, which has its own copy for now.
const COLLECTION_TITLES: Record<string, { eyebrow: string; title: string; blurb: string }> = {
  formal: {
    eyebrow: "Formal",
    title: "Pieces made for the boardroom.",
    blurb: "Structured leather goods that read as sharp with a suit — quiet luxury, no logos.",
  },
  "semi-formal": {
    eyebrow: "Semi-formal",
    title: "Between the office and the studio.",
    blurb: "Softer silhouettes for the days that go from a client meeting to dinner without stopping home.",
  },
  heritage: {
    eyebrow: "New in",
    title: "Freshly out of the workshop.",
    blurb: "The most recent additions to the catalogue — small batches, first-come.",
  },
};

const CATEGORY_TITLES: Record<string, { eyebrow: string; title: string; blurb: string }> = {
  wallet: {
    eyebrow: "Wallets",
    title: "Small leather goods, big detail.",
    blurb: "Bifolds, cardholders, and long wallets — hand-stitched from the same full-grain leather as the bags.",
  },
  tote: {
    eyebrow: "Totes",
    title: "The everyday carry, elevated.",
    blurb: "Open-top and zip-top totes sized for a laptop, notebook, and everything you didn't plan on.",
  },
  backpack: {
    eyebrow: "Backpacks",
    title: "For hands-free days.",
    blurb: "Structured leather backpacks — designed for commute, travel, and everything between.",
  },
  crossbody: {
    eyebrow: "Crossbody",
    title: "Cross-body, hands-free.",
    blurb: "Compact silhouettes for the days you want to carry less.",
  },
  clutch: {
    eyebrow: "Clutches",
    title: "Evening-ready.",
    blurb: "Streamlined leather clutches for dinners, openings, and everything after 6PM.",
  },
  duffel: {
    eyebrow: "Duffels",
    title: "Weekend, packed.",
    blurb: "Roomy leather duffels built for a two-night trip and a decade of them.",
  },
};

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
  const activeCollection = first(searchParams.collection);
  const activeCategory = first(searchParams.category);
  const activeSearch = first(searchParams.q);
  const collectionMeta = activeCollection
    ? COLLECTION_TITLES[activeCollection]
    : undefined;
  const categoryMeta = activeCategory
    ? CATEGORY_TITLES[activeCategory]
    : undefined;

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
          {saleOnly
            ? "The Sale"
            : collectionMeta?.eyebrow ??
              categoryMeta?.eyebrow ??
              (activeSearch ? "Search results" : "The Catalogue")}
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl tracking-tight">
          {saleOnly ? (
            <>
              Summer <span className="text-gradient-gold">sale</span>.
            </>
          ) : (
            collectionMeta?.title ??
            categoryMeta?.title ??
            (activeSearch ? (
              <>
                Results for{" "}
                <span className="text-gradient-gold">"{activeSearch}"</span>.
              </>
            ) : (
              "Every piece in the collection."
            ))
          )}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          {saleOnly
            ? "Selected pieces, up to 25% off. Shipping from our Lahore studio within 48 hours."
            : collectionMeta?.blurb ??
              categoryMeta?.blurb ??
              "Filter by silhouette, price, or availability. Each piece ships from our Lahore studio within 48 hours."}
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

      {/* Active-collection / category chip — gives a one-tap "clear" so
          the shopper isn't stuck inside a narrow slice once they've
          drilled in from the navbar. */}
      {!saleOnly && (collectionMeta || categoryMeta) && (
        <div className="mb-6 lg:mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 pl-3 pr-1 py-1 text-xs">
          <span className="font-medium">
            Showing {collectionMeta?.eyebrow ?? categoryMeta?.eyebrow}
          </span>
          <Link
            href="/products"
            aria-label="Clear filter"
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
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Try widening your price range or clearing the category filter.
              </p>
              <div className="mt-6">
                <Button href="/products" variant="outline">
                  Clear filters
                </Button>
              </div>
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
