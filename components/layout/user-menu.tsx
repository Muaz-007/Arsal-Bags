"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Heart,
  LogOut,
  Package,
  Settings as SettingsIcon,
  Shield,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Account button + dropdown shown in the navbar.
 *
 *  - Not signed in: tapping the icon jumps straight to /auth/signup
 *    (sign-up is the primary action; the signup page still has a "Sign in"
 *     link for returning customers).
 *  - Signed in (desktop): full account list — Profile, Orders, Wishlist,
 *    (Admin if applicable), then a Logout button at the bottom.
 *  - Signed in (mobile, sm+): a compact dropdown with Profile + Logout only.
 *    The rest of the account pages are available from the hamburger drawer.
 */
export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = session?.user as
    | { name?: string | null; email?: string | null; role?: string }
    | undefined;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Not signed in → a labelled pill on desktop, a small icon on mobile.
  if (status !== "authenticated") {
    return (
      <>
        {/* Mobile: small icon, stays in normal flow */}
        <Link
          href="/auth/signup"
          aria-label="Join"
          className="md:hidden h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition"
        >
          <User className="h-4 w-4" />
        </Link>
        {/* Desktop: "Join" pill, pinned to the far right via order-last */}
        <Link
          href="/auth/signup"
          className="hidden md:inline-flex md:order-last items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-foreground text-background hover:bg-foreground/90 active:scale-[0.97] transition shadow-sm ml-1"
        >
          Join
        </Link>
      </>
    );
  }

  return (
    <div ref={ref} className="relative md:order-last md:ml-1">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-9 w-9 grid place-items-center rounded-full transition",
          open ? "bg-muted" : "hover:bg-muted"
        )}
      >
        <User className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card shadow-xl overflow-hidden z-50"
          >
            {/* Header: name + email */}
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-sm font-medium truncate">
                {user?.name ?? "Account"}
              </p>
              {user?.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>

            {/* Mobile (sm only): just profile. The hamburger drawer carries
                the full list, so we don't duplicate it here. */}
            <ul className="md:hidden p-1.5">
              <MenuLink
                href="/dashboard/profile"
                icon={SettingsIcon}
                label="Profile"
                onClose={() => setOpen(false)}
              />
            </ul>

            {/* Desktop (md+): full list. */}
            <ul className="hidden md:block p-1.5">
              <MenuLink
                href="/dashboard/profile"
                icon={SettingsIcon}
                label="Profile"
                onClose={() => setOpen(false)}
              />
              <MenuLink
                href="/dashboard"
                icon={Package}
                label="My orders"
                onClose={() => setOpen(false)}
              />
              <MenuLink
                href="/wishlist"
                icon={Heart}
                label="Wishlist"
                onClose={() => setOpen(false)}
              />
              {isAdmin && (
                <MenuLink
                  href="/admin"
                  icon={Shield}
                  label="Admin panel"
                  onClose={() => setOpen(false)}
                />
              )}
            </ul>

            {/* Logout — always last */}
            <div className="border-t border-border p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({
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
        role="menuitem"
        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/85 hover:text-foreground hover:bg-muted transition"
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    </li>
  );
}
