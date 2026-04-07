import { NextRequest, NextResponse } from "next/server";
import {
  buildProxySuccessPayload,
  buildProxyErrorPayload,
} from "@/lib/proxy-response";
import { API_BASE_URL } from "@/config/server-env";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    const response = NextResponse.json(buildProxySuccessPayload(data, res.ok), {
      status: res.status,
    });

    // 🔑 forward Set-Cookie so browser deletes auth cookie
    const setCookies = res.headers.getSetCookie?.() ?? [];
    setCookies.forEach((c) => response.headers.append("Set-Cookie", c));

    return response;
  } catch (error) {
    console.error("logout route error:", error);
    return NextResponse.json(buildProxyErrorPayload(error), { status: 500 });
  }
}
