"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProductSpecification } from "@/types";

// Common leather-goods spec suggestions — shown as chips the admin can
// click to prefill a row's label. Saves 3-4 keystrokes on the fields
// that recur across most SKUs.
const COMMON_LABELS = [
  "Dimensions",
  "Weight",
  "Laptop fit",
  "Material",
  "Closure",
  "Interior",
  "Strap length",
];

/**
 * Repeatable label/value editor. Serializes its state into a hidden
 * `<input name="specifications">` as a JSON array so the existing form
 * submit path picks it up without any additional wiring.
 */
export function SpecEditor({
  name,
  initial,
}: {
  name: string;
  initial?: ProductSpecification[];
}) {
  const [rows, setRows] = useState<ProductSpecification[]>(
    initial && initial.length > 0 ? initial : []
  );

  function updateRow(i: number, patch: Partial<ProductSpecification>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addRow(label = "") {
    setRows((prev) => [...prev, { label, value: "" }]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Filter out incomplete rows on serialize so we never send half-blanks
  // to the API — the Zod refine would drop them anyway, but this keeps
  // the round-trip clean.
  const serialized = JSON.stringify(
    rows
      .map((r) => ({ label: r.label.trim(), value: r.value.trim() }))
      .filter((r) => r.label && r.value)
  );

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={serialized} />

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No specifications yet. Add rows below — they show as a labelled
          list on the product page.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r, i) => (
            <li key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2 items-end">
              <div className="space-y-1">
                {i === 0 && <Label className="text-[11px]">Label</Label>}
                <Input
                  placeholder="Dimensions"
                  value={r.label}
                  onChange={(e) => updateRow(i, { label: e.target.value })}
                  maxLength={60}
                />
              </div>
              <div className="space-y-1">
                {i === 0 && <Label className="text-[11px]">Value</Label>}
                <Input
                  placeholder="28 × 32 × 12 cm"
                  value={r.value}
                  onChange={(e) => updateRow(i, { value: e.target.value })}
                  maxLength={200}
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label="Remove row"
                className="h-9 w-9 grid place-items-center rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => addRow()}>
          <Plus className="h-3.5 w-3.5" /> Add row
        </Button>
        <span className="text-[11px] text-muted-foreground">Quick add:</span>
        {COMMON_LABELS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => addRow(label)}
            className="inline-flex h-7 px-2.5 text-[11px] rounded-full border border-border bg-background hover:border-foreground/30 hover:bg-muted transition"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
