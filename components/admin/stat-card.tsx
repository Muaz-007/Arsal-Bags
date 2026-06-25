import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 font-display text-3xl">{value}</p>
        <div className="mt-2 flex items-center justify-between">
          {typeof delta === "number" && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs",
                delta >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-500"
              )}
            >
              {delta >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
