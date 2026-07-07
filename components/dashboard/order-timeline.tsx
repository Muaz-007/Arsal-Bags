import { Banknote, Check, Clock, Package, Sparkles, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentMethod } from "@/types";

interface Step {
  key: OrderStatus;
  label: string;
  icon: typeof Clock;
  /** Extra hint line under the step name. */
  note?: string;
}

/**
 * Timelines diverge by payment method:
 *
 * - **COD**: money is collected on delivery, so the "Paid" state never
 *   sits in the middle of the flow. Instead we show a single "Delivered
 *   & paid" step at the end and skip the intermediate `paid` slot.
 * - **Card / online**: payment happens up-front, so the `paid` step is
 *   shown between "Placed" and the workshop hand-off.
 *
 * Both flows collapse to a single destructive card when the order is
 * cancelled.
 */
const FLOW_BY_METHOD: Record<PaymentMethod, Step[]> = {
  card: [
    { key: "pending", label: "Placed", icon: Sparkles },
    { key: "paid", label: "Payment received", icon: Check },
    { key: "fulfilled", label: "In the workshop", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: Check },
  ],
  cod: [
    { key: "pending", label: "Placed", icon: Sparkles },
    { key: "fulfilled", label: "In the workshop", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    {
      key: "delivered",
      label: "Delivered",
      icon: Check,
      note: "Cash collected on delivery.",
    },
  ],
};

export function OrderTimeline({
  status,
  paymentMethod = "cod",
}: {
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
}) {
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

  const flow = FLOW_BY_METHOD[paymentMethod] ?? FLOW_BY_METHOD.cod;

  // If the current status isn't in this flow (e.g. an admin marked a COD
  // order as "paid" mid-way — treat it as fulfilled for the timeline so
  // the step highlight still lands somewhere sensible).
  const activeIndex = (() => {
    const idx = flow.findIndex((s) => s.key === status);
    if (idx >= 0) return idx;
    if (status === "paid" && paymentMethod === "cod") {
      return flow.findIndex((s) => s.key === "fulfilled");
    }
    return 0;
  })();

  return (
    <ol className="relative">
      {flow.map((step, i) => {
        const state =
          i < activeIndex ? "complete" : i === activeIndex ? "active" : "upcoming";
        const Icon = step.icon;
        return (
          <li
            key={step.key}
            className="relative pl-12 pb-7 last:pb-0"
          >
            {/* connector */}
            {i < flow.length - 1 && (
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
            {state === "active" ? (
              <p className="text-xs text-muted-foreground mt-0.5">
                Currently at this step.
              </p>
            ) : (
              step.note && (
                <p
                  className={cn(
                    "text-xs mt-0.5",
                    state === "upcoming"
                      ? "text-muted-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {step.note}
                </p>
              )
            )}
          </li>
        );
      })}

      {paymentMethod === "cod" && status !== "delivered" && (
        <li className="mt-2 pl-12 relative">
          <span className="absolute left-0 top-0 h-9 w-9 grid place-items-center rounded-full border border-dashed border-border text-muted-foreground">
            <Banknote className="h-4 w-4" />
          </span>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Payment
          </p>
          <p className="text-sm mt-0.5">Cash on delivery</p>
        </li>
      )}
    </ol>
  );
}
