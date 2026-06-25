"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function SignupPage() {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    };
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Could not sign up" }));
        push({ title: "Sign-up failed", description: error, tone: "error" });
        return;
      }
      await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });
      push({ title: "Welcome to BagsArt", tone: "success" });
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-16 max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Create your account
        </p>
        <h1 className="mt-3 font-display text-4xl">Join the atelier.</h1>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          <Button type="submit" variant="gold" className="w-full" loading={loading} size="lg">
            Create account
          </Button>

          <p className="text-sm text-center">
            Already have one?{" "}
            <Link href="/auth/login" className="underline decoration-gold underline-offset-4">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
