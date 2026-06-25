import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Join BagsArt to track orders, save favorites, and check out faster.",
};

export default function SignupPage() {
  return <AuthCard initialMode="signup" />;
}
