import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <Star
            key={i}
            width={size}
            height={size}
            className={cn(
              "transition-colors",
              filled
                ? "fill-gold text-gold"
                : "fill-muted text-muted-foreground/50"
            )}
          />
        );
      })}
    </div>
  );
}
