"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/components/home/hero-carousel";

/**
 * Hero
 *
 * Mobile-first: the image area is a soft-fading carousel that auto-rotates
 * through a few curated products, each with its own caption.
 */

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/50" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06] bg-grid-pattern"
        style={{ backgroundSize: "44px 44px" }}
      />

      <div className="container relative grid lg:grid-cols-2 gap-12 items-center pt-6 pb-24 lg:pt-10 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-8 bg-gold" />
            New · Summer Atelier 2026
          </p>
          <h1 className="mt-5 font-display text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
            Crafted bags,{" "}
            <span className="text-gradient-gold">reimagined</span>{" "}
            for a quieter world.
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
            Full-grain leather, solid brass, and patient hand-stitching — the
            kind of bag you carry for a decade and pass on for two more.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" variant="gold" href="/products">
              Shop the collection <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" href="/about">
              Our atelier
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 max-w-md gap-6 text-sm">
            {[
              { k: "Hand-stitched", v: "by master artisans" },
              { k: "Full-grain", v: "Italian leather" },
              { k: "Lifetime", v: "repair guarantee" },
            ].map((s) => (
              <div key={s.k}>
                <p className="font-display text-base">{s.k}</p>
                <p className="text-muted-foreground text-xs mt-1">{s.v}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <HeroCarousel />
        </motion.div>
      </div>
    </section>
  );
}
