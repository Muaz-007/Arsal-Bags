"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Catches runtime errors thrown by any nested
 * server or client component and renders a graceful fallback.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Send to your error tracker (Sentry, LogRocket, etc.)
    console.error(error);
  }, [error]);

  return (
    <div className="container py-20 max-w-xl text-center">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto h-16 w-16 grid place-items-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300"
      >
        <AlertTriangle className="h-7 w-7" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.06 }}
        className="mt-7 font-display text-4xl tracking-tight"
      >
        Something <span className="text-gradient-gold">went wrong</span>.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12 }}
        className="mt-3 text-muted-foreground"
      >
        We've logged this and our team will take a look. You can try again or
        head back to the store.
      </motion.p>

      {error.digest && (
        <p className="mt-3 text-[11px] font-mono text-muted-foreground/70">
          Reference · {error.digest}
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="mt-8 flex flex-wrap gap-3 justify-center"
      >
        <Button onClick={reset} variant="gold">
          <RefreshCcw className="h-4 w-4" /> Try again
        </Button>
        <Button href="/" variant="outline">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Button>
      </motion.div>
    </div>
  );
}
