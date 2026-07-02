"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

/**
 * Reusable admin list toolbar — a debounced search box + up to two filter
 * dropdowns that write their state back into the URL as query params.
 *
 * Using URL as state means the server component reading `searchParams` can
 * apply the filter without needing the whole list to become client-side.
 */
export function ListToolbar({
  searchPlaceholder = "Search…",
  filters,
}: {
  searchPlaceholder?: string;
  filters?: {
    key: string;
    options: Option[];
    label?: string;
  }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");

  // Debounce the search — waits 300ms after the last keystroke before
  // syncing the URL, so we don't refetch on every character.
  useEffect(() => {
    const initial = params.get("q") ?? "";
    if (q === initial) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (q) next.set("q", q);
      else next.delete("q");
      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  }

  function clearAll() {
    setQ("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  const hasAny =
    !!q || (filters ?? []).some((f) => params.get(f.key));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          className={cn(
            "w-full h-10 rounded-md border border-input bg-background pl-9 pr-9 text-sm",
            "focus:outline-none focus:ring-1 focus:ring-ring"
          )}
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {filters?.map((f) => (
        <div key={f.key} className="min-w-[160px]">
          <Dropdown
            value={params.get(f.key) ?? "all"}
            onChange={(v) => setParam(f.key, v)}
            options={[
              { value: "all", label: f.label ? `All ${f.label}` : "All" },
              ...f.options,
            ]}
          />
        </div>
      ))}

      {hasAny && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-foreground px-2 h-10"
        >
          Clear
        </button>
      )}
    </div>
  );
}
