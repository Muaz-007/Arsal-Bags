"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { cn } from "@/lib/utils";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Guest-checkout verification modal.
 *
 * Rendered from `<CheckoutPage>` when an unauthenticated buyer submits
 * the form. The modal:
 *   - Displays the email we just mailed a code to
 *   - Collects a 6-digit code via six single-character inputs
 *   - Auto-submits when the last digit is entered
 *   - Bubbles the successful code up via `onVerified(code)` — the parent
 *     handles the actual order POST so the modal doesn't need to know
 *     the full checkout payload
 *   - Offers "resend" with a 60-second cooldown to keep the SMTP budget
 *     from being burned by a customer mashing the button
 */
export function GuestVerifyModal({
  open,
  email,
  submitting,
  onClose,
  onVerified,
  onResend,
}: {
  open: boolean;
  email: string;
  submitting: boolean;
  onClose: () => void;
  onVerified: (code: string) => void;
  onResend: () => Promise<void>;
}) {
  const push = useToast((s) => s.push);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const submittedFor = useRef<string | null>(null);

  useBodyScrollLock(open);

  // Reset the code + submit guard whenever the modal opens/closes.
  useEffect(() => {
    if (open) {
      setDigits(Array(6).fill(""));
      submittedFor.current = null;
      // Small delay lets the animation finish before we grab focus.
      const t = setTimeout(() => inputsRef.current[0]?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Resend cooldown tick.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  function focusInput(i: number) {
    inputsRef.current[i]?.focus();
    inputsRef.current[i]?.select();
  }

  function setDigitAt(i: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function onDigitChange(i: number, raw: string) {
    const value = raw.replace(/\D/g, "").slice(-1);
    setDigitAt(i, value);
    if (value && i < 5) focusInput(i + 1);
  }

  function onDigitKeyDown(
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      setDigitAt(i - 1, "");
      focusInput(i - 1);
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      focusInput(i - 1);
      return;
    }
    if (e.key === "ArrowRight" && i < 5) {
      e.preventDefault();
      focusInput(i + 1);
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const filled = text.padEnd(6, "").split("").slice(0, 6);
    setDigits(filled);
    focusInput(Math.min(text.length, 5));
  }

  // Auto-submit when 6 digits are filled — but only once per code so
  // clearing and retyping doesn't re-fire onVerified.
  useEffect(() => {
    const code = digits.join("");
    if (code.length !== 6 || submitting) return;
    if (submittedFor.current === code) return;
    submittedFor.current = code;
    onVerified(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, submitting]);

  async function resend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await onResend();
      push({
        title: "New code sent",
        description: `Check ${email} for the new verification code.`,
        tone: "success",
      });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setDigits(Array(6).fill(""));
      submittedFor.current = null;
      focusInput(0);
    } finally {
      setResending(false);
    }
  }

  const code = digits.join("");
  const canManualSubmit = code.length === 6 && !submitting;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => !submitting && onClose()}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-verify-heading"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[61] grid place-items-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden pointer-events-auto">
              <div className="flex items-start justify-between p-5 border-b border-border">
                <div className="flex items-start gap-3">
                  <span className="h-9 w-9 grid place-items-center rounded-full bg-gold/15 text-gold-dark dark:text-gold-light shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Last step
                    </p>
                    <h2
                      id="guest-verify-heading"
                      className="mt-1 font-display text-xl tracking-tight"
                    >
                      Verify your email
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !submitting && onClose()}
                  disabled={submitting}
                  aria-label="Close"
                  className="h-8 w-8 grid place-items-center rounded-full hover:bg-muted transition disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to{" "}
                  <span className="text-foreground font-medium">{email}</span>.
                  Enter it below to place your order.
                </p>

                <div>
                  <div className="flex justify-between gap-2 sm:gap-3">
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputsRef.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        aria-label={`Digit ${i + 1}`}
                        maxLength={1}
                        value={d}
                        onChange={(e) => onDigitChange(i, e.target.value)}
                        onKeyDown={(e) => onDigitKeyDown(i, e)}
                        onPaste={onPaste}
                        onFocus={(e) => e.target.select()}
                        disabled={submitting}
                        className={cn(
                          "h-12 w-full text-center rounded-md border border-input bg-background",
                          "font-mono text-xl tabular-nums transition-colors",
                          "dark:border-gold/40 dark:hover:border-gold/60 dark:focus:border-gold-dark",
                          "focus:outline-none focus:ring-2 focus:ring-ring",
                          "disabled:opacity-50"
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Code expires in 15 minutes. Check spam if you don't see it.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  loading={submitting}
                  disabled={!canManualSubmit}
                  onClick={() => onVerified(code)}
                >
                  {submitting ? "Placing your order…" : "Verify & place order"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Didn't get the code?
                  </span>
                  <button
                    type="button"
                    onClick={resend}
                    disabled={resending || cooldown > 0 || submitting}
                    className="text-foreground font-medium underline decoration-gold underline-offset-4 disabled:opacity-40 disabled:no-underline inline-flex items-center gap-1.5"
                  >
                    {resending && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : resending
                        ? "Sending…"
                        : "Resend code"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
