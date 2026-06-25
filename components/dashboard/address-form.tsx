"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { SavedAddress } from "@/types/address";

/**
 * Shared add/edit form for a SavedAddress. Used inside the address book
 * card on /dashboard/profile and inline on the checkout page.
 */
export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save address",
  showDefaultToggle = true,
}: {
  initial?: Partial<SavedAddress>;
  onSubmit: (values: Omit<SavedAddress, "id" | "createdAt" | "updatedAt">) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  showDefaultToggle?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [isDefault, setIsDefault] = useState(!!initial?.isDefault);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      await onSubmit({
        label: (fd.get("label") as string)?.trim() || null,
        name: (fd.get("name") as string).trim(),
        address: (fd.get("address") as string).trim(),
        city: (fd.get("city") as string).trim(),
        country: (fd.get("country") as string).trim(),
        postal: (fd.get("postal") as string).trim(),
        phone: (fd.get("phone") as string)?.trim() || null,
        isDefault,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Label</Label>
          <Input
            name="label"
            placeholder="Home, Office…"
            defaultValue={initial?.label ?? ""}
            maxLength={40}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Full name</Label>
          <Input name="name" required defaultValue={initial?.name ?? ""} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Street address</Label>
        <Input name="address" required defaultValue={initial?.address ?? ""} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>City</Label>
          <Input name="city" required defaultValue={initial?.city ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label>Country</Label>
          <Input
            name="country"
            required
            defaultValue={initial?.country ?? "Pakistan"}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Postal code</Label>
          <Input name="postal" required defaultValue={initial?.postal ?? ""} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Phone</Label>
        <Input
          name="phone"
          type="tel"
          placeholder="Optional"
          defaultValue={initial?.phone ?? ""}
        />
      </div>

      {showDefaultToggle && (
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-gold"
          />
          Set as default address
        </label>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" variant="gold" loading={loading}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
