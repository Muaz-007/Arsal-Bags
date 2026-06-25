"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      push({ title: "Sign-in failed", description: res.error, tone: "error" });
      return;
    }
    push({ title: "Welcome back", tone: "success" });
    router.push("/dashboard");
  }

  return (
    <div className="container py-16 grid lg:grid-cols-2 gap-12 items-center max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Welcome back
        </p>
        <h1 className="mt-3 font-display text-4xl">Sign in to your BagsArt account.</h1>
        <p className="mt-3 text-muted-foreground">
          Track orders, save favorites, and check out faster.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5 max-w-sm">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required defaultValue="admin@bagsart.dev" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required defaultValue="admin12345" />
          </div>
          <Button type="submit" variant="gold" className="w-full" loading={loading} size="lg">
            Sign in
          </Button>

          <p className="text-xs text-muted-foreground">
            Try the seeded admin (filled in) or any email/password 6+ chars.
          </p>

          <div className="hairline" />

          <p className="text-sm text-center">
            New here?{" "}
            <Link href="/auth/signup" className="underline decoration-gold underline-offset-4">
              Create an account
            </Link>
          </p>
        </form>
      </motion.div>

      <div className="hidden lg:block">
        <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-gold/20 via-muted to-background border border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.06]" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="font-display text-3xl leading-tight">
              "The Florence Tote is the only bag I've carried daily for six months."
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Naomi Aldridge — Editor, Studio Magazine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
