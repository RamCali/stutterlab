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
  "pro",
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
