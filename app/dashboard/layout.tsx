import type { Metadata } from "next";
import { ReactNode } from "react";

// The whole /dashboard tree is user-specific — never index.
export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

/**
 * Customer account layout.
 *
 * The old layout had its own sidebar that made these pages feel like an
 * admin dashboard. They're now plain store pages — the user reaches them
 * from the account dropdown (desktop) or the hamburger drawer (mobile),
 * so a duplicate sidebar would just create noise. The page-level header
 * inside each route does the wayfinding instead.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container py-8 lg:py-14 max-w-5xl">{children}</div>
  );
}
