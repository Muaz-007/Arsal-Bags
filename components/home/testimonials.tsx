"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section";
import { TESTIMONIALS } from "@/lib/mock-data";
import { Quote } from "lucide-react";

export function Testimonials() {
  return (
    <section className="relative border-y border-border bg-muted/40 py-24 overflow-hidden">
      {/* Subtle gold glow accents */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-gold/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-gold/8 blur-3xl" />

      <div className="container relative">
        <SectionHeader
          eyebrow="Carried by"
          title="A quiet kind of obsession"
          align="center"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.55,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-7 relative transition-shadow duration-300 hover:shadow-xl hover:shadow-gold/5"
            >
              <Quote className="h-5 w-5 text-gold mb-4" />
              <blockquote className="text-base leading-relaxed text-foreground/90">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-border/60">
                <p className="font-display text-base">{t.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">
                  {t.role}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
