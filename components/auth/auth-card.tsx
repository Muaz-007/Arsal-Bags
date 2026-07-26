"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  User2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * Auth card — a single component used by both /auth/login and /auth/signup.
 *
 * The signed-in/up forms live side by side and crossfade between each
 * other when the user taps the segmented control at the top. The visual
 * pane on the left of the card morphs its quote + gradient too, so the
 * whole surface feels alive.
 *
 *  - Tab switch uses a sliding `layoutId` indicator (Framer Motion)
 *  - Each field staggers in with a 40 ms delay
 *  - Password field has a Show/Hide eye toggle
 *  - Honors both NextAuth credentials and (when env present) Google OAuth
 */

type Mode = "signin" | "signup";

const VISUAL_BY_MODE: Record<
  Mode,
  { heading: string; pillars: string[]; bg: string }
> = {
  signin: {
    heading: "Crafted for the everyday, made to last.",
    pillars: [
      "Full-grain leather, hand-cut",
      "Small batches from our Lahore studio",
      "7-day easy returns",
    ],
    bg: "from-gold/25 via-muted to-background",
  },
  signup: {
    heading: "One account. Faster checkout. Better wishlist.",
    pillars: [
      "Save addresses for one-tap orders",
      "Wishlist syncs across your devices",
      "First to hear when new pieces drop",
    ],
    bg: "from-gold/20 via-amber-100/30 to-background dark:from-gold/15 dark:via-amber-900/15",
  },
};

/**
 * Only allow relative same-origin paths for post-login redirects. Anything
 * else (absolute URLs, protocol-relative `//evil.com`, javascript:) falls
 * back to null so we never bounce the freshly authed user to a foreign
 * origin — that's an open-redirect / phishing vector.
 */
function safeCallback(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  return raw;
}

