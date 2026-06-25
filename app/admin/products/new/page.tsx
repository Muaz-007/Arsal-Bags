"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";

const CATEGORY_OPTIONS = [
  { value: "tote", label: "Tote" },
  { value: "backpack", label: "Backpack" },
  { value: "clutch", label: "Clutch" },
  { value: "crossbody", label: "Crossbody" },
  { value: "duffel", label: "Duffel" },
  { value: "wallet", label: "Wallet" },
];

export default function NewProductPage() {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("tote");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      push({ title: "Product created", tone: "success" });
      router.push("/admin/products");
    } else {
      push({ title: "Could not create product", tone: "error" });
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl">Add product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new piece for the catalogue.
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
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" name="tagline" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & inventory</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" name="price" type="number" step="0.01" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compareAt">Compare-at</Label>
              <Input id="compareAt" name="compareAt" type="number" step="0.01" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" defaultValue={10} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Category</Label>
              <Dropdown
                value={category}
                onChange={setCategory}
                options={CATEGORY_OPTIONS}
              />
              {/* Mirror the value into a hidden input so the form payload
                  stays the same as before. */}
              <input type="hidden" name="category" value={category} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="collection">Collection</Label>
              <Input id="collection" name="collection" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="images">Image URLs (one per line)</Label>
              <Textarea id="images" name="images" rows={4} required />
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: drop Cloudinary or Unsplash URLs here. Direct file upload
              hooks into the same endpoint when CLOUDINARY_* env vars are set.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" variant="gold" loading={loading}>
            Save product
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
