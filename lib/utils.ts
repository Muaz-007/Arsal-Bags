import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (ShadCN-style helper). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a rupee amount for display.
 *
 * Uses a plain "Rs 12,345" prefix rather than `Intl.currency` because the
 * PKR ISO output ("PKR 12,345.00") reads awkward in a customer-facing
 * store, and Unicode ₨ isn't consistently rendered across every device.
 */
export function formatPrice(amount: number, _currency = "PKR") {
  const rounded = Math.round(amount);
  return `Rs ${rounded.toLocaleString("en-PK")}`;
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(value: string, max = 120) {
  return value.length > max ? `${value.slice(0, max - 1).trim()}…` : value;
}
