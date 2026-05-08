CREATE INDEX IF NOT EXISTS "sessions_user_started_idx" ON "sessions" ("user_id", "started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_conversations_user_completed_idx" ON "ai_conversations" ("user_id", "completed_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "monthly_reports_user_month_idx" ON "monthly_reports" ("user_id", "month");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "weekly_audits_user_created_idx" ON "weekly_audits" ("user_id", "created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_victories_created_idx" ON "community_victories" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shadowing_scores_user_created_idx" ON "shadowing_scores" ("user_id", "created_at");
