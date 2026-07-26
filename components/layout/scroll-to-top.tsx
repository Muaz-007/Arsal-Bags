"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useWishlist } from "@/store/wishlist";

/**
 * Floating scroll-to-top button. Fades in once the user has scrolled past
 * 1.4× the viewport height. Hidden inside the admin shell — admin has its
 * own chrome.
 *
 * Sits topmost of the bottom-right FAB stack — lifts above whichever of
 * the WhatsApp FAB and wishlist FAB happen to be visible so nothing
 * overlaps. Each stacked button adds ~64px (button height + gap) to the
 * offset from the corner.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const wishlistCount = useWishlist((s) => s.ids.length);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 1.4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  // Match the WishlistFab's actual visibility.
  const fabShowing =
    wishlistCount > 0 &&
    pathname !== "/wishlist" &&
    pathname !== "/dashboard/wishlist" &&
    !pathname?.startsWith("/auth") &&
    !pathname?.startsWith("/checkout");

  // Match the WhatsAppFab's actual visibility (same hide-list + env
  // number check). Kept inline to avoid coupling the two components.
  const whatsappShowing =
    !!process.env.NEXT_PUBLIC_WHATSAPP_NUMBER &&
    !pathname?.startsWith("/auth") &&
    !pathname?.startsWith("/checkout");

  // 20px = bottom-5 (base corner). Each stacked button below adds ~64px
  // (button + gap) so we always sit above whatever's on-screen.
  const fabsBelow = (fabShowing ? 1 : 0) + (whatsappShowing ? 1 : 0);
  const bottomPx = 20 + fabsBelow * 64;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          type="button"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="fixed right-5 z-40 h-11 w-11 grid place-items-center rounded-full border border-border bg-background shadow-lg ring-1 ring-gold/15 hover:ring-gold/40 transition-shadow"
          // Bottom in inline style + native CSS transition — same reason
          // as the WhatsApp FAB: framer has no starting value for the
          // `bottom` prop on first mount and interpolates from 0, which
          // reads as the button sliding up from the viewport edge.
          style={{
            bottom: bottomPx,
            transition:
              "bottom 350ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms",
          }}
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
