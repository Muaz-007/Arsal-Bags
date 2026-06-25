"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="container py-16 max-w-md">
      <Link
        href="/auth/login"
        className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6"
      >
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Reset your password
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">
          Forgot it? <span className="text-gradient-gold">No problem.</span>
        </h1>

        {sent ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 grid place-items-center rounded-full bg-gold/15 text-gold">
                <Mail className="h-4 w-4" />
              </span>
              <p className="text-sm">
                If <strong>{email}</strong> is registered, a reset link has been
                sent. The link expires in one hour.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <p className="text-sm text-muted-foreground">
              Enter the email you used to sign up. We'll send you a one-time
              link to set a new password.
            </p>
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:border-foreground/40"
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Send reset link
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
