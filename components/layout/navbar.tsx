"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/products?category=tote", label: "Totes" },
  { href: "/products?category=backpack", label: "Backpacks" },
  { href: "/products?collection=heritage", label: "Heritage" },
  { href: "/about", label: "Atelier" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const totalItems = useCart((s) => s.totalItems());

  // Hide site nav inside admin shell — admin has its own chrome.
  const isAdmin = pathname?.startsWith("/admin");

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

  if (isAdmin) return null;

  return (
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

        <div className="flex items-center gap-1">
          <button
            aria-label="Search"
            className="hidden sm:grid h-9 w-9 place-items-center rounded-full hover:bg-muted transition"
          >
            <Search className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <Link
            href="/auth/login"
            aria-label="Account"
            className="hidden sm:grid h-9 w-9 place-items-center rounded-full hover:bg-muted transition"
          >
            <User className="h-4 w-4" />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition"
          >
            <ShoppingBag className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 grid place-items-center text-[10px] font-medium rounded-full bg-gold text-black">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-in side drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
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
              className="md:hidden fixed inset-y-0 right-0 z-50 w-[82%] max-w-[320px] bg-background border-l border-border shadow-2xl flex flex-col will-change-transform"
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

                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-7 mb-3">
                  Account
                </p>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/auth/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm hover:bg-muted transition"
                    >
                      <User className="h-4 w-4" />
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2.5 text-sm hover:bg-muted transition"
                    >
                      My orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/wishlist"
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2.5 text-sm hover:bg-muted transition"
                    >
                      Wishlist
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Drawer footer CTA */}
              <div className="border-t border-border p-5">
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
                <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-[0.18em]">
                  Free shipping over $250
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
