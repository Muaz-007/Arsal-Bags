"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/store/wishlist";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

/**
 * Client-side wishlist view. Handles two cases:
 *  - Signed in: receives `initialProducts` already hydrated from Prisma; the
 *    Zustand store is used only to drive the heart icons across the site.
 *  - Guest: no products are passed in — we read IDs from localStorage and
 *    fetch product details from /api/products on mount.
 */
export function WishlistClient({
  initialProducts,
}: {
  initialProducts?: Product[];
}) {
  const ids = useWishlist((s) => s.ids);
  const clear = useWishlist((s) => s.clear);
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(!initialProducts);

  useEffect(() => {
    if (initialProducts) return;
    fetch("/api/products")
      .then((r) => r.json())
      .then((d: { products: Product[] }) => {
        setProducts(d.products.filter((p) => ids.includes(p.id)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ids, initialProducts]);

  // Guest path
  if (!initialProducts) {
    return (
      <div className="space-y-8">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Your account
            </p>
            <h1 className="mt-3 font-display text-4xl">Wishlist</h1>
            <p className="mt-2 text-muted-foreground">
              {ids.length} {ids.length === 1 ? "piece" : "pieces"} on your list.
            </p>
          </div>
          {ids.length > 0 && (
            <Button variant="ghost" onClick={clear}>
              Clear wishlist
            </Button>
          )}
        </header>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Your wishlist is empty. Tap the heart on any product to save it
            here. Sign in to sync it across devices.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Signed-in path
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
