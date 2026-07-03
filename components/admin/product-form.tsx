"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { Category, Product } from "@/types";

const CATEGORY_OPTIONS = [
  { value: "tote", label: "Tote" },
  { value: "backpack", label: "Backpack" },
  { value: "clutch", label: "Clutch" },
  { value: "crossbody", label: "Crossbody" },
  { value: "duffel", label: "Duffel" },
  { value: "wallet", label: "Wallet" },
];

/**
 * Shared product form — used by both "Add product" and "Edit product".
 * When `initial` is passed, the form pre-fills + the submit hits the PATCH
 * endpoint. When absent, it's a fresh create → POST.
 */
export function ProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const isEdit = !!initial;

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [category, setCategory] = useState<Category>(initial?.category ?? "tote");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const url = isEdit
      ? `/api/admin/products/${initial!.id}`
      : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      push({
        title: isEdit ? "Product updated" : "Product created",
        tone: "success",
      });
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      push({
        title: isEdit ? "Couldn't update" : "Couldn't create",
        description: data?.error,
        tone: "error",
      });
    }
  }

  async function remove() {
    if (!initial) return;
    if (
      !confirm(
        `Delete "${initial.name}"? This removes it from the catalogue permanently.`
      )
    )
      return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${initial.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (res.ok) {
      push({ title: "Product deleted", tone: "info" });
      router.push("/admin/products");
      router.refresh();
    } else {
      push({ title: "Couldn't delete", tone: "error" });
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl">
          {isEdit ? "Edit product" : "Add product"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEdit
            ? `Updating ${initial!.name}.`
            : "Create a new piece for the catalogue."}
        </p>
      </header>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={initial?.name ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                name="tagline"
                required
                defaultValue={initial?.tagline ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                defaultValue={initial?.description ?? ""}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing &amp; inventory</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (PKR)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                required
                defaultValue={initial?.price ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compareAt">Compare-at</Label>
              <Input
                id="compareAt"
                name="compareAt"
                type="number"
                step="0.01"
                defaultValue={initial?.compareAt ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                required
                defaultValue={initial?.stock ?? 10}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Category</Label>
              <Dropdown
                value={category}
                onChange={(v) => setCategory(v as Category)}
                options={CATEGORY_OPTIONS}
              />
              <input type="hidden" name="category" value={category} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="collection">Collection</Label>
              <Input
                id="collection"
                name="collection"
                defaultValue={initial?.collection ?? ""}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader name="images" initialUrls={initial?.images} />
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3 items-center">
          <Button type="submit" variant="gold" loading={loading}>
            {isEdit ? "Save changes" : "Save product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="ghost"
              className="ml-auto text-destructive hover:bg-destructive/10"
              loading={deleting}
              onClick={remove}
            >
              <Trash2 className="h-4 w-4" />
              Delete product
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
