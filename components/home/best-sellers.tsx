import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section";
import { ProductRail } from "@/components/product/product-rail";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getBestSellers } from "@/lib/queries";

/**
 * Best Sellers — ranked horizontal rail. Pulls a longer list (10) so users
 * can scroll through the rankings rather than seeing only the top four.
 */
export async function BestSellers() {
  const products = await getBestSellers(10);

  return (
    <section className="border-y border-border bg-muted/30 py-20">
      <Reveal className="container">
        <SectionHeader
          eyebrow="Best sellers"
          title={
            <>
              The pieces that{" "}
              <span className="text-gradient-gold">won the studio</span>
            </>
          }
          subtitle="Ranked by repeat orders and five-star reviews from the past 90 days."
        />

        <ProductRail products={products} />

        <div className="mt-8 flex justify-center">
          <Button href="/products?sort=popular" size="lg" variant="gold">
            View all best sellers
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
