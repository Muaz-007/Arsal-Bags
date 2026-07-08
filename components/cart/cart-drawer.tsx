"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { formatPrice } from "@/lib/utils";

/**
 * Right-side cart drawer. Opens automatically the moment Add-to-Cart fires,
 * so buyers get an immediate visual "yes, it's in your bag" without needing
 * to hunt for the cart icon. Also usable as a mini-cart when the customer
 * clicks the cart icon in the navbar.
 *
 * Body scroll locked while open. Esc / backdrop click / X all close.
 * Rendered from the root layout so it's available on every route.
 */
export function CartDrawer() {
  const open = useCart((s) => s.drawerOpen);
  const close = useCart((s) => s.closeDrawer);
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const shipping = useCart((s) => s.shipping());
  const total = useCart((s) => s.total());
  const totalItems = useCart((s) => s.totalItems());
  const update = useCart((s) => s.update);
  const remove = useCart((s) => s.remove);
  const pathname = usePathname();

  useBodyScrollLock(open);

  // Close on route change so navigating from inside the drawer (View bag,
  // Checkout, product link) always dismisses it — even when the target
  // route is the same as the current one and Next.js doesn't fire a
  // navigation event, the pathname value still churns.
  useEffect(() => {
    if (open) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cart-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-sm"
            onClick={close}
          />
          <motion.aside
            key="cart-panel"
            role="dialog"
            aria-label="Shopping bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full sm:w-[420px] bg-card border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <header className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4 text-gold" />
                <p className="font-display text-lg">Your bag</p>
                {totalItems > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {totalItems} item{totalItems === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close bag"
                className="h-8 w-8 grid place-items-center rounded-full hover:bg-muted text-muted-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {/* Empty state */}
            {lines.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                <div className="h-14 w-14 grid place-items-center rounded-full bg-muted mb-5">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-display text-xl">Your bag is empty</p>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                  Once you add pieces you love, you'll see them here.
                </p>
                <Button
                  href="/products"
                  variant="gold"
                  className="mt-6"
                  onClick={close}
                >
                  Browse the catalogue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                {/* Line items */}
                <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-4 divide-y divide-border">
                  {lines.map((l, i) => (
                    <li
                      key={`${l.productId}-${l.color}`}
                      className={i === 0 ? "" : "pt-4"}
                    >
                      <div className="grid grid-cols-[72px_1fr_auto] gap-3">
                        <Link
                          href={`/products/${l.slug}`}
                          onClick={close}
                          className="relative aspect-square rounded-md overflow-hidden bg-muted"
                        >
                          <Image
                            src={l.image}
                            alt={l.name}
                            fill
                            sizes="72px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="min-w-0">
                          <Link
                            href={`/products/${l.slug}`}
                            onClick={close}
                            className="text-sm font-medium leading-tight line-clamp-2 hover:underline decoration-gold underline-offset-4"
                          >
                            {l.name}
                          </Link>
                          {l.color && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {l.color}
                            </p>
                          )}
                          {/* Quantity controls */}
                          <div className="mt-2 inline-flex items-center rounded-full border border-border">
                            <button
                              type="button"
                              onClick={() =>
                                update(l.productId, Math.max(1, l.quantity - 1), l.color)
                              }
                              aria-label="Decrease"
                              className="h-7 w-7 grid place-items-center hover:bg-muted rounded-l-full"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-xs tabular-nums">
                              {l.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                update(l.productId, l.quantity + 1, l.color)
                              }
                              aria-label="Increase"
                              className="h-7 w-7 grid place-items-center hover:bg-muted rounded-r-full"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <p className="text-sm font-medium">
                            {formatPrice(l.price * l.quantity)}
                          </p>
                          <button
                            type="button"
                            onClick={() => remove(l.productId, l.color)}
                            aria-label="Remove"
                            className="h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Totals + CTA */}
                <footer className="border-t border-border bg-muted/30 px-5 py-4 space-y-3">
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd>{formatPrice(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Shipping</dt>
                      <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-border font-display text-base">
                      <dt>Total</dt>
                      <dd>{formatPrice(total)}</dd>
                    </div>
                  </dl>
                  <div className="flex gap-2">
                    <Button
                      href="/cart"
                      variant="outline"
                      className="flex-1"
                      onClick={close}
                    >
                      View bag
                    </Button>
                    <Button
                      href="/checkout"
                      variant="gold"
                      className="flex-1"
                      onClick={close}
                    >
                      Checkout <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center">
                    Free delivery on orders over Rs 4,000
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
