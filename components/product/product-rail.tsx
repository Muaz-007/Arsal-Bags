"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types";

/**
 * ProductRail
 *
 * Responsive product showcase:
 *  - Mobile / tablet: 2-row horizontally scrollable rail with snap. Cards are
 *    rendered statically (no per-card scroll-in animation) and images load
 *    eagerly so off-screen cards are ready the moment the user starts to
 *    swipe — no pop-in.
 *  - Desktop (lg+): a single static row of cards in a regular grid — no
 *    horizontal scroll, no edge fades, no arrows. Per-card stagger animation
 *    still plays since the whole row is on screen at once.
 */
export function ProductRail({
  products,
  desktopColumns = 4,
}: {
  products: Product[];
  desktopColumns?: 3 | 4 | 5;
}) {
  const desktopList = products.slice(0, desktopColumns);

  const desktopColsClass: Record<3 | 4 | 5, string> = {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
  };

  return (
    <>
      {/* Mobile / tablet — 2-row scrollable rail, no per-card animation, eager image loading */}
      <div className="lg:hidden grid grid-rows-2 grid-flow-col auto-cols-[170px] sm:auto-cols-[220px] gap-3 sm:gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pl-2 -mr-5 pr-5 pb-2 sm:pl-3">
        {products.map((p, i) => (
          <div key={p.id} className="snap-start">
            <ProductCard product={p} priority={i < 2} eager />
          </div>
        ))}
      </div>

      {/* Desktop — single static row */}
      <div className={`hidden lg:grid gap-6 ${desktopColsClass[desktopColumns]}`}>
        {desktopList.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.55,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <ProductCard product={p} priority={i < 2} />
          </motion.div>
        ))}
      </div>
    </>
  );
}
