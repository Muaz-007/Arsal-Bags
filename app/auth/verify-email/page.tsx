"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type State =
  | { phase: "loading" }
  | { phase: "success"; email: string }
  | { phase: "error"; message: string };

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ phase: "error", message: "Missing verification token." });
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/profile/email/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setState({
            phase: "error",
            message: data?.error ?? "This link is no longer valid.",
          });
          return;
        }
        setState({ phase: "success", email: data.email ?? "" });
        // Bounce back to profile after a couple seconds.
        setTimeout(() => {
          router.push("/dashboard/profile");
          router.refresh();
        }, 2500);
      } catch {
        setState({
          phase: "error",
          message: "Something went wrong. Please try again.",
        });
      }
    })();
  }, [token, router]);

  return (
    <div className="container py-20 max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        {state.phase === "loading" && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
            <h1 className="mt-6 font-display text-3xl">Confirming…</h1>
            <p className="mt-2 text-muted-foreground">
              Just a moment while we verify the link.
            </p>
          </>
        )}

        {state.phase === "success" && (
          <>
            <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="mt-6 font-display text-3xl">
              Email <span className="text-gradient-gold">updated</span>.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Your account is now associated with{" "}
              <strong className="text-foreground">{state.email}</strong>. We're
              bouncing you back to your profile.
            </p>
            <Button href="/dashboard/profile" variant="gold" className="mt-6">
              Take me there now <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {state.phase === "error" && (
          <>
            <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-destructive/15 text-destructive">
              <XCircle className="h-7 w-7" />
            </div>
            <h1 className="mt-6 font-display text-3xl">
              Link no longer valid.
            </h1>
            <p className="mt-3 text-muted-foreground">{state.message}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try requesting a new change from your profile.
            </p>
            <Button
              href="/dashboard/profile"
              variant="outline"
              className="mt-6"
            >
              Back to profile
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
