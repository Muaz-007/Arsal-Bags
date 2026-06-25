import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED = ["/dashboard"];
const ADMIN = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN.some((p) => pathname.startsWith(p));
  if (!needsAuth && !needsAdmin) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? "dev-insecure-secret-change-me",
  });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  if (needsAdmin && (token as any).role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
