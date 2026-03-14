import { API_BASE_URL } from "@/config/server-env";
import { buildProxyErrorPayload } from "@/lib/proxy-response";
import { NextRequest, NextResponse } from "next/server";

type ProxyBody = string | FormData | undefined;

export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;

    const headers: Record<string, string> = {
      ...(cookie && { Cookie: cookie }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
    const res = await fetch(`${API_BASE_URL}/api/v1/diagram/diagrams`, {
      method: "GET",
      headers,
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

    if (!res.ok) {
      return NextResponse.json(buildProxyErrorPayload(data), {
        status: res.status,
      });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error next js route " },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;

    const contentType = req.headers.get("content-type") || "";

    const headers: Record<string, string> = {
      ...(cookie && { Cookie: cookie }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    let body: ProxyBody;

    if (contentType.includes("multipart/form-data")) {
      body = await req.formData();
    } else {
      const json = await req.json();
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(json);
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/diagram/diagrams`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const text = await res.text();
    let data = null;

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

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
