import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Truck } from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getOrderById } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderTimeline } from "@/components/dashboard/order-timeline";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const order = await getOrderById(params.id);
  if (!order) notFound();
  // Only allow customers to view their own orders (admins use /admin/orders).
  if (user.role !== "admin" && order.userId !== user.id) notFound();

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/dashboard"
          className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to orders
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl tracking-tight">
              Order <span className="font-mono text-3xl">{order.id}</span>
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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items */}
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
                    {item.slug ? (
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-sm font-medium hover:underline decoration-gold underline-offset-4 inline-flex items-center gap-1"
                      >
                        {item.name}
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    ) : (
                      <p className="text-sm font-medium">{item.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Qty {item.quantity}
                      {item.color && ` · ${item.color}`}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Totals */}
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
              {order.tax > 0 && (
                <Row label="Tax" value={formatPrice(order.tax)} />
              )}
              <Row
                label={<span className="font-display">Total</span>}
                value={<span className="font-display">{formatPrice(order.total)}</span>}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sidebar: timeline + tracking + customer */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
                Status
              </p>
              <OrderTimeline status={order.status} />
            </CardContent>
          </Card>

          {order.trackingNumber && (
            <Card className="border-gold/30">
              <CardContent className="p-5 space-y-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground inline-flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-gold" />
                  Tracking
                </p>
                <p className="font-mono text-sm">{order.trackingNumber}</p>
                {order.trackingUrl ? (
                  <Link
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1.5 text-xs text-gold-dark dark:text-gold-light hover:underline decoration-gold underline-offset-4"
                  >
                    Track with courier
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Use this number on your courier's website.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Customer
              </p>
              <div>
                <p className="text-sm font-medium">{order.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {order.customerEmail}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button href="/contact" variant="outline" className="w-full">
            Need help with this order?
          </Button>
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
