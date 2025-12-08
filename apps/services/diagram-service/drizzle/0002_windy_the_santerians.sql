CREATE TABLE IF NOT EXISTS "diagram_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diagram_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "diagram_like_unique" UNIQUE("diagram_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "diagrams" DROP CONSTRAINT "diagrams_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "diagrams" ALTER COLUMN "project_id" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "diagrams" ALTER COLUMN "project_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "diagrams" ALTER COLUMN "data" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "diagrams" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "diagrams" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "diagrams" ADD COLUMN "is_public" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "diagrams" ADD COLUMN "views" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "diagrams" ADD COLUMN "forked_from" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diagram_likes" ADD CONSTRAINT "diagram_likes_diagram_id_diagrams_id_fk" FOREIGN KEY ("diagram_id") REFERENCES "public"."diagrams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diagrams" ADD CONSTRAINT "diagrams_forked_from_diagrams_id_fk" FOREIGN KEY ("forked_from") REFERENCES "public"."diagrams"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diagrams" ADD CONSTRAINT "diagrams_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
