"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Save, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Product picker — used by Featured / Best Sellers / Summer Sale tabs.
 * Renders a searchable grid of all catalogue products; the admin toggles
 * which ones appear in the section. Selected products keep a manual order
 * so the admin can curate the section's narrative.
 */
export function FeaturedPicker({
  all,
  initialSelected,
  label,
  helper,
  itemNoun = "product",
  storeKey,
}: {
  all: Product[];
  initialSelected: string[];
  label: string;
  helper?: string;
  itemNoun?: string;
  /** When provided, "Save section" PUTs to /api/admin/storefront with this key. */
  storeKey?: "featured" | "bestsellers" | "sale";
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const push = useToast((s) => s.push);

  const filtered = q
    ? all.filter((p) =>
        (p.name + " " + p.tagline + " " + p.category)
          .toLowerCase()
          .includes(q.toLowerCase())
      )
    : all;

  function toggle(id: string) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  }

  async function save() {
    if (!storeKey) {
      push({
        title: "Section saved",
        description: `${selected.length} ${itemNoun}s will appear in “${label}”`,
        tone: "success",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/storefront", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: storeKey, value: selected }),
      });
      if (!res.ok) throw new Error("Save failed");
      push({
        title: "Section saved",
        description: `${selected.length} ${itemNoun}s will appear in “${label}”`,
        tone: "success",
      });
    } catch {
      push({
        title: "Couldn't save",
        description: "Please try again.",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{label}</h2>
          {helper && (
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">{helper}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <Badge variant="success">{selected.length} picked</Badge>
            <Badge variant="muted">{all.length - selected.length} available</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${itemNoun}s…`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 w-60"
            />
          </div>
          <Button onClick={save} variant="gold" size="sm" loading={saving}>
            <Save className="h-4 w-4" /> Save section
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              No products match “{q}”.
            </p>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((p) => {
                const picked = selected.includes(p.id);
                const order = selected.indexOf(p.id) + 1;
                const onSale = p.compareAt && p.compareAt > p.price;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggle(p.id)}
                    className={cn(
                      "group relative text-left rounded-xl overflow-hidden border-2 transition-all",
                      "hover:shadow-md hover:-translate-y-0.5",
                      picked
                        ? "border-gold ring-2 ring-gold/30"
                        : "border-border"
                    )}
                  >
                    <div className="relative aspect-[4/5] bg-muted">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="220px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {picked && (
                        <div className="absolute top-2 left-2 inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-full bg-gold text-black text-xs font-mono tabular-nums font-semibold shadow">
                          {order}
                        </div>
                      )}
                      {onSale && (
                        <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 bg-rose-500/90 text-white">
                          Sale
                        </span>
                      )}
                      {p.stock === 0 && (
                        <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 bg-foreground/85 text-background">
                          Out
                        </span>
                      )}
                      <div
                        className={cn(
                          "absolute inset-0 transition-opacity",
                          picked
                            ? "bg-gold/10"
                            : "bg-foreground/0 group-hover:bg-foreground/[0.04]"
                        )}
                      />
                      <div
                        className={cn(
                          "absolute bottom-2 right-2 h-7 w-7 grid place-items-center rounded-full transition-all",
                          picked
                            ? "bg-gold text-black scale-100"
                            : "bg-background/85 text-foreground/60 scale-90 group-hover:scale-100"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground capitalize">
                          {p.category}
                        </span>
                        <span className="text-xs font-medium">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
