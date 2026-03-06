import { API_BASE_URL } from "@/config/server-env";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{ diagramId: string }>;
};

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { diagramId } = await params;
    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;

    const res = await fetch(
      `${API_BASE_URL}/api/v1/diagram/admin/diagrams/${diagramId}`,
      {
        method: "DELETE",
        headers: {
          Cookie: cookie ?? "",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: "include",
        cache: "no-store",
      },
    );

    const text = await res.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      return NextResponse.json({ message: data }, { status: res.status });
    }

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (_error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
