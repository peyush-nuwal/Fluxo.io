import { API_BASE_URL } from "@/config/server-env";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Unauthorized " },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
