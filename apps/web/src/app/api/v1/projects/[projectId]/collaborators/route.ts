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
    const payload = await req.json().catch(() => undefined);
    if (payload !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(payload);
    }
  }

  const res = await fetch(
    `${API_BASE_URL}/api/v1/projects/${projectId}/collaborators`,
    {
      method,
      headers,
      ...(body ? { body } : {}),
      credentials: "include",
      cache: "no-store",
    },
  );

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

  return NextResponse.json(buildProxySuccessPayload(data, true), {
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
    return NextResponse.json(
      buildProxyErrorPayload(null, "Internal server error"),
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: Params,
): Promise<Response> {
  try {
    const { projectId } = await params;
    return proxyCollaboratorRequest(req, projectId, "POST");
  } catch {
    return NextResponse.json(
      buildProxyErrorPayload(null, "Internal server error"),
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params,
): Promise<Response> {
  try {
    const { projectId } = await params;
    return proxyCollaboratorRequest(req, projectId, "DELETE");
  } catch {
    return NextResponse.json(
      buildProxyErrorPayload(null, "Internal server error"),
      { status: 500 },
    );
  }
}
