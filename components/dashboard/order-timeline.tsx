import { Check, Clock, Package, Sparkles, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const FLOW: { key: OrderStatus; label: string; icon: typeof Clock }[] = [
  { key: "pending", label: "Placed", icon: Sparkles },
  { key: "paid", label: "Paid", icon: Check },
  { key: "fulfilled", label: "In the workshop", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Check },
];

/**
 * Vertical order tracking timeline. Steps before the current status are
 * "complete", the current status is "active", future steps are "upcoming".
 * Cancelled orders short-circuit to a destructive state.
 */
export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5">
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 grid place-items-center rounded-full bg-destructive/20 text-destructive">
            <XCircle className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium">Cancelled</p>
            <p className="text-xs text-muted-foreground">
              If you didn't request this, get in touch at bags.art.pk@gmail.com.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeIndex = FLOW.findIndex((s) => s.key === status);

  return (
    <ol className="relative">
      {FLOW.map((step, i) => {
        const state =
          i < activeIndex ? "complete" : i === activeIndex ? "active" : "upcoming";
        const Icon = step.icon;
        return (
          <li
            key={step.key}
            className="relative pl-12 pb-7 last:pb-0"
          >
            {/* connector */}
            {i < FLOW.length - 1 && (
              <span
                className={cn(
                  "absolute left-4 top-9 bottom-0 w-px",
                  state === "complete" ? "bg-gold" : "bg-border"
                )}
              />
            )}

            <span
              className={cn(
                "absolute left-0 top-0 h-9 w-9 grid place-items-center rounded-full border transition-colors",
                state === "complete" &&
                  "bg-gold text-black border-gold",
                state === "active" &&
                  "bg-background text-foreground border-foreground ring-2 ring-gold/30",
                state === "upcoming" &&
                  "bg-background text-muted-foreground border-border"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>

            <p
              className={cn(
                "font-medium text-sm",
                state === "upcoming" && "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
            {state === "active" && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Currently at this step.
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
