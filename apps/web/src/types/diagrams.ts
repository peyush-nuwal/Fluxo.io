export type DiagramResource = {
  id: string; // UUID
  project_id: string; // UUID
  user_id: string; // UUID

  name: string;
  description?: string;

  thumbnail?: string;
  thumbnail_url?: string | null;
  owner_name?: string | null;
  owner_username?: string | null;
  owner_avatar_url?: string | null;
  data: Record<string, any>; // JSON
  is_active: boolean;
  is_public: boolean;

  views: number;

  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  deleted_at?: string | null; // nullable
  last_opened_at?: string | null;
  access_type?: "owner" | "shared";
};

export type FilterOption =
  | "last_viewed"
  | "most_viewed"
  | "recently_created"
  | "recently_updated"
  | "name_asc"
  | "name_desc"
  | "public_only"
  | "private_only"
  | "active_only";

export type filterOption_array = {
  value: FilterOption;
  label: string;
};

export type DropDownFilterProps = {
  filter: FilterOption;
  onFilterChange: (value: FilterOption) => void;
};

export type DiagramPayload = {
  name?: string | null;
  projectId?: string | null;
  data?: Record<string, any> | null;
  description?: string | null;
  thumbnail_url?: string | null;
  owner_name?: string | null;
  owner_username?: string | null;
  owner_avatar_url?: string | null;
};

export type UpdateDiagramPayload = DiagramPayload;

export type SetDiagramActivePayload = {
  is_active: boolean;
};
