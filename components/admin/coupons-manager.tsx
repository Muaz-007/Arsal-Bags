"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Coupon } from "@/types";

const TYPE_OPTIONS = [
  { value: "percent", label: "Percentage off" },
  { value: "fixed", label: "Fixed amount off" },
];

/**
 * Admin coupons manager — list + create + edit + delete on a single screen.
 * Optimistic UI for snappy feedback; falls back to refresh on error.
 */
export function CouponsManager({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [items, setItems] = useState<Coupon[]>(initial);
  const [mode, setMode] = useState<
    | { kind: "list" }
    | { kind: "new" }
    | { kind: "edit"; code: string }
  >({ kind: "list" });
  const [busy, setBusy] = useState(false);

  // Local draft state used by the form (covers both create + edit).
  const editing = mode.kind === "edit"
    ? items.find((c) => c.code === mode.code)
    : null;

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("10");
  const [active, setActive] = useState(true);
  const [expires, setExpires] = useState("");

  function openNew() {
    setCode("");
    setType("percent");
    setValue("10");
    setActive(true);
    setExpires("");
    setMode({ kind: "new" });
  }

  function openEdit(c: Coupon) {
    setCode(c.code);
    setType(c.type);
    setValue(String(c.value));
    setActive(c.active);
    setExpires(c.expiresAt ? c.expiresAt.slice(0, 10) : "");
    setMode({ kind: "edit", code: c.code });
  }

  function reset() {
    setMode({ kind: "list" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const numericValue = Number(value);
      if (!isFinite(numericValue) || numericValue <= 0) {
        push({ title: "Value must be a positive number", tone: "error" });
        return;
      }
      const expiresAt =
        expires.trim() === ""
          ? null
          : new Date(expires + "T23:59:59.000Z").toISOString();

      if (mode.kind === "new") {
        const res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            code: code.trim().toUpperCase(),
            type,
            value: numericValue,
            active,
            expiresAt,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          push({ title: "Couldn't create", description: data?.error, tone: "error" });
          return;
        }
        push({ title: "Coupon created", tone: "success" });
      } else if (mode.kind === "edit") {
        const res = await fetch(
          `/api/admin/coupons/${encodeURIComponent(mode.code)}`,
          {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              type,
              value: numericValue,
              active,
              expiresAt,
            }),
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          push({ title: "Couldn't update", description: data?.error, tone: "error" });
          return;
        }
        push({ title: "Coupon updated", tone: "success" });
      }
      router.refresh();
      reset();
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: Coupon) {
    if (!confirm(`Delete coupon ${c.code}? This can't be undone.`)) return;
    // Optimistic
    setItems((arr) => arr.filter((x) => x.code !== c.code));
    const res = await fetch(`/api/admin/coupons/${encodeURIComponent(c.code)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      // Rollback
      setItems(initial);
      push({ title: "Couldn't delete", tone: "error" });
    } else {
      push({ title: "Coupon deleted", tone: "info" });
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl">Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Promotional codes. {items.length} total.
          </p>
        </div>
        {mode.kind === "list" && (
          <Button variant="gold" onClick={openNew}>
            <Plus className="h-4 w-4" /> New coupon
          </Button>
        )}
      </header>

      {/* Form panel */}
      <AnimatePresence mode="wait">
        {(mode.kind === "new" || mode.kind === "edit") && (
          <motion.div
            key={mode.kind === "edit" ? `edit-${mode.code}` : "new"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card>
              <CardContent className="p-6">
                <p className="font-display text-xl mb-4">
                  {mode.kind === "new" ? "New coupon" : `Edit ${editing?.code}`}
                </p>
                <form onSubmit={save} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Code</Label>
                      <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="WELCOME10"
                        required
                        maxLength={40}
                        disabled={mode.kind === "edit"}
                        className="font-mono uppercase"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        A-Z, 0-9, _ or -. Customers type this at checkout.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Type</Label>
                      <Dropdown
                        value={type}
                        onChange={(v) => setType(v as "percent" | "fixed")}
                        options={TYPE_OPTIONS}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>{type === "percent" ? "Percent off" : "Amount off (USD)"}</Label>
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        min={1}
                        max={type === "percent" ? 100 : 100000}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Expires (optional)</Label>
                      <Input
                        type="date"
                        value={expires}
                        onChange={(e) => setExpires(e.target.value)}
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-gold"
                    />
                    Active — customers can use this now
                  </label>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button type="submit" variant="gold" loading={busy}>
                      {mode.kind === "new" ? "Create coupon" : "Save changes"}
                    </Button>
                    <Button type="button" variant="outline" onClick={reset}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {items.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              No coupons yet. Click "New coupon" to create your first.
            </p>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-muted/30 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Code</th>
                  <th className="text-left px-5 py-3">Type</th>
                  <th className="text-left px-5 py-3">Value</th>
                  <th className="text-left px-5 py-3">Uses</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((c) => (
                  <tr key={c.code} className={cn("hover:bg-muted/30 transition-colors", !c.active && "opacity-60")}>
                    <td className="px-5 py-3 font-mono">{c.code}</td>
                    <td className="px-5 py-3 capitalize">{c.type}</td>
                    <td className="px-5 py-3">
                      {c.type === "percent" ? `${c.value}%` : `$${c.value}`}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{c.uses}</td>
                    <td className="px-5 py-3">
                      <Badge variant={c.active ? "success" : "muted"}>
                        {c.active ? "Active" : "Paused"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label="Edit"
                          onClick={() => openEdit(c)}
                          className="h-8 w-8 grid place-items-center rounded-full hover:bg-muted text-muted-foreground transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          onClick={() => remove(c)}
                          className="h-8 w-8 grid place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
