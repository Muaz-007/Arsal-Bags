"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const update = useCart((s) => s.update);
  const remove = useCart((s) => s.remove);
  const apply = useCart((s) => s.applyCoupon);
  const coupon = useCart((s) => s.coupon);
  const subtotal = useCart((s) => s.subtotal());
  const shipping = useCart((s) => s.shipping());
  const tax = useCart((s) => s.tax());
  const discount = useCart((s) => s.discount());
  const total = useCart((s) => s.total());
  const push = useToast((s) => s.push);

  const [code, setCode] = useState(coupon?.code ?? "");
  const [applying, setApplying] = useState(false);

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/coupons/${encodeURIComponent(code.trim())}`);
      if (!res.ok) {
        push({ title: "Invalid coupon code", tone: "error" });
        return;
      }
      const data = await res.json();
      apply({ code: data.code, type: data.type, value: data.value });
      push({ title: "Coupon applied", description: data.code, tone: "success" });
    } finally {
      setApplying(false);
    }
  }

  if (lines.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="container py-20 max-w-xl text-center"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.1,
          }}
          className="relative mx-auto h-24 w-24"
        >
          <div className="absolute inset-0 rounded-full bg-gold/10 blur-2xl" />
          <div className="relative h-full w-full grid place-items-center rounded-full border border-border bg-card shadow-sm">
            <ShoppingBag className="h-9 w-9 text-foreground/70" />
          </div>
        </motion.div>
        <h1 className="mt-7 font-display text-4xl">Your bag is empty</h1>
        <p className="mt-3 text-muted-foreground">
          Browse the catalogue — every piece is made in a small run, then put on
          a shelf to be carried home.
        </p>
        <Button href="/products" size="lg" className="mt-8" variant="gold">
          Start shopping <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="container py-12 lg:py-16 grid gap-12 lg:grid-cols-[1fr_380px]">
      <section>
        <h1 className="font-display text-4xl tracking-tight">Your bag</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {lines.length} {lines.length === 1 ? "item" : "items"}
        </p>

        <ul className="mt-8 divide-y divide-border border-y border-border">
          <AnimatePresence initial={false}>
            {lines.map((line) => (
              <motion.li
                key={`${line.productId}-${line.color}`}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="py-6 grid grid-cols-[80px_1fr_auto] sm:grid-cols-[110px_1fr_auto] gap-4 sm:gap-5 items-center"
              >
                <Link
                  href={`/products/${line.slug}`}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <Image src={line.image} alt={line.name} fill className="object-cover" />
                </Link>
                <div className="min-w-0">
                  <Link
                    href={`/products/${line.slug}`}
                    className="font-display text-lg hover:underline decoration-gold underline-offset-4"
                  >
                    {line.name}
                  </Link>
                  {line.color && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Color · {line.color}
                    </p>
                  )}
                  <p className="text-sm mt-2">{formatPrice(line.price)} each</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button
                        onClick={() =>
                          update(line.productId, line.quantity - 1, line.color)
                        }
                        className="h-8 w-8 grid place-items-center hover:bg-muted rounded-l-full"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{line.quantity}</span>
                      <button
                        onClick={() =>
                          update(line.productId, line.quantity + 1, line.color)
                        }
                        className="h-8 w-8 grid place-items-center hover:bg-muted rounded-r-full"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(line.productId, line.color)}
                      className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
                <p className="font-medium text-right">
                  {formatPrice(line.price * line.quantity)}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>

      <aside className="lg:sticky lg:top-24 self-start glass rounded-2xl p-7 space-y-5">
        <h2 className="font-display text-2xl">Order summary</h2>

        <form onSubmit={applyCoupon} className="flex gap-2">
          <Input
            placeholder="Coupon code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button type="submit" variant="outline" loading={applying}>
            Apply
          </Button>
        </form>
        <p className="text-xs text-muted-foreground -mt-3">
          Try <code className="font-mono">WELCOME10</code> or{" "}
          <code className="font-mono">STUDIO25</code>.
        </p>

        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <dt>Discount</dt>
              <dd>−{formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
          </div>
          {tax > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd>{formatPrice(tax)}</dd>
            </div>
          )}
          <div className="hairline" />
          <div className="flex justify-between font-display text-lg">
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>

        <Button href="/checkout" size="lg" variant="gold" className="w-full">
          Checkout <ArrowRight className="h-4 w-4" />
        </Button>
        <Link
          href="/products"
          className="block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
