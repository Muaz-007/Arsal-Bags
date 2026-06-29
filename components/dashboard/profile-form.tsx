"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

/**
 * Account form on /dashboard/profile.
 *
 * Two distinct flows depending on how the user signed in:
 *
 *  - **Google** sign-in: email field is read-only with a "Connected via
 *    Google" badge. They'd have to change their email in their Google
 *    account; on their next sign-in our `signIn` callback will pick up
 *    the new email automatically.
 *  - **Credentials** (email/password): they can request an email change.
 *    We send a verification link to the NEW address; the swap only happens
 *    when they click that link.
 *
 * Name is always editable for both flows.
 */
export function ProfileForm({
  initialName,
  initialEmail,
  provider,
}: {
  initialName: string;
  initialEmail: string;
  provider: string;
}) {
  const { update: updateSession } = useSession();
  const router = useRouter();
  const push = useToast((s) => s.push);

  const isGoogle = provider === "google";

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailRequestSent, setEmailRequestSent] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() === initialName) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        push({
          title: "Couldn't save",
          description: data?.error,
          tone: "error",
        });
        return;
      }
      await updateSession({ name: name.trim() });
      push({ title: "Name updated", tone: "success" });
      router.refresh();
    } finally {
      setSavingName(false);
    }
  }

  async function requestEmailChange(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() === initialEmail.toLowerCase()) return;
    setSavingEmail(true);
    try {
      const res = await fetch("/api/profile/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ newEmail: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        push({
          title: "Couldn't request change",
          description: data?.error,
          tone: "error",
        });
        return;
      }
      setEmailRequestSent(true);
      push({
        title: "Verification email sent",
        description: `Check ${email.trim()} for a confirmation link.`,
        tone: "success",
      });
    } finally {
      setSavingEmail(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-7">
          {/* Sign-in method indicator */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Signed in via{" "}
              {isGoogle ? (
                <Badge variant="outline">Google</Badge>
              ) : (
                <Badge variant="muted">Email &amp; password</Badge>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </Button>
          </div>

          {/* Name */}
          <form onSubmit={saveName} className="space-y-2">
            <Label>Full name</Label>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
                className="flex-1"
              />
              <Button
                type="submit"
                variant="gold"
                loading={savingName}
                disabled={name.trim() === initialName || savingName}
              >
                Save name
              </Button>
            </div>
          </form>

          {/* Email */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Email</Label>
              {isGoogle && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Managed by Google
                </span>
              )}
            </div>

            {isGoogle ? (
              <>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={initialEmail}
                    readOnly
                    disabled
                    className="pl-10 bg-muted/40 cursor-not-allowed"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Your email is set by your Google account. To change it,
                  update the email in{" "}
                  <a
                    href="https://myaccount.google.com/personal-info"
                    target="_blank"
                    rel="noopener"
                    className="underline decoration-gold underline-offset-4 hover:text-foreground transition"
                  >
                    Google account settings
                  </a>
                  , then sign back in here.
                </p>
              </>
            ) : emailRequestSent ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-start gap-3"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Verification sent</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Click the link in the email at <strong>{email}</strong>{" "}
                    within an hour to complete the change. Until then, your
                    current email stays active.
                  </p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={requestEmailChange} className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={200}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll send a verification link to the new address. Until you
                  click it, your current email stays active.
                </p>
                <Button
                  type="submit"
                  variant="gold"
                  loading={savingEmail}
                  disabled={
                    email.trim().toLowerCase() === initialEmail.toLowerCase() ||
                    savingEmail
                  }
                >
                  Send verification
                </Button>
              </form>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
