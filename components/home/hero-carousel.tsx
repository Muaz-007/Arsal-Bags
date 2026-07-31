"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Hero carousel — auto-rotates through a small curated set of products,
 * each slide showing the photo plus a short product line. Built to feel at
 * home on mobile (the primary surface) while still working as the desktop
 * hero image.
 */

export interface Slide {
  href: string;
  src: string;
  alt: string;
  tag: string;
  name: string;
  price: string;
  tagline: string;
}

// A single, safely-linked fallback shown when the admin hasn't uploaded
// any hero slides via `/admin/storefront`. Links to the catalogue root
// (not a specific product slug) so the CTA can't 404 if the catalogue
// has been wiped. As soon as the admin adds even one slide, this is
// ignored and the admin-curated set takes over — one slide = static
// hero, multiple slides = auto-rotating carousel.
const DEFAULT_SLIDES: Slide[] = [
  {
    href: "/products",
    src: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=70",
    alt: "Full-grain leather goods from BagsArt",
    tag: "The catalogue",
    name: "Handcrafted in Lahore",
    price: "",
    tagline: "Full-grain leather, small batches, quiet design.",
  },
];

const ROTATION_MS = 4500;

export function HeroCarousel({ slides }: { slides?: Slide[] }) {
  // Admin slides win; otherwise fall back to the single DEFAULT_SLIDES
  // entry so the section is never empty. Rotation only kicks in when
  // there's actually more than one slide to cycle through.
  const SLIDES = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || SLIDES.length <= 1) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, [paused, SLIDES.length]);

  const slide = SLIDES[active];

  const goPrev = () =>
    setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  const goNext = () => setActive((i) => (i + 1) % SLIDES.length);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="relative aspect-[4/5] lg:h-[560px] lg:aspect-auto mx-auto w-full max-w-sm lg:max-w-none">
        {/* Glow */}
        <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gold/15 blur-3xl" />

        {/* Image stack — cross-fades between slides */}
        <Link
          href={slide.href}
          className="relative block h-full w-full rounded-3xl overflow-hidden border border-border bg-muted"
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={slide.src}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(min-width: 1024px) 520px, 90vw"
                priority={active === 0}
                fetchPriority={active === 0 ? "high" : "auto"}
                loading={active === 0 ? "eager" : "lazy"}
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Gradient + caption */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="absolute bottom-5 left-5 right-5 text-white"
            >
              <p className="text-[10px] uppercase tracking-[0.22em] opacity-85">
                {slide.tag}
              </p>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <p className="font-display text-xl sm:text-2xl">{slide.name}</p>
                <span className="font-display text-base sm:text-lg">
                  {slide.price}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-white/85 leading-snug line-clamp-2">
                {slide.tagline}
              </p>
            </motion.div>
          </AnimatePresence>
        </Link>

        {/* Decorative dot — stays inside the card on mobile */}
        <span className="absolute top-3 left-3 lg:-top-3 lg:-left-3 h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-gold animate-float opacity-90 pointer-events-none" />

        {/* Prev / Next arrows — hidden with a single slide since there's
            nothing to navigate to. */}
        {SLIDES.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous slide"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center rounded-full bg-background/80 backdrop-blur border border-border shadow-md hover:bg-background hover:scale-105 active:scale-95 transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next slide"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center rounded-full bg-background/80 backdrop-blur border border-border shadow-md hover:bg-background hover:scale-105 active:scale-95 transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Slide indicators — pointless with one slide, so hide them too. */}
      {SLIDES.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active
                  ? "w-8 bg-foreground"
                  : "w-1.5 bg-foreground/25 hover:bg-foreground/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
