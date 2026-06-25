import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge middleware — gates `/dashboard/*` (any signed-in user) and
 * `/admin/*` (admin role only). Anything else passes through.
 *
 * The redirect for unauthenticated users preserves the original path in
 * a `from` query param so /auth/login can bounce them back after success.
 *
 * IMPORTANT: middleware runs on the edge and CANNOT import lib/auth.ts —
 * we read NEXTAUTH_SECRET from env directly. In production this MUST be
 * set; we fail closed if it isn't.
 */

const PROTECTED = ["/dashboard"];
const ADMIN = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN.some((p) => pathname.startsWith(p));
  if (!needsAuth && !needsAdmin) return NextResponse.next();

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    // Fail closed in production — a missing secret means tokens can't be
    // verified, so we block access rather than letting anyone through.
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const token = await getToken({
    req,
    secret: secret ?? "dev-insecure-secret-change-me",
  });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  if (needsAdmin && (token as { role?: string }).role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
