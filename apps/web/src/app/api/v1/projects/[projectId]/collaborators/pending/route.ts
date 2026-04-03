import { API_BASE_URL } from "@/config/server-env";
import {
  buildProxyErrorPayload,
  buildProxySuccessPayload,
} from "@/lib/proxy-response";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{ projectId: string }>;
};

async function proxyCollaboratorRequest(
  req: NextRequest,
  projectId: string,
  method: "GET" | "POST" | "DELETE",
): Promise<Response> {
  const cookie = req.headers.get("cookie");
  const accessToken = req.cookies.get("access_token")?.value;
  const headers: Record<string, string> = {
    ...(cookie ? { Cookie: cookie } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  let body: string | undefined;
  if (method !== "GET") {
    const rawBody = await req.text().catch(() => "");
    if (rawBody.trim().length > 0) {
      body = rawBody;
      headers["Content-Type"] =
        req.headers.get("content-type") || "application/json";
    }
  }

  const upstreamUrl = `${API_BASE_URL}/api/v1/projects/${projectId}/collaborators/pending`;

  const res = await fetch(upstreamUrl, {
    method,
    headers,
    body,
    credentials: "include",
    cache: "no-store",
  });

  const text = await res.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text?.trim() ? { message: text.trim() } : null;
  }

  if (!res.ok) {
    return NextResponse.json(buildProxyErrorPayload(data), {
      status: res.status,
    });
  }

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(buildProxySuccessPayload(data, res.ok), {
    status: res.status,
  });
}

export async function GET(
  req: NextRequest,
  { params }: Params,
): Promise<Response> {
  try {
    const { projectId } = await params;
    return proxyCollaboratorRequest(req, projectId, "GET");
  } catch {
    return NextResponse.json(buildProxyErrorPayload(null), { status: 500 });
  }
}
