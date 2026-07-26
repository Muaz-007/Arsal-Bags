import crypto from "crypto";

/**
 * Newsletter unsubscribe token helpers.
 *
 * We sign a stable HMAC over the subscriber's email with `NEXTAUTH_SECRET`
 * as the key — no DB column needed, tokens are stable per subscriber, and
 * only someone with the secret (i.e. us) can mint them.
 *
 * Tokens don't expire on purpose: someone opening a two-year-old newsletter
 * should still be able to unsubscribe from it.
 */

function secret(): string {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is required to sign newsletter tokens");
  return s;
}

/** Return the HMAC signature (hex) for a given subscriber email. */
export function signUnsubscribe(email: string): string {
  return crypto
    .createHmac("sha256", secret())
    .update(email.toLowerCase().trim())
    .digest("hex")
    .slice(0, 32); // 32 chars is more than enough — ~10^38 collision space
}

/** Constant-time comparison so we don't leak timing info on token guesses. */
export function verifyUnsubscribe(email: string, token: string): boolean {
  const expected = signUnsubscribe(email);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

/** Build the absolute unsubscribe URL that goes into newsletter footers. */
export function unsubscribeUrl(email: string, baseUrl: string): string {
  const token = signUnsubscribe(email);
  const q = new URLSearchParams({ email, token });
  return `${baseUrl.replace(/\/+$/, "")}/newsletter/unsubscribe?${q.toString()}`;
}
