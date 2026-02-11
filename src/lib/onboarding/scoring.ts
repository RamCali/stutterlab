/**
 * Assessment scoring algorithm for the Speech Assessment quiz funnel.
 * Produces severity + confidence scores and a user profile that
 * influences curriculum emphasis.
 *
 * Severity is computed from three observable dimensions (inspired by SSI-4):
 *  1. Frequency  — how often stuttering occurs (~40% weight)
 *  2. Duration   — how long each stutter lasts (~30% weight)
 *  3. Impact     — how much it affects daily life (~30% weight)
 */

export type AssessmentProfile =
  | "avoidance-heavy"
  | "anxiety-heavy"
  | "technique-ready"
  | "balanced";

export interface AssessmentScores {
  severityScore: number;     // 1-100
  confidenceScore: number;   // 1-100
  profile: AssessmentProfile;
  /** Derived from severityScore for DB enum backwards compatibility */
  severityLabel: "mild" | "moderate" | "severe";
  recommendedEmphasis: {
    fluencyShaping: number;          // 0-1
    stutteringModification: number;  // 0-1
    cbt: number;                     // 0-1
  };
}

export interface ScoringInput {
  /** How often stuttering occurs in conversation */
  stutterFrequency: string;   // "rarely" | "sometimes" | "often" | "very-often"
  /** How long each stutter event lasts */
  stutterDuration: string;    // "brief" | "moderate" | "long" | "very-long"
  /** How much stuttering affects daily life */
  stutterImpact: string;      // "minimal" | "some" | "significant" | "severe"
  confidenceRatings: Record<string, number>; // situation -> 1-5
  avoidanceBehaviors: string[];
  stutteringTypes: string[];
  speakingFrequency: string;  // "rarely" | "sometimes" | "often" | "daily"
  fearedSituations: string[];
}

/* ─── Dimension scoring tables ─── */

const FREQUENCY_SCORES: Record<string, number> = {
  "rarely": 15,
  "sometimes": 35,
  "often": 60,
  "very-often": 85,
};

const DURATION_SCORES: Record<string, number> = {
  "brief": 15,
  "moderate": 35,
  "long": 60,
  "very-long": 85,
};

const IMPACT_SCORES: Record<string, number> = {
  "minimal": 15,
  "some": 35,
  "significant": 60,
  "severe": 85,
};

const SPEAKING_FREQ_ADJUSTMENT: Record<string, number> = {
  rarely: 5,
  sometimes: 2,
  often: -2,
  daily: -4,
};

export function calculateScores(data: ScoringInput): AssessmentScores {
  // --- Severity Score (3-dimension composite) ---
  const freqScore = FREQUENCY_SCORES[data.stutterFrequency] ?? 35;
  const durScore = DURATION_SCORES[data.stutterDuration] ?? 35;
  const impactScore = IMPACT_SCORES[data.stutterImpact] ?? 35;

  // Weighted composite: frequency 40%, duration 30%, impact 30%
  let severityScore = freqScore * 0.4 + durScore * 0.3 + impactScore * 0.3;

  // Adjust for stuttering types (more types = more complex presentation)
  severityScore += data.stutteringTypes.length * 3;

  // Adjust for avoidance behaviors
  severityScore += data.avoidanceBehaviors.length * 2;

  // Adjust for speaking frequency (frequent speakers get small bonus)
  severityScore += SPEAKING_FREQ_ADJUSTMENT[data.speakingFrequency] ?? 0;

  // Adjust for feared situations count
  if (data.fearedSituations.length > 5) severityScore += 4;
  else if (data.fearedSituations.length > 3) severityScore += 2;

  severityScore = Math.max(1, Math.min(100, Math.round(severityScore)));

  // --- Confidence Score ---
  const ratings = Object.values(data.confidenceRatings);
  let confidenceScore: number;

  if (ratings.length === 0) {
    confidenceScore = 50;
  } else {
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    // Scale 1-5 to 0-100
    confidenceScore = Math.round(((avg - 1) / 4) * 100);
  }

  // Avoidance lowers confidence
  confidenceScore -= data.avoidanceBehaviors.length * 4;
  confidenceScore = Math.max(1, Math.min(100, confidenceScore));

  // --- Profile ---
  const profile = determineProfile(confidenceScore, data.avoidanceBehaviors.length, severityScore);

  // --- Recommended Emphasis ---
  const recommendedEmphasis = getEmphasis(profile);

  // --- Derive severity label for DB enum ---
  const severityLabel: "mild" | "moderate" | "severe" =
    severityScore <= 33 ? "mild" : severityScore <= 66 ? "moderate" : "severe";

  return {
    severityScore,
    confidenceScore,
    profile,
    severityLabel,
    recommendedEmphasis,
  };
}

function determineProfile(
  confidence: number,
  avoidanceCount: number,
  severity: number
): AssessmentProfile {
  if (avoidanceCount >= 3 && confidence < 40) return "avoidance-heavy";
  if (confidence < 30) return "anxiety-heavy";
  if (confidence > 55 && severity < 60) return "technique-ready";
  return "balanced";
}

function getEmphasis(profile: AssessmentProfile) {
  switch (profile) {
    case "avoidance-heavy":
      return { fluencyShaping: 0.35, stutteringModification: 0.30, cbt: 0.35 };
    case "anxiety-heavy":
      return { fluencyShaping: 0.30, stutteringModification: 0.25, cbt: 0.45 };
    case "technique-ready":
      return { fluencyShaping: 0.45, stutteringModification: 0.40, cbt: 0.15 };
    case "balanced":
      return { fluencyShaping: 0.40, stutteringModification: 0.35, cbt: 0.25 };
  }
}

/** Get a human-readable description for a profile */
export function getProfileDescription(profile: AssessmentProfile): string {
  switch (profile) {
    case "avoidance-heavy":
      return "You tend to avoid speaking situations. Your program emphasizes gradual exposure and confidence building alongside speech techniques.";
    case "anxiety-heavy":
      return "Speaking anxiety is your main challenge. Your program includes extra mindfulness and CBT modules alongside core techniques.";
    case "technique-ready":
      return "You're ready to dive into techniques. Your program focuses heavily on speech modification skills with progressive real-world practice.";
    case "balanced":
      return "You have a well-rounded profile. Your program balances technique practice, confidence building, and real-world exposure evenly.";
  }
}
