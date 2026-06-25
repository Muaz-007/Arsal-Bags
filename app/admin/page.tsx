import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenueChart, ProductsChart } from "@/components/admin/charts";
import { getAdminStats, listOrders } from "@/lib/queries";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  const orders = (await listOrders()).slice(0, 6);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-2 font-display text-3xl">Atelier dashboard</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Last updated · {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue (7d)" value={formatPrice(stats.revenue)} delta={12.4} />
        <StatCard label="Orders (7d)" value={String(stats.orders)} delta={4.8} />
        <StatCard label="Customers" value={String(stats.customers)} delta={2.1} />
        <StatCard label="Conversion" value={`${stats.conversion}%`} delta={-0.3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Revenue · last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={stats.weekly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top sellers</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductsChart data={stats.topProducts} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent orders</CardTitle>
          <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-muted/30 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Order</th>
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs">{o.id}</td>
                  <td className="px-5 py-3">{o.customerName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-3">
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
