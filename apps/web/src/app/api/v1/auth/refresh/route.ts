import { API_BASE_URL } from "@/config/server-env";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
      credentials: "include",
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    const response = NextResponse.json(data, { status: res.status });

    const setCookies = res.headers.getSetCookie?.() ?? [];
    setCookies.forEach((cookie) =>
      response.headers.append("Set-Cookie", cookie),
    );

    return response;
  } catch (_error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
