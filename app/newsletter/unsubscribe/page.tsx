import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { verifyUnsubscribe } from "@/lib/newsletter-token";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Confirm unsubscribe from the BagsArt newsletter.",
  robots: { index: false, follow: false },
};

// Force fresh so the DB update lands and we always render the true state.
export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { email?: string; token?: string };
}) {
  const rawEmail = searchParams.email?.toLowerCase().trim() ?? "";
  const token = searchParams.token ?? "";

  const valid = !!rawEmail && !!token && verifyUnsubscribe(rawEmail, token);

  // Server-side write on page load so a single click is enough — no extra
  // "confirm" step. If someone loads the URL a second time it's idempotent.
  let done = false;
  if (valid && prisma) {
    await prisma.subscriber
      .update({ where: { email: rawEmail }, data: { active: false } })
      .then(() => {
        done = true;
      })
      .catch(() => {
        // Row missing → still consider the operation successful because the
        // desired end-state (no active subscription for this email) is met.
        done = true;
      });
  } else if (valid) {
    done = true; // mock mode
  }

  return (
    <div className="container py-16 lg:py-24 max-w-md">
      <Card>
        <CardContent className="p-8 sm:p-10 text-center space-y-5">
          {done ? (
            <>
              <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="font-display text-2xl">You're unsubscribed.</h1>
              <p className="text-sm text-muted-foreground">
                We've removed{" "}
                <span className="font-medium text-foreground">{rawEmail}</span>{" "}
                from the BagsArt letter. No more emails from this list —
                unless you change your mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <Button href="/" variant="outline">
                  Back to shop
                </Button>
                <Button href="/products" variant="gold">
                  Browse the catalogue
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-destructive/15 text-destructive">
                <XCircle className="h-7 w-7" />
              </div>
              <h1 className="font-display text-2xl">Link isn't valid.</h1>
              <p className="text-sm text-muted-foreground">
                This unsubscribe link is missing or expired. Reply to any
                BagsArt email and we'll remove you manually.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="text-sm underline decoration-gold underline-offset-4"
                >
                  Contact support
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
