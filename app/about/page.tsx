import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Hammer, Heart, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Atelier",
  description:
    "Inside the BagsArt atelier — craft, materials, sustainability, and the people who make every piece.",
};

const PILLARS = [
  {
    icon: Hammer,
    title: "Hand-stitched, end to end",
    body: "Every BagsArt piece is built by one artisan, start to finish. We don't divide labour, because we don't divide ownership — the maker signs the inside of every bag.",
  },
  {
    icon: Award,
    title: "Honest materials",
    body: "Full-grain Tuscan leather, solid brass, cotton-thread stitching, suede linings. We name every material on the product page because we want you to be able to question them.",
  },
  {
    icon: Heart,
    title: "Lifetime repair",
    body: "If a stitch fails, send it back. We resole, restitch, and re-edge for as long as you carry the bag. The same studio that made it will fix it.",
  },
  {
    icon: Leaf,
    title: "Quietly sustainable",
    body: "Vegetable-tanned hides from a Tuscan tannery rated by the Leather Working Group. Off-cuts go to a local school of design. Packaging is recycled card and paper tape — no plastic.",
  },
];

const TIMELINE = [
  {
    year: "2018",
    note: "Two friends start sketching wallets at the kitchen table.",
  },
  {
    year: "2020",
    note: "First Florence Tote leaves the workshop. Sells out in a weekend.",
  },
  {
    year: "2023",
    note: "Open the Karachi atelier — five artisans, room to grow slowly.",
  },
  {
    year: "2026",
    note: "Launch the Heritage collection and our first online flagship.",
  },
];

const TEAM = [
  {
    name: "Mira Kapoor",
    role: "Founder & Designer",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=70",
  },
  {
    name: "Daniel Reyes",
    role: "Head of Atelier",
    photo:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=70",
  },
  {
    name: "Asha Verma",
    role: "Master Artisan",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=500&q=70",
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
              Bags built by hand,{" "}
              <span className="text-gradient-gold">designed to outlive</span>{" "}
              trends.
            </h1>
            <p className="mt-6 max-w-xl text-muted-foreground text-lg leading-relaxed">
              BagsArt is a small studio in Karachi making bags the slow way —
              one person, one bag, one signature on the inside. We work in
              capsules of a few hundred pieces, then start again.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/products" variant="gold" size="lg">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="#craft" variant="outline" size="lg">
                How we make a bag
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
              What we believe
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight max-w-2xl">
              Four principles, repeated for every piece.
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
            Sourced openly, named honestly.
          </h2>
        </Reveal>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Tuscan full-grain leather",
              note: "Vegetable-tanned in Santa Croce sull'Arno by a Leather Working Group gold-rated tannery.",
              image:
                "https://images.unsplash.com/photo-1564594985645-4427056e22e2?auto=format&fit=crop&w=600&q=70",
            },
            {
              title: "Solid brass hardware",
              note: "Cast in Birmingham, lacquer-free so the metal can develop a real patina.",
              image:
                "https://images.unsplash.com/photo-1577538926210-fc6a26bf2768?auto=format&fit=crop&w=600&q=70",
            },
            {
              title: "Linen-cotton lining",
              note: "Woven in Karachi from organic cotton — softens and breathes, never crinkles.",
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

      {/* Sustainability */}
      <section
        id="sustainability"
        className="border-y border-border bg-foreground text-background py-20 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="container relative grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-gold">
              Sustainability
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight">
              Small enough to count every hide.
            </h2>
            <p className="mt-5 text-background/75 leading-relaxed max-w-md">
              We make under 4,000 pieces a year. That means we can choose every
              hide ourselves, repair every bag in-house, and ship from a single
              studio — none of which is possible at scale.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-6 max-w-md">
              {[
                { v: "100%", k: "LWG-rated leather" },
                { v: "0", k: "single-use plastic in packaging" },
                { v: "< 4k", k: "pieces per year" },
                { v: "5 yr", k: "average bag lifespan" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="font-display text-4xl">{s.v}</dt>
                  <dd className="mt-1 text-[11px] uppercase tracking-[0.16em] text-background/55">
                    {s.k}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Timeline */}
      <section className="container py-20">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Story so far
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight max-w-2xl">
            Eight years, four collections, one studio.
          </h2>
        </Reveal>
        <ol className="mt-12 relative max-w-2xl">
          <span className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
          {TIMELINE.map((t, i) => (
            <Reveal key={t.year} delay={i * 0.05}>
              <li className="relative pl-8 pb-8 last:pb-0">
                <span className="absolute left-0 top-1 h-4 w-4 rounded-full bg-gold ring-4 ring-background" />
                <p className="font-display text-2xl">{t.year}</p>
                <p className="mt-1 text-muted-foreground">{t.note}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Team */}
      <section className="container pb-20">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            The studio
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight max-w-2xl">
            People you can put a name to.
          </h2>
        </Reveal>
        <div className="mt-10 grid sm:grid-cols-3 gap-6">
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.06}>
              <article className="rounded-2xl overflow-hidden border border-border bg-card">
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={m.photo}
                    alt={m.name}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="font-display text-lg">{m.name}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">
                    {m.role}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-14 rounded-3xl border border-border bg-card p-8 sm:p-10 text-center max-w-3xl mx-auto">
            <p className="font-display text-2xl sm:text-3xl tracking-tight">
              Come visit the atelier.
            </p>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              We host private appointments at our Karachi studio. Bring a coffee,
              we'll show you how a Florence Tote is born.
            </p>
            <div className="mt-6">
              <Button href="/contact" variant="gold" size="lg">
                Book an appointment <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
