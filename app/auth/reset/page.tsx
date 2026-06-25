"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const push = useToast((s) => s.push);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      push({ title: "Missing reset token", tone: "error" });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      push({
        title: "Couldn't reset",
        description: data?.error,
        tone: "error",
      });
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/auth/login"), 2000);
  }

  return (
    <div className="container py-16 max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Choose a new password
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">
          Almost there.
        </h1>

        {done ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 grid place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Password updated</p>
                <p className="text-xs text-muted-foreground">
                  Redirecting you to sign in…
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <p className="text-sm text-muted-foreground">
              Pick a fresh password at least 6 characters long.
            </p>
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-11 text-sm focus-visible:outline-none focus-visible:border-foreground/40"
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide" : "Show"}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-full hover:bg-muted text-muted-foreground transition"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Update password <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              <Link
                href="/auth/login"
                className="underline decoration-gold underline-offset-4 text-foreground hover:text-gold transition"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
