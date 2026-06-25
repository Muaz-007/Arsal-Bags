"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Package, Heart, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: User, exact: true },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="container py-8 lg:py-12 grid gap-8 lg:gap-10 lg:grid-cols-[220px_1fr]">
      {/* Mobile: horizontal scroll tabs. Desktop: vertical sidebar. */}
      <aside className="lg:sticky lg:top-24 self-start">
        <p className="hidden lg:block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Account
        </p>
        <nav
          className={cn(
            "flex lg:flex-col gap-1 lg:gap-1.5",
            "overflow-x-auto scrollbar-none -mx-5 px-5 lg:mx-0 lg:px-0"
          )}
        >
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "shrink-0 inline-flex items-center gap-2 rounded-full lg:rounded-md px-3.5 lg:px-3 py-2 text-sm transition-colors border lg:border-0",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
