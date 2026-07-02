"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

/**
 * Compact newsletter form for the footer.
 *
 * Same POST endpoint as the homepage `Newsletter` — the `source` field lets
 * the admin see which surface a subscriber came in from without a schema
 * change.
 */
export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
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
        body: JSON.stringify({ email, source: "footer" }),
      });
      setDone(true);
      setEmail("");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        You're on the list — watch your inbox.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 flex gap-2 max-w-sm"
      aria-label="Subscribe to the BagsArt letter"
    >
      <Input
        type="email"
        placeholder="you@studio.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-10 flex-1"
        required
        aria-label="Email address"
      />
      <Button type="submit" size="sm" variant="gold" loading={loading}>
        Subscribe
      </Button>
    </form>
  );
}
