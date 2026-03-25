import { API_BASE_URL } from "@/config/server-env";
import { buildProxyErrorPayload } from "@/lib/proxy-response";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{ diagramId: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { diagramId } = await params;
    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;

    const headers: Record<string, string> = {
      ...(cookie && { Cookie: cookie }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    const res = await fetch(
      `${API_BASE_URL}/api/v1/diagrams/${diagramId}/ownership`,
      {
        method: "GET",
        headers,
        credentials: "include",
        cache: "no-store",
      },
    );

    const text = await res.text();
    let data: Record<string, unknown> | null = null;

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
