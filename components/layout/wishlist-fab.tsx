"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useWishlist } from "@/store/wishlist";

/**
 * Floating wishlist button — bottom-right corner.
 *
 *  - Appears whenever the user has 1+ items in their wishlist (guest or
 *    signed-in alike).
 *  - Tapping it goes to `/wishlist` — public route that renders the local
 *    list for guests and the server-backed list for signed-in users.
 *  - Pulses briefly when the count changes, so adding a heart feels
 *    confirmed even when the user isn't looking at the navbar cart pip.
 *  - Hidden on the wishlist page itself, in admin / auth / checkout.
 */
export function WishlistFab() {
  const pathname = usePathname();
  const count = useWishlist((s) => s.ids.length);
  const prev = useRef(count);
  const [pulse, setPulse] = useState(false);

  // Trigger a brief scale pulse when the count grows.
  useEffect(() => {
    if (count > prev.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      prev.current = count;
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count]);

  // Don't show on routes where it would be noise or redundant.
  const hidden =
    !pathname ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/checkout") ||
    pathname === "/wishlist" ||
    pathname === "/dashboard/wishlist";

  const visible = count > 0 && !hidden;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="wishlist-fab"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 right-5 z-40"
        >
          <Link
            href="/wishlist"
            aria-label={`Open wishlist (${count} item${count > 1 ? "s" : ""})`}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border shadow-lg ring-1 ring-gold/20 hover:ring-gold/50 hover:-translate-y-0.5 active:scale-95 transition"
          >
            <motion.span
              animate={pulse ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
              className="grid place-items-center"
            >
              <Heart className="h-5 w-5 fill-gold text-gold" />
            </motion.span>

            {/* Count badge */}
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 grid place-items-center rounded-full bg-foreground text-background text-[10px] font-mono tabular-nums font-medium shadow">
              {count > 99 ? "99+" : count}
            </span>

            {/* Soft halo while pulsing */}
            <AnimatePresence>
              {pulse && (
                <motion.span
                  key="halo"
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-gold/40 pointer-events-none"
                />
              )}
            </AnimatePresence>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
