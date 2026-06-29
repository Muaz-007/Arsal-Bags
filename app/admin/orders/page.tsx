import Link from "next/link";
import { ChevronRight, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listOrders } from "@/lib/queries";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await listOrders();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} orders across all customers. Click a row to edit
          status and tracking.
        </p>
      </header>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {orders.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              No orders yet.
            </p>
          ) : (
            <table className="w-full text-sm min-w-[820px]">
              <thead className="bg-muted/30 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Order</th>
                  <th className="text-left px-5 py-3">Customer</th>
                  <th className="text-left px-5 py-3">Items</th>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Tracking</th>
                  <th className="text-right px-5 py-3">Total</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-xs">
                      <Link href={`/admin/orders/${o.id}`} className="block">
                        {o.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.customerEmail}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {o.items.length}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={
                          o.status === "shipped" || o.status === "delivered"
                            ? "success"
                            : o.status === "pending"
                              ? "warning"
                              : o.status === "cancelled"
                                ? "outline"
                                : "muted"
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {o.trackingNumber ? (
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <Truck className="h-3.5 w-3.5 text-gold" />
                          <span className="font-mono">{o.trackingNumber}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-3 text-muted-foreground">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="grid place-items-center"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
