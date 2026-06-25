import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { USERS } from "@/lib/mock-data";

/**
 * Auth strategy:
 *  - JWT sessions (works without a DB)
 *  - Credentials provider with bcrypt password hashing when MySQL is wired
 *  - Mock-mode fallback: any 6+ char password works for seeded mock users;
 *    the seeded admin uses ADMIN_PASSWORD (defaults to "admin12345").
 *  - Google OAuth wires up automatically when GOOGLE_CLIENT_ID/SECRET are set.
 */

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(creds) {
      if (!creds?.email || !creds?.password) return null;
      const email = String(creds.email).toLowerCase().trim();
      const password = String(creds.password);

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

      // Mock mode
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
  pages: { signIn: "/auth/login" },
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
  secret: process.env.NEXTAUTH_SECRET ?? "dev-insecure-secret-change-me",
};
