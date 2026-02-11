export type ProjectType = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_public: boolean;
  collaborators: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  owner_name: string | null;
  owner_username: string | null;
  owner_avatar_url: string | null;
};
