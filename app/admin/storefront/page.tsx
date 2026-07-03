import { Suspense } from "react";
import { Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminTabs } from "@/components/admin/tabs";
import { SectionEditor, type SectionItem } from "@/components/admin/section-editor";
import { FeaturedPicker } from "@/components/admin/featured-picker";
import { listProducts, getBestSellers, getSaleProducts } from "@/lib/queries";

/**
 * /admin/storefront
 *
 * The single control surface for everything visible on the public homepage:
 * the hero carousel, the category strip, and the three product rails.
 * The active tab is driven by the `?tab=` search param so it's bookmarkable.
 */

const HERO_SLIDES: SectionItem[] = [
  {
    id: "hero_1",
    title: "Florence Tote",
    subtitle: "Featured · Heritage",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=70",
    href: "/products/florence-tote-cognac",
    visible: true,
  },
  {
    id: "hero_2",
    title: "Atelier Backpack",
    subtitle: "New · Studio Daily",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=70",
    href: "/products/atelier-backpack-noir",
    visible: true,
  },
  {
    id: "hero_3",
    title: "Milano Shoulder",
    subtitle: "Evening · Limited",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=70",
    href: "/products/milano-shoulder-noir",
    visible: true,
  },
  {
    id: "hero_4",
    title: "Courier Crossbody",
    subtitle: "Best seller · Crossbody",
    image: "https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?auto=format&fit=crop&w=300&q=70",
    href: "/products/courier-crossbody-tan",
    visible: true,
  },
];

const STRIP_ITEMS: SectionItem[] = [
  { id: "strip_1", title: "Under Rs 15k", subtitle: "Price filter", image: "https://images.unsplash.com/photo-1606513542745-97629752a13b?auto=format&fit=crop&w=200&q=70", href: "/products?price=0-15000", visible: true },
  { id: "strip_2", title: "Best Sellers", subtitle: "Curated", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&q=70", href: "/products?sort=popular", visible: true },
  { id: "strip_3", title: "Under Rs 30k", subtitle: "Price filter", image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=200&q=70", href: "/products?price=0-30000", visible: true },
  { id: "strip_4", title: "Backpacks", subtitle: "Category", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=70", href: "/products?category=backpack", visible: true },
  { id: "strip_5", title: "On Sale", subtitle: "Curated", image: "https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?auto=format&fit=crop&w=200&q=70", href: "/products?sale=1", visible: true },
  { id: "strip_6", title: "Totes", subtitle: "Category", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=200&q=70", href: "/products?category=tote", visible: true },
  { id: "strip_7", title: "Heritage", subtitle: "Collection", image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=200&q=70", href: "/products?collection=heritage", visible: true },
  { id: "strip_8", title: "Wallets", subtitle: "Category", image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=200&q=70", href: "/products?category=wallet", visible: true },
];

const TABS = [
  { value: "hero", label: "Hero slider", count: HERO_SLIDES.length },
  { value: "strip", label: "Category strip", count: STRIP_ITEMS.length },
  { value: "featured", label: "Featured" },
  { value: "bestsellers", label: "Best sellers" },
  { value: "sale", label: "Summer sale" },
];

type SP = { [k: string]: string | string[] | undefined };
const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const tab = first(searchParams.tab) ?? "hero";

  const { products: allProducts } = await listProducts({ perPage: 100 });
  const bestSellers = await getBestSellers(10);
  const saleProducts = await getSaleProducts(10);
  const featuredSelected = allProducts.filter((p) => p.featured).map((p) => p.id);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Storefront"
        title="Sections"
        description="Control everything visible on the public homepage — hero slides, the category strip, and the three product rails. Changes are saved per section."
        actions={
          <>
            <Button href="/" variant="outline" size="sm">
              <Eye className="h-4 w-4" /> View store
            </Button>
            <Button variant="gold" size="sm">
              <Sparkles className="h-4 w-4" /> Publish all
            </Button>
          </>
        }
      />

      <div className="mb-8 -mx-1 px-1 overflow-x-auto scrollbar-none">
        <Suspense fallback={null}>
          <AdminTabs tabs={TABS} />
        </Suspense>
      </div>

      {tab === "hero" && (
        <SectionEditor
          title="Hero carousel"
          description="Slides shown in the homepage hero. Order matches the auto-rotation order. Hide a slide to remove it from rotation without deleting it."
          initialItems={HERO_SLIDES}
          itemNoun="slide"
          storeKey="hero"
        />
      )}

      {tab === "strip" && (
        <SectionEditor
          title="Category strip"
          description="The continuously-scrolling circle row below the hero. Each item links to a filtered catalogue view (price, category, or collection)."
          initialItems={STRIP_ITEMS}
          itemNoun="tile"
          storeKey="strip"
        />
      )}

      {tab === "featured" && (
        <FeaturedPicker
          all={allProducts}
          initialSelected={featuredSelected}
          label="Featured this season"
          helper="Hand-picked pieces shown in the first product rail on the homepage. The order you pick them in is the order they appear."
          storeKey="featured"
        />
      )}

      {tab === "bestsellers" && (
        <FeaturedPicker
          all={allProducts}
          initialSelected={bestSellers.map((p) => p.id)}
          label="Best sellers"
          helper="By default this section is auto-ranked by review count. Pick products here to override that ranking with a manual order."
          storeKey="bestsellers"
        />
      )}

      {tab === "sale" && (
        <FeaturedPicker
          all={allProducts}
          initialSelected={saleProducts.map((p) => p.id)}
          label="Summer sale"
          helper="Products in this section show their strike-through compareAt price. Make sure each product has a compareAt set in the catalogue."
          storeKey="sale"
        />
      )}
    </div>
  );
}
