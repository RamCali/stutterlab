CREATE TABLE IF NOT EXISTS "community_member_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "alias" text NOT NULL,
  "avatar_color" text DEFAULT 'teal' NOT NULL,
  "bio" text,
  "show_real_name" boolean DEFAULT false NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "community_member_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_post_reactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "post_id" uuid NOT NULL,
  "user_id" text NOT NULL,
  "reaction_type" text DEFAULT 'support' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "reporter_user_id" text NOT NULL,
  "target_type" text NOT NULL,
  "target_id" text NOT NULL,
  "reason" text NOT NULL,
  "details" text,
  "status" text DEFAULT 'open' NOT NULL,
  "reviewed_by" text,
  "reviewed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_practice_rooms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "host_user_id" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "scheduled_at" timestamp NOT NULL,
  "duration_minutes" integer DEFAULT 30 NOT NULL,
  "capacity" integer DEFAULT 6 NOT NULL,
  "participant_count" integer DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'scheduled' NOT NULL,
  "join_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_room_participants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "room_id" uuid NOT NULL,
  "user_id" text NOT NULL,
  "status" text DEFAULT 'joined' NOT NULL,
  "joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "community_post_reactions" ADD CONSTRAINT "community_post_reactions_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "community_room_participants" ADD CONSTRAINT "community_room_participants_room_id_community_practice_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."community_practice_rooms"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_post_reactions_post_idx" ON "community_post_reactions" ("post_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_reports_status_idx" ON "community_reports" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_practice_rooms_scheduled_idx" ON "community_practice_rooms" ("scheduled_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_room_participants_room_idx" ON "community_room_participants" ("room_id");
