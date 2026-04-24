import { API_BASE_URL } from "@/config/server-env";
import { NextRequest, NextResponse } from "next/server";
import {
  buildProxyErrorPayload,
  buildProxySuccessPayload,
} from "@/lib/proxy-response";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;
    const body = await req.json();

    const headers: Record<string, string> = {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      "Content-Type": "application/json",
    };

    const res = await fetch(`${API_BASE_URL}/api/v1/auth/email/change/verify`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      return NextResponse.json(buildProxyErrorPayload(data), {
        status: res.status,
      });
    }

    const response = NextResponse.json(buildProxySuccessPayload(data), {
      status: res.status,
    });

    const setCookies = res.headers.getSetCookie?.() ?? [];
    for (const cookieValue of setCookies) {
      response.headers.append("Set-Cookie", cookieValue);
    }

    return response;
  } catch (error) {
    return NextResponse.json(buildProxyErrorPayload(error), { status: 500 });
  }
}
