"use client";

import { motion } from "framer-motion";
import { ArrowRight, Banknote, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccess() {
  const params = useSearchParams();
  const orderId = params.get("order");
  // Card orders come back with a Stripe session_id; COD orders come back
  // with just the order ref. We treat "no session_id" as COD to show the
  // right copy on the confirmation screen.
  const isCod = !params.get("session_id");
  return (
    <div className="container py-24 max-w-xl text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="mx-auto h-16 w-16 rounded-full bg-emerald-500/15 grid place-items-center"
      >
        <Check className="h-8 w-8 text-emerald-500" />
      </motion.div>
      <h1 className="mt-6 font-display text-4xl tracking-tight">
        {isCod ? "Order placed." : "Order confirmed."}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {isCod
          ? "We've sent a confirmation to your inbox. Our team will call to verify before dispatching."
          : "Thank you. We've sent a receipt to your inbox."}
      </p>

      {isCod && (
        <div className="mt-6 mx-auto max-w-sm rounded-xl border border-gold/30 bg-gold/5 px-5 py-4 text-left">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2 inline-flex items-center gap-2">
            <Banknote className="h-3.5 w-3.5 text-gold" />
            Cash on delivery
          </p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            Please have the exact total ready when the courier arrives. You'll
            receive a tracking number by email once the order ships.
          </p>
        </div>
      )}

      {orderId && (
        <p className="mt-4 text-sm">
          Reference:{" "}
          <code className="font-mono text-foreground">{orderId}</code>
        </p>
      )}
      <div className="mt-8 flex gap-3 justify-center">
        <Button href="/dashboard/orders" variant="gold">
          View order <ArrowRight className="h-4 w-4" />
        </Button>
        <Button href="/products" variant="outline">
          Keep browsing
        </Button>
      </div>
    </div>
  );
}
