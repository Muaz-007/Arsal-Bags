"use client";

import { create } from "zustand";

interface SearchState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

/** Global open/close state for the navbar search overlay. */
export const useSearchPanel = create<SearchState>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set({ open: !get().open }),
}));
