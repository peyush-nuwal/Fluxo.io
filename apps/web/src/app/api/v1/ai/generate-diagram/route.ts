import { API_BASE_URL } from "@/config/server-env";
import {
  buildProxyErrorPayload,
  buildProxySuccessPayload,
} from "@/lib/proxy-response";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;
    const body = await req.json();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(cookie && { Cookie: cookie }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    const res = await fetch(`${API_BASE_URL}/api/v1/ai/generate-diagram`, {
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

    return NextResponse.json(buildProxySuccessPayload(data, res.ok), {
      status: res.status,
    });
  } catch {
    return NextResponse.json(
      buildProxyErrorPayload({ message: "Internal server error" }),
      { status: 500 },
    );
  }
}
