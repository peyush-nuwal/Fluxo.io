import { API_BASE_URL } from "@/config/server-env";
import type { ApiResponse } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

type ProxyBody = string | FormData | undefined;

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;

    const headers: Record<string, string> = {
      ...(cookie && { Cookie: cookie }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
    const res = await fetch(`${API_BASE_URL}/api/v1/diagrams`, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    });

    const raw = await res.json().catch(() => null);

    const response: ApiResponse<{ email?: string }> = {
      success: raw?.success ?? false,
      message: raw?.message ?? "Something went wrong",
      data: raw?.email ? { email: raw.email } : null,
    };

    return NextResponse.json(response, { status: res.status });
  } catch {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Internal server error",
        data: null,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<Response> {
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

    const res = await fetch(`${API_BASE_URL}/api/v1/diagrams`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const raw = await res.json().catch(() => null);

    const response: ApiResponse<{ email?: string }> = {
      success: raw?.success ?? false,
      message: raw?.message ?? "Something went wrong",
      data: raw?.email ? { email: raw.email } : null,
    };

    return NextResponse.json(response, { status: res.status });
  } catch {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Internal server error",
        data: null,
      },
      { status: 500 },
    );
  }
}
