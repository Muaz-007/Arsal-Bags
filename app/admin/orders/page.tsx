import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusDropdown } from "@/components/admin/order-status-dropdown";
import { listOrders } from "@/lib/queries";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await listOrders();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} orders across all customers.
        </p>
      </header>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead className="bg-muted/30 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Order</th>
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Items</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs">{o.id}</td>
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
                  <td className="px-5 py-3 w-44">
                    <OrderStatusDropdown defaultValue={o.status} />
                  </td>
                  <td className="px-5 py-3 text-right">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
