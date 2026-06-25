"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";

interface CartState {
  lines: CartLine[];
  coupon?: { code: string; type: "percent" | "fixed"; value: number };
  add: (line: CartLine) => void;
  update: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  applyCoupon: (c: CartState["coupon"]) => void;
  totalItems: () => number;
  subtotal: () => number;
  discount: () => number;
  shipping: () => number;
  tax: () => number;
  total: () => number;
}

const SHIPPING_FREE_THRESHOLD = 250;
const SHIPPING_FEE = 15;
const TAX_RATE = 0.08;

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
      update: (productId, quantity) => {
        set({
          lines: get()
            .lines.map((l) => (l.productId === productId ? { ...l, quantity } : l))
            .filter((l) => l.quantity > 0),
        });
      },
      remove: (productId) =>
        set({ lines: get().lines.filter((l) => l.productId !== productId) }),
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
      tax: () => (get().subtotal() - get().discount()) * TAX_RATE,
      total: () =>
        Math.max(
          0,
          get().subtotal() - get().discount() + get().shipping() + get().tax()
        ),
    }),
    {
      name: "bagsart-cart",
      partialize: (s) => ({ lines: s.lines, coupon: s.coupon }),
    }
  )
);
