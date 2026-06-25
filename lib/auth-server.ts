"use server";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export interface SessionUser {
  id: string;
  name: string | null;
  email: string | null;
  role: "customer" | "admin";
}

/** Returns the current session user, or null. Server-only. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const u = session.user as Partial<SessionUser>;
  return {
    id: u.id ?? "",
    name: u.name ?? null,
    email: u.email ?? null,
    role: (u.role as "customer" | "admin") ?? "customer",
  };
}

/** Like getCurrentUser but redirects to /auth/login if not signed in. */
export async function requireUser(redirectTo = "/auth/login"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

/** Require admin role — sends customers home. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "admin") redirect("/");
  return user;
}
