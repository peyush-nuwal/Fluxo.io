import { API_BASE_URL } from "@/config/server-env";
import { NextRequest, NextResponse } from "next/server";
import {
  buildProxySuccessPayload,
  buildProxyErrorPayload,
} from "@/lib/proxy-response";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE_URL}/api/v1/invitations/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") ?? "",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: Record<string, unknown> = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || "Failed to accept invitation" };
    }

    return NextResponse.json(buildProxySuccessPayload(data, res.ok), {
      status: res.status,
    });
  } catch {
    return NextResponse.json(
      buildProxyErrorPayload(null, "Internal server error"),
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const token = req.nextUrl.searchParams.get("token");

    const target = token
      ? `${API_BASE_URL}/api/v1/invitations/accept?token=${encodeURIComponent(token)}`
      : `${API_BASE_URL}/api/v1/invitations/accept`;

    const res = await fetch(target, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
      credentials: "include",
      cache: "no-store",
    });

    const text = await res.text();
    let data: Record<string, unknown> = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || "Failed to accept invitation" };
    }

    return NextResponse.json(buildProxySuccessPayload(data, res.ok), {
      status: res.status,
    });
  } catch {
    return NextResponse.json(
      buildProxyErrorPayload(null, "Internal server error"),
      { status: 500 },
    );
  }
}
