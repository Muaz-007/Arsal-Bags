"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  Menu,
  X,
  LayoutTemplate,
  Boxes,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

// Explicit type so `exact` is uniformly an optional boolean across every
// item — without it TS infers a union where only some union members have
// the property, and destructuring `exact` fails to compile.
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

const NAV: NavGroup[] = [
  { group: "Overview", items: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  ]},
  { group: "Storefront", items: [
    { href: "/admin/storefront", label: "Sections", icon: LayoutTemplate },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  ]},
  { group: "Sales", items: [
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/coupons", label: "Coupons", icon: Tag },
  ]},
  { group: "Audience", items: [
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/messages", label: "Messages", icon: Mail },
  ]},
  { group: "System", items: [
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]},
];

function NavList({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto">
      {NAV.map((group) => (
        <div key={group.group}>
          <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {group.group}
          </p>
          <ul className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname?.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer on route change.
  useEffect(() => setOpen(false), [pathname]);

  // Lock page scroll while the admin drawer is open.
  useBodyScrollLock(open);

  return (
    <>
      {/* Mobile topbar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/85 backdrop-blur px-4 h-14">
        <Link href="/" className="flex items-center gap-2 font-display text-base">
          <span className="inline-block h-2 w-2 rounded-full bg-gold" />
          BagsArt
          <span className="ml-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            admin
          </span>
        </Link>
        <button
          aria-label="Open admin menu"
          onClick={() => setOpen(true)}
          className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition"
        >
          <Menu className="h-4 w-4" />
        </button>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed inset-0 z-50 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border p-4 flex flex-col will-change-transform"
            >
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="flex items-center gap-2 font-display text-base">
                  <span className="inline-block h-2 w-2 rounded-full bg-gold" />
                  BagsArt
                </Link>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground px-3 py-2 mt-2"
              >
                ← Back to store
              </Link>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-card/40 h-screen sticky top-0 px-4 py-5">
        <Link href="/" className="flex items-center gap-2 font-display text-lg px-2 mb-8">
          <span className="inline-block h-2 w-2 rounded-full bg-gold" />
          BagsArt
          <span className="ml-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            admin
          </span>
        </Link>
        <NavList pathname={pathname} />
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground px-3 py-2"
        >
          ← Back to store
        </Link>
      </aside>
    </>
  );
}
