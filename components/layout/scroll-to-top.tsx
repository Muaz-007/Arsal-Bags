"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Floating scroll-to-top button. Fades in once the user has scrolled past
 * 1.5× the viewport height. Hidden inside the admin shell — admin has its
 * own chrome.
 */
export function ScrollToTop() {
  const pathname = usePathname();
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
          className="fixed bottom-5 right-5 z-40 h-11 w-11 grid place-items-center rounded-full border border-border bg-background shadow-lg ring-1 ring-gold/15 hover:ring-gold/40 transition-shadow"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
