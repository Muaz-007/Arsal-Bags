import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listOrders } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function DashboardHome() {
  const orders = (await listOrders()).slice(0, 3);
  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Account
        </p>
        <h1 className="mt-3 font-display text-4xl">Welcome back.</h1>
        <p className="mt-2 text-muted-foreground">
          A quick overview of your recent activity at BagsArt.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Lifetime orders", value: orders.length, hint: "since you joined" },
          { label: "On the way", value: 1, hint: "expected by Friday" },
          { label: "Saved items", value: 4, hint: "in your wishlist" },
        ].map((s) => (
          <Card key={s.label} className="glass">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-2 font-display text-3xl">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-2xl">Recent orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{o.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt)} · {o.items.length}{" "}
                      {o.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
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
                    <span className="text-sm font-medium">{formatPrice(o.total)}</span>
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
