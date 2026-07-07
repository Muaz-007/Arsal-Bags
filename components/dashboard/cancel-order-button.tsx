"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { cn } from "@/lib/utils";

// Kept 1:1 with the server enum in app/api/orders/[id]/cancel/route.ts.
type ReasonKey =
  | "changed_mind"
  | "wrong_item"
  | "found_cheaper"
  | "too_slow"
  | "duplicate"
  | "other";

const REASONS: { value: ReasonKey; label: string }[] = [
  { value: "changed_mind", label: "Changed my mind" },
  { value: "wrong_item", label: "Ordered the wrong item / colour" },
  { value: "found_cheaper", label: "Found it cheaper elsewhere" },
  { value: "too_slow", label: "Taking too long" },
  { value: "duplicate", label: "Duplicate order" },
  { value: "other", label: "Other" },
];

/**
 * Small "cancel this order" pill + confirmation modal shown on the
 * customer's order detail page. Only rendered by the parent when the
 * order is still in `pending` status — the same guard exists on the
 * server too, so a bypassed client can't sneak a late cancellation
 * through.
 */
export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState<ReasonKey | null>(null);
  const [otherReason, setOtherReason] = useState("");

  useBodyScrollLock(open);

  function reset() {
    setReason(null);
    setOtherReason("");
  }

  async function confirmCancel() {
    if (!reason) {
      push({ title: "Please pick a reason.", tone: "error" });
      return;
    }
    if (reason === "other" && otherReason.trim().length < 4) {
      push({
        title: "Add a short note",
        description: "Just a few words about why — it helps us improve.",
        tone: "error",
      });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reason,
          otherReason:
            reason === "other" ? otherReason.trim().slice(0, 280) : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        push({
          title: "Couldn't cancel",
          description:
            data?.error ??
            "Something went wrong on our end. Please try again in a moment.",
          tone: "error",
        });
        return;
      }
      push({
        title: "Order cancelled",
        description: "We've sent a confirmation to your email.",
        tone: "success",
      });
      setOpen(false);
      reset();
      router.refresh();
    } catch {
      push({
        title: "Couldn't cancel",
        description: "Check your connection and try again.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        className="w-full text-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        Cancel this order
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => !busy && setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              key="modal"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[61] grid place-items-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden pointer-events-auto">
                <div className="flex items-start justify-between p-5 border-b border-border">
                  <div className="flex items-start gap-3">
                    <span className="h-9 w-9 grid place-items-center rounded-full bg-destructive/15 text-destructive shrink-0">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        Confirm
                      </p>
                      <h2 className="mt-1 font-display text-xl tracking-tight">
                        Cancel this order?
                      </h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => !busy && setOpen(false)}
                    disabled={busy}
                    aria-label="Close"
                    className="h-8 w-8 grid place-items-center rounded-full hover:bg-muted transition disabled:opacity-40"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    We'll release the items back into stock and won't charge
                    you — this order hadn't shipped yet.
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Why are you cancelling?
                    </p>
                    <ul className="space-y-1.5" role="radiogroup" aria-label="Cancellation reason">
                      {REASONS.map((opt) => {
                        const active = reason === opt.value;
                        return (
                          <li key={opt.value}>
                            <button
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => setReason(opt.value)}
                              disabled={busy}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm text-left transition-colors",
                                active
                                  ? "border-gold bg-gold/5 dark:bg-gold/10"
                                  : "border-border hover:border-foreground/30",
                                busy && "opacity-60 pointer-events-none"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-4 w-4 rounded-full border grid place-items-center shrink-0 transition-colors",
                                  active
                                    ? "border-gold bg-gold text-black"
                                    : "border-border"
                                )}
                              >
                                {active && <Check className="h-2.5 w-2.5" />}
                              </span>
                              <span className="flex-1">{opt.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {reason === "other" && (
                    <div className="space-y-1.5">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Tell us a bit more
                      </p>
                      <Textarea
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                        maxLength={280}
                        rows={3}
                        placeholder="A few words — it helps us do better next time."
                        disabled={busy}
                      />
                      <p className="text-[11px] text-muted-foreground text-right">
                        {otherReason.length}/280
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setOpen(false);
                        reset();
                      }}
                      disabled={busy}
                    >
                      Keep order
                    </Button>
                    <Button
                      type="button"
                      variant="gold"
                      className="flex-1 bg-destructive text-white hover:bg-destructive/90"
                      loading={busy}
                      disabled={
                        !reason ||
                        (reason === "other" && otherReason.trim().length < 4)
                      }
                      onClick={confirmCancel}
                    >
                      Yes, cancel
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
