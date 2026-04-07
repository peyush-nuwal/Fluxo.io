import { API_BASE_URL } from "@/config/server-env";
import { NextRequest, NextResponse } from "next/server";
import {
  buildProxySuccessPayload,
  buildProxyErrorPayload,
} from "@/lib/proxy-response";
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE_URL}/api/v1/auth/otp/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") ?? "",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const text = await res.text();

    let data: unknown = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || "OTP generation  failed" };
    }

    if (!res.ok) {
      return NextResponse.json(buildProxySuccessPayload(data, res.ok), {
        status: res.status,
      });
    }

    const response = NextResponse.json(buildProxySuccessPayload(data, true));

    // Forward Set-Cookie headers (email verified / session upgraded)
    const setCookies = res.headers.getSetCookie?.() ?? [];
    for (const cookie of setCookies) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  } catch (error) {
    console.error("generate OTP route error:", error);
    return NextResponse.json(buildProxyErrorPayload(error), { status: 500 });
  }
}
