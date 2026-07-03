"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function AddToCart({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(product.colors[0]);
  const add = useCart((s) => s.add);
  const toggle = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const push = useToast((s) => s.push);

  const inStock = product.stock > 0;

  function addToCart() {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: qty,
      color,
    });
    push({
      title: "Added to your bag",
      description: `${product.name}${color ? ` · ${color}` : ""}`,
      tone: "success",
    });
  }

  return (
    <div className="space-y-6">
      {product.colors.length > 1 && (
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Color · <span className="text-foreground">{color}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition",
                  color === c
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-10 w-10 grid place-items-center hover:bg-muted rounded-l-full"
            aria-label="Decrease"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
            className="h-10 w-10 grid place-items-center hover:bg-muted rounded-r-full"
            aria-label="Increase"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <Button size="lg" variant="gold" onClick={addToCart} disabled={!inStock} className="flex-1">
          <ShoppingBag className="h-4 w-4" />
          {inStock ? "Add to bag" : "Sold out"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => toggle(product.id)}
          aria-label="Toggle wishlist"
        >
          <Heart className={cn("h-4 w-4", wished && "fill-red-500 text-red-500")} />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Free delivery over Rs 4,000 · Cash on delivery · Made in Lahore
      </p>
    </div>
  );
}
