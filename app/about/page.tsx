import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Atelier",
  description: "Inside the BagsArt atelier — craft, materials, and the people who make our bags.",
};

const STORY = [
  {
    title: "Hand-stitched",
    body: "Every BagsArt piece is built by one artisan, end to end. We don't divide labour, because we don't divide ownership — the maker signs the inside of every bag.",
  },
  {
    title: "Honest materials",
    body: "Full-grain Tuscan leather, solid brass, cotton-thread stitching, suede linings. We name every material on the product page because we want you to be able to question them.",
  },
  {
    title: "Lifetime repair",
    body: "If a stitch fails, send it back. We resole, restitch, and re-edge for as long as you carry the bag. The same studio that made it will fix it.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="container py-20">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          The Atelier
        </p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl tracking-tight max-w-3xl">
          Bags built by hand, designed to outlive trends.
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground leading-relaxed">
          BagsArt is a small studio in Karachi making bags the slow way — one
          person, one bag, one signature on the inside. We work in capsules of a
          few hundred pieces, then start again.
        </p>
      </section>

      <section className="container grid lg:grid-cols-3 gap-8 py-12 border-t border-border">
        {STORY.map((s) => (
          <article key={s.title}>
            <h3 className="font-display text-2xl">{s.title}</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">{s.body}</p>
          </article>
        ))}
      </section>

      <section className="container py-20">
        <div className="relative aspect-[16/8] rounded-3xl overflow-hidden border border-border">
          <Image
            src="https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=2000&q=80"
            alt="Inside the atelier"
            fill
            className="object-cover"
          />
        </div>
      </section>
    </>
  );
}
