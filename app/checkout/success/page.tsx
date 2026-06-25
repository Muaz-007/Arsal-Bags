"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccess() {
  const params = useSearchParams();
  const orderId = params.get("order");
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
        Order confirmed.
      </h1>
      <p className="mt-3 text-muted-foreground">
        Thank you. We've sent a receipt to your inbox.
      </p>
      {orderId && (
        <p className="mt-2 text-sm">
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
