import { API_BASE_URL } from "@/config/server-env";
import { NextRequest, NextResponse } from "next/server";
import {
  buildProxySuccessPayload,
  buildProxyErrorPayload,
} from "@/lib/proxy-response";

type Params = {
  params: Promise<{ diagramId: string }>;
};

export async function PATCH(
  req: NextRequest,
  { params }: Params,
): Promise<Response> {
  try {
    const { diagramId } = await params;
    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;
    const body = await req.json();

    const headers: Record<string, string> = {
      ...(cookie && { Cookie: cookie }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      "Content-Type": "application/json",
    };

    const res = await fetch(
      `${API_BASE_URL}/api/v1/diagram/diagrams/${diagramId}/active`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
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

    return NextResponse.json(buildProxySuccessPayload(data, res.ok), {
      status: res.status,
    });
  } catch (error) {
    return NextResponse.json(buildProxyErrorPayload(error), { status: 500 });
  }
}
