"use client";

import { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown";

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

/**
 * Small client wrapper around the custom Dropdown so the admin orders table
 * (which is a server component) can render one Dropdown per row.
 */
export function OrderStatusDropdown({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return <Dropdown value={value} onChange={setValue} options={STATUSES} />;
}
