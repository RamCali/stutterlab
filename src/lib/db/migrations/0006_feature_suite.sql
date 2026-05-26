-- Quick Calm moment logs
CREATE TABLE IF NOT EXISTS "moment_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "technique" text NOT NULL,
  "severity" integer NOT NULL,
  "context" text,
  "notes" text,
  "helped" boolean,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "moment_logs_user_created_idx" ON "moment_logs" ("user_id", "created_at");

-- Speaking calendar events
CREATE TABLE IF NOT EXISTS "speaking_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "title" text NOT NULL,
  "event_type" text NOT NULL,
  "event_date" timestamp NOT NULL,
  "notes" text,
  "micro_plan" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "speaking_events_user_date_idx" ON "speaking_events" ("user_id", "event_date");

-- Rich micro-challenge attempts (unified flow)
CREATE TABLE IF NOT EXISTS "micro_challenge_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "challenge_id" text NOT NULL,
  "challenge_title" text NOT NULL,
  "technique" text,
  "source" text DEFAULT 'app' NOT NULL,
  "predicted_anxiety" integer NOT NULL,
  "actual_anxiety" integer,
  "outcome" text NOT NULL,
  "reflection" text,
  "voice_note_url" text,
  "xp_earned" integer DEFAULT 0 NOT NULL,
  "attempt_date" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "micro_challenge_attempts_user_date_idx" ON "micro_challenge_attempts" ("user_id", "attempt_date");

-- 30-second weekly reviews
CREATE TABLE IF NOT EXISTS "weekly_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "week_start" text NOT NULL,
  "top_win" text NOT NULL,
  "top_avoidance" text,
  "target_situation" text NOT NULL,
  "next_week_plan" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "weekly_reviews_user_week_idx" ON "weekly_reviews" ("user_id", "week_start");

-- Notification preferences
CREATE TABLE IF NOT EXISTS "user_notification_prefs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL UNIQUE,
  "daily_reminders" boolean DEFAULT true NOT NULL,
  "weekly_progress" boolean DEFAULT true NOT NULL,
  "new_exercises" boolean DEFAULT false NOT NULL,
  "smart_reminders" boolean DEFAULT true NOT NULL,
  "reminder_hour" integer DEFAULT 9 NOT NULL,
  "reminder_minute" integer DEFAULT 0 NOT NULL,
  "phone_e164" text,
  "sms_enabled" boolean DEFAULT false NOT NULL,
  "last_reminder_sent_at" timestamp,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Group practice rooms
CREATE TABLE IF NOT EXISTS "practice_rooms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "host_user_id" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "scheduled_at" timestamp NOT NULL,
  "duration_minutes" integer DEFAULT 15 NOT NULL,
  "max_participants" integer DEFAULT 8 NOT NULL,
  "status" text DEFAULT 'scheduled' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "practice_rooms_scheduled_idx" ON "practice_rooms" ("scheduled_at");

CREATE TABLE IF NOT EXISTS "practice_room_participants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "room_id" uuid NOT NULL REFERENCES "practice_rooms"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL,
  "anonymous_name" text NOT NULL,
  "joined_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "practice_room_participants_room_user_idx" ON "practice_room_participants" ("room_id", "user_id");
