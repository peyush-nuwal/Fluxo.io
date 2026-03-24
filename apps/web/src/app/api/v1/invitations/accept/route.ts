import { API_BASE_URL } from "@/config/server-env";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(
      `${API_BASE_URL}/api/v1/diagram/invitations/accept`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") ?? "",
        },
        credentials: "include",
        body: JSON.stringify(body),
      },
    );

    const text = await res.text();
    let data: Record<string, unknown> = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || "Failed to accept invitation" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
