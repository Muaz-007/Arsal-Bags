import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your BagsArt account.",
};

export default function LoginPage() {
  return <AuthCard initialMode="signin" />;
}
