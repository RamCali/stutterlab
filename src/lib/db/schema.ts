import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  real,
  uuid,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
type AdapterAccountType = "oauth" | "oidc" | "email" | "credentials";

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "slp"]);
export const severityEnum = pgEnum("severity", ["mild", "moderate", "severe"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "free",
  "core",
  "pro",
  "elite",
  "slp",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "trialing",
  "incomplete",
]);
export const exerciseTypeEnum = pgEnum("exercise_type", [
  "reading",
  "gentle_onset",
  "light_contact",
  "prolonged_speech",
  "breathing",
  "pausing",
  "cancellation",
  "pull_out",
  "preparatory_set",
  "voluntary_stuttering",
  "tongue_twister",
  "phone_number",
]);
export const exerciseDifficultyEnum = pgEnum("exercise_difficulty", [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);
export const emotionalTagEnum = pgEnum("emotional_tag", [
  "confident",
  "anxious",
  "frustrated",
  "proud",
  "neutral",
  "hopeful",
  "discouraged",
]);
export const techniqueCategoryEnum = pgEnum("technique_category", [
  "fluency_shaping",
  "stuttering_modification",
]);

// ==================== NEXTAUTH TABLES ====================

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const authSessions = pgTable("auth_sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

// ==================== USER PROFILES ====================

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  role: userRoleEnum("role").default("user").notNull(),
  stutteringSeverity: severityEnum("stuttering_severity"),
  treatmentPath: jsonb("treatment_path"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  // SLP-specific fields
  slpCredentials: text("slp_credentials"),
  slpSpecialties: jsonb("slp_specialties"),
  slpAvailability: jsonb("slp_availability"),
  slpHourlyRate: real("slp_hourly_rate"),
  slpBio: text("slp_bio"),
  preferredApproach: techniqueCategoryEnum("preferred_approach"),
  approachConfidence: real("approach_confidence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== EXERCISES ====================

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: exerciseTypeEnum("type").notNull(),
  technique: text("technique").notNull(),
  difficulty: exerciseDifficultyEnum("difficulty").notNull(),
  instructions: text("instructions").notNull(),
  contentJson: jsonb("content_json").notNull(), // exercise-specific data (text to read, breathing pattern, etc.)
  audioUrl: text("audio_url"),
  durationSeconds: integer("duration_seconds"),
  isPremium: boolean("is_premium").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== SESSIONS & TRACKING ====================

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  durationSeconds: integer("duration_seconds"),
  exerciseType: text("exercise_type"),
  toolsUsed: jsonb("tools_used"), // ["daf", "faf", "metronome", "choral"]
  selfRatedFluency: integer("self_rated_fluency"), // 1-10
  aiFluencyScore: real("ai_fluency_score"), // 0-100
  techniqueCategory: techniqueCategoryEnum("technique_category"),
  confidenceBefore: integer("confidence_before"), // 1-10
  confidenceAfter: integer("confidence_after"), // 1-10
  notes: text("notes"),
  recordingUrl: text("recording_url"),
});

export const exerciseCompletions = pgTable("exercise_completions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  sessionId: uuid("session_id").references(() => sessions.id),
  exerciseId: uuid("exercise_id")
    .references(() => exercises.id)
    .notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  xpEarned: integer("xp_earned").default(0).notNull(),
  recordingUrl: text("recording_url"),
  aiFeedback: text("ai_feedback"),
});

// ==================== TECHNIQUE OUTCOMES (A/B TESTING) ====================

export const techniqueOutcomes = pgTable("technique_outcomes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  sessionId: uuid("session_id").references(() => sessions.id),
  techniqueId: text("technique_id").notNull(),
  category: techniqueCategoryEnum("category").notNull(),
  confidenceDelta: integer("confidence_delta"),
  completionRate: real("completion_rate"),
  selfRatedFluency: integer("self_rated_fluency"),
  durationSeconds: integer("duration_seconds"),
  contentLevel: text("content_level"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== VOICE JOURNAL ====================

export const voiceJournalEntries = pgTable("voice_journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  recordingUrl: text("recording_url").notNull(),
  transcription: text("transcription"),
  fluencyScore: real("fluency_score"),
  emotionalTag: emotionalTagEnum("emotional_tag"),
  disfluencyMap: jsonb("disfluency_map"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== AI ANALYSIS ====================

export const speechAnalyses = pgTable("speech_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  sessionId: uuid("session_id").references(() => sessions.id),
  fluencyScore: real("fluency_score"),
  speakingRate: real("speaking_rate"), // words per minute
  stutteredSyllablesPercent: real("stuttered_syllables_percent"),
  disfluencyMap: jsonb("disfluency_map"), // { blocks: [], prolongations: [], repetitions: [], interjections: [] }
  stutterFingerprintJson: jsonb("stutter_fingerprint_json"),
  triggerPhonemes: jsonb("trigger_phonemes"),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  scenarioType: text("scenario_type").notNull(),
  messages: jsonb("messages").notNull(), // [{role, content, timestamp}]
  fluencyScore: real("fluency_score"),
  disfluencyMoments: jsonb("disfluency_moments"),
  techniquesUsed: jsonb("techniques_used"),
  durationSeconds: integer("duration_seconds"),
  stressLevel: integer("stress_level"), // null = calm, 1-3 = stress levels
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// ==================== GAMIFICATION ====================

export const userStats = pgTable("user_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  totalXp: integer("total_xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  achievements: jsonb("achievements").default([]).notNull(),
  streakFreezeTokens: integer("streak_freeze_tokens").default(0).notNull(),
  lastPracticeDate: timestamp("last_practice_date"),
  totalPracticeSeconds: integer("total_practice_seconds").default(0).notNull(),
  totalExercisesCompleted: integer("total_exercises_completed")
    .default(0)
    .notNull(),
  currentDay: integer("current_day").default(1).notNull(),
});

// ==================== COMMUNITY ====================

export const communityPosts = pgTable("community_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  category: text("category").notNull(), // techniques, wins, support, qa, resources
  title: text("title").notNull(),
  content: text("content").notNull(),
  audioClipUrl: text("audio_clip_url"),
  upvotes: integer("upvotes").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityComments = pgTable("community_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .references(() => communityPosts.id)
    .notNull(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== SLP CONNECTIONS ====================

export const slpConnections = pgTable("slp_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  slpUserId: text("slp_user_id").notNull(),
  patientUserId: text("patient_user_id").notNull(),
  status: text("status").default("pending").notNull(), // pending, active, declined, ended
  assignedExercises: jsonb("assigned_exercises"),
  notes: text("notes"),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
});

// ==================== SUBSCRIPTIONS ====================

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: subscriptionPlanEnum("plan").default("free").notNull(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== CBT ====================

export const thoughtRecords = pgTable("thought_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  situation: text("situation").notNull(),
  automaticThought: text("automatic_thought").notNull(),
  emotions: jsonb("emotions").notNull(),
  evidenceFor: text("evidence_for"),
  evidenceAgainst: text("evidence_against"),
  balancedThought: text("balanced_thought"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== SPEECH SITUATIONS ====================

export const speechSituations = pgTable("speech_situations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  situationType: text("situation_type").notNull(),
  description: text("description"),
  anxietyBefore: integer("anxiety_before"), // 1-10
  anxietyAfter: integer("anxiety_after"), // 1-10
  fluencyRating: integer("fluency_rating"), // 1-10
  techniquesUsed: jsonb("techniques_used"),
  outcome: text("outcome"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== FEARED WORDS ====================

export const fearedWords = pgTable("feared_words", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  word: text("word").notNull(),
  phoneme: text("phoneme"),
  difficulty: text("difficulty").default("medium").notNull(), // easy, medium, hard
  practiceCount: integer("practice_count").default(0).notNull(),
  mastered: boolean("mastered").default(false).notNull(),
  lastPracticed: timestamp("last_practiced"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== AUDIO LAB PRESETS ====================

// ==================== MONTHLY PROGRESS REPORTS ====================

export const severityRatingEnum = pgEnum("severity_rating", [
  "normal",
  "mild",
  "moderate",
  "severe",
]);

export const monthlyReports = pgTable("monthly_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  month: timestamp("month").notNull(), // first day of the month
  passageId: text("passage_id").notNull(),
  audioUrl: text("audio_url"),
  transcription: text("transcription"),
  totalSyllables: integer("total_syllables"),
  stutteredSyllables: integer("stuttered_syllables"),
  percentSS: real("percent_ss"),
  severityRating: severityRatingEnum("severity_rating"),
  speakingRate: real("speaking_rate"),
  fluencyScore: integer("fluency_score"),
  analysisJson: jsonb("analysis_json"), // detailed disfluency breakdown
  recommendationsJson: jsonb("recommendations_json"), // AI-generated clinical recommendations
  shareToken: text("share_token").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== WEEKLY CLINICAL AUDITS ====================

export const weeklyAudits = pgTable("weekly_audits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  weekNumber: text("week_number").notNull(), // ISO week: "2026-W07"
  prompt: text("prompt").notNull(),
  transcription: text("transcription").notNull(),
  durationSeconds: integer("duration_seconds"),
  // Core clinical metrics
  percentSS: real("percent_ss"),
  severityRating: severityRatingEnum("severity_rating"),
  fluencyScore: integer("fluency_score"),
  speakingRate: real("speaking_rate"),
  totalSyllables: integer("total_syllables"),
  stutteredSyllables: integer("stuttered_syllables"),
  // Structured analysis (JSONB)
  disfluencyBreakdown: jsonb("disfluency_breakdown"),
  techniqueAnalysis: jsonb("technique_analysis"),
  rateAnalysis: jsonb("rate_analysis"),
  weekOverWeekChange: jsonb("week_over_week_change"),
  insights: jsonb("insights"),
  phonemeHeatmap: jsonb("phoneme_heatmap"),
  // Sharing
  shareToken: text("share_token").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== COMMUNITY VICTORIES (I DID IT) ====================

export const communityVictories = pgTable("community_victories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  anonymousName: text("anonymous_name").notNull(),
  victoryType: text("victory_type").notNull(), // phone_call, meeting, order, presentation, conversation, asked_help
  description: text("description"),
  celebrateCount: integer("celebrate_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== ACCOUNTABILITY BUDDIES ====================

export const buddyPairings = pgTable("buddy_pairings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userAId: text("user_a_id").notNull(),
  userBId: text("user_b_id").notNull(),
  userAName: text("user_a_name").notNull(), // anonymous name
  userBName: text("user_b_name").notNull(), // anonymous name
  sharedStreak: integer("shared_streak").default(0).notNull(),
  status: text("status").default("active").notNull(), // active, ended
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

// ==================== COMMUNITY CHALLENGES ====================

export const communityChallenges = pgTable("community_challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").default(0).notNull(),
  xpReward: integer("xp_reward").default(100).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  participantCount: integer("participant_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challengeParticipants = pgTable("challenge_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  challengeId: uuid("challenge_id")
    .references(() => communityChallenges.id)
    .notNull(),
  userId: text("user_id").notNull(),
  contribution: integer("contribution").default(0).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// ==================== SHADOWING SCORES ====================

export const shadowingScores = pgTable("shadowing_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  clipId: text("clip_id").notNull(),
  technique: text("technique").notNull(),
  overallScore: integer("overall_score").notNull(),
  rhythmMatch: integer("rhythm_match").notNull(),
  techniqueAccuracy: integer("technique_accuracy").notNull(),
  paceMatch: integer("pace_match").notNull(),
  stars: integer("stars").notNull(),
  feedback: text("feedback"),
  techniqueNotes: text("technique_notes"),
  xpEarned: integer("xp_earned").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== MICRO-CHALLENGE COMPLETIONS ====================

export const microChallengeCompletions = pgTable("micro_challenge_completions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  challengeDate: text("challenge_date").notNull(), // ISO date string (YYYY-MM-DD)
  challengeTitle: text("challenge_title").notNull(),
  technique: text("technique").notNull(),
  xpEarned: integer("xp_earned").default(10).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// ==================== AUDIO LAB PRESETS ====================

export const audioLabPresets = pgTable("audio_lab_presets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  dafEnabled: boolean("daf_enabled").default(false).notNull(),
  dafDelayMs: integer("daf_delay_ms").default(70),
  fafEnabled: boolean("faf_enabled").default(false).notNull(),
  fafSemitones: real("faf_semitones").default(0),
  choralEnabled: boolean("choral_enabled").default(false).notNull(),
  metronomeEnabled: boolean("metronome_enabled").default(false).notNull(),
  metronomeBpm: integer("metronome_bpm").default(80),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
