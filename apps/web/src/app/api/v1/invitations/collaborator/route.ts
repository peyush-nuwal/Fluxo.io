import { API_BASE_URL } from "@/config/server-env";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{ projectId: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { projectId } = await params;

    const res = await fetch(
      `${API_BASE_URL}/diagram/diagrams/${projectId}/collaborators`,
      {
        method: "GET",
        headers: {
          cookie: req.headers.get("cookie") ?? "",
        },
        credentials: "include",
        cache: "no-store",
      },
    );

    const text = await res.text();
    let data: Record<string, unknown> = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || "Failed to get collaborators" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
