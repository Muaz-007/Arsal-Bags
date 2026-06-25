"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Box } from "lucide-react";
import { cn } from "@/lib/utils";

const ProductViewer = dynamic(
  () => import("@/components/3d/product-viewer").then((m) => m.ProductViewer),
  { ssr: false }
);

export function ProductGallery({
  images,
  alt,
  color,
}: {
  images: string[];
  alt: string;
  color?: string;
}) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"image" | "3d">("image");

  return (
    <div>
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted">
        {mode === "3d" ? (
          <ProductViewer color={color} />
        ) : (
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
        )}

        <button
          onClick={() => setMode(mode === "3d" ? "image" : "3d")}
          className={cn(
            "absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs",
            "bg-background/80 backdrop-blur border border-border hover:bg-background transition"
          )}
        >
          <Box className="h-3.5 w-3.5" />
          {mode === "3d" ? "Photos" : "3D View"}
        </button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => {
              setIndex(i);
              setMode("image");
            }}
            className={cn(
              "relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-md overflow-hidden border transition",
              index === i && mode === "image"
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
