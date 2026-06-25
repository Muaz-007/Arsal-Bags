import { Skeleton } from "@/components/ui/skeleton";

/**
 * Auth route loading skeleton — shown while the AuthCard client component
 * compiles on first load. Mirrors the card's two-pane layout so the page
 * doesn't feel like just the navbar is loading.
 */
export default function AuthLoading() {
  return (
    <div className="container py-10 lg:py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-card overflow-hidden shadow-xl">
        <div className="grid lg:grid-cols-[1fr_1.2fr]">
          {/* Visual pane skeleton (desktop only) */}
          <div className="relative hidden lg:flex flex-col justify-between p-10 min-h-[560px] bg-gradient-to-br from-gold/15 via-muted to-background">
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-44 mt-3" />
            </div>
            <div>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-4/5 mt-2" />
              <Skeleton className="h-3 w-1/2 mt-5" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>

          {/* Form pane skeleton */}
          <div className="p-7 sm:p-10 lg:p-12 min-h-[560px] flex flex-col">
            {/* Mode toggle pill */}
            <Skeleton className="h-10 w-64 rounded-full" />

            <div className="mt-8 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-3/4" />
            </div>
            <Skeleton className="h-4 w-1/2 mt-3" />

            {/* Field placeholders */}
            <div className="mt-7 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl mt-2" />
            </div>

            <div className="mt-auto pt-8">
              <Skeleton className="h-3 w-1/2 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
