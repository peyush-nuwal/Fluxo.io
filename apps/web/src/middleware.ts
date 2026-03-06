import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const decodeJwtPayload = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const json = atob(padded);
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
};

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;
  const isDashboardPath =
    pathname.startsWith("/home") ||
    pathname.startsWith("/trash") ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/settings");

  let hasValidToken = false;
  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);
    const now = Math.floor(Date.now() / 1000);
    hasValidToken = !!payload?.exp && payload.exp > now;
  }

  // If user is authenticated
  if (hasValidToken) {
    // Redirect from login/signup to dashboard
    if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    // Allow access to dashboard
    return NextResponse.next();
  }

  // If user is NOT authenticated
  if (!hasValidToken) {
    // Redirect from dashboard to login
    if (isDashboardPath) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Allow access to login/signup
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/trash/:path*",
    "/community/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/",
  ],
};