export function AuthCard({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const visual = VISUAL_BY_MODE[mode];

  return (
    <div className="container py-10 lg:py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-card overflow-hidden shadow-xl">
        <div className="grid lg:grid-cols-[1fr_1.2fr]">
          {/* ─── Visual pane ─── */}
          <div
            className={cn(
              "relative hidden lg:flex flex-col justify-between p-10",
              "bg-gradient-to-br transition-colors duration-700",
              visual.bg
            )}
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.06] pointer-events-none" />
            {/* Floating gold accents */}
            <motion.span
              aria-hidden
              className="absolute h-3 w-3 rounded-full bg-gold/80 shadow"
              animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ top: "22%", left: "18%" }}
            />
            <motion.span
              aria-hidden
              className="absolute h-2 w-2 rounded-full bg-gold/60"
              animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
              style={{ bottom: "30%", right: "20%" }}
            />
            <motion.span
              aria-hidden
              className="absolute h-1.5 w-1.5 rounded-full bg-foreground/30"
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.6,
              }}
              style={{ top: "40%", right: "32%" }}
            />

            <div className="relative">
              <div className="flex items-center gap-2 font-display text-xl tracking-tight">
                <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse" />
                BagsArt
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Atelier · Est. 2026
              </p>
            </div>

            {/* Brand pane — replaces the earlier quote/citation block.
                Reviews live on PDPs + the homepage; the auth screens are
                the moment to reinforce brand identity, not to run social
                proof. */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={visual.heading}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="font-display text-2xl xl:text-3xl leading-tight tracking-tight">
                    {visual.heading}
                  </h2>
                  <ul className="mt-6 space-y-2.5">
                    {visual.pillars.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2.5 text-sm text-foreground/80"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gold shrink-0"
                        />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Free delivery on orders over Rs 4,000
            </div>
          </div>

          {/* ─── Form pane ─── */}
          <div className="p-7 sm:p-10 lg:p-12 min-h-[560px] flex flex-col">
            <ModeToggle mode={mode} onChange={setMode} />

            <div className="mt-8 flex-1">
              <AnimatePresence mode="wait" initial={false}>
                {mode === "signin" ? (
                  <SignInForm key="signin" onSwitch={() => setMode("signup")} />
                ) : (
                  <SignUpForm key="signup" onSwitch={() => setMode("signin")} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Segmented mode switcher ─────────────────────────────────────────── */

function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <div className="relative inline-flex p-1 rounded-full border border-border bg-muted/60 self-start">
      {(["signin", "signup"] as Mode[]).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={cn(
              "relative px-5 h-9 rounded-full text-sm font-medium transition-colors z-10",
              active ? "text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "signin" ? "Sign in" : "Create account"}
            {active && (
              <motion.span
                layoutId="auth-toggle-pill"
                className="absolute inset-0 rounded-full bg-foreground -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Field primitive with stagger reveal ─────────────────────────────── */

function Field({
  delay = 0,
  children,
}: {
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function InputShell({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      {children}
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm transition-all " +
  "placeholder:text-muted-foreground/70 " +
  "focus-visible:outline-none focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-gold/30";

/* ─── Sign In form ────────────────────────────────────────────────────── */

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const push = useToast((s) => s.push);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Controlled password input so we can clear it after a failed attempt
  // (security: never echo back the password the user just got wrong).
  const [password, setPassword] = useState("");
  // Prefilled from ?email= when the user is bounced here after verifying.
  const prefilledEmail = params.get("email") ?? "";
  const justVerified = params.get("verified") === "1";
  const callbackUrl = safeCallback(params.get("callbackUrl"));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (res?.error) {
      // Only drop the loading state on FAILURE — on success we keep the
      // button spinning until navigation actually kicks in, so there's no
      // "dead beat" where the button looks done but the page hasn't
      // started transitioning yet. Combined with the top progress bar,
      // the user always sees continuous feedback.
      setLoading(false);
      setPassword(""); // never echo back a bad password
      const msg = "Email or password is wrong.";
      setError(msg);
      push({ title: "Sign-in failed", description: msg, tone: "error" });
      return;
    }

    push({ title: "Welcome back", tone: "success" });

    // Optimistic redirect — push to the caller's destination IMMEDIATELY
    // so the top progress bar takes over the "something is happening"
    // signal and the login form starts unmounting. Waiting on
    // `getSession()` here (previously ~200-500ms) made the button spin
    // for a beat after the "Welcome back" toast fired, which felt broken.
    const initialDest = callbackUrl ?? "/";
    router.push(initialDest);
    router.refresh();

    // Admin auto-redirect is a background enhancement: fetch the session
    // AFTER the initial navigation is underway, and if the user turns
    // out to be an admin (and we didn't already land them via
    // callbackUrl), bounce them across to /admin. Second push is
    // near-instant because Next.js prefetches internal routes.
    if (!callbackUrl) {
      getSession().then((session) => {
        const role = (session?.user as { role?: string } | undefined)?.role;
        if (role === "admin") {
          router.push("/admin");
        }
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Welcome back
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight leading-tight">
          Sign in to your <span className="text-gradient-gold">atelier.</span>
        </h1>
        {justVerified && (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            Email verified — sign in with your password to continue.
          </div>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Track orders, save favorites, and check out faster.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <Field delay={0.06}>
          <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
            Email
          </label>
          <InputShell icon={Mail}>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={prefilledEmail}
              placeholder="you@studio.com"
              className={inputClass}
            />
          </InputShell>
        </Field>

        <Field delay={0.12}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Password
            </label>
            <Link
              href="/auth/forgot"
              className="text-[11px] text-muted-foreground hover:text-foreground transition"
            >
              Forgot?
            </Link>
          </div>
          <InputShell icon={Lock}>
            <input
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass + " pr-11"}
            />
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-full hover:bg-muted text-muted-foreground transition"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </InputShell>
        </Field>

        {error && (
          <Field delay={0}>
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-xs text-destructive"
            >
              {error}
            </div>
          </Field>
        )}

        <Field delay={0.2}>
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full mt-2"
            loading={loading}
          >
            Sign in <ArrowRight className="h-4 w-4" />
          </Button>
        </Field>

        <Field delay={0.26}>
          <SocialDivider />
          <SocialButtons callbackUrl={callbackUrl ?? "/"} />
        </Field>
      </form>

      <Field delay={0.34}>
        <p className="mt-7 text-sm text-center text-muted-foreground">
          New to BagsArt?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="underline decoration-gold underline-offset-4 text-foreground hover:text-gold transition"
          >
            Create an account
          </button>
        </p>
      </Field>
    </motion.div>
  );
}

/* ─── Sign Up form ────────────────────────────────────────────────────── */

function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const push = useToast((s) => s.push);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const callbackUrl = safeCallback(params.get("callbackUrl"));
  // Prefilled from the checkout page's bounce — the guest already typed
  // their name + email into the checkout form; no reason to make them
  // type it again here.
  const prefilledName = params.get("name") ?? "";
  const prefilledEmail = params.get("email") ?? "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    };
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        push({
          title: "Sign-up failed",
          description: data?.error ?? "Could not sign up",
          tone: "error",
        });
        return;
      }
      // Every new account now goes through email verification. Stash the
      // freshly-typed password in sessionStorage so the verify page can
      // silently sign the user in the moment the 6-digit code checks out —
      // otherwise they'd land on /auth/login and re-type the same
      // password they set 15 seconds ago. sessionStorage clears when the
      // tab closes, and we scrub it immediately after a successful login.
      try {
        sessionStorage.setItem(
          "bagsart-pending-signup-pw",
          String(payload.password ?? "")
        );
      } catch {
        // Private mode / storage quota — the verify page falls back to
        // routing through /auth/login, which still works.
      }
      push({
        title: "Check your inbox",
        description: `We sent a 6-digit code to ${data.email ?? payload.email}.`,
        tone: "success",
      });
      const emailParam = encodeURIComponent(
        String(data.email ?? payload.email ?? "")
      );
      const cbParam = callbackUrl
        ? `&callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "";
      router.push(`/auth/verify-signup?email=${emailParam}${cbParam}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Create your account
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight leading-tight">
          Join the <span className="text-gradient-gold">atelier.</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One account for orders, the wishlist, and faster checkout.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-4" autoComplete="off">
        <Field delay={0.06}>
          <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
            Full name
          </label>
          <InputShell icon={User2}>
            <input
              name="name"
              autoComplete="off"
              required
              defaultValue={prefilledName}
              placeholder="Naomi Aldridge"
              className={inputClass}
            />
          </InputShell>
        </Field>

        <Field delay={0.12}>
          <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
            Email
          </label>
          <InputShell icon={Mail}>
            <input
              name="email"
              type="email"
              autoComplete="off"
              required
              defaultValue={prefilledEmail}
              placeholder="you@studio.com"
              className={inputClass}
            />
          </InputShell>
        </Field>

        <Field delay={0.18}>
          <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
            Password
          </label>
          <InputShell icon={Lock}>
            <input
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className={inputClass + " pr-11"}
            />
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-full hover:bg-muted text-muted-foreground transition"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </InputShell>
        </Field>

        <Field delay={0.26}>
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full mt-2"
            loading={loading}
          >
            Create account <ArrowRight className="h-4 w-4" />
          </Button>
        </Field>

        <Field delay={0.32}>
          <SocialDivider />
          <SocialButtons callbackUrl={callbackUrl ?? "/"} />
        </Field>
      </form>

      <Field delay={0.4}>
        <p className="mt-7 text-sm text-center text-muted-foreground">
          Already part of the atelier?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="underline decoration-gold underline-offset-4 text-foreground hover:text-gold transition"
          >
            Sign in
          </button>
        </p>
      </Field>
    </motion.div>
  );
}

/* ─── Social helpers ──────────────────────────────────────────────────── */

function SocialDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        or
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function SocialButtons({ callbackUrl }: { callbackUrl: string }) {
  return (
    <button
      type="button"
      // callbackUrl carries through /checkout when a guest is bounced
      // through login; falls back to "/" otherwise.
      onClick={() => signIn("google", { callbackUrl })}
      className="inline-flex w-full items-center justify-center gap-2 h-11 rounded-xl border border-border bg-background text-sm hover:bg-muted transition active:scale-[0.97]"
    >
      <GoogleIcon className="h-4 w-4" />
      Continue with Google
    </button>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.71-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.227c1.886-1.74 2.986-4.302 2.986-7.351Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.895 6.614-2.422l-3.227-2.51c-.895.6-2.04.954-3.386.954-2.605 0-4.81-1.759-5.598-4.122H3.073v2.59A9.997 9.997 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC04"
        d="M6.402 13.9A6.018 6.018 0 0 1 6.09 12c0-.659.114-1.297.314-1.9V7.51H3.073A9.997 9.997 0 0 0 2 12c0 1.614.387 3.14 1.073 4.49l3.329-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.978c1.468 0 2.786.504 3.826 1.495l2.864-2.864C16.96 2.99 14.695 2 12 2A9.997 9.997 0 0 0 3.073 7.51l3.329 2.59C7.19 7.737 9.395 5.977 12 5.977Z"
      />
    </svg>
  );
}

