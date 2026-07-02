"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * Inline stock editor for the inventory table.
 *
 * Design goals:
 *   - Optimistic UI: local value bumps immediately on click so the buttons
 *     feel responsive even when the DB write is slow.
 *   - Debounced persist: clicks are batched into a single PATCH after the
 *     admin stops clicking for 400ms, so hammering "+" ten times triggers
 *     one round-trip instead of ten.
 *   - Rollback on error: if the API rejects the update we snap back to the
 *     last-known-good value and surface a toast.
 */
export function StockCell({
  id,
  initial,
}: {
  id: string;
  initial: number;
}) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const lastPersisted = useRef(initial);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function persist(next: number) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId: id, stock: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setValue(lastPersisted.current);
        push({
          title: "Couldn't save stock",
          description: data?.error ?? "Please try again.",
          tone: "error",
        });
        return;
      }
      lastPersisted.current = next;
      setSavedAt(Date.now());
      // Keep the surrounding page (low-stock counts, etc.) in sync.
      router.refresh();
    } catch {
      setValue(lastPersisted.current);
      push({
        title: "Couldn't save stock",
        description: "Check your connection and try again.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  function schedulePersist(next: number) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => persist(next), 400);
  }

  function set(next: number) {
    const clamped = Math.max(0, next);
    setValue(clamped);
    schedulePersist(clamped);
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
        disabled={value === 0}
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
        aria-label="Increase stock"
        className="h-7 w-7 grid place-items-center rounded-full border border-border hover:bg-muted disabled:opacity-40 transition"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
