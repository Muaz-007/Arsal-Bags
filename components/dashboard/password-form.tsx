"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * Password change card on /dashboard/profile.
 *
 *   - Only rendered for credentials users. Google-only accounts get a
 *     friendly explainer instead (they change password in Google).
 *   - Requires the current password so a hijacked session can't silently
 *     take over the account.
 *   - Success collapses the form into a confirmation state; users can
 *     click "Change again" to reopen if they want another rotation.
 */
export function PasswordForm({ provider }: { provider: string }) {
  const push = useToast((s) => s.push);
  const isGoogle = provider === "google";

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    setCurrent("");
    setNext("");
    setConfirm("");
    setDone(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) {
      push({
        title: "Password too short",
        description: "Use at least 8 characters.",
        tone: "error",
      });
      return;
    }
    if (next !== confirm) {
      push({
        title: "Passwords don't match",
        description: "Retype the new password to confirm it.",
        tone: "error",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: next,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        push({
          title: "Couldn't change password",
          description: data?.error ?? "Please try again.",
          tone: "error",
        });
        return;
      }
      setDone(true);
      push({
        title: "Password updated",
        description: "We've emailed a confirmation to your inbox.",
        tone: "success",
      });
    } finally {
      setSaving(false);
    }
  }

  if (isGoogle) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <span className="h-9 w-9 grid place-items-center rounded-full bg-muted shrink-0">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium">Password is managed by Google</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-md leading-relaxed">
                You sign in to BagsArt with your Google account, so there's no
                separate password here. To change it, update the password in
                your{" "}
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-gold underline-offset-4 hover:text-foreground"
                >
                  Google account settings
                </a>
                .
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Password updated</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your new password is active. Use it the next time you sign in.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-3 text-sm underline decoration-gold underline-offset-4 hover:text-foreground"
              >
                Change again
              </button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <Label>Current password</Label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn("pr-10")}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? "Hide" : "Show"}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {showCurrent ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>New password</Label>
            <div className="relative">
              <Input
                type={showNext ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNext((v) => !v)}
                aria-label={showNext ? "Hide" : "Show"}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {showNext ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Confirm new password</Label>
            <Input
              type={showNext ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Retype to confirm"
            />
          </div>

          <Button
            type="submit"
            variant="gold"
            loading={saving}
            disabled={!current || next.length < 8 || next !== confirm}
          >
            Change password
          </Button>

          <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
            We'll send a confirmation to your email. If you didn't make this
            change, reply to that email and we'll help you lock the account.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
