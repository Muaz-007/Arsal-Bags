"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section";
import { Quote } from "lucide-react";

export type TestimonialItem = {
  id: string;
  author: string;
  role: string;
  quote: string;
  productSlug?: string;
  productName?: string;
};

/**
 * Homepage social-proof section. Rendered from real DB reviews when the
 * admin has featured any (see `getFeaturedReviews`), and hidden entirely
 * when the list is empty — a page with 0 testimonials feels quieter than
 * one padded with fake ones.
 */
export function Testimonials({ items }: { items: TestimonialItem[] }) {
  if (items.length === 0) return null;

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
          {items.map((t, i) => (
            <motion.figure
              key={t.id}
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
                <p className="font-display text-base">{t.author}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">
                  {t.role}
                </p>
                {t.productSlug && t.productName && (
                  <Link
                    href={`/products/${t.productSlug}`}
                    className="mt-2 inline-block text-[11px] text-muted-foreground hover:text-foreground underline decoration-gold underline-offset-4"
                  >
                    On the {t.productName}
                  </Link>
                )}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
