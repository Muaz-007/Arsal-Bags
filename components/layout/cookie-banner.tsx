"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "bagsart-cookie-consent";
const CONSENT_VERSION = "1";

/**
 * First-visit cookie acknowledgement.
 *
 * We only use functional cookies (auth session, cart, wishlist, theme
 * preference) — no third-party analytics, no ad networks — so this is a
 * plain acknowledgement rather than a granular consent picker. Choice is
 * stored in localStorage under `bagsart-cookie-consent`; bumping
 * `CONSENT_VERSION` re-prompts every visitor if we ever start adding
 * new categories of cookies.
 *
 * Hidden completely on admin pages so the panel stays clean for staff.
 */
export function CookieBanner() {
  // `null` = we haven't read localStorage yet (SSR / first paint).
  // Setting this from `useEffect` avoids a hydration mismatch and stops
  // the banner from flashing on every navigation.
  const [state, setState] = useState<null | "show" | "hidden">(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Suppress on admin routes without importing usePathname (which would
    // pull the client Router into every page). Location.pathname read here
    // is fine because this effect only runs on the client.
    if (window.location.pathname.startsWith("/admin")) {
      setState("hidden");
      return;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setState(stored === CONSENT_VERSION ? "hidden" : "show");
    } catch {
      // localStorage disabled (private mode, quota exceeded) — err on the
      // side of showing the banner. Persisting won't work either, but the
      // user can still dismiss for the session.
      setState("show");
    }
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, CONSENT_VERSION);
    } catch {
      // Ignore — dismissal still lands for this session.
    }
    setState("hidden");
  }

  return (
    <AnimatePresence>
      {state === "show" && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie notice"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:left-4 sm:bottom-4 z-40 max-w-md"
        >
          <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-lg shadow-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="h-9 w-9 grid place-items-center rounded-full bg-gold/15 text-gold-dark dark:text-gold-light shrink-0">
                <Cookie className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug">
                  A quick note about cookies
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  We use a few essential cookies to keep you signed in,
                  remember your bag, and hold onto your light/dark preference.
                  No trackers, no ads.{" "}
                  <Link
                    href="/legal/cookies"
                    className="underline decoration-gold underline-offset-2 hover:text-foreground"
                  >
                    Learn more
                  </Link>
                  .
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="gold"
                    size="sm"
                    onClick={accept}
                  >
                    Got it
                  </Button>
                  <Link
                    href="/legal/cookies"
                    className="text-xs text-muted-foreground hover:text-foreground px-2"
                  >
                    Details
                  </Link>
                </div>
              </div>
              <button
                type="button"
                onClick={accept}
                aria-label="Dismiss"
                className="h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0 -mt-1 -mr-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
