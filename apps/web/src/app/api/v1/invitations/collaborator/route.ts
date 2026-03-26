import { API_BASE_URL } from "@/config/server-env";
import { ApiResponse } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";
import {
  buildProxySuccessPayload,
  buildProxyErrorPayload,
} from "@/lib/proxy-response";

type Params = {
  params: { projectId: string };
};

type Collaborator = {
  email: string | null;
  user_name: string | null;
  avatar_url: string | null;
  role: "owner" | "collaborator";
};

type GetCollaboratorsData = {
  members: Collaborator[];
  viewerRole: "owner" | "collaborator";
};

type InviteResponse = {
  email: string;
};
export async function POST(
  req: NextRequest,
  { params }: Params,
): Promise<Response> {
  try {
    const { projectId } = params;

    const cookie = req.headers.get("cookie");
    const accessToken = req.cookies.get("access_token")?.value;

    const body = await req.json();

    const res = await fetch(
      `${API_BASE_URL}/diagram/diagrams/${projectId}/collaborators`,
      {
        method: "POST",
        headers: {
          ...(cookie && { Cookie: cookie }),
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ({
      message: "Invalid JSON response",
    }));

    return NextResponse.json(buildProxySuccessPayload(data, res.ok), {
      status: res.status,
    });
  } catch (error) {
    return NextResponse.json(
      buildProxyErrorPayload(null, "Internal server error"),
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: Params,
): Promise<Response> {
  try {
    const { projectId } = params;

    const res = await fetch(
      `${API_BASE_URL}/diagram/diagrams/${projectId}/collaborators`,
      {
        method: "GET",
        headers: {
          cookie: req.headers.get("cookie") ?? "",
        },
        cache: "no-store",
      },
    );

    const raw = await res.json().catch(() => null);

    const response: ApiResponse<GetCollaboratorsData> = {
      success: raw?.success ?? false,
      message: raw?.message ?? "Failed to get collaborators",
      data: {
        members: raw?.members ?? [],
        viewerRole: raw?.viewerRole ?? "collaborator",
      },
    };

    return NextResponse.json(response, { status: res.status });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Internal server error",
        data: null,
      },
      { status: 500 },
    );
  }
}
