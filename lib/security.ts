/**
 * Reusable security helpers — IP-aware rate-limit middleware for API
 * routes, generic error messages, etc.
 *
 * Why generic messages? "No user with that email" leaks account existence;
 * "Wrong password" leaks the same once an attacker probes a known address.
 * All credential failures should say the same thing.
 */

export const AUTH_GENERIC_ERROR = "Email or password is wrong.";

/** Maximum bytes we'll accept in a JSON request body. Defense in depth — */
/* keep payloads tiny so a misbehaving client can't DoS us with huge JSON. */
export const MAX_JSON_BODY = 16 * 1024; // 16 KB

/**
 * Constant-time string compare to avoid timing-leak attacks on small
 * secrets. Not used in critical paths today, but here when we add one.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
