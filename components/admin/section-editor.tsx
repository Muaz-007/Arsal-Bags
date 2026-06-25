"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit3,
  Save,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export interface SectionItem {
  id: string;
  image?: string;
  title: string;
  subtitle?: string;
  href?: string;
  visible: boolean;
}

/**
 * Generic editor for a storefront section: a list of items the admin can
 * reorder, toggle on/off, edit inline, add, and remove. Used by Hero,
 * Category Strip, Featured, Best Sellers, and Summer Sale tabs.
 */
export function SectionEditor({
  title,
  description,
  initialItems,
  itemNoun = "item",
  storeKey,
  allowImage = true,
  allowSubtitle = true,
  allowHref = true,
}: {
  title: string;
  description?: string;
  initialItems: SectionItem[];
  itemNoun?: string;
  /** When provided, "Save changes" PUTs to /api/admin/storefront with this key. */
  storeKey?: "hero" | "strip";
  allowImage?: boolean;
  allowSubtitle?: boolean;
  allowHref?: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const push = useToast((s) => s.push);

  function move(id: string, direction: -1 | 1) {
    setItems((arr) => {
      const i = arr.findIndex((x) => x.id === id);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= arr.length) return arr;
      const copy = arr.slice();
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  function toggle(id: string) {
    setItems((arr) =>
      arr.map((x) => (x.id === id ? { ...x, visible: !x.visible } : x))
    );
  }

  function remove(id: string) {
    setItems((arr) => arr.filter((x) => x.id !== id));
    push({ title: `${itemNoun} removed`, tone: "info" });
  }

  function add() {
    const id = `new_${Date.now()}`;
    setItems((arr) => [
      ...arr,
      {
        id,
        title: "New " + itemNoun,
        subtitle: "",
        image: "",
        href: "",
        visible: true,
      },
    ]);
    setEditingId(id);
  }

  function patch(id: string, p: Partial<SectionItem>) {
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, ...p } : x)));
  }

  async function save() {
    if (!storeKey) {
      push({
        title: "Storefront updated",
        description: `${items.filter((x) => x.visible).length} ${itemNoun}s live`,
        tone: "success",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/storefront", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: storeKey, value: items }),
      });
      if (!res.ok) throw new Error("Save failed");
      push({
        title: "Storefront updated",
        description: `${items.filter((x) => x.visible).length} ${itemNoun}s live`,
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

  const visibleCount = items.filter((x) => x.visible).length;

  return (
    <div className="space-y-6">
      {/* Header strip */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              {description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <Badge variant="muted">
              {items.length} total
            </Badge>
            <Badge variant="success">
              {visibleCount} visible
            </Badge>
            {items.length - visibleCount > 0 && (
              <Badge variant="warning">
                {items.length - visibleCount} hidden
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={add} variant="outline" size="sm">
            <Plus className="h-4 w-4" /> Add {itemNoun}
          </Button>
          <Button onClick={save} variant="gold" size="sm" loading={saving}>
            <Save className="h-4 w-4" /> Save changes
          </Button>
        </div>
      </div>

      {/* Item list */}
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          <AnimatePresence initial={false}>
            {items.map((it, i) => (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={cn(!it.visible && "opacity-60")}
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Order handle */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(it.id, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className="h-6 w-6 grid place-items-center rounded hover:bg-muted disabled:opacity-30 transition"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(it.id, 1)}
                      disabled={i === items.length - 1}
                      aria-label="Move down"
                      className="h-6 w-6 grid place-items-center rounded hover:bg-muted disabled:opacity-30 transition"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  {allowImage && (
                    <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
                      {it.image ? (
                        <Image
                          src={it.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-muted-foreground/40">
                          <GripVertical className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{it.title}</p>
                    {it.subtitle && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {it.subtitle}
                      </p>
                    )}
                    {it.href && (
                      <p className="text-[11px] font-mono text-muted-foreground/80 truncate mt-1">
                        {it.href}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggle(it.id)}
                      aria-label={it.visible ? "Hide" : "Show"}
                      title={it.visible ? "Hide" : "Show"}
                      className="h-8 w-8 grid place-items-center rounded-full hover:bg-muted transition"
                    >
                      {it.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(editingId === it.id ? null : it.id)}
                      aria-label="Edit"
                      title="Edit"
                      className={cn(
                        "h-8 w-8 grid place-items-center rounded-full hover:bg-muted transition",
                        editingId === it.id && "bg-muted"
                      )}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(it.id)}
                      aria-label="Remove"
                      title="Remove"
                      className="h-8 w-8 grid place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Inline edit panel */}
                <AnimatePresence>
                  {editingId === it.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-muted/30 border-t border-border overflow-hidden"
                    >
                      <div className="p-5 grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label>Title</Label>
                          <Input
                            value={it.title}
                            onChange={(e) => patch(it.id, { title: e.target.value })}
                          />
                        </div>
                        {allowSubtitle && (
                          <div className="space-y-1.5 sm:col-span-2">
                            <Label>Subtitle</Label>
                            <Input
                              value={it.subtitle ?? ""}
                              onChange={(e) =>
                                patch(it.id, { subtitle: e.target.value })
                              }
                            />
                          </div>
                        )}
                        {allowImage && (
                          <div className="space-y-1.5">
                            <Label>Image URL</Label>
                            <Input
                              value={it.image ?? ""}
                              placeholder="https://..."
                              onChange={(e) =>
                                patch(it.id, { image: e.target.value })
                              }
                            />
                          </div>
                        )}
                        {allowHref && (
                          <div className="space-y-1.5">
                            <Label>Link</Label>
                            <Input
                              value={it.href ?? ""}
                              placeholder="/products?..."
                              onChange={(e) => patch(it.id, { href: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No {itemNoun}s yet. Click "Add {itemNoun}" to create one.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
