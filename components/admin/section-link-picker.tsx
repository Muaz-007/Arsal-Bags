"use client";

import { useMemo, useState } from "react";
import { Input, Label } from "@/components/ui/input";

/**
 * Link picker for storefront section items.
 *
 * Instead of asking the admin to remember URL shapes like
 * `/products?category=wallet` or `/products/some-slug`, we surface a
 * dropdown of every sensible destination — the catalogue root, price
 * buckets, categories, collections, sort presets, and every product in
 * the store. Selecting a row writes the correct URL back into the
 * section item.
 *
 * A "Custom URL…" option still allows a free-form path for edge cases
 * (external link, campaign landing page).
 */

export type LinkPickerProduct = {
  id: string;
  slug: string;
  name: string;
  category?: string;
};

const CATEGORY_OPTIONS = [
  { slug: "tote", label: "Totes" },
  { slug: "backpack", label: "Backpacks" },
  { slug: "crossbody", label: "Crossbody" },
  { slug: "clutch", label: "Clutches" },
  { slug: "duffel", label: "Duffels" },
  { slug: "wallet", label: "Wallets" },
];

const COLLECTION_OPTIONS = [
  { slug: "formal", label: "Formal" },
  { slug: "semi-formal", label: "Semi-formal" },
  { slug: "heritage", label: "Heritage / New" },
];

const PRESETS: { value: string; label: string }[] = [
  { value: "/products", label: "All products" },
  { value: "/products?sort=latest", label: "Sort · Newest first" },
  { value: "/products?sort=popular", label: "Sort · Best sellers" },
  { value: "/products?sale=1", label: "On sale" },
  { value: "/products?price=0-3000", label: "Price · Under Rs 3,000" },
  { value: "/products?price=0-5000", label: "Price · Under Rs 5,000" },
  { value: "/products?price=0-10000", label: "Price · Under Rs 10,000" },
  ...CATEGORY_OPTIONS.map((c) => ({
    value: `/products?category=${c.slug}`,
    label: `Category · ${c.label}`,
  })),
  ...COLLECTION_OPTIONS.map((c) => ({
    value: `/products?collection=${c.slug}`,
    label: `Collection · ${c.label}`,
  })),
];

const CUSTOM = "__custom__";

export function SectionLinkPicker({
  value,
  onChange,
  products,
}: {
  value: string;
  onChange: (href: string) => void;
  products?: LinkPickerProduct[];
}) {
  // The full list of dropdown options: presets + every product (as a
  // "Product · Name" row that resolves to /products/slug).
  const options = useMemo(() => {
    const productOptions = (products ?? []).map((p) => ({
      value: `/products/${p.slug}`,
      label: `Product · ${p.name}`,
    }));
    return [...PRESETS, ...productOptions];
  }, [products]);

  // Match the current value against a known option. When the value is
  // something arbitrary (external URL, deep-link), we drop into custom
  // mode so the admin can keep it as-is.
  const matchedOption = options.find((o) => o.value === value);
  const [mode, setMode] = useState<"choose" | "custom">(
    value && !matchedOption ? "custom" : "choose"
  );

  return (
    <div className="space-y-2">
      <Label>Link</Label>
      {mode === "choose" ? (
        <>
          <select
            value={matchedOption ? value : ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === CUSTOM) {
                setMode("custom");
                return;
              }
              onChange(v);
            }}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="" disabled>
              Choose a destination…
            </option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            <option value={CUSTOM}>Custom URL…</option>
          </select>
          {value && matchedOption && (
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              {value}
            </p>
          )}
        </>
      ) : (
        <div className="space-y-1.5">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/products?custom=1 or https://…"
            className="h-9 text-sm font-mono"
          />
          <button
            type="button"
            onClick={() => setMode("choose")}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            ← Back to preset list
          </button>
        </div>
      )}
    </div>
  );
}
