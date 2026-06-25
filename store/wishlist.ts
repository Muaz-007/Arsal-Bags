"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  ids: string[];
  /** Set by WishlistSync based on the next-auth session. `toggle()` reads
   *  this to decide whether to fire the server POST — keeps guests silent. */
  authed: boolean;
  hydrated: boolean;
  toggle: (id: string) => void;
  setIds: (ids: string[]) => void;
  setAuthed: (v: boolean) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

/**
 * Local + server-synced wishlist.
 *
 *  - Persisted to localStorage so guests still get a wishlist.
 *  - When the user signs in, `WishlistSync` (components/layout/wishlist-sync)
 *    pulls the canonical list from `/api/wishlist`, merges local additions,
 *    pushes back any IDs that weren't on the server, AND flips `authed`
 *    here so `toggle()` knows whether to call the API.
 *  - `toggle()` does an optimistic local change; the POST is only fired
 *    when the user is signed in. Guests get a silent local toggle — no 401
 *    noise in the console.
 */
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      authed: false,
      hydrated: false,
      toggle: (id) => {
        const isOn = get().ids.includes(id);
        // Optimistic local update first
        set({
          ids: isOn
            ? get().ids.filter((x) => x !== id)
            : [...get().ids, id],
        });
        // Sync to server only when signed in.
        if (typeof window !== "undefined" && get().authed) {
          fetch("/api/wishlist", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ productId: id }),
          }).catch(() => null);
        }
      },
      setIds: (ids) => set({ ids, hydrated: true }),
      setAuthed: (v) => set({ authed: v }),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "bagsart-wishlist",
      // Don't persist `authed` / `hydrated` — they're derived per session.
      partialize: (s) => ({ ids: s.ids }),
    }
  )
);
