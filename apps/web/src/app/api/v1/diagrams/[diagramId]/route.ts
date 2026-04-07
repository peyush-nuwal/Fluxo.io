import { API_BASE_URL } from "@/config/server-env";
import {
  buildProxyErrorPayload,
  buildProxySuccessPayload,
} from "@/lib/proxy-response";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{ diagramId: string }>;
};

type ProxyBody = string | FormData | undefined;

export async function GET(
  req: NextRequest,
  { params }: Params,
): Promise<Response> {
  try {
    const { diagramId } = await params;
    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;

    const headers: Record<string, string> = {
      ...(cookie && { Cookie: cookie }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
    const res = await fetch(
      `${API_BASE_URL}/api/v1/diagram/diagrams/${diagramId}`,
      {
        method: "GET",
        headers,
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

    return NextResponse.json(buildProxySuccessPayload(data, res.ok), {
      status: res.status,
    });
  } catch (error) {
    return NextResponse.json(buildProxyErrorPayload(error), { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params,
): Promise<Response> {
  try {
    const { diagramId } = await params;
    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;

    const headers: Record<string, string> = {
      ...(cookie && { Cookie: cookie }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    const res = await fetch(
      `${API_BASE_URL}/api/v1/diagram/diagrams/${diagramId}`,
      {
        method: "DELETE",
        headers,
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

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(buildProxySuccessPayload(data, res.ok), {
      status: res.status,
    });
  } catch (error) {
    return NextResponse.json(buildProxyErrorPayload(error), { status: 500 });
  }
}
export async function PUT(
  req: NextRequest,
  { params }: Params,
): Promise<Response> {
  try {
    const { diagramId } = await params;
    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;

    const headers: Record<string, string> = {
      ...(cookie && { Cookie: cookie }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    const contentType = req.headers.get("content-type") || "";

    let body: ProxyBody;

    if (contentType.includes("multipart/form-data")) {
      body = await req.formData();
    } else {
      const json = await req.json();
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(json);
    }

    const res = await fetch(
      `${API_BASE_URL}/api/v1/diagram/diagrams/${diagramId}`,
      {
        method: "PUT",
        headers,
        body,
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

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(buildProxySuccessPayload(data, res.ok), {
      status: res.status,
    });
  } catch (error) {
    return NextResponse.json(buildProxyErrorPayload(error), { status: 500 });
  }
}
