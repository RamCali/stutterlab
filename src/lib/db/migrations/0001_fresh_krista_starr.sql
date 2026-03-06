ALTER TYPE "public"."exercise_type" ADD VALUE 'reading_to_ai';--> statement-breakpoint
ALTER TYPE "public"."exercise_type" ADD VALUE 'daf_reading';--> statement-breakpoint
ALTER TYPE "public"."exercise_type" ADD VALUE 'rhythm_reading';--> statement-breakpoint
ALTER TYPE "public"."exercise_type" ADD VALUE 'mirror_practice';--> statement-breakpoint
CREATE TABLE "cohort_aggregates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_key" text NOT NULL,
	"metric_value" real NOT NULL,
	"sample_size" integer NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cohort_aggregates_metric_key_unique" UNIQUE("metric_key")
);
--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD COLUMN "session_scorecard" jsonb;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD COLUMN "emotional_journey" jsonb;