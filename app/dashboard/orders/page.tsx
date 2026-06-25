import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listOrdersForUser } from "@/lib/queries";
import { requireUser } from "@/lib/auth-server";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await listOrdersForUser(user.id);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Your account
        </p>
        <h1 className="mt-3 font-display text-4xl">Orders</h1>
        <p className="mt-2 text-muted-foreground">
          Reorders, returns, and tracking — all in one place.
        </p>
      </header>

      {orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center">
            <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-muted">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 font-display text-2xl">No orders yet</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              When you place your first order, you'll see it here with live
              tracking and a quick reorder shortcut.
            </p>
            <Button href="/products" variant="gold" className="mt-6">
              Browse the catalogue <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Card key={o.id} className="overflow-hidden">
              <CardContent className="p-0">
                <header className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Order
                    </p>
                    <Link
                      href={`/dashboard/orders/${o.id}`}
                      className="font-mono text-sm hover:underline decoration-gold underline-offset-4"
                    >
                      {o.id}
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Placed
                    </p>
                    <p className="text-sm">{formatDate(o.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Total
                    </p>
                    <p className="text-sm font-medium">{formatPrice(o.total)}</p>
                  </div>
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
                </header>
                <ul className="divide-y divide-border">
                  {o.items.map((item) => (
                    <li
                      key={item.productId}
                      className="px-5 py-4 grid grid-cols-[60px_1fr_auto] gap-4 items-center"
                    >
                      <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="60px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        {item.slug ? (
                          <Link
                            href={`/products/${item.slug}`}
                            className="text-sm font-medium hover:underline decoration-gold underline-offset-4"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <p className="text-sm font-medium">{item.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Qty {item.quantity}
                          {item.color && ` · ${item.color}`}
                        </p>
                      </div>
                      <p className="text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
