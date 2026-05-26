/**
 * Evidence tiers for techniques and modalities.
 * Used in UI badges — not a claim that the StutterLab app protocol is RCT-validated.
 */

export type EvidenceTier = "strong" | "moderate" | "emerging" | "mixed";

export const EVIDENCE_TIER_LABELS: Record<EvidenceTier, string> = {
  strong: "Strong evidence",
  moderate: "Moderate evidence",
  emerging: "Emerging evidence",
  mixed: "Mixed evidence",
};

export const EVIDENCE_TIER_DESCRIPTIONS: Record<EvidenceTier, string> = {
  strong:
    "Supported by systematic reviews or multiple adult RCTs (e.g. fluency shaping, CBT for speech anxiety).",
  moderate:
    "Supported in research with smaller or more variable effects (e.g. stuttering modification).",
  emerging:
    "Promising mechanisms; limited long-term or conversational generalization data.",
  mixed:
    "Helpful for some people in structured practice; large individual differences in real conversation.",
};

export const EVIDENCE_TIER_STYLES: Record<
  EvidenceTier,
  { badge: string; border: string }
> = {
  strong: {
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
  },
  moderate: {
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30",
  },
  emerging: {
    badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    border: "border-amber-500/30",
  },
  mixed: {
    badge: "bg-orange-500/15 text-orange-800 dark:text-orange-300",
    border: "border-orange-500/30",
  },
};

/** Map exercise IDs to evidence tier */
export const EXERCISE_EVIDENCE_TIER: Record<string, EvidenceTier> = {
  reading: "moderate",
  "gentle-onset": "strong",
  "light-contact": "strong",
  "prolonged-speech": "strong",
  pausing: "strong",
  cancellation: "moderate",
  "pull-out": "moderate",
  "preparatory-set": "moderate",
  "voluntary-stuttering": "moderate",
  "tongue-twisters": "moderate",
  "reading-to-ai": "emerging",
  "daf-assisted-reading": "mixed",
  "rhythm-reading": "mixed",
  "mirror-practice": "mixed",
};

export const MODALITY_EVIDENCE_TIER: Record<string, EvidenceTier> = {
  daf: "mixed",
  faf: "mixed",
  choral: "mixed",
  metronome: "mixed",
  cbt: "strong",
  exposure: "strong",
  disclosure: "moderate",
  ai_simulation: "emerging",
};

export const EVIDENCE_DISCLAIMER =
  "Built from peer-reviewed speech and psychology techniques. StutterLab daily practice is not a substitute for care from a licensed SLP or mental health professional.";
