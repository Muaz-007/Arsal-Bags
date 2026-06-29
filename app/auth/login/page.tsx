import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your BagsArt account.",
};

export default async function LoginPage() {
  // If they're already signed in, bounce them away. Admins → admin panel,
  // everyone else → homepage. Prevents the "I just signed in but I'm still
  // on the sign-in page" feel after OAuth callbacks.
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/");

  return <AuthCard initialMode="signin" />;
}
