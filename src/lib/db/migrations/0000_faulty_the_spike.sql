CREATE TYPE "public"."emotional_tag" AS ENUM('confident', 'anxious', 'frustrated', 'proud', 'neutral', 'hopeful', 'discouraged');--> statement-breakpoint
CREATE TYPE "public"."exercise_difficulty" AS ENUM('beginner', 'intermediate', 'advanced', 'expert');--> statement-breakpoint
CREATE TYPE "public"."exercise_type" AS ENUM('reading', 'gentle_onset', 'light_contact', 'prolonged_speech', 'breathing', 'pausing', 'cancellation', 'pull_out', 'preparatory_set', 'voluntary_stuttering', 'tongue_twister', 'phone_number');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('mild', 'moderate', 'severe');--> statement-breakpoint
CREATE TYPE "public"."severity_rating" AS ENUM('normal', 'mild', 'moderate', 'severe');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('free', 'core', 'pro', 'elite', 'slp');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'past_due', 'trialing', 'incomplete');--> statement-breakpoint
CREATE TYPE "public"."technique_category" AS ENUM('fluency_shaping', 'stuttering_modification');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'slp');--> statement-breakpoint
CREATE TABLE "accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"scenario_type" text NOT NULL,
	"messages" jsonb NOT NULL,
	"fluency_score" real,
	"disfluency_moments" jsonb,
	"techniques_used" jsonb,
	"duration_seconds" integer,
	"stress_level" integer,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audio_lab_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"daf_enabled" boolean DEFAULT false NOT NULL,
	"daf_delay_ms" integer DEFAULT 70,
	"faf_enabled" boolean DEFAULT false NOT NULL,
	"faf_semitones" real DEFAULT 0,
	"choral_enabled" boolean DEFAULT false NOT NULL,
	"metronome_enabled" boolean DEFAULT false NOT NULL,
	"metronome_bpm" integer DEFAULT 80,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buddy_pairings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_a_id" text NOT NULL,
	"user_b_id" text NOT NULL,
	"user_a_name" text NOT NULL,
	"user_b_name" text NOT NULL,
	"shared_streak" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_active_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"contribution" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"target_value" integer NOT NULL,
	"current_value" integer DEFAULT 0 NOT NULL,
	"xp_reward" integer DEFAULT 100 NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"participant_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"audio_clip_url" text,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_victories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"anonymous_name" text NOT NULL,
	"victory_type" text NOT NULL,
	"description" text,
	"celebrate_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"session_id" uuid,
	"exercise_id" uuid NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"xp_earned" integer DEFAULT 0 NOT NULL,
	"recording_url" text,
	"ai_feedback" text
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" "exercise_type" NOT NULL,
	"technique" text NOT NULL,
	"difficulty" "exercise_difficulty" NOT NULL,
	"instructions" text NOT NULL,
	"content_json" jsonb NOT NULL,
	"audio_url" text,
	"duration_seconds" integer,
	"is_premium" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feared_words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"word" text NOT NULL,
	"phoneme" text,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"practice_count" integer DEFAULT 0 NOT NULL,
	"mastered" boolean DEFAULT false NOT NULL,
	"last_practiced" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "micro_challenge_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"challenge_date" text NOT NULL,
	"challenge_title" text NOT NULL,
	"technique" text NOT NULL,
	"xp_earned" integer DEFAULT 10 NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monthly_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"month" timestamp NOT NULL,
	"passage_id" text NOT NULL,
	"audio_url" text,
	"transcription" text,
	"total_syllables" integer,
	"stuttered_syllables" integer,
	"percent_ss" real,
	"severity_rating" "severity_rating",
	"speaking_rate" real,
	"fluency_score" integer,
	"analysis_json" jsonb,
	"recommendations_json" jsonb,
	"share_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "monthly_reports_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"bio" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"stuttering_severity" "severity",
	"treatment_path" jsonb,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"slp_credentials" text,
	"slp_specialties" jsonb,
	"slp_availability" jsonb,
	"slp_hourly_rate" real,
	"slp_bio" text,
	"preferred_approach" "technique_category",
	"approach_confidence" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"duration_seconds" integer,
	"exercise_type" text,
	"tools_used" jsonb,
	"self_rated_fluency" integer,
	"ai_fluency_score" real,
	"technique_category" "technique_category",
	"confidence_before" integer,
	"confidence_after" integer,
	"notes" text,
	"recording_url" text
);
--> statement-breakpoint
CREATE TABLE "shadowing_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"clip_id" text NOT NULL,
	"technique" text NOT NULL,
	"overall_score" integer NOT NULL,
	"rhythm_match" integer NOT NULL,
	"technique_accuracy" integer NOT NULL,
	"pace_match" integer NOT NULL,
	"stars" integer NOT NULL,
	"feedback" text,
	"technique_notes" text,
	"xp_earned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slp_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slp_user_id" text NOT NULL,
	"patient_user_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"assigned_exercises" jsonb,
	"notes" text,
	"connected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speech_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"session_id" uuid,
	"fluency_score" real,
	"speaking_rate" real,
	"stuttered_syllables_percent" real,
	"disfluency_map" jsonb,
	"stutter_fingerprint_json" jsonb,
	"trigger_phonemes" jsonb,
	"analyzed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speech_situations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"situation_type" text NOT NULL,
	"description" text,
	"anxiety_before" integer,
	"anxiety_after" integer,
	"fluency_rating" integer,
	"techniques_used" jsonb,
	"outcome" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"plan" "subscription_plan" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "technique_outcomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"session_id" uuid,
	"technique_id" text NOT NULL,
	"category" "technique_category" NOT NULL,
	"confidence_delta" integer,
	"completion_rate" real,
	"self_rated_fluency" integer,
	"duration_seconds" integer,
	"content_level" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thought_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"situation" text NOT NULL,
	"automatic_thought" text NOT NULL,
	"emotions" jsonb NOT NULL,
	"evidence_for" text,
	"evidence_against" text,
	"balanced_thought" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"achievements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"streak_freeze_tokens" integer DEFAULT 0 NOT NULL,
	"last_practice_date" timestamp,
	"total_practice_seconds" integer DEFAULT 0 NOT NULL,
	"total_exercises_completed" integer DEFAULT 0 NOT NULL,
	"current_day" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "user_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "voice_journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"recording_url" text NOT NULL,
	"transcription" text,
	"fluency_score" real,
	"emotional_tag" "emotional_tag",
	"disfluency_map" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"week_number" text NOT NULL,
	"prompt" text NOT NULL,
	"transcription" text NOT NULL,
	"duration_seconds" integer,
	"percent_ss" real,
	"severity_rating" "severity_rating",
	"fluency_score" integer,
	"speaking_rate" real,
	"total_syllables" integer,
	"stuttered_syllables" integer,
	"disfluency_breakdown" jsonb,
	"technique_analysis" jsonb,
	"rate_analysis" jsonb,
	"week_over_week_change" jsonb,
	"insights" jsonb,
	"phoneme_heatmap" jsonb,
	"share_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_audits_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_community_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."community_challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_completions" ADD CONSTRAINT "exercise_completions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_completions" ADD CONSTRAINT "exercise_completions_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speech_analyses" ADD CONSTRAINT "speech_analyses_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technique_outcomes" ADD CONSTRAINT "technique_outcomes_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;