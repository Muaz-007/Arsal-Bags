"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { AddressForm } from "@/components/dashboard/address-form";
import { cn } from "@/lib/utils";
import type { SavedAddress } from "@/types/address";

/**
 * /dashboard/profile companion: list, add, edit, delete saved addresses.
 * Uses the /api/addresses CRUD endpoints; optimistic UI for snappiness.
 */
export function AddressBook() {
  const [items, setItems] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "add" | { editId: string }>("list");
  const push = useToast((s) => s.push);

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/addresses", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { addresses: SavedAddress[] };
        setItems(data.addresses);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function add(values: Omit<SavedAddress, "id" | "createdAt" | "updatedAt">) {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      push({ title: "Couldn't save", tone: "error" });
      return;
    }
    const created = (await res.json()) as SavedAddress;
    // If created becomes default, demote others locally.
    setItems((arr) => {
      const next = arr.map((a) =>
        created.isDefault ? { ...a, isDefault: false } : a
      );
      return [created, ...next];
    });
    push({ title: "Address saved", tone: "success" });
    setMode("list");
  }

  async function edit(
    id: string,
    values: Omit<SavedAddress, "id" | "createdAt" | "updatedAt">
  ) {
    const res = await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      push({ title: "Couldn't update", tone: "error" });
      return;
    }
    const updated = (await res.json()) as SavedAddress;
    setItems((arr) =>
      arr.map((a) => {
        if (a.id === id) return updated;
        if (updated.isDefault) return { ...a, isDefault: false };
        return a;
      })
    );
    push({ title: "Address updated", tone: "success" });
    setMode("list");
  }

  async function setDefault(id: string) {
    // Optimistic
    setItems((arr) =>
      arr.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    const res = await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (!res.ok) {
      push({ title: "Couldn't set default", tone: "error" });
    }
  }

  async function remove(id: string) {
    const wasDefault = items.find((a) => a.id === id)?.isDefault;
    // Optimistic
    setItems((arr) => {
      const remaining = arr.filter((a) => a.id !== id);
      // Promote a new default locally if we removed the default.
      if (wasDefault && remaining[0]) remaining[0].isDefault = true;
      return remaining;
    });
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      push({ title: "Couldn't delete", tone: "error" });
    } else {
      push({ title: "Address removed", tone: "info" });
    }
  }

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Address book</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Save your shipping addresses for one-tap checkout.
          </p>
        </div>
        {mode === "list" && (
          <Button onClick={() => setMode("add")} variant="outline" size="sm">
            <Plus className="h-4 w-4" /> Add address
          </Button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {mode === "add" && (
          <motion.div
            key="add"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card>
              <CardContent className="p-6">
                <p className="font-display text-lg mb-4">New address</p>
                <AddressForm
                  onSubmit={add}
                  onCancel={() => setMode("list")}
                  submitLabel="Save address"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {typeof mode === "object" && (
          <motion.div
            key={`edit-${mode.editId}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card>
              <CardContent className="p-6">
                <p className="font-display text-lg mb-4">Edit address</p>
                <AddressForm
                  initial={items.find((a) => a.id === mode.editId)}
                  onSubmit={(v) => edit(mode.editId, v)}
                  onCancel={() => setMode("list")}
                  submitLabel="Update address"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {mode === "list" && (
        <>
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Loading…
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-10 text-center">
                <span className="mx-auto h-12 w-12 grid place-items-center rounded-full bg-muted text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                </span>
                <p className="mt-4 font-display text-xl">No saved addresses yet</p>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  Save a shipping address now and we'll auto-fill the checkout
                  next time.
                </p>
                <Button
                  variant="gold"
                  className="mt-5"
                  onClick={() => setMode("add")}
                >
                  <Plus className="h-4 w-4" /> Add your first address
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((a) => (
                <Card
                  key={a.id}
                  className={cn(
                    "transition-shadow hover:shadow-md",
                    a.isDefault && "ring-1 ring-gold/40"
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">
                            {a.label || "Address"}
                          </p>
                          {a.isDefault && (
                            <Badge variant="gold">
                              <Star className="h-3 w-3 mr-1 inline" />
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 -mr-2 -mt-1">
                        <button
                          type="button"
                          aria-label="Edit"
                          onClick={() => setMode({ editId: a.id })}
                          className="h-8 w-8 grid place-items-center rounded-full hover:bg-muted text-muted-foreground transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          onClick={() => remove(a.id)}
                          className="h-8 w-8 grid place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <address className="not-italic mt-3 text-sm text-foreground/85 leading-relaxed">
                      {a.name}
                      <br />
                      {a.address}
                      <br />
                      {a.city}, {a.country} {a.postal}
                      {a.phone && (
                        <>
                          <br />
                          <span className="text-muted-foreground">
                            {a.phone}
                          </span>
                        </>
                      )}
                    </address>

                    {!a.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefault(a.id)}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Set as default
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
