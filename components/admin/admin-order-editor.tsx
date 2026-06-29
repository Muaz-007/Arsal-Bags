"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import type { Order } from "@/types";

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

/**
 * Admin order editor — change status + set/clear tracking info.
 * Single Save button writes everything in one PATCH so admin gets clear
 * "Saved" feedback rather than three separate status toasts.
 */
export function AdminOrderEditor({ order }: { order: Order }) {
  const router = useRouter();
  const push = useToast((s) => s.push);

  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber ?? ""
  );
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl ?? "");
  const [saving, setSaving] = useState(false);

  const dirty =
    status !== order.status ||
    trackingNumber !== (order.trackingNumber ?? "") ||
    trackingUrl !== (order.trackingUrl ?? "");

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber,
          trackingUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        push({ title: "Couldn't save", description: data?.error, tone: "error" });
        return;
      }
      push({
        title: "Order updated",
        description: "The customer's order page reflects this immediately.",
        tone: "success",
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Manage
        </p>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Dropdown
            value={status}
            onChange={(v) => setStatus(v as Order["status"])}
            options={STATUSES}
          />
        </div>

        <div className="space-y-1.5">
          <Label>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              Tracking number
            </span>
          </Label>
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="TCS-AB123456789"
            maxLength={80}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Tracking URL (optional)</Label>
          <Input
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="https://www.tcsexpress.com/track?id=..."
            type="url"
            maxLength={500}
          />
          <p className="text-[11px] text-muted-foreground">
            If set, the customer sees a "Track with courier" link on their
            order page.
          </p>
        </div>

        <Button
          variant="gold"
          onClick={save}
          loading={saving}
          disabled={!dirty || saving}
          className="w-full"
        >
          <Save className="h-4 w-4" />
          Save changes
        </Button>
      </CardContent>
    </Card>
  );
}
