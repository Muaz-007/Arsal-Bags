"use client";

import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container py-20 sm:py-28 max-w-xl text-center">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-xs uppercase tracking-[0.22em] text-muted-foreground"
      >
        Error · 404
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 font-display text-5xl sm:text-6xl tracking-tight"
      >
        Lost in the <span className="text-gradient-gold">atelier</span>.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 text-muted-foreground"
      >
        The page you were looking for has been moved, retired, or never made it
        past the workshop floor.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="mt-9 flex flex-wrap gap-3 justify-center"
      >
        <Button href="/" variant="gold">
          Back to homepage <ArrowRight className="h-4 w-4" />
        </Button>
        <Button href="/products" variant="outline">
          <Search className="h-4 w-4" /> Browse the catalogue
        </Button>
      </motion.div>
    </div>
  );
}
