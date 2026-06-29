import { Hero } from "@/components/home/hero";
import { CategoryStrip, type StripItem } from "@/components/home/category-strip";
import { FeaturedProducts } from "@/components/home/featured-products";
import { BestSellers } from "@/components/home/best-sellers";
import { SummerSale } from "@/components/home/summer-sale";
import { VarietyCta } from "@/components/home/variety-cta";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { Testimonials } from "@/components/home/testimonials";
import { Newsletter } from "@/components/home/newsletter";
import { getStorefrontConfig } from "@/lib/queries";

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

export default async function HomePage() {
  const rawStrip = await getStorefrontConfig<AdminStripItem[]>("strip");
  const stripItems = toStripItems(rawStrip);

  return (
    <>
      <Hero />
      <CategoryStrip items={stripItems} />
      <FeaturedProducts />
      <BestSellers />
      <SummerSale />
      <VarietyCta />
      <CategoriesGrid />
      <Testimonials />
      <Newsletter />
    </>
  );
}
