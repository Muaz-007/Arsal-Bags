"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Heart,
  LogIn,
  LogOut,
  Menu,
  Package,
  Search,
  Settings as SettingsIcon,
  Shield,
  ShoppingBag,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ThemeRow } from "@/components/layout/theme-row";
import { UserMenu } from "@/components/layout/user-menu";
import { CartButton } from "@/components/layout/cart-button";
import { SearchPanel } from "@/components/layout/search-panel";
import { useSearchPanel } from "@/store/search";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/products?collection=formal", label: "Formal" },
  { href: "/products?collection=semi-formal", label: "Semi-formal" },
  { href: "/products?category=wallet", label: "Wallets" },
  { href: "/products?collection=heritage", label: "New" },
  { href: "/about", label: "The Studio" },
  { href: "/contact", label: "Get in touch" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const totalItems = useCart((s) => s.totalItems());
  const openSearch = useSearchPanel((s) => s.setOpen);
  const { data: session, status } = useSession();
  const user = session?.user as
    | { name?: string | null; email?: string | null; role?: string }
    | undefined;
  const isAdmin = user?.role === "admin";
  const authed = status === "authenticated";

  // Hide site nav inside admin shell — admin has its own chrome.
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock the page behind the drawer so swiping inside the menu doesn't
  // accidentally scroll the page underneath.
  useBodyScrollLock(open);

  if (isAdminRoute) return null;

  return (
    // Fragment (not a single element) is deliberate: the mobile drawer and
    // search panel MUST render as siblings of the sticky header, not
    // children. When the header switches to `backdrop-blur-xl` on scroll,
    // that filter creates a containing block for descendant `position:
    // fixed` elements — which pinned the drawer to the 64px header height,
    // so it appeared "behind" the page and only surfaced when the user
    // scrolled back to the top.
    <>
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-border/70"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl tracking-tight"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse" />
          <span>BagsArt</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative text-foreground/80 hover:text-foreground transition-colors"
            >
              {l.label}
              <span className="absolute inset-x-0 -bottom-1 h-px scale-x-0 origin-left bg-gold transition-transform group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        {/* gap-1.5 keeps targets > 6px apart (Lighthouse minimum) */}
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Search"
            onClick={() => openSearch(true)}
            className="h-10 w-10 grid place-items-center rounded-full hover:bg-muted transition"
          >
            <Search className="h-4 w-4" />
          </button>
          {/* Desktop only — on mobile the theme toggle lives inside the drawer */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <UserMenu />
          <CartButton />
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden h-10 w-10 grid place-items-center rounded-full hover:bg-muted transition"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>

    {/* Mobile slide-in side drawer — rendered OUTSIDE the header for the
        containing-block reason described above. */}
    <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              // z-[60] so the scrim sits above the sticky header (z-50) —
              // otherwise the logo + hamburger stay crisp while the rest of
              // the page dims, which looks inconsistent.
              className="md:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="md:hidden fixed inset-y-0 right-0 z-[70] w-[72%] max-w-[280px] bg-background border-l border-border shadow-2xl flex flex-col will-change-transform"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-border">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 font-display text-lg"
                >
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

              {/* When signed in: who's logged in */}
              {authed && (
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="mt-1 text-sm font-medium truncate">
                    {user?.name ?? "Account"}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              )}

              {/* Drawer nav */}
              <nav className="flex-1 overflow-y-auto py-5 px-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                  Shop
                </p>
                <ul className="space-y-1">
                  {NAV_LINKS.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-3 py-2.5 text-sm hover:bg-muted transition"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Account section — content depends on auth state */}
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-7 mb-3">
                  {authed ? "Account" : "Get started"}
                </p>

                {authed ? (
                  <ul className="space-y-1">
                    {isAdmin ? (
                      // Admins don't shop — they only need the panel.
                      <DrawerLink
                        href="/admin"
                        icon={Shield}
                        label="Admin panel"
                        onClose={() => setOpen(false)}
                      />
                    ) : (
                      <>
                        <DrawerLink
                          href="/dashboard"
                          icon={Package}
                          label="My orders"
                          onClose={() => setOpen(false)}
                        />
                        <DrawerLink
                          href="/wishlist"
                          icon={Heart}
                          label="Wishlist"
                          onClose={() => setOpen(false)}
                        />
                        <DrawerLink
                          href="/dashboard/profile"
                          icon={SettingsIcon}
                          label="Profile"
                          onClose={() => setOpen(false)}
                        />
                      </>
                    )}
                  </ul>
                ) : (
                  <ul className="space-y-1">
                    <DrawerLink
                      href="/auth/signup"
                      icon={UserPlus}
                      label="Create account"
                      onClose={() => setOpen(false)}
                    />
                    <DrawerLink
                      href="/auth/login"
                      icon={LogIn}
                      label="Sign in"
                      onClose={() => setOpen(false)}
                    />
                  </ul>
                )}

                {/* Preferences — theme toggle moved here from the navbar
                    so the top bar stays minimal on phones. */}
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-7 mb-3">
                  Preferences
                </p>
                <ThemeRow />
              </nav>

              {/* Drawer footer — Logout when authed, plus a primary CTA.
                  Admins get "Go to admin"; everyone else gets "View bag". */}
              <div className="border-t border-border p-5 space-y-3">
                {authed && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-md border border-border bg-card text-sm hover:bg-muted transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                )}
                {isAdmin ? (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-md bg-gold text-black font-medium text-sm hover:bg-gold-light transition"
                  >
                    <Shield className="h-4 w-4" />
                    Go to admin
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/cart"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 w-full h-11 rounded-md bg-gold text-black font-medium text-sm hover:bg-gold-light transition"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      View bag
                      {totalItems > 0 && (
                        <span className="ml-1 inline-flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-black text-gold text-[11px]">
                          {totalItems}
                        </span>
                      )}
                    </Link>
                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.18em]">
                      Free delivery over Rs 4,000
                    </p>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchPanel />
    </>
  );
}

function DrawerLink({
  href,
  icon: Icon,
  label,
  onClose,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClose: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClose}
        className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm hover:bg-muted transition"
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    </li>
  );
}
