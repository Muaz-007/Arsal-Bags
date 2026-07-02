import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Join BagsArt to track orders, save favorites, and check out faster.",
  robots: { index: false, follow: false },
};

export default async function SignupPage() {
  // Already signed in → no point showing a signup form. Bounce them home.
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/");

  return <AuthCard initialMode="signup" />;
}
