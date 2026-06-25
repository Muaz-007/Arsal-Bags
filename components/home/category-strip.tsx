"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Category Strip
 *
 * Continuously-scrolling marquee of circular quick-filter thumbnails.
 *
 * Implementation: a CSS transform animation on the inner track. This is
 * GPU-accelerated (no per-frame React state, no layout-thrashing scrollLeft
 * writes) so the motion stays consistently smooth on phones. The list is
 * rendered twice and the track translates from `0` to `-50%`, landing
 * exactly on the start of the duplicate — no visible seam.
 *
 * Hover / touch pauses the animation; after the user lets go, it resumes
 * from wherever it was after a short delay (so the strip doesn't yank itself
 * out from under a still-reading finger).
 */

const img = (id: string, size = 200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${size}&q=70`;

const ITEMS = [
  { label: "Under $199", href: "/products?price=0-199", image: img("photo-1606513542745-97629752a13b") },
  { label: "Best Sellers", href: "/products?sort=popular", image: img("photo-1548036328-c9fa89d128fa") },
  { label: "Under $299", href: "/products?price=0-299", image: img("photo-1566150905458-1bf1fc113f0d") },
  { label: "Backpacks", href: "/products?category=backpack", image: img("photo-1553062407-98eeb64c6a62") },
  { label: "On Sale", href: "/products?sale=1", image: img("photo-1591348278863-a8fb3887e2aa") },
  { label: "Totes", href: "/products?category=tote", image: img("photo-1590874103328-eac38a683ce7") },
  { label: "Under $499", href: "/products?price=0-499", image: img("photo-1564422170194-896b89110ef8") },
  { label: "Heritage", href: "/products?collection=heritage", image: img("photo-1547949003-9792a18a2601") },
  { label: "Crossbody", href: "/products?category=crossbody", image: img("photo-1584917865442-de89df76afd3") },
  { label: "New In", href: "/products?sort=latest", image: img("photo-1622560480605-d83c853bc5c3") },
  { label: "Wallets", href: "/products?category=wallet", image: img("photo-1572569511254-d8f925fe2cbb") },
  { label: "Evening", href: "/products?collection=evening", image: img("photo-1559563458-527698bf5295") },
];

// Mouse leaves → resume almost instantly (the user has moved on).
// Touch ends   → wait a moment, so the strip doesn't yank itself out from
//                under a still-reading finger.
const MOUSE_RESUME_MS = 120;
const TOUCH_RESUME_MS = 1000;

export function CategoryStrip() {
  const loop = [...ITEMS, ...ITEMS];
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pause = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = null;
    setPaused(true);
  };
  const resumeAfter = (ms: number) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), ms);
  };

  return (
    <section
      className="relative overflow-hidden border-y border-border bg-background py-6 sm:py-8"
      aria-label="Shop by category"
      onMouseEnter={pause}
      onMouseLeave={() => resumeAfter(MOUSE_RESUME_MS)}
      onTouchStart={pause}
      onTouchEnd={() => resumeAfter(TOUCH_RESUME_MS)}
    >
      {/* Edge fades so items glide in / out instead of cutting off */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-background to-transparent z-10" />

      <ul
        className={cn(
          "marquee-track flex w-max gap-5 sm:gap-8 px-5",
          paused && "marquee-paused"
        )}
      >
        {loop.map((it, i) => (
          <li key={i} className="shrink-0">
            <Link
              href={it.href}
              className="flex flex-col items-center gap-2 w-[78px] sm:w-[96px] group/item"
            >
              <div className="relative h-[68px] w-[68px] sm:h-[84px] sm:w-[84px] rounded-full overflow-hidden border border-border ring-1 ring-gold/15 shadow-sm transition-transform duration-300 group-hover/item:scale-105 group-hover/item:ring-gold/40">
                <Image
                  src={it.image}
                  alt={it.label}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-muted-foreground group-hover/item:text-foreground transition-colors text-center leading-tight">
                {it.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
