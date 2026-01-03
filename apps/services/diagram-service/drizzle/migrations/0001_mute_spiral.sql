ALTER TABLE "diagrams" DROP CONSTRAINT "diagrams_forked_from_diagrams_id_fk";
--> statement-breakpoint
ALTER TABLE "diagrams" ADD COLUMN "last_opened_at" timestamp;--> statement-breakpoint
ALTER TABLE "diagrams" DROP COLUMN IF EXISTS "forked_from";