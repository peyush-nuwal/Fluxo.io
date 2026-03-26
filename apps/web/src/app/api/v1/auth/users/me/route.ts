import { API_BASE_URL } from "@/config/server-env";
import { NextResponse } from "next/server";
import {
  buildProxySuccessPayload,
  buildProxyErrorPayload,
} from "@/lib/proxy-response";

export async function GET(req: Request): Promise<Response> {
  try {
    const cookie = req.headers.get("cookie");

    const res = await fetch(`${API_BASE_URL}/api/v1/auth/users/me`, {
      method: "GET",
      headers: {
        Cookie: cookie ?? "",
      },
      credentials: "include",
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
      return NextResponse.json(buildProxyErrorPayload(data, "Unauthorized"), {
        status: res.status,
      });
    }

    return NextResponse.json(buildProxySuccessPayload(data, true), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      buildProxyErrorPayload(null, "Internal server error"),
      { status: 500 },
    );
  }
}
