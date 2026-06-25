"use client";

import { useState } from "react";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * Inline stock editor for the inventory table. Optimistic local state + a
 * toast confirmation. In a real app this would write to /api/admin/inventory.
 */
export function StockCell({
  id,
  initial,
}: {
  id: string;
  initial: number;
}) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const push = useToast((s) => s.push);

  function persist(next: number) {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setSavedAt(Date.now());
      push({
        title: "Stock updated",
        description: `${next} units in inventory`,
        tone: "success",
      });
    }, 350);
  }

  function set(next: number) {
    const clamped = Math.max(0, next);
    setValue(clamped);
    persist(clamped);
  }

  const tone =
    value === 0
      ? "out"
      : value <= 5
        ? "critical"
        : value <= 12
          ? "low"
          : "healthy";

  const toneClass: Record<typeof tone, string> = {
    out: "bg-muted text-muted-foreground",
    critical: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
    low: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    healthy: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  } as const;

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => set(value - 1)}
        disabled={busy || value === 0}
        aria-label="Decrease stock"
        className="h-7 w-7 grid place-items-center rounded-full border border-border hover:bg-muted disabled:opacity-40 transition"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span
        className={cn(
          "inline-flex items-center justify-center min-w-[56px] h-7 px-2 rounded-full text-xs font-mono tabular-nums",
          toneClass[tone]
        )}
      >
        {busy ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : savedAt && Date.now() - savedAt < 1500 ? (
          <Check className="h-3 w-3" />
        ) : (
          value
        )}
      </span>
      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={busy}
        aria-label="Increase stock"
        className="h-7 w-7 grid place-items-center rounded-full border border-border hover:bg-muted disabled:opacity-40 transition"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
