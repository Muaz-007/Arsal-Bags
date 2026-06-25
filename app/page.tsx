import { Hero } from "@/components/home/hero";
import { CategoryStrip } from "@/components/home/category-strip";
import { FeaturedProducts } from "@/components/home/featured-products";
import { BestSellers } from "@/components/home/best-sellers";
import { SummerSale } from "@/components/home/summer-sale";
import { VarietyCta } from "@/components/home/variety-cta";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { Testimonials } from "@/components/home/testimonials";
import { Newsletter } from "@/components/home/newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryStrip />
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
