"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";

interface CartState {
  lines: CartLine[];
  coupon?: { code: string; type: "percent" | "fixed"; value: number };
  add: (line: CartLine) => void;
  update: (productId: string, quantity: number, color?: string) => void;
  remove: (productId: string, color?: string) => void;
  clear: () => void;
  applyCoupon: (c: CartState["coupon"]) => void;
  totalItems: () => number;
  subtotal: () => number;
  discount: () => number;
  shipping: () => number;
  tax: () => number;
  total: () => number;
}

// All amounts in PKR. Rs 250 shipping, waived on orders Rs 4,000+. No tax.
// Keep mirrored with `app/api/checkout/route.ts` — the server recomputes
// totals so client-side tampering can't change the charged amount.
const SHIPPING_FEE = 250;
const SHIPPING_FREE_THRESHOLD = 4000;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line) => {
        const lines = get().lines.slice();
        const idx = lines.findIndex(
          (l) => l.productId === line.productId && l.color === line.color
        );
        if (idx >= 0) {
          lines[idx] = { ...lines[idx], quantity: lines[idx].quantity + line.quantity };
        } else {
          lines.push(line);
        }
        set({ lines });
      },
      update: (productId, quantity, color) => {
        // Match on (productId, color) so different color variants of the same
        // product are treated as distinct cart lines — mirrors the add() key.
        const isSame = (l: CartLine) =>
          l.productId === productId && (color === undefined || l.color === color);
        set({
          lines: get()
            .lines.map((l) => (isSame(l) ? { ...l, quantity } : l))
            .filter((l) => l.quantity > 0),
        });
      },
      remove: (productId, color) => {
        // Same matching rule as update(): only remove the exact variant so
        // deleting one color doesn't wipe out the customer's other colors.
        const isSame = (l: CartLine) =>
          l.productId === productId && (color === undefined || l.color === color);
        set({ lines: get().lines.filter((l) => !isSame(l)) });
      },
      clear: () => set({ lines: [], coupon: undefined }),
      applyCoupon: (c) => set({ coupon: c }),
      totalItems: () => get().lines.reduce((a, l) => a + l.quantity, 0),
      subtotal: () =>
        get().lines.reduce((a, l) => a + l.price * l.quantity, 0),
      discount: () => {
        const { coupon, subtotal } = get();
        if (!coupon) return 0;
        return coupon.type === "percent"
          ? subtotal() * (coupon.value / 100)
          : Math.min(coupon.value, subtotal());
      },
      shipping: () => {
        const sub = get().subtotal() - get().discount();
        if (sub <= 0) return 0;
        return sub >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE;
      },
      tax: () => 0,
      total: () =>
        Math.max(0, get().subtotal() - get().discount() + get().shipping()),
    }),
    {
      name: "bagsart-cart",
      partialize: (s) => ({ lines: s.lines, coupon: s.coupon }),
    }
  )
);
