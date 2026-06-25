import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { USERS } from "@/lib/mock-data";
import { AUTH_GENERIC_ERROR } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Auth strategy
 *
 *  - JWT sessions (works without a DB).
 *  - Credentials provider with bcrypt password hashing when MySQL/Postgres
 *    is wired.
 *  - Brute-force protection: per-IP rate limit on the credentials provider
 *    (5 attempts / 15 min) — trips with the same generic error string so
 *    attackers can't tell whether the limit or the password was wrong.
 *  - Mock-mode fallback: any 6+ char password works for seeded mock users;
 *    the seeded admin uses ADMIN_PASSWORD (defaults to "admin12345").
 *  - Google OAuth wires up automatically when GOOGLE_CLIENT_ID/SECRET are
 *    set.
 *
 * All credential failures return the same `AUTH_GENERIC_ERROR` string — we
 * never tell the caller whether the email was unknown or the password
 * wrong, because that leak lets attackers enumerate registered accounts.
 */

function clientIpFromHeaders(): string {
  try {
    const h = headers();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return h.get("x-real-ip") ?? h.get("cf-connecting-ip") ?? "0.0.0.0";
  } catch {
    return "0.0.0.0";
  }
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(creds) {
      // Treat every failure mode the same — never tell the caller why.
      // The early-returns below all funnel to `null`, which NextAuth
      // surfaces as the generic CredentialsSignin error.
      if (!creds?.email || !creds?.password) return null;
      const email = String(creds.email).toLowerCase().trim();
      const password = String(creds.password);

      // Per-IP brute-force throttle: 5 attempts per 15 minutes.
      const ip = clientIpFromHeaders();
      const limit = await rateLimit({
        key: `signin:${ip}`,
        max: 5,
        windowMs: 15 * 60_000,
      });
      if (!limit.ok) {
        // Don't throw a distinct error — keep the failure mode identical
        // to a bad password so an attacker can't tell why they're locked.
        return null;
      }

      if (prisma) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } as any;
      }

      // ── Mock mode (no DATABASE_URL) ────────────────────────────────────
      const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@bagsart.dev").toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD ?? "admin12345";
      if (email === adminEmail && password === adminPassword) {
        const admin = USERS.find((u) => u.email === adminEmail);
        return {
          id: admin?.id ?? "u_admin",
          name: admin?.name ?? "BagsArt Admin",
          email: adminEmail,
          role: "admin",
        } as any;
      }
      if (password.length < 6) return null;
      const known = USERS.find((u) => u.email === email);
      // In mock mode we accept any 6+ char password so the demo flow works.
      // Real production never reaches this branch (DATABASE_URL is set).
      return {
        id: known?.id ?? `mock_${Date.now()}`,
        name: known?.name ?? email.split("@")[0],
        email,
        role: (known?.role ?? "customer") as "customer" | "admin",
      } as any;
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login", error: "/auth/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "customer";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  // Public marker — the real value lives in NEXTAUTH_SECRET. Refuse to
  // boot without it in production.
  secret:
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? (() => {
          throw new Error(
            "NEXTAUTH_SECRET is required in production. Set it in your environment."
          );
        })()
      : "dev-insecure-secret-change-me"),
};

export { AUTH_GENERIC_ERROR };
