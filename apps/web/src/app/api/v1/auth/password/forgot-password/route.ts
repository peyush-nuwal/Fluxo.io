import { API_BASE_URL } from "@/config/server-env";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(
      `${API_BASE_URL}/api/v1/auth/password/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") ?? "",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json().catch(() => ({}));

    const response = NextResponse.json(data, { status: res.status });
    // 🔑 forward auth cookies
    const setCookies = res.headers.getSetCookie?.() ?? [];
    setCookies.forEach((cookie) =>
      response.headers.append("Set-Cookie", cookie),
    );
    return response;
  } catch (error) {
    console.error("forgot password route error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
