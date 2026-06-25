"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/mock-data";
import { SectionHeader } from "@/components/ui/section";

export function CategoriesGrid() {
  return (
    <section className="container py-20">
      <SectionHeader
        eyebrow="Categories"
        title="Find your shape"
        subtitle="From day totes to weekend duffels, the catalogue is built around six honest silhouettes."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c, i) => (
          <motion.div
            key={c.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <Link
              href={`/products?category=${c.slug}`}
              className="group relative block aspect-[5/4] sm:aspect-[4/5] overflow-hidden rounded-2xl border border-border"
            >
              <Image
                src={c.image}
                alt={c.label}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between">
                <p className="font-display text-2xl text-white">{c.label}</p>
                <span className="text-xs uppercase tracking-[0.18em] text-white/80 group-hover:text-gold transition">
                  Shop →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
