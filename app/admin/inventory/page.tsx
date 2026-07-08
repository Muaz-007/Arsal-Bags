import Image from "next/image";
import { AlertTriangle, Boxes, Package, ShoppingBag } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StockCell } from "@/components/admin/inventory-stock-cell";
import { listProducts } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * /admin/inventory
 *
 * A focused view of stock health across the catalogue. Filterable into
 * sections by tone (sold out, critical, low, healthy) and offers an inline
 * +/- stock control on every row.
 */
export default async function InventoryPage() {
  const { products } = await listProducts({ perPage: 100 });

  const sold = products.reduce((a, p) => a + p.reviewCount, 0);
  const out = products.filter((p) => p.stock === 0);
  const critical = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const low = products.filter((p) => p.stock > 5 && p.stock <= 12);
  const totalUnits = products.reduce((a, p) => a + p.stock, 0);

  const ordered = [
    ...out,
    ...critical,
    ...low,
    ...products.filter((p) => p.stock > 12),
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Storefront"
        title="Inventory"
        description="Stock levels across every piece in the atelier. Tap a row's +/- pill to adjust quantity — changes save instantly."
      />

      {/* Summary tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <SummaryTile
          icon={Boxes}
          label="Units in stock"
          value={String(totalUnits)}
        />
        <SummaryTile
          icon={Package}
          label="SKUs tracked"
          value={String(products.length)}
        />
        <SummaryTile
          icon={ShoppingBag}
          label="Lifetime sold"
          value={String(sold)}
        />
        <SummaryTile
          icon={AlertTriangle}
          label="Needs restock"
          value={String(out.length + critical.length)}
          tone={out.length + critical.length > 0 ? "warning" : "muted"}
        />
      </div>

      {/* Inventory table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-muted/30 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Product</th>
                <th className="text-left px-5 py-3">SKU</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-right px-5 py-3">Price</th>
                <th className="text-center px-5 py-3">Stock</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ordered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {p.id.toUpperCase()}
                  </td>
                  <td className="px-5 py-3 capitalize text-muted-foreground">
                    {p.category}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <StockCell id={p.id} initial={p.stock} />
                  </td>
                  <td className="px-5 py-3">
                    {p.stock === 0 ? (
                      <Badge variant="muted">Sold out</Badge>
                    ) : p.stock <= 5 ? (
                      <Badge variant="warning">Critical</Badge>
                    ) : p.stock <= 12 ? (
                      <Badge variant="outline">Low</Badge>
                    ) : (
                      <Badge variant="success">Healthy</Badge>
                    )}
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

function SummaryTile({
  icon: Icon,
  label,
  value,
  tone = "muted",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "muted" | "warning";
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={
            tone === "warning"
              ? "h-10 w-10 grid place-items-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300"
              : "h-10 w-10 grid place-items-center rounded-lg bg-muted"
          }
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="font-display text-2xl mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
