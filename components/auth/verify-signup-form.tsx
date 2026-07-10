"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Signup verification form.
 *
 * Behaviour:
 *   - Six individual digit inputs. Typing a digit auto-advances focus.
 *     Pasting a 6-digit string fills all boxes at once.
 *   - Backspace on an empty box moves focus back and clears the previous.
 *   - Auto-submits when all six digits are filled.
 *   - Resend button is disabled for 60 seconds after each request, so the
 *     server-side rate limit isn't the first thing users hit.
 *   - Successful verification triggers a silent NextAuth credentials
 *     sign-in only if we also had the password; otherwise we redirect
 *     to /auth/login with the email prefilled.
 */
export function VerifySignupForm({
  initialEmail,
  callbackUrl,
}: {
  initialEmail?: string;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const autoSubmittedFor = useRef<string | null>(null);

  // Countdown tick for the resend button.
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
    // Only keep digits; if the user pasted multiple chars we distribute
    // them across the following boxes below via onPaste, so here we
    // assume a single-character intent.
    const value = raw.replace(/\D/g, "").slice(-1);
    setDigitAt(i, value);
    if (value && i < 5) focusInput(i + 1);
  }

  function onDigitKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
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
      return;
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const filled = text.padEnd(6, "").split("").slice(0, 6);
    setDigits(filled);
    // Focus the box after the last pasted digit (or the last box).
    focusInput(Math.min(text.length, 5));
  }

  async function verify(code: string) {
    if (!email) {
      push({
        title: "Missing email",
        description: "Enter the email you signed up with, then the code.",
        tone: "error",
      });
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        push({
          title: "Verification failed",
          description: data?.error ?? "That code isn't valid.",
          tone: "error",
        });
        // Clear digits so the user can retype cleanly.
        setDigits(Array(6).fill(""));
        focusInput(0);
        return;
      }

      // Try the silent sign-in path first — if the sign-up flow just
      // handed us the password via sessionStorage, we can create the
      // session ourselves and skip the extra /auth/login stop. Scrub the
      // stashed password immediately (success or failure) so it never
      // outlives this handler.
      let stashedPassword: string | null = null;
      try {
        stashedPassword = sessionStorage.getItem("bagsart-pending-signup-pw");
      } catch {
        // No storage access — fall through to the /auth/login fallback.
      }
      if (stashedPassword) {
        try {
          sessionStorage.removeItem("bagsart-pending-signup-pw");
        } catch {
          // best-effort cleanup only
        }
        const signInRes = await signIn("credentials", {
          email,
          password: stashedPassword,
          redirect: false,
        });
        if (!signInRes?.error) {
          push({ title: "Welcome to BagsArt", tone: "success" });
          // Land on the caller-provided page (e.g. /checkout when this
          // flow started from the checkout redirect). Falls back to home.
          router.push(callbackUrl ?? "/");
          router.refresh();
          return;
        }
        // Silent sign-in failed for some reason (throttled, transient) —
        // drop through to the manual sign-in fallback below.
      }

      // Fallback: no stashed password, or the auto sign-in didn't take.
      push({
        title: "Email verified",
        description: "You can sign in now.",
        tone: "success",
      });
      const cbParam = callbackUrl
        ? `&callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "";
      router.push(
        `/auth/login?email=${encodeURIComponent(email)}&verified=1${cbParam}`
      );
    } finally {
      setVerifying(false);
    }
  }

  // Auto-submit when all 6 digits are filled — but only once per code,
  // otherwise clearing and retyping the same code would loop.
  useEffect(() => {
    const code = digits.join("");
    if (code.length !== 6) return;
    if (verifying) return;
    if (autoSubmittedFor.current === code) return;
    autoSubmittedFor.current = code;
    verify(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  async function resend() {
    if (!email) {
      push({ title: "Enter your email first.", tone: "error" });
      return;
    }
    setResending(true);
    try {
      await fetch("/api/auth/verify-signup/resend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      push({
        title: "New code sent",
        description: "Check your inbox — it should arrive in a moment.",
        tone: "success",
      });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setDigits(Array(6).fill(""));
      autoSubmittedFor.current = null;
      focusInput(0);
    } finally {
      setResending(false);
    }
  }

  const canSubmit = digits.every((d) => d) && !!email;

  return (
    <Card>
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* The email is fixed at this step. Making it editable used to
            look helpful ("fix a typo") but any change here just breaks
            verification — the code was mailed to the original address,
            and the silent sign-in that runs after verify uses the
            password we stashed against that same address. A typo means
            the user has to go back to /auth/signup anyway. */}
        <div className="space-y-1.5">
          <Label>Email</Label>
          <div className="rounded-md border border-input bg-muted/40 px-3 py-2.5 text-sm flex items-center justify-between gap-3">
            <span className="truncate font-medium">{email || "—"}</span>
            <a
              href="/auth/signup"
              className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground shrink-0"
            >
              Change
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Verification code</Label>
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
                disabled={verifying}
                className={cn(
                  "h-12 w-full text-center rounded-md border border-input bg-background",
                  "font-mono text-xl tabular-nums",
                  "transition-colors",
                  "dark:border-gold/40 dark:hover:border-gold/60 dark:focus:border-gold-dark",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  "disabled:opacity-50"
                )}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            Code expires in 15 minutes. Check spam if you don't see it.
          </p>
        </div>

        <Button
          type="button"
          variant="gold"
          size="lg"
          className="w-full"
          loading={verifying}
          disabled={!canSubmit || verifying}
          onClick={() => verify(digits.join(""))}
        >
          Verify email
        </Button>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Didn't get the code?</span>
          <button
            type="button"
            onClick={resend}
            disabled={resending || cooldown > 0}
            className="text-foreground font-medium underline decoration-gold underline-offset-4 disabled:opacity-40 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
