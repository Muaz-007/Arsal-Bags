"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLLAGE = [
  {
    src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=70",
    alt: "Atelier Backpack",
    // big tile on desktop, normal on mobile
    className: "lg:col-span-2 lg:row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?auto=format&fit=crop&w=500&q=70",
    alt: "Courier Crossbody",
    className: "lg:col-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=500&q=70",
    alt: "Soirée Clutch",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1606513542745-97629752a13b?auto=format&fit=crop&w=500&q=70",
    alt: "Bifold Wallet",
    className: "",
  },
];

const STATS = [
  { value: "60+", label: "pieces in catalogue" },
  { value: "6", label: "honest silhouettes" },
  { value: "100%", label: "made in studio" },
];

/**
 * Variety CTA — a wide banner inviting the visitor to browse the full
 * catalogue. Sits below Best Sellers and acts as the bridge from "curated
 * picks" to the rest of the store.
 */
export function VarietyCta() {
  return (
    <section className="container py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card"
      >
        {/* Decorative gold blur */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-foreground/5 blur-3xl" />

        <div className="relative grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-14 p-6 sm:p-8 md:p-12 lg:p-16 items-center">
          {/* Copy */}
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-gold" />
              The full catalogue
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
              View our entire{" "}
              <span className="text-gradient-gold">variety</span>{" "}
              of crafted pieces.
            </h2>
            <p className="mt-5 text-muted-foreground max-w-md leading-relaxed">
              From day totes to evening clutches, weekend duffels to bifold
              wallets — every silhouette, every finish, every color the atelier
              currently makes. All in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="gold" href="/products">
                Browse all products
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" href="/products?sort=latest">
                See new arrivals
              </Button>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md pt-6 border-t border-border">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-2xl md:text-3xl">{s.value}</dt>
                  <dd className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mt-1 leading-snug">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Collage — 2x2 grid on mobile, complex 3x2 layout on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-2 aspect-square lg:aspect-auto lg:h-[440px]">
            {COLLAGE.map((img, i) => (
              <motion.div
                key={img.src}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative overflow-hidden rounded-2xl border border-border bg-muted ${img.className}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 22vw, 45vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
