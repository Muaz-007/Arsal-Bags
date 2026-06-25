import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section";
import { ProductRail } from "@/components/product/product-rail";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { listProducts } from "@/lib/queries";

export async function FeaturedProducts() {
  // Pull a generous list so the horizontal rail has room to breathe — featured
  // pieces first, padded with the rest if there aren't enough featured ones.
  const { products: featured } = await listProducts({ perPage: 50 });
  const head = featured.filter((p) => p.featured);
  const tail = featured.filter((p) => !p.featured);
  const products = [...head, ...tail].slice(0, 10);

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
