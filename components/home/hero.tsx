import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroCarousel, type Slide } from "@/components/home/hero-carousel";
import { Reveal } from "@/components/ui/reveal";
import { getStorefrontConfig } from "@/lib/queries";

/**
 * Hero (server component) — fetches the admin-curated carousel slides from
 * `StorefrontConfig` and forwards them to the client `HeroCarousel`. When no
 * config exists yet (fresh deploy), the carousel falls back to its built-in
 * defaults so the homepage always renders.
 */

interface AdminSlide {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  href?: string;
  visible: boolean;
}

function adminSlidesToCarousel(items: AdminSlide[] | null): Slide[] | undefined {
  if (!items?.length) return undefined;
  const visible = items.filter(
    (s) => s.visible !== false && s.image && s.title
  );
  if (visible.length === 0) return undefined;

  return visible.map((s) => ({
    href: s.href || "/products",
    src: s.image || "",
    alt: s.title,
    tag: s.subtitle ?? "",
    name: s.title,
    price: "",
    tagline: "",
  }));
}

export async function Hero() {
  const raw = await getStorefrontConfig<AdminSlide[]>("hero");
  const slides = adminSlidesToCarousel(raw);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/50" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06] bg-grid-pattern"
        style={{ backgroundSize: "44px 44px" }}
      />

      <div className="container relative grid lg:grid-cols-2 gap-12 items-center pt-6 pb-24 lg:pt-10 lg:pb-28">
        <Reveal y={16}>
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-8 bg-gold" />
            New · Summer 2026
          </p>
          <h1 className="mt-5 font-display text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
            Crafted bags,{" "}
            <span className="text-gradient-gold">reimagined</span>{" "}
            for a quieter world.
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
            Full-grain leather, solid brass, and careful finishing — the
            kind of bag you carry for years without a second thought.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" variant="gold" href="/products">
              Shop the collection <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" href="/about">
              About us
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 max-w-md gap-6 text-sm">
            {[
              { k: "Premium quality", v: "in every piece" },
              { k: "Full-grain", v: "leather, always" },
              { k: "Small batch", v: "made in Lahore" },
            ].map((s) => (
              <div key={s.k}>
                <p className="font-display text-base">{s.k}</p>
                <p className="text-muted-foreground text-xs mt-1">{s.v}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal y={12} delay={0.1}>
          <HeroCarousel slides={slides} />
        </Reveal>
      </div>
    </section>
  );
}
