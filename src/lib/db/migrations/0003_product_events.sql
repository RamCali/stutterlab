CREATE TABLE IF NOT EXISTS "product_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"event_name" text NOT NULL,
	"context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_events_user_created_idx" ON "product_events" ("user_id", "created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_events_name_created_idx" ON "product_events" ("event_name", "created_at");
