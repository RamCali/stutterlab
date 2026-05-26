CREATE TABLE IF NOT EXISTS "oases_check_ins" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "check_in_date" date NOT NULL,
  "scores" jsonb NOT NULL,
  "impact_score" real NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "oases_check_ins_user_date_idx" ON "oases_check_ins" ("user_id", "check_in_date");

CREATE TABLE IF NOT EXISTS "behavioral_predictions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "client_id" text,
  "situation" text NOT NULL,
  "prediction" text NOT NULL,
  "confidence_level" integer NOT NULL,
  "anxiety_before" integer NOT NULL,
  "anxiety_after" integer,
  "actual_outcome" text,
  "completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp
);

CREATE INDEX IF NOT EXISTS "behavioral_predictions_user_created_idx" ON "behavioral_predictions" ("user_id", "created_at");
