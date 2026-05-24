export type DisfluencyCategory = "typical" | "stutter-like";

export interface DisfluencyType {
  id: string;
  label: string;
  description: string;
  example: string;
  category: DisfluencyCategory;
  emoji: string;
}

export const DISFLUENCY_TYPES: DisfluencyType[] = [
  {
    id: "phrase-repetition",
    label: "Phrase repetitions",
    description: "Repeating a short phrase while planning language.",
    example: "Where is... where is the ball?",
    category: "typical",
    emoji: "💬",
  },
  {
    id: "whole-word-repetition",
    label: "Whole-word repetitions",
    description: "Repeating a full word once or twice.",
    example: "Where... where is the ball?",
    category: "typical",
    emoji: "🔁",
  },
  {
    id: "interjection",
    label: "Interjections",
    description: "Adding fillers while thinking.",
    example: "Where... um... is the ball?",
    category: "typical",
    emoji: "💭",
  },
  {
    id: "revision",
    label: "Revisions",
    description: "Changing wording mid-sentence.",
    example: "What... where is the ball?",
    category: "typical",
    emoji: "✏️",
  },
  {
    id: "hesitation",
    label: "Hesitations",
    description: "A longer pause while thinking.",
    example: "I want... the blue one.",
    category: "typical",
    emoji: "⏸️",
  },
  {
    id: "sound-repetition",
    label: "Sound repetitions",
    description: "Repeating the first sound in a word.",
    example: "sh-sh-shoe",
    category: "stutter-like",
    emoji: "🔂",
  },
  {
    id: "syllable-repetition",
    label: "Syllable repetitions",
    description: "Repeating part of a word.",
    example: "ba-ba-ball",
    category: "stutter-like",
    emoji: "🔁",
  },
  {
    id: "prolongation",
    label: "Prolongations",
    description: "Stretching a sound longer than intended.",
    example: "Wwwwwhere is it?",
    category: "stutter-like",
    emoji: "➡️",
  },
  {
    id: "block",
    label: "Blocks",
    description: "A tense stop where speech or airflow feels stuck.",
    example: "Mouth is ready, but no sound comes out.",
    category: "stutter-like",
    emoji: "🧱",
  },
];

export const TYPICAL_DISFLUENCY_IDS = DISFLUENCY_TYPES
  .filter((type) => type.category === "typical")
  .map((type) => type.id);

export const STUTTER_LIKE_DISFLUENCY_IDS = DISFLUENCY_TYPES
  .filter((type) => type.category === "stutter-like")
  .map((type) => type.id);

export interface ReferralRiskInput {
  disfluencyTypes?: string[];
  fluencyPersistence?: string;
  avoidanceBehaviors?: string[];
  physicalBehaviors?: string[];
  impact?: string;
  fastOrUnclearSpeech?: string;
}

export interface ReferralGuidance {
  shouldRecommendSlp: boolean;
  urgency: "routine" | "recommended";
  reasons: string[];
}

export function getReferralGuidance(input: ReferralRiskInput): ReferralGuidance {
  const reasons: string[] = [];
  const disfluencyTypes = input.disfluencyTypes ?? [];
  const hasStutterLike = disfluencyTypes.some((id) =>
    STUTTER_LIKE_DISFLUENCY_IDS.includes(id)
  );

  if (input.fluencyPersistence === "years" || input.fluencyPersistence === "worsening") {
    reasons.push("fluency concerns are longstanding or worsening");
  }

  if (hasStutterLike) {
    reasons.push("stuttering-like practice patterns are present");
  }

  if ((input.avoidanceBehaviors?.length ?? 0) >= 3) {
    reasons.push("strong avoidance patterns are present");
  }

  if ((input.physicalBehaviors?.length ?? 0) > 0) {
    reasons.push("speech-linked physical behaviors are present");
  }

  if (input.impact === "significant" || input.impact === "severe") {
    reasons.push("speech concerns have significant daily-life impact");
  }

  if (input.fastOrUnclearSpeech === "often" || input.fastOrUnclearSpeech === "very-often") {
    reasons.push("fast or hard-to-understand speech patterns are present");
  }

  const shouldRecommendSlp = reasons.length > 0;

  return {
    shouldRecommendSlp,
    urgency: shouldRecommendSlp ? "recommended" : "routine",
    reasons,
  };
}
