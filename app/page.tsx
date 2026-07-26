import { Hero } from "@/components/home/hero";
import { CategoryStrip, type StripItem } from "@/components/home/category-strip";
import { FeaturedProducts } from "@/components/home/featured-products";
import { BestSellers } from "@/components/home/best-sellers";
import { SummerSale } from "@/components/home/summer-sale";
import { VarietyCta } from "@/components/home/variety-cta";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { Testimonials } from "@/components/home/testimonials";
import { getFeaturedReviews, getStorefrontConfig } from "@/lib/queries";

interface AdminStripItem {
  id: string;
  title: string;
  href?: string;
  image?: string;
  visible: boolean;
}

function toStripItems(items: AdminStripItem[] | null): StripItem[] | undefined {
  if (!items?.length) return undefined;
  const visible = items.filter(
    (s) => s.visible !== false && s.image && s.title
  );
  if (visible.length === 0) return undefined;
  return visible.map((s) => ({
    label: s.title,
    href: s.href || "/products",
    image: s.image || "",
  }));
}

// Homepage renders on every request so admin edits (stock, storefront config,
// featured picks, new products) reflect immediately. If traffic grows and this
// becomes expensive, swap to `export const revalidate = 60` for ISR.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [rawStrip, featuredReviews] = await Promise.all([
    getStorefrontConfig<AdminStripItem[]>("strip"),
    getFeaturedReviews(),
  ]);
  const stripItems = toStripItems(rawStrip);

  const testimonials = featuredReviews.map((r) => ({
    id: r.id,
    author: r.author,
    role: r.role,
    quote: r.quote,
    productSlug: r.productSlug || undefined,
    productName: r.productName || undefined,
  }));

  return (
    <>
      <Hero />
      <CategoryStrip items={stripItems} />
      <FeaturedProducts />
      <BestSellers />
      <SummerSale />
      <VarietyCta />
      <CategoriesGrid />
      <Testimonials items={testimonials} />
      {/* Newsletter CTA lives in the footer — kept it out of the home
          page to avoid duplicating the form immediately above its own
          footer copy. */}
    </>
  );
}
