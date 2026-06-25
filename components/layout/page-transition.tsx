"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

/**
 * Subtle page-level fade + lift transition.
 *
 * Earlier we used `<AnimatePresence mode="wait">` which made the previous
 * page finish its exit animation BEFORE the next one started — that left
 * the viewport empty (just the navbar) for ~350ms on every route change.
 * Felt sluggish on heavy pages like /auth (which mounts the AuthCard).
 *
 * Now: we just key the wrapper on the pathname so React unmounts/mounts
 * the new page instantly, then animate the fresh content in. No waiting,
 * no empty viewport, page feels snappy.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
