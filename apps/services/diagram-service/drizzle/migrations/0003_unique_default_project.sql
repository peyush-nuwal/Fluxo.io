ALTER TABLE "projects"
ADD COLUMN IF NOT EXISTS "is_default" boolean DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS "projects_one_default_per_user_idx"
ON "projects" ("user_id")
WHERE ("is_default" = true AND "deleted_at" IS NULL);
