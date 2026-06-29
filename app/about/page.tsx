import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Hammer, Heart, Leaf, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Atelier",
  description:
    "BagsArt is a small leather goods studio in Lahore. Hand-stitched bags, honest materials, lifetime repair.",
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
    icon: Heart,
    title: "Repair, don't replace",
    body: "If a stitch fails or a strap wears through, send the bag back. We'll repair it at cost so a piece you love stays in service for years instead of ending up in a landfill.",
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
              The Atelier
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
                alt="Inside the atelier"
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
              note: "Soft, breathable cotton — not the bonded plastic sheet you'll find inside most mid-range bags. Easier to repair, and it doesn't crack with age.",
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

      {/* Repair / longevity */}
      <section
        id="sustainability"
        className="border-y border-border bg-foreground text-background py-20 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="container relative grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-gold">
              Built to be kept
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight">
              A bag you only buy once.
            </h2>
            <p className="mt-5 text-background/75 leading-relaxed max-w-md">
              The most sustainable thing a leather goods brand can do is make
              something the owner keeps. We design for that — heavier hides,
              double-stitched seams, hardware you can replace. And if anything
              does go wrong, we'd rather fix it than sell you a new one.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="space-y-4 max-w-md text-background/85">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                <span>
                  In-house repair — restitching, re-edging, hardware
                  replacement — for as long as you own the bag.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                <span>
                  Recycled-card boxes and paper tape. No plastic in the
                  packaging.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                <span>
                  Small batch runs so we don't produce more than we can sell —
                  unsold stock is its own kind of waste.
                </span>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center max-w-3xl mx-auto">
            <p className="font-display text-2xl sm:text-3xl tracking-tight">
              Visit the studio.
            </p>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              We take private appointments at our Lahore workshop. Come see how
              the bags are made, or just stop by for a coffee and a look at the
              leather.
            </p>
            <div className="mt-6">
              <Button href="/contact" variant="gold" size="lg">
                Get in touch <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
