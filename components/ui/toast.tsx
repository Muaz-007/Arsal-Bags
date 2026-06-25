"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: Tone;
}

interface ToastStore {
  items: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: number) => void;
}

export const useToast = create<ToastStore>((set) => ({
  items: [],
  push: (t) => {
    const id = Date.now() + Math.random();
    set((s) => ({ items: [...s.items, { id, ...t }] }));
    setTimeout(() => {
      set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    }, 3200);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

const icons = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
  info: <Info className="h-4 w-4 text-sky-500" />,
};

export function ToastViewport() {
  const items = useToast((s) => s.items);
  const dismiss = useToast((s) => s.dismiss);
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80 pointer-events-none">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            className={cn(
              "pointer-events-auto glass rounded-xl shadow-xl px-4 py-3 cursor-pointer",
              "border-l-2",
              t.tone === "success" && "border-emerald-500",
              t.tone === "error" && "border-red-500",
              t.tone === "info" && "border-sky-500"
            )}
            onClick={() => dismiss(t.id)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{icons[t.tone]}</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
