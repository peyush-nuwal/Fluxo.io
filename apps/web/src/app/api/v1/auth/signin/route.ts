import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

    console.log("📝 Login attempt:", { email: body.email, API_URL });

    if (!API_URL) {
      console.error("❌ API_URL is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const backendUrl = `${API_URL}/api/v1/auth/signin`;
    console.log("🔗 Forwarding to:", backendUrl);

    // Get cookies from the incoming request
    const cookieHeader = req.headers.get("cookie") || "";
    console.log("📦 Forwarding cookies:", cookieHeader ? "yes" : "no");

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader, // Forward browser cookies to backend
      },
      credentials: "include", // Include cookies in fetch
      body: JSON.stringify(body),
    });

    console.log("📊 Backend response status:", res.status);

    const data = await res.json().catch(() => ({}));
    console.log("📦 Backend response data:", data);

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const response = NextResponse.json(data);

    // Get all Set-Cookie headers from backend and forward them
    const setCookieHeaders = res.headers.getSetCookie?.() || [];
    console.log("🍪 Set-Cookie headers count:", setCookieHeaders.length);

    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });
      console.log("✅ Forwarded", setCookieHeaders.length, "cookies to client");
    }

    return response;
  } catch (error) {
    console.error("❌ Signin route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
