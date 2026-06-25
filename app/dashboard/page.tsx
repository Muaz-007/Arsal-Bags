"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDERS } from "@/lib/mock-data";

export default function CustomerHome() {
  const { data: session } = useSession();
  const name =
    (session?.user as { name?: string | null } | undefined)?.name ?? "there";
  const firstName = name.split(" ")[0];

  const orders = ORDERS.slice(0, 3);

  return (
    <div className="space-y-10">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Your account
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight">
          Hi, <span className="text-gradient-gold">{firstName}.</span>
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Quick glance at your orders and saved pieces. Keep browsing the
          atelier whenever you're ready.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/products" variant="gold">
            Continue shopping <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/wishlist" variant="outline">
            <Heart className="h-4 w-4" /> View wishlist
          </Button>
        </div>
      </motion.header>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Lifetime orders", value: orders.length, hint: "since you joined" },
          { label: "On the way", value: 1, hint: "expected by Friday" },
          { label: "Saved items", value: 4, hint: "in your wishlist" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.08 + i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Card className="glass">
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-2 font-display text-3xl">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.hint}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent orders */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <Package className="h-5 w-5 text-gold" />
            Recent orders
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 group"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="px-5 py-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium font-mono text-sm">{o.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt)} · {o.items.length}{" "}
                      {o.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={
                        o.status === "shipped" || o.status === "delivered"
                          ? "success"
                          : o.status === "pending"
                            ? "warning"
                            : "outline"
                      }
                    >
                      {o.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formatPrice(o.total)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
