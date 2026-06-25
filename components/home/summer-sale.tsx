import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { ProductRail } from "@/components/product/product-rail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { getSaleProducts } from "@/lib/queries";

/**
 * Summer Sale — sale banner + horizontal product rail.
 */
export async function SummerSale() {
  const products = await getSaleProducts(10);

  return (
    <Reveal as="section" className="container py-20">
      {/* Sale banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-amber-50 via-background to-rose-50 dark:from-amber-950/30 dark:via-background dark:to-rose-950/30 p-6 sm:p-8 md:p-10 mb-10">
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gold/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-rose-400/15 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="gold">
                <Flame className="h-3 w-3 mr-1 inline" />
                Limited
              </Badge>
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Ends August 31
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.05]">
              Summer <span className="text-gradient-gold">Sale</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md">
              Up to <span className="font-medium text-foreground">25% off</span>{" "}
              on selected pieces from the atelier — while quantities last.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-gold" />
            <span>Free shipping on every order over $250</span>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No sale items at the moment — check back soon.
        </p>
      ) : (
        <ProductRail products={products} />
      )}

      <div className="mt-8 flex justify-center">
        <Button href="/products?sale=1" size="lg" variant="gold">
          Shop the sale
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Reveal>
  );
}
