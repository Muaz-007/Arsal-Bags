"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Filter as FilterIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "tote", label: "Totes" },
  { value: "backpack", label: "Backpacks" },
  { value: "crossbody", label: "Crossbody" },
  { value: "clutch", label: "Clutches" },
  { value: "duffel", label: "Duffels" },
  { value: "wallet", label: "Wallets" },
];

// Buckets match BagsArt's actual PKR spread — wallets sit under Rs 3k,
// everyday totes / crossbodies in the Rs 3-6k band, backpacks + duffels
// at the top of the current range. Rework these once real pricing shifts.
const PRICE_RANGES = [
  { value: "", label: "Any price" },
  { value: "0-3000", label: "Under Rs 3,000" },
  { value: "3000-5000", label: "Rs 3,000 – Rs 5,000" },
  { value: "5000-7000", label: "Rs 5,000 – Rs 7,000" },
  { value: "7000-10000", label: "Rs 7,000 – Rs 10,000" },
  { value: "10000-", label: "Rs 10,000+" },
];

/**
 * The shared filter panel — used inline on desktop and inside the mobile
 * bottom sheet. Renders the same controls in both contexts so behavior
 * stays consistent.
 */
function FilterPanel({
  onAfterChange,
  className,
}: {
  onAfterChange?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(Array.from(params.entries()));
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    start(() => router.replace(`/products?${next.toString()}`));
    onAfterChange?.();
  };

  const category = params.get("category") ?? "";
  const price = params.get("price") ?? "";
  const inStock = params.get("inStock") === "1";

  return (
    <div className={cn("space-y-8 text-sm", pending && "opacity-60", className)}>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Category
        </p>
        <ul className="space-y-1">
          {CATEGORIES.map((c) => (
            <li key={c.value}>
              <button
                onClick={() => setParam("category", c.value)}
                className={cn(
                  "w-full text-left rounded-md px-2.5 py-1.5 transition-colors",
                  category === c.value
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Price
        </p>
        <ul className="space-y-1">
          {PRICE_RANGES.map((c) => (
            <li key={c.value}>
              <button
                onClick={() => setParam("price", c.value)}
                className={cn(
                  "w-full text-left rounded-md px-2.5 py-1.5 transition-colors",
                  price === c.value
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setParam("inStock", e.target.checked ? "1" : "")}
            className="h-4 w-4 rounded border-input accent-gold"
          />
          <span className="text-sm">In stock only</span>
        </label>
      </div>
    </div>
  );
}

/**
 * Desktop sidebar (lg+ only) — unchanged behaviour.
 */
export function ProductFilters() {
  return (
    <aside className="hidden lg:block lg:sticky lg:top-24 self-start">
      <FilterPanel />
    </aside>
  );
}

/**
 * Mobile filter trigger + bottom sheet drawer. Renders nothing on lg+.
 * Counts the currently-active filters and shows a small gold badge next to
 * the "Filter" label so the user can see at a glance whether anything is
 * applied.
 */
export function MobileFilterTrigger() {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only mount the portal on the client — avoids SSR mismatch.
  useEffect(() => setMounted(true), []);

  // Active filter count
  const activeCount =
    (params.get("category") ? 1 : 0) +
    (params.get("price") ? 1 : 0) +
    (params.get("inStock") === "1" ? 1 : 0);

  useBodyScrollLock(open);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const overlay = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden fixed inset-x-0 bottom-0 z-[60] bg-background border-t border-border rounded-t-3xl shadow-2xl max-h-[calc(100vh-5rem)] flex flex-col will-change-transform"
          >
            {/* Grab handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="font-display text-xl">Filters</h2>
              <button
                aria-label="Close filters"
                onClick={() => setOpen(false)}
                className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filter body — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <FilterPanel />
            </div>

            {/* Sticky footer CTA */}
            <div className="border-t border-border p-4 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 h-11 rounded-md bg-gold text-black font-medium text-sm hover:bg-gold-light transition"
              >
                Show results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center gap-2 h-10 px-4 rounded-full border border-border bg-background text-sm hover:bg-muted transition"
      >
        <FilterIcon className="h-4 w-4" />
        Filter
        {activeCount > 0 && (
          <span className="ml-0.5 inline-flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-gold text-black text-[11px] font-medium">
            {activeCount}
          </span>
        )}
      </button>

      {/* Render the drawer at the document root so parent `backdrop-blur`
          and `transform` styles can't trap its `fixed` positioning. */}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
