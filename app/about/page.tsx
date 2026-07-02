import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Hammer, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "BagsArt is a small leather goods studio in Lahore. Hand-stitched bags in full-grain leather — made in small batches.",
};

const PILLARS = [
  {
    icon: Hammer,
    title: "Made by hand",
    body: "Each bag is cut, stitched, and finished by one maker rather than passed down a production line. It takes longer. It also means there's one person responsible for every piece that leaves the studio.",
  },
  {
    icon: ShieldCheck,
    title: "Honest materials",
    body: "Full-grain leather, solid brass, cotton-thread stitching, soft fabric linings. We list what's in every bag on its product page — no hidden coatings or filler layers.",
  },
  {
    icon: Sparkles,
    title: "Timeless design",
    body: "Our shapes are drawn to sit quietly in your rotation for years — not to chase seasonal trends. Fewer pieces, drawn carefully, made properly.",
  },
  {
    icon: Leaf,
    title: "Made in small batches",
    body: "We work in small runs rather than mass production. That keeps quality in our hands, and it means we don't end up with shelves of unsold stock — which is its own kind of waste.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/40" />
        <div className="container py-20 lg:py-28 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              About us
            </p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
              Leather goods,{" "}
              <span className="text-gradient-gold">built to last</span>.
            </h1>
            <p className="mt-6 max-w-xl text-muted-foreground text-lg leading-relaxed">
              BagsArt is a small studio in Lahore making bags the slow way —
              one piece at a time, from full-grain leather, finished by hand.
              No shortcuts, no plastic linings, no rebranded import.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/products" variant="gold" size="lg">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="#craft" variant="outline" size="lg">
                How we work
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border">
              <Image
                src="https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=70"
                alt="Inside the studio"
                fill
                sizes="(min-width: 1024px) 520px, 90vw"
                priority
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pillars */}
      <section id="craft" className="border-y border-border bg-muted/30 py-20">
        <div className="container">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              How we work
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight max-w-2xl">
              Four things we hold to, on every piece.
            </h2>
          </Reveal>
          <div className="mt-12 grid sm:grid-cols-2 gap-8">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06}>
                <article className="rounded-2xl border border-border bg-card p-7 h-full">
                  <span className="h-10 w-10 grid place-items-center rounded-lg bg-gold/15 text-gold-dark dark:text-gold-light mb-4">
                    <p.icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-xl">{p.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {p.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Materials strip */}
      <section id="materials" className="container py-20">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Materials
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight max-w-2xl">
            What goes into a BagsArt piece.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Every product page lists the exact materials used. Here's the
            short version of what we stock in the studio.
          </p>
        </Reveal>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Full-grain leather",
              note: "The top layer of the hide, with the grain intact. Heavier and stiffer than the corrected leather most factories use — but it ages well and develops a natural patina.",
              image:
                "https://images.unsplash.com/photo-1564594985645-4427056e22e2?auto=format&fit=crop&w=600&q=70",
            },
            {
              title: "Solid brass hardware",
              note: "No plating, no plastic core. The metal is heavier in the hand and will gradually pick up a warmer tone with use rather than chipping.",
              image:
                "https://images.unsplash.com/photo-1577538926210-fc6a26bf2768?auto=format&fit=crop&w=600&q=70",
            },
            {
              title: "Cotton linings",
              note: "Soft, breathable cotton — not the bonded plastic sheet you'll find inside most mid-range bags. Ages gracefully and doesn't crack.",
              image:
                "https://images.unsplash.com/photo-1610177498573-58c50bf01ff7?auto=format&fit=crop&w=600&q=70",
            },
          ].map((m, i) => (
            <Reveal key={m.title} delay={i * 0.06}>
              <article className="rounded-2xl overflow-hidden border border-border bg-card">
                <div className="relative aspect-[5/4] bg-muted">
                  <Image
                    src={m.image}
                    alt={m.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg">{m.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {m.note}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Collection CTA — closes the About page with a clear route to shop */}
      <section
        id="collection"
        className="border-y border-border bg-foreground text-background py-24 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

        <div className="container relative text-center max-w-2xl mx-auto">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-gold">
              The collection
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight leading-[1.1]">
              See the bags in{" "}
              <span className="text-gradient-gold">their element</span>.
            </h2>
            <p className="mt-6 text-background/75 leading-relaxed">
              Totes for the everyday, backpacks for the commute, clutches for
              the evening — full-grain leather across every silhouette. Have
              a look and choose the one that fits your day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button href="/products" variant="gold" size="lg">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                href="/contact"
                variant="outline"
                size="lg"
                className="border-background/30 text-background hover:bg-background/10"
              >
                Talk to us
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}
