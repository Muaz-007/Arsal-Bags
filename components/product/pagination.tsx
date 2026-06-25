"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  total,
  perPage,
}: {
  page: number;
  total: number;
  perPage: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const params = useSearchParams();
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const next = new URLSearchParams(Array.from(params.entries()));
    next.set("page", String(p));
    return `/products?${next.toString()}`;
  };

  return (
    <nav className="mt-12 flex items-center justify-center gap-1">
      {Array.from({ length: totalPages }).map((_, i) => {
        const p = i + 1;
        return (
          <Link
            key={p}
            href={hrefFor(p)}
            className={cn(
              "h-9 min-w-9 px-3 grid place-items-center rounded-md text-sm border transition",
              p === page
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {p}
          </Link>
        );
      })}
    </nav>
  );
}
