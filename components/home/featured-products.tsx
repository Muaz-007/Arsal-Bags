import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section";
import { ProductRail } from "@/components/product/product-rail";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import {
  getStorefrontConfig,
  listProducts,
  resolveProductsByIds,
} from "@/lib/queries";

export async function FeaturedProducts() {
  // If the admin has curated this section, honour their order. Otherwise
  // fall back to featured-first, padded with the rest.
  const curated = await getStorefrontConfig<string[]>("featured");
  let products = curated ? await resolveProductsByIds(curated) : [];

  if (products.length === 0) {
    const { products: catalogue } = await listProducts({ perPage: 50 });
    const head = catalogue.filter((p) => p.featured);
    const tail = catalogue.filter((p) => !p.featured);
    products = [...head, ...tail].slice(0, 10);
  }

  return (
    <Reveal as="section" className="container py-20">
      <SectionHeader
        eyebrow="The shortlist"
        title="Featured this season"
        subtitle="Hand-picked pieces from our most recent capsule — each made in a limited run."
      />
      <ProductRail products={products} />
      <div className="mt-8 flex justify-center">
        <Button href="/products" size="lg" variant="gold">
          View all products
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Reveal>
  );
}
