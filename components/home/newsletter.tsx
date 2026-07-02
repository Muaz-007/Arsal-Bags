"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Reveal } from "@/components/ui/reveal";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const push = useToast((s) => s.push);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      push({ title: "Please enter a valid email.", tone: "error" });
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      push({
        title: "You're on the list",
        description: "Look out for our next capsule launch in your inbox.",
        tone: "success",
      });
      setEmail("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Reveal as="section" className="container py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 md:p-16">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-2 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Newsletter
            </p>
            <h3 className="mt-3 font-display text-3xl md:text-4xl tracking-tight">
              A note when a new piece is finished.
            </h3>
            <p className="mt-3 text-muted-foreground max-w-md">
              One letter a month. No marketing pressure, no urgency — just the
              quiet news of what's coming out of the workshop next.
            </p>
          </div>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="you@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              required
            />
            <Button type="submit" size="lg" variant="gold" loading={loading}>
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </Reveal>
  );
}
