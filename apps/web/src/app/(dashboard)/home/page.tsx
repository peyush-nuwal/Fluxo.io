import { ResourceView } from "@/components/resource-view";
import DashboardShell from "../DashboardShell";
import { ProjectResource } from "@/types";
import { File, Plus } from "lucide-react";

export default function DashboardPage() {
  const resources: ProjectResource[] = [
    {
      id: "7c1a1d2e-9a2b-4f9a-9f4c-2a1e9b1d1111",
      project_id: "c91b7f12-6a3d-4c9a-bb12-91a2f000aaaa",
      user_id: "1a2b3c4d-1111-2222-3333-abcdefabcdef",

      name: "Auth Flow Diagram",
      description: "User authentication flow",

      data: {
        nodes: 12,
        edges: 15,
      },
      thumbnail: "/assets/temp.jpeg",

      is_active: true,
      is_public: false,

      views: 10,

      created_at: "2026-02-01T10:20:30Z",
      updated_at: "2026-02-02T08:15:00Z",
      deleted_at: null,
      last_opened_at: "2026-02-04T12:00:00Z",
    },
    {
      id: "8d2e3f4a-aaaa-bbbb-cccc-6789abc",
      project_id: "c91b7f12-6a3d-4c9a-bb12-91a2f000aaaa",
      user_id: "1a2b3c4d-1111-2222-3333-abcdefabcdef",

      name: "System Overview",
      description: "d",
      thumbnail: "",
      data: {
        nodes: 5,
        edges: 4,
      },

      is_active: true,
      is_public: true,

      views: 42,

      created_at: "2026-01-28T09:00:00Z",
      updated_at: "2026-02-03T18:30:00Z",
      deleted_at: null,
      last_opened_at: null,
    },
    {
      id: "7c1a1d2e-9a2b-4f9a-9f4c-2ab1d1111",
      project_id: "c91b7f12-6a3d-4c9a-bb12-91a2f000aaaa",
      user_id: "1a2b3c4d-1111-2222-3333-abcdefabcdef",

      name: "Auth Flow Diagram",
      description: "User authentication flow",

      data: {
        nodes: 12,
        edges: 15,
      },
      thumbnail: "/assets/temp.jpeg",

      is_active: true,
      is_public: false,

      views: 10,

      created_at: "2026-02-01T10:20:30Z",
      updated_at: "2026-02-02T08:15:00Z",
      deleted_at: null,
      last_opened_at: "2026-02-04T12:00:00Z",
    },
    {
      id: "8d2e3f4a-aaaa-b-cccc-123456789abc",
      project_id: "c91b7f12-6a3d-4c9a-bb12-91a2f000aaaa",
      user_id: "1a2b3c4d-1111-2222-3333-abcdefabcdef",

      name: "System Overview",
      description: "d",
      thumbnail: "",
      data: {
        nodes: 5,
        edges: 4,
      },

      is_active: true,
      is_public: true,

      views: 42,

      created_at: "2026-01-28T09:00:00Z",
      updated_at: "2026-02-03T18:30:00Z",
      deleted_at: null,
      last_opened_at: null,
    },
    {
      id: "7c1a1d2e-9a2b-4f9f4c-2a1e9b1d1111",
      project_id: "c91b7f12-6a3d-4c9a-bb12-91a2f000aaaa",
      user_id: "1a2b3c4d-1111-2222-3333-abcdefabcdef",

      name: "Auth Flow Diagram",
      description: "User authentication flow",

      data: {
        nodes: 12,
        edges: 15,
      },
      thumbnail: "/assets/temp.jpeg",

      is_active: true,
      is_public: false,

      views: 10,

      created_at: "2026-02-01T10:20:30Z",
      updated_at: "2026-02-02T08:15:00Z",
      deleted_at: null,
      last_opened_at: "2026-02-04T12:00:00Z",
    },
    {
      id: "8d2e3f4a-aaaa-bbbb-cccc-123456789abc",
      project_id: "c91b7f12-6a3d-4c9a-bb12-91a2f000aaaa",
      user_id: "1a2b3c4d-1111-2222-3333-abcdefabcdef",

      name: "System Overview",
      description: "d",
      thumbnail: "",
      data: {
        nodes: 5,
        edges: 4,
      },

      is_active: true,
      is_public: true,

      views: 42,

      created_at: "2026-01-28T09:00:00Z",
      updated_at: "2026-02-03T18:30:00Z",
      deleted_at: null,
      last_opened_at: null,
    },
  ];

  return (
    <DashboardShell>
      <div className="flex-1 min-h-[calc(100vh-100px)] overflow-auto">
        <div className="mt-20 px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
            <button
              type="button"
              className="bg-card/90 w-full rounded-2xl border border-border px-6 py-5 text-left flex items-center gap-4 group transition-all ease-out duration-200 hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Plus className="size-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-foreground font-semibold tracking-tight">
                  Create a New File
                </h4>
                <p className="text-xs text-muted-foreground">
                  Start from scratch with a blank canvas
                </p>
              </div>
            </button>

            <button
              type="button"
              className="bg-card/90 w-full rounded-2xl border border-border px-6 py-5 text-left flex items-center gap-4 group transition-all ease-out duration-200 hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <File className="size-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-foreground font-semibold tracking-tight">
                  Generate an outline
                </h4>
                <p className="text-xs text-muted-foreground">
                  Build structure from a prompt or topic
                </p>
              </div>
            </button>
          </div>
        </div>

        <ResourceView resources={resources} />
      </div>
    </DashboardShell>
  );
}
