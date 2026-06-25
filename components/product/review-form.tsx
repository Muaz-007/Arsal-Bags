"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId }: { productId: string }) {
  const { status } = useSession();
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      push({ title: "Pick a rating first", tone: "error" });
      return;
    }
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          title: form.get("title"),
          body: form.get("body"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        push({ title: "Couldn't post", description: data?.error, tone: "error" });
        return;
      }
      push({
        title: "Review posted",
        description: "Thanks for sharing — it'll help other customers.",
        tone: "success",
      });
      router.refresh();
      (e.target as HTMLFormElement).reset();
      setRating(0);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") return null;

  if (status !== "authenticated") {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm">
            <Link
              href="/auth/login"
              className="underline decoration-gold underline-offset-4 font-medium"
            >
              Sign in
            </Link>{" "}
            to leave a review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
          Write a review
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Star picker */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => {
              const on = (hovered || rating) >= n;
              return (
                <motion.button
                  key={n}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      on
                        ? "fill-gold text-gold"
                        : "fill-muted text-muted-foreground/40"
                    )}
                  />
                </motion.button>
              );
            })}
            <span className="ml-2 text-xs text-muted-foreground">
              {rating > 0
                ? `${rating} of 5`
                : "Tap a star"}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label>Headline</Label>
            <Input
              name="title"
              required
              maxLength={120}
              placeholder="In one sentence — what did you love?"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Review</Label>
            <Textarea
              name="body"
              required
              minLength={8}
              maxLength={2000}
              rows={4}
              placeholder="Tell other customers about the leather, the size, daily use…"
            />
          </div>
          <Button
            type="submit"
            variant="gold"
            className="w-full"
            loading={loading}
          >
            Post review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
