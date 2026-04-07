import { NextRequest, NextResponse } from "next/server";
import {
  buildProxySuccessPayload,
  buildProxyErrorPayload,
} from "@/lib/proxy-response";
import { API_BASE_URL } from "@/config/server-env";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: unknown = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    const response = NextResponse.json(buildProxySuccessPayload(data, res.ok), {
      status: res.status,
    });

    const setCookies = res.headers.getSetCookie?.() ?? [];
    setCookies.forEach((c) => response.headers.append("Set-Cookie", c));

    return response;
  } catch (error) {
    console.error("Signup route error:", error);
    return NextResponse.json(buildProxyErrorPayload(error), { status: 500 });
  }
}
