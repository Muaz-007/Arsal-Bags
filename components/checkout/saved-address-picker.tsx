"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SavedAddress } from "@/types/address";

/**
 * Saved-address picker for the checkout page.
 *
 *  - Signed-in customers see their saved addresses as selectable cards.
 *  - Selecting one fires `onSelect(address)` so the parent form can prefill
 *    its inputs.
 *  - "Use a different address" expands a fresh inline form.
 *  - Guests / users with no saved addresses just see the regular form.
 */
export function SavedAddressPicker({
  onSelect,
  onUseNew,
  selectedId,
  newMode,
}: {
  onSelect: (address: SavedAddress) => void;
  onUseNew: () => void;
  selectedId?: string;
  newMode: boolean;
}) {
  const { status } = useSession();
  const [items, setItems] = useState<SavedAddress[] | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const res = await fetch("/api/addresses", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { addresses: SavedAddress[] };
        setItems(data.addresses);
        // Auto-select the default for first paint
        const def = data.addresses.find((a) => a.isDefault) ?? data.addresses[0];
        if (def) onSelect(def);
      } catch {
        // ignore
      }
    })();
    // We deliberately don't depend on onSelect — it's the parent's stable callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status !== "authenticated") return null;
  if (items === null) return null; // still loading
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Saved addresses
      </p>
      <ul className="grid sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {items.map((a) => {
            const active = !newMode && a.id === selectedId;
            return (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(a)}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-all",
                    "hover:border-foreground/30",
                    active
                      ? "border-gold ring-2 ring-gold/20 bg-gold/5"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium truncate">
                      {a.label || "Address"}
                    </p>
                    <span className="flex items-center gap-1.5 shrink-0">
                      {a.isDefault && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-gold-dark dark:text-gold-light">
                          <Star className="h-3 w-3" />
                          Default
                        </span>
                      )}
                      {active && (
                        <span className="h-5 w-5 grid place-items-center rounded-full bg-gold text-black shrink-0">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </span>
                  </div>
                  <address className="not-italic text-xs text-muted-foreground leading-relaxed">
                    {a.name}
                    <br />
                    {a.address}, {a.city}
                    <br />
                    {a.country} {a.postal}
                  </address>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>

        {/* Use new address tile */}
        <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <button
            type="button"
            onClick={onUseNew}
            className={cn(
              "w-full h-full min-h-[120px] rounded-xl border border-dashed border-border p-4",
              "flex flex-col items-center justify-center gap-1.5 text-muted-foreground",
              "hover:text-foreground hover:border-foreground/30 transition-colors",
              newMode && "border-foreground/40 text-foreground bg-muted/30"
            )}
          >
            {newMode ? (
              <Check className="h-4 w-4 text-gold" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="text-xs uppercase tracking-[0.18em]">
              {newMode ? "Entering a new address" : "Use a different address"}
            </span>
          </button>
        </motion.li>
      </ul>
    </div>
  );
}
