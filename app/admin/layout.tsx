import type { Metadata } from "next";
import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";

// Admin never indexed — defence in depth alongside robots.ts disallow.
export const metadata: Metadata = {
  title: "Admin · BagsArt",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Block layout on mobile (topbar above, content below), flex row on lg+.
  return (
    <div className="lg:flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-muted/30">
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
