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
      <div className="mt-20 px-10 flex items-center gap-3">
        <div className="bg-card w-fit px-6 h-32 border-border border border-solid flex flex-col justify-center items-center gap-3 group">
          <Plus className="size-12 text-muted-foreground group-hover:text-foreground transition-colors ease-in duration-150" />
          <h4 className="text-muted-foreground font-medium group-hover:text-foreground transition-colors ease-in duration-150 ">
            Create a New File
          </h4>
        </div>

        <div className="bg-card w-fit  px-6 h-32 border-border border border-solid flex flex-col justify-center items-center gap-3 group">
          <File className="size-12 text-muted-foreground group-hover:text-foreground transition-colors ease-in duration-150" />
          <h4 className="text-muted-foreground font-medium group-hover:text-foreground transition-colors ease-in duration-150 ">
            Generate an outline
          </h4>
        </div>
      </div>

      <ResourceView resources={resources} />
    </DashboardShell>
  );
}
