/**
 * Shared types for StutterLab's analysis engine.
 * All 7 advanced intelligence features share these types.
 */

// ─── Feature 1: Phoneme-Level Difficulty Mapping ───

export interface PhonemeDifficulty {
  phoneme: string;
  totalAttempts: number;
  disfluencyCount: number;
  difficultyScore: number; // 0-1, higher = harder (Bayesian)
  trend: "improving" | "stable" | "worsening";
  lastSeen: string; // ISO date
  triggerWords: string[]; // words that triggered disfluencies on this phoneme
}

export interface PhonemeHeatmapData {
  phonemes: PhonemeDifficulty[];
  topDifficult: string[]; // top 5 hardest phonemes
  totalAnalyzed: number;
  lastUpdated: string;
}

// ─── Feature 2: Technique Detection Enhancement ───

export type TechniqueType =
  | "gentle_onset"
  | "pacing"
  | "rate_compliance"
  | "prolonged_speech"
  | "cancellation"
  | "pull_out";

export interface TechniqueMasteryData {
  technique: TechniqueType;
  totalDetections: number;
  highConfidenceCount: number;
  highConfidenceRate: number; // 0-1
  sessionsUsed: number;
  masteryLevel: "beginner" | "intermediate" | "advanced";
  trend: "improving" | "stable" | "declining";
  lastUsed: string | null;
}

export interface TechniqueHistory {
  techniques: TechniqueMasteryData[];
  recommendations: string[];
  overallMasteryScore: number; // 0-100
}

/** Rich format stored in aiConversations.techniquesUsed (new format) */
export interface TechniqueDetectionRecord {
  technique: string;
  count: number;
  highConfidence: number;
  lowConfidence: number;
}

// ─── Feature 3: Emotional State Adaptation ───

export type EmotionalState = "calm" | "anxious" | "frustrated" | "confident";

export interface EmotionSnapshot {
  state: EmotionalState;
  confidence: number; // 0-1
  indicators: string[];
  pitchVariance: number;
  paceChange: number;
  volumeStability: number;
  pauseFrequency: number;
  timestamp: number;
}

// ─── Feature 4: Predictive Coaching ───

export type PredictionType =
  | "day_of_week"
  | "time_of_day"
  | "scenario"
  | "post_gap"
  | "phoneme";

export interface Prediction {
  type: PredictionType;
  description: string;
  confidence: "low" | "medium" | "high";
  suggestion: string;
}

export interface CoachingInsight {
  predictions: Prediction[];
  upcomingChallenges: string[];
  warmupSuggestions: string[];
  motivationalNote: string;
}

// ─── Feature 5: Measured Roleplay (Session Scorecard) ───

export interface SessionDimension {
  name: string;
  score: number; // 0-100
  grade: string; // A+, A, A-, B+, etc.
  trend: "improving" | "stable" | "declining" | null;
  notes: string;
}

export interface SessionScorecard {
  overall: { score: number; grade: string };
  dimensions: SessionDimension[];
  comparisonToAverage: {
    dimension: string;
    userScore: number;
    avgScore: number;
    delta: number;
  }[] | null;
  comparisonToPrevious: {
    dimension: string;
    current: number;
    previous: number;
    change: number;
  }[] | null;
}

export interface SessionComparison {
  averages: Record<string, number>;
  previousSession: SessionScorecard | null;
  totalSessionsForScenario: number;
}

/** Turn data shape for scoring (matches VoiceConversation TurnMetrics) */
export interface ScoringTurn {
  role: "user" | "assistant";
  text: string;
  disfluencyCount: number;
  speakingRate: number;
  techniquesUsed?: string[];
  vocalEffort?: number;
  spmZone?: "slow" | "target" | "fast";
}

// ─── Feature 6: Cohort Intelligence ───

export type CohortCategory =
  | "motivation"
  | "comparison"
  | "milestone"
  | "technique"
  | "scenario";

export interface CohortInsight {
  id: string;
  text: string;
  category: CohortCategory;
  context: string[]; // When to show: ["progress_page", "phone-call", "day_30", etc.]
  source?: string; // Research citation
}

export interface CohortContext {
  page?: string;
  scenario?: string;
  day?: number;
  fluencyScore?: number;
  streak?: number;
  technique?: string;
}

// ─── Feature 7: Transfer Gap Detection ───

export interface TransferGap {
  id: string;
  from: string; // e.g., "Reading exercises"
  to: string; // e.g., "Conversational speech"
  fromScore: number;
  toScore: number;
  fluencyDrop: number; // percentage points
  severity: "mild" | "moderate" | "severe";
  suggestedBridge: string;
  dataPoints: number;
}

export interface BridgingExercise {
  title: string;
  description: string;
  targetGap: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedMinutes: number;
  href?: string; // link to the exercise in the app
}

export interface TransferReport {
  gaps: TransferGap[];
  recommendations: string[];
  bridgingExercises: BridgingExercise[];
  overallTransferScore: number; // 0-100 (100 = perfect transfer)
}

// ─── Shared Input Types for Server Actions ───

export interface TransferGapInput {
  conversations: {
    fluencyScore: number | null;
    stressLevel: number | null;
    completedAt: Date;
    techniquesUsed: unknown;
  }[];
  situations: {
    fluencyRating: number | null;
    anxietyBefore: number | null;
    anxietyAfter: number | null;
    techniquesUsed: unknown;
    createdAt: Date;
  }[];
  reports: {
    fluencyScore: number | null;
    createdAt: Date;
  }[];
}

export interface PredictiveInput {
  sessions: {
    startedAt: Date;
    aiFluencyScore: number | null;
    exerciseType: string | null;
    durationSeconds: number | null;
  }[];
  conversations: {
    scenarioType: string;
    fluencyScore: number | null;
    stressLevel: number | null;
    completedAt: Date;
  }[];
  situations: {
    situationType: string;
    anxietyBefore: number | null;
    fluencyRating: number | null;
    createdAt: Date;
  }[];
  currentStreak: number;
  lastPracticeDate: Date | null;
}
