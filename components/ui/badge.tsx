import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "gold" | "muted" | "success" | "warning";

export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: Variant;
  children: React.ReactNode;
}) {
  const styles: Record<Variant, string> = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-border text-foreground",
    gold: "bg-gold/15 text-gold-dark dark:text-gold-light border border-gold/30",
    muted: "bg-muted text-foreground",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20",
    warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
