import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VerifySignupForm } from "@/components/auth/verify-signup-form";
import { getCurrentUser } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Confirm the 6-digit code we sent to activate your BagsArt account.",
  robots: { index: false, follow: false },
};

export default async function VerifySignupPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  // Already signed in? Skip the whole flow.
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/");

  const email = (searchParams.email ?? "").trim();

  return (
    <div className="container py-12 lg:py-20 max-w-md">
      <Link
        href="/auth/signup"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to signup
      </Link>

      <header className="mt-6 mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Almost there
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight">
          Confirm your <span className="text-gradient-gold">email</span>.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          {email ? (
            <span className="text-foreground font-medium">{email}</span>
          ) : (
            "your inbox"
          )}
          . Enter it below to activate your account.
        </p>
      </header>

      <VerifySignupForm initialEmail={email} />
    </div>
  );
}
