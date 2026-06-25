import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listOrders } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function OrdersPage() {
  const orders = await listOrders();
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl">Your orders</h1>
        <p className="mt-2 text-muted-foreground">
          Reorders, returns, and tracking — all in one place.
        </p>
      </header>

      <div className="space-y-4">
        {orders.map((o) => (
          <Card key={o.id} className="overflow-hidden">
            <CardContent className="p-0">
              <header className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Order
                  </p>
                  <p className="font-medium">{o.id}</p>
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
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty {item.quantity}
                        {item.color && ` · ${item.color}`}
                      </p>
                    </div>
                    <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
