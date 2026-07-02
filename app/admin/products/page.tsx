import Image from "next/image";
import Link from "next/link";
import { Plus, Edit, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { listProducts } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

type SP = { [k: string]: string | string[] | undefined };
const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

const CATEGORY_OPTIONS = [
  { value: "tote", label: "Tote" },
  { value: "backpack", label: "Backpack" },
  { value: "clutch", label: "Clutch" },
  { value: "crossbody", label: "Crossbody" },
  { value: "duffel", label: "Duffel" },
  { value: "wallet", label: "Wallet" },
];

const STOCK_OPTIONS = [
  { value: "in", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Sold out" },
];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const search = first(searchParams.q);
  const category = first(searchParams.category);
  const stockFilter = first(searchParams.stock);

  const { products } = await listProducts({
    perPage: 100,
    search: search || undefined,
    category: category || undefined,
  });

  // Stock filter runs post-fetch — it's a bucketed classification, not a
  // simple where clause, and 100 rows client-side stays snappy.
  const filtered = products.filter((p) => {
    if (stockFilter === "in") return p.stock > 5;
    if (stockFilter === "low") return p.stock > 0 && p.stock <= 5;
    if (stockFilter === "out") return p.stock === 0;
    return true;
  });

  const hasQuery = !!(search || category || stockFilter);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasQuery
              ? `${filtered.length} match${filtered.length === 1 ? "" : "es"} of ${products.length}.`
              : `Manage your catalogue. ${products.length} items.`}
          </p>
        </div>
        <Button variant="gold" href="/admin/products/new">
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </header>

      <ListToolbar
        searchPlaceholder="Search by name, tagline, description…"
        filters={[
          { key: "category", options: CATEGORY_OPTIONS, label: "categories" },
          { key: "stock", options: STOCK_OPTIONS, label: "stock" },
        ]}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-14 text-center">
              <p className="text-sm text-muted-foreground">
                {hasQuery
                  ? "No products match those filters."
                  : "No products yet. Add your first piece to get started."}
              </p>
              {!hasQuery && (
                <Button
                  href="/admin/products/new"
                  variant="gold"
                  size="sm"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4" /> Add product
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-muted/30 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Product</th>
                  <th className="text-left px-5 py-3">Category</th>
                  <th className="text-left px-5 py-3">Stock</th>
                  <th className="text-left px-5 py-3">Price</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 capitalize">{p.category}</td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          p.stock === 0
                            ? "text-red-500"
                            : p.stock <= 5
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3">
                      {p.stock > 0 ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="muted">Sold out</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          aria-label="View live"
                          title="View on store"
                          className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground transition"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          aria-label="Edit"
                          title="Edit product"
                          className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground transition"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      </div>
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
