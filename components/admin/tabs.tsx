"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Admin segmented tab control.
 * Uses URL search params for state so tabs are bookmarkable and the
 * browser back-button works.
 */
export function AdminTabs({
  param = "tab",
  tabs,
  className,
}: {
  param?: string;
  tabs: { value: string; label: string; count?: number }[];
  className?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get(param) ?? tabs[0]?.value;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-full border border-border bg-card overflow-x-auto scrollbar-none max-w-full",
        className
      )}
    >
      {tabs.map((t) => {
        const sp = new URLSearchParams(Array.from(params.entries()));
        sp.set(param, t.value);
        const active = current === t.value;
        return (
          <Link
            key={t.value}
            href={`${pathname}?${sp.toString()}`}
            scroll={false}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 rounded-full px-3.5 h-8 text-xs font-medium transition-colors",
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-mono tabular-nums",
                  active
                    ? "bg-background/20 text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {t.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
