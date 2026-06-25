import Link from "next/link";
import { ArrowRight, Heart, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth-server";
import { listOrdersForUser } from "@/lib/queries";

/**
 * Customer account home — server component.
 * Fetches the signed-in user's real orders from the DB; no hardcoded
 * numbers, no mock data. Empty state nudges them to shop when they have
 * no orders yet.
 */
export default async function CustomerHome() {
  const user = await requireUser();
  const firstName = (user.name ?? "there").split(" ")[0];
  const allOrders = await listOrdersForUser(user.id);
  const recent = allOrders.slice(0, 3);

  return (
    <div className="space-y-10">
      <header>
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
      </header>

      {/* Recent orders */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <Package className="h-5 w-5 text-gold" />
            Recent orders
          </h2>
          {allOrders.length > 0 && (
            <Link
              href="/dashboard/orders"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 group"
            >
              View all
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="mx-auto h-12 w-12 grid place-items-center rounded-full bg-muted">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-4 font-display text-xl">No orders yet</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                When you place your first order it'll show up here with live
                tracking.
              </p>
              <Button href="/products" variant="gold" className="mt-5">
                Browse the catalogue <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {recent.map((o) => (
                  <li
                    key={o.id}
                    className="px-5 py-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/orders/${o.id}`}
                        className="font-medium font-mono text-sm hover:underline decoration-gold underline-offset-4"
                      >
                        {o.id}
                      </Link>
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
        )}
      </section>
    </div>
  );
}
