"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/store/wishlist";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const clear = useWishlist((s) => s.clear);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d: { products: Product[] }) => {
        setProducts(d.products.filter((p) => ids.includes(p.id)));
        setLoading(false);
      });
  }, [ids]);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl">Wishlist</h1>
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
          Your wishlist is empty. Tap the heart on any product to save it here.
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
