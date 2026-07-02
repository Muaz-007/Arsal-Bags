import Link from "next/link";
import { ArrowRight, Heart, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listWishlistProducts } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth-server";
import { WishlistClient } from "@/components/dashboard/wishlist-client";

export const metadata = {
  title: "Wishlist",
  description: "Pieces you've saved at BagsArt. Sign in to sync your wishlist across devices.",
  robots: { index: false, follow: false },
};

/**
 * Public wishlist page — works for guests (renders the local Zustand list)
 * AND signed-in customers (renders their server-backed list). When a guest
 * signs in, WishlistSync merges the local set into the server set, so
 * everything they hearted before signing in transfers automatically.
 */
export default async function WishlistPage() {
  const user = await getCurrentUser();

  // Signed-in: SSR the server list.
  if (user) {
    const products = await listWishlistProducts(user.id);

    return (
      <div className="container py-10 lg:py-14 max-w-5xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Your account
            </p>
            <h1 className="mt-3 font-display text-4xl">Wishlist</h1>
            <p className="mt-2 text-muted-foreground">
              {products.length} {products.length === 1 ? "piece" : "pieces"} saved
              for later.
            </p>
          </div>
        </header>

        {products.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-14 text-center">
              <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-muted">
                <Heart className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-5 font-display text-2xl">Your wishlist is empty</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Tap the heart icon on any product to save it here. Your list
                syncs across every device you sign in on.
              </p>
              <Button href="/products" variant="gold" className="mt-6">
                Start browsing <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <WishlistClient initialProducts={products} />
        )}
      </div>
    );
  }

  // Guest: render the client-side view + a friendly sign-up nudge.
  return (
    <div className="container py-10 lg:py-14 max-w-5xl space-y-8">
      {/* Guest sync banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-gold/10 via-amber-50/40 to-rose-50/30 dark:from-gold/15 dark:via-amber-950/20 dark:to-rose-950/20 p-5 sm:p-6 flex flex-wrap items-center gap-4">
        <span className="h-10 w-10 grid place-items-center rounded-full bg-gold/20 text-gold-dark dark:text-gold-light shrink-0">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-[200px]">
          <p className="font-medium text-sm">
            Sign in to sync your wishlist across devices
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Saved on this device only. Create an account and we'll move
            everything over — automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Button href="/auth/signup" variant="gold" size="sm">
            <UserPlus className="h-4 w-4" /> Join
          </Button>
          <Button href="/auth/login" variant="outline" size="sm">
            Sign in
          </Button>
        </div>
      </div>

      <WishlistClient />
    </div>
  );
}
