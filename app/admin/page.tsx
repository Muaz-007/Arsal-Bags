import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowUpRight,
  Eye,
  Package,
  Plus,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RevenueChart, ProductsChart } from "@/components/admin/charts";
import {
  getAdminStats,
  listOrders,
  listProducts,
  listUsers,
} from "@/lib/queries";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  const orders = await listOrders();
  const { products } = await listProducts({ perPage: 100 });
  const users = await listUsers();

  const recentOrders = orders.slice(0, 6);
  const lowStock = products
    .filter((p) => p.stock > 0 && p.stock <= 8)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);
  const outOfStock = products.filter((p) => p.stock === 0);
  // `listUsers()` already returns rows ordered by createdAt DESC, so the
  // first 3 customer entries are the most recent — no reverse needed.
  const newestCustomers = users
    .filter((u) => u.role === "customer")
    .slice(0, 3);

  const avgOrderValue = stats.revenue / Math.max(stats.orders, 1);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Overview"
        title="Atelier dashboard"
        description={`Last updated · ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
        actions={
          <>
            <Button href="/admin/storefront" variant="outline" size="sm">
              <Sparkles className="h-4 w-4" /> Edit storefront
            </Button>
            <Button href="/admin/products/new" variant="gold" size="sm">
              <Plus className="h-4 w-4" /> Add product
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue (7d)"
          value={formatPrice(stats.revenue)}
          delta={12.4}
        />
        <StatCard
          label="Orders (7d)"
          value={String(stats.orders)}
          delta={4.8}
        />
        <StatCard
          label="Avg. order value"
          value={formatPrice(avgOrderValue)}
          delta={1.7}
        />
        <StatCard label="Conversion" value={`${stats.conversion}%`} delta={-0.3} />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue · last 7 days</CardTitle>
            <Badge variant="success">
              <TrendingUp className="h-3 w-3 mr-1 inline" />
              +12.4%
            </Badge>
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

      {/* Inventory + Customers strip */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Inventory alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Inventory alerts</CardTitle>
              {(outOfStock.length > 0 || lowStock.length > 0) && (
                <Badge variant="warning">
                  <AlertTriangle className="h-3 w-3 mr-1 inline" />
                  {outOfStock.length + lowStock.length}
                </Badge>
              )}
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              View inventory
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {lowStock.length === 0 && outOfStock.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-muted-foreground">
                All products are healthily stocked.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {outOfStock.slice(0, 3).map((p) => (
                  <li
                    key={p.id}
                    className="px-5 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {p.category} · {formatPrice(p.price)}
                      </p>
                    </div>
                    <Badge variant="muted">Sold out</Badge>
                  </li>
                ))}
                {lowStock.map((p) => (
                  <li
                    key={p.id}
                    className="px-5 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {p.category} · {formatPrice(p.price)}
                      </p>
                    </div>
                    <Badge variant="warning">{p.stock} left</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Audience quick view */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New customers</CardTitle>
            <Link
              href="/admin/users"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              All users
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {newestCustomers.map((u) => (
                <li
                  key={u.id}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-muted grid place-items-center font-display text-sm">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {u.email}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground shrink-0">
                    {formatDate(u.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin/products/new", label: "Add product", icon: Package },
          { href: "/admin/storefront", label: "Edit sections", icon: Sparkles },
          { href: "/admin/orders", label: "Process orders", icon: ShoppingCart },
          { href: "/admin/users", label: "Manage users", icon: Users },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-foreground/30 hover:shadow-md transition-all"
          >
            <span className="h-10 w-10 grid place-items-center rounded-lg bg-muted group-hover:bg-foreground group-hover:text-background transition-colors">
              <a.icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">{a.label}</span>
            <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent orders</CardTitle>
          <Link
            href="/admin/orders"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
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
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs">{o.id}</td>
                  <td className="px-5 py-3">{o.customerName}</td>
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
                            : "outline"
                      }
                    >
                      {o.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {formatPrice(o.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
