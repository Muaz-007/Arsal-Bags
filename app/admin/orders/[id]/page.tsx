import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getOrderById } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminOrderEditor } from "@/components/admin/admin-order-editor";
import { OrderTimeline } from "@/components/dashboard/order-timeline";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const order = await getOrderById(params.id);
  if (!order) notFound();

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/admin/orders"
          className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All orders
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">
              Order <span className="font-mono text-2xl">{order.id}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Placed {formatDate(order.createdAt)} ·{" "}
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </p>
          </div>
          <Badge
            variant={
              order.status === "shipped" || order.status === "delivered"
                ? "success"
                : order.status === "pending"
                  ? "warning"
                  : order.status === "cancelled"
                    ? "outline"
                    : "muted"
            }
          >
            {order.status}
          </Badge>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {order.items.map((item) => (
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
                    <p className="text-sm font-medium">{item.name}</p>
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

            <div className="border-t border-border p-5 space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.shipping > 0 ? (
                <Row label="Shipping" value={formatPrice(order.shipping)} />
              ) : (
                <Row
                  label="Shipping"
                  value={<span className="text-emerald-600">Free</span>}
                />
              )}
              <Row label="Tax" value={formatPrice(order.tax)} />
              <Row
                label={<span className="font-display">Total</span>}
                value={
                  <span className="font-display">{formatPrice(order.total)}</span>
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
                Customer
              </p>
              <p className="font-medium">{order.customerName}</p>
              <p className="text-xs text-muted-foreground">
                {order.customerEmail}
              </p>
            </CardContent>
          </Card>

          <AdminOrderEditor order={order} />

          <Card>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
                Current status
              </p>
              <OrderTimeline status={order.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
