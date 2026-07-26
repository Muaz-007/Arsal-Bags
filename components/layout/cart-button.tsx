"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";

/**
 * Navbar cart button.
 *
 * Pulses + flashes a soft gold halo when the cart's total item count
 * grows — so adding to bag feels confirmed wherever the user clicks
 * "Add to cart" on the site. Mirrors the WishlistFab's pulse pattern.
 *
 * The initial `useRef(totalItems)` captures the count from Zustand's
 * persist-hydrated state, so we don't pulse on first page-load when the
 * cart is simply being restored from localStorage.
 */
export function CartButton() {
  const totalItems = useCart((s) => s.totalItems());
  const openDrawer = useCart((s) => s.openDrawer);
  const prev = useRef(totalItems);
  const [pulse, setPulse] = useState(false);
  // Zustand's persist middleware rehydrates from localStorage on the
  // client — so on the very first render the server-produced HTML shows
  // `totalItems = 0` while the client already knows it's higher. Rendering
  // the count badge before we've mounted causes a React hydration error
  // ("Expected server HTML to contain a matching <span>"). Flip `mounted`
  // in a client-only effect and gate the count-dependent UI on it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const displayCount = mounted ? totalItems : 0;

  useEffect(() => {
    if (totalItems > prev.current) {
      setPulse(true);
      prev.current = totalItems;
      const t = setTimeout(() => setPulse(false), 700);
      return () => clearTimeout(t);
    }
    prev.current = totalItems;
  }, [totalItems]);

  return (
    <button
      type="button"
      onClick={() => openDrawer()}
      aria-label={`Cart (${displayCount} ${displayCount === 1 ? "item" : "items"})`}
      className={cn(
        "relative h-10 w-10 grid place-items-center rounded-full transition-all",
        pulse ? "bg-gold/10 ring-2 ring-gold/40" : "hover:bg-muted"
      )}
    >
      <motion.span
        animate={pulse ? { scale: [1, 1.28, 1] } : { scale: 1 }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
        className="grid place-items-center"
      >
        <ShoppingBag
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            pulse && "text-gold"
          )}
        />
      </motion.span>

      {displayCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 grid place-items-center text-[10px] font-medium rounded-full bg-gold text-black shadow-sm">
          {displayCount}
        </span>
      )}

      {/* Soft halo on add */}
      <AnimatePresence>
        {pulse && (
          <motion.span
            key="halo"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-gold/40 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </button>
  );
}
