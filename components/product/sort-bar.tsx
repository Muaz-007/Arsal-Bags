"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Dropdown } from "@/components/ui/dropdown";
import { MobileFilterTrigger } from "@/components/product/filters";

const OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price · low to high" },
  { value: "price-desc", label: "Price · high to low" },
];

export function SortBar({ total }: { total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const sort = params.get("sort") ?? "latest";

  function update(value: string) {
    const next = new URLSearchParams(Array.from(params.entries()));
    next.set("sort", value);
    next.delete("page");
    router.replace(`/products?${next.toString()}`);
  }

  return (
    <>
      {/* Mobile: sticky filter + sort row at the top of the results */}
      <div className="lg:hidden sticky top-16 z-30 -mx-5 px-5 py-3 mb-5 bg-background/85 backdrop-blur border-b border-border flex items-center gap-2">
        <MobileFilterTrigger />
        <div className="flex-1" />
        <Dropdown
          value={sort}
          onChange={update}
          options={OPTIONS}
          prefix="Sort ·"
          align="end"
          className="min-w-[160px]"
        />
      </div>

      {/* Desktop sort row */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "product" : "products"}
        </p>
        <Dropdown
          value={sort}
          onChange={update}
          options={OPTIONS}
          prefix="Sort ·"
          align="end"
          className="w-60"
        />
      </div>

      {/* Mobile-only product count under the sticky bar */}
      <p className="lg:hidden text-sm text-muted-foreground mb-4">
        {total} {total === 1 ? "product" : "products"}
      </p>
    </>
  );
}
