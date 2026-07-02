import type { Metadata } from "next";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { getCurrentUser } from "@/lib/auth-server";

// Admin never indexed — defence in depth alongside robots.ts disallow.
export const metadata: Metadata = {
  title: "Admin · BagsArt",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Single server-side gate for every /admin/* page. Individual pages don't
  // have to repeat the check — if the layout redirects, nothing inside runs.
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?callbackUrl=/admin");
  if (user.role !== "admin") redirect("/");

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
