"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * PDP image gallery — hero image with fade transitions plus a horizontal
 * thumbnail strip. The 3D preview mode was removed because the placeholder
 * mesh didn't match the actual product (same generic bag for every SKU),
 * which read as amateurish. Real 360° / video support can slot in here later.
 */
export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);

  return (
    <div>
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted">
        <AnimatePresence mode="wait">
          <motion.div
            key={images[index]}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src={images[index]}
              alt={alt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setIndex(i)}
            className={cn(
              "relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-md overflow-hidden border transition",
              index === i
                ? "border-foreground"
                : "border-border opacity-70 hover:opacity-100"
            )}
          >
            <Image src={src} alt={`${alt} — view ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
