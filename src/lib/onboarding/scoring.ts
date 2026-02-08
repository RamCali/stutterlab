/**
 * Assessment scoring algorithm for the Speech Assessment quiz funnel.
 * Produces severity + confidence scores and a user profile that
 * influences curriculum emphasis.
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
  recommendedEmphasis: {
    fluencyShaping: number;          // 0-1
    stutteringModification: number;  // 0-1
    cbt: number;                     // 0-1
  };
}

interface ScoringInput {
  severity: "mild" | "moderate" | "severe" | null;
  confidenceRatings: Record<string, number>; // situation -> 1-5
  avoidanceBehaviors: string[];
  stutteringTypes: string[];
  speakingFrequency: string; // "rarely" | "sometimes" | "often" | "daily"
  fearedSituations: string[];
}

const SEVERITY_BASE: Record<string, number> = {
  mild: 25,
  moderate: 50,
  severe: 75,
};

const FREQUENCY_ADJUSTMENT: Record<string, number> = {
  rarely: 10,
  sometimes: 5,
  often: -3,
  daily: -5,
};

export function calculateScores(data: ScoringInput): AssessmentScores {
  // --- Severity Score ---
  let severityScore = SEVERITY_BASE[data.severity || "moderate"] ?? 50;

  // Adjust for stuttering types (more types = more complex)
  severityScore += data.stutteringTypes.length * 4;

  // Adjust for avoidance behaviors
  severityScore += data.avoidanceBehaviors.length * 3;

  // Adjust for speaking frequency
  severityScore += FREQUENCY_ADJUSTMENT[data.speakingFrequency] ?? 0;

  // Adjust for feared situations count
  if (data.fearedSituations.length > 5) severityScore += 5;
  else if (data.fearedSituations.length > 3) severityScore += 2;

  severityScore = Math.max(1, Math.min(100, Math.round(severityScore)));

  // --- Confidence Score ---
  const ratings = Object.values(data.confidenceRatings);
  let confidenceScore: number;

  if (ratings.length === 0) {
    confidenceScore = 50; // default
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

  return {
    severityScore,
    confidenceScore,
    profile,
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
