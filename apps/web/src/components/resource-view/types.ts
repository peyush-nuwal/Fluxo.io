export type Resource = {
  id: string;
  name: string;
  description?: string | null;
  is_public: boolean;
  views: number;
  thumbnail_url?: string | null;
  owner_username?: string | null;
  owner_avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  last_opened_at?: string | null;
  is_active?: boolean;
  access_type?: "owner" | "shared";
};
