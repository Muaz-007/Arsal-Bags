/**
 * Prisma client singleton — guards against hot-reload connection churn in dev.
 * `prisma` is null when DATABASE_URL is not configured, which signals call
 * sites (lib/queries.ts) to fall back to mock data so the app still runs.
 */

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

function makeClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma: PrismaClient | null =
  global.__prisma__ ?? makeClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  global.__prisma__ = prisma;
}

export function isDbConnected() {
  return prisma !== null;
}
