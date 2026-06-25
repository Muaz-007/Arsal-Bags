"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { cn, formatPrice } from "@/lib/utils";
import { useWishlist } from "@/store/wishlist";
import type { Product } from "@/types";

export function ProductCard({
  product,
  priority,
  eager,
}: {
  product: Product;
  priority?: boolean;
  /** Force `loading="eager"` on the image — useful inside a horizontal rail
   *  where lazy-loaded off-screen cards would otherwise pop in on scroll. */
  eager?: boolean;
}) {
  const wishlisted = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);

  const onSale = product.compareAt && product.compareAt > product.price;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm transition-shadow duration-300 group-hover:shadow-xl"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          loading={priority || eager ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {onSale && <Badge variant="gold">Sale</Badge>}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="warning">Low stock</Badge>
          )}
          {product.stock === 0 && <Badge variant="muted">Sold out</Badge>}
        </div>

        <button
          aria-label="Toggle wishlist"
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
          }}
          className={cn(
            "absolute right-3 top-3 h-9 w-9 grid place-items-center rounded-full",
            "bg-background/80 backdrop-blur transition hover:bg-background"
          )}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition",
              wishlisted ? "fill-red-500 text-red-500" : "text-foreground"
            )}
          />
        </button>
      </Link>

      <div className="mt-2.5 sm:mt-3 px-0.5 sm:px-1 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/products/${product.slug}`}
            className="font-display text-sm sm:text-base leading-snug hover:underline decoration-gold underline-offset-4"
          >
            {product.name}
          </Link>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
            {product.tagline}
          </p>
          <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2">
            <Rating value={product.rating} size={12} />
            <span className="text-[11px] sm:text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm sm:text-base font-medium">{formatPrice(product.price)}</p>
          {onSale && (
            <p className="text-[11px] sm:text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAt!)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
