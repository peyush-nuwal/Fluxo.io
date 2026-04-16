import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/config/server-env";
import {
  buildProxySuccessPayload,
  buildProxyErrorPayload,
} from "@/lib/proxy-response";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;

    const contentType = req.headers.get("content-type") || "";

    const headers: Record<string, string> = {
      ...(cookie && { Cookie: cookie }),
      ...(accessToken && { authorization: `Bearer ${accessToken}` }),
    };

    let body = await req.formData();
    const res = await fetch(
      `${API_BASE_URL}/api/v1/auth/users/me/upload-avatar`,
      {
        method: "POST",
        headers,
        body,
        cache: "no-store",
      },
    );

    const text = await res.text();
    let data: unknown = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      data = null;
    }

    if (!res.ok) {
      return NextResponse.json(buildProxyErrorPayload(data), {
        status: res.status,
      });
    }

    return NextResponse.json(buildProxySuccessPayload(data), {
      status: res.status,
    });
  } catch (error) {
    return NextResponse.json(buildProxyErrorPayload(error), {
      status: 500,
    });
  }
}
