import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("access_token");
  const { pathname } = req.nextUrl;

  // If user is authenticated
  if (accessToken) {
    // Redirect from login/signup to dashboard
    if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    // Allow access to dashboard
    return NextResponse.next();
  }

  // If user is NOT authenticated
  if (!accessToken) {
    // Redirect from dashboard to login
    if (pathname.startsWith("/home")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Allow access to login/signup
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/login", "/signup", "/"],
};
