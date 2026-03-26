import { API_BASE_URL } from "@/config/server-env";
import { NextRequest, NextResponse } from "next/server";
import {
  buildProxySuccessPayload,
  buildProxyErrorPayload,
} from "@/lib/proxy-response";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE_URL}/api/v1/auth/password/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    const response = NextResponse.json(buildProxySuccessPayload(data, res.ok), {
      status: res.status,
    });
    // 🔑 forward auth cookies
    const setCookies = res.headers.getSetCookie?.() ?? [];
    setCookies.forEach((cookie) =>
      response.headers.append("Set-Cookie", cookie),
    );
    return response;
  } catch (error) {
    console.error("resetting password route error:", error);
    return NextResponse.json(
      buildProxyErrorPayload(null, "Internal server error"),
      { status: 500 },
    );
  }
}
