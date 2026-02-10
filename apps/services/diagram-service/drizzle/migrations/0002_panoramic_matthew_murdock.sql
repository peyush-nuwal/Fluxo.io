ALTER TABLE "diagrams" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "diagrams" ADD COLUMN "owner_name" text;--> statement-breakpoint
ALTER TABLE "diagrams" ADD COLUMN "owner_username" text;--> statement-breakpoint
ALTER TABLE "diagrams" ADD COLUMN "owner_avatar_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "owner_name" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "owner_username" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "owner_avatar_url" text;