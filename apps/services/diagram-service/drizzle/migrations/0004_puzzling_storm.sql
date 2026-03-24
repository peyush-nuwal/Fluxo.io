ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "is_default" boolean DEFAULT false;
