export type FluencyPatternGroupId =
  | "typicalLike"
  | "stutteringLike"
  | "clutteringLike";

export interface FluencyPatternGroup {
  id: FluencyPatternGroupId;
  label: string;
  plainLanguage: string;
  keys: string[];
}

export const ADULT_ONLY_NOTE =
  "StutterLab is built for adults 18+ and provides practice support, not diagnosis or a replacement for care from a licensed SLP.";

export const FLUENCY_PATTERN_GROUPS: FluencyPatternGroup[] = [
  {
    id: "typicalLike",
    label: "Typical-like disfluencies",
    plainLanguage:
      "Fillers, revisions, phrase repetitions, and thinking pauses can happen in everyday adult speech, especially under stress or time pressure.",
    keys: [
      "fillers",
      "filler",
      "interjections",
      "interjection",
      "revisions",
      "revision",
      "phrase_repetitions",
      "phrase_repetition",
      "word_repetitions",
      "word_repetition",
      "pauses",
      "pause",
    ],
  },
  {
    id: "stutteringLike",
    label: "Stuttering-like disfluencies",
    plainLanguage:
      "Blocks, prolongations, and sound or syllable repetitions are the patterns most often targeted with stuttering modification and fluency shaping practice.",
    keys: [
      "blocks",
      "block",
      "prolongations",
      "prolongation",
      "sound_repetitions",
      "sound_repetition",
      "syllable_repetitions",
      "syllable_repetition",
      "part_word_repetitions",
      "part_word_repetition",
    ],
  },
  {
    id: "clutteringLike",
    label: "Cluttering-like indicators",
    plainLanguage:
      "Fast or irregular rate, unusual pausing, and reduced clarity can point to pacing needs. These are practice signals, not a diagnosis.",
    keys: [
      "rapid_rate",
      "irregular_rate",
      "unusual_pauses",
      "reduced_clarity",
      "omitted_syllables",
      "collapsed_syllables",
    ],
  },
];

export interface PatternGroupSummary {
  id: FluencyPatternGroupId;
  label: string;
  plainLanguage: string;
  count: number;
  previousCount?: number;
  trend: "increasing" | "decreasing" | "stable" | "new";
}

export function summarizeFluencyPatternGroups(
  disfluencyBreakdown?: Record<string, number>,
  previousBreakdown?: Record<string, number>,
  speakingRate?: number | null,
): PatternGroupSummary[] {
  return FLUENCY_PATTERN_GROUPS.map((group) => {
    let count = countKeys(disfluencyBreakdown, group.keys);
    const previousCount =
      previousBreakdown != null ? countKeys(previousBreakdown, group.keys) : undefined;

    if (group.id === "clutteringLike" && speakingRate != null && speakingRate > 220) {
      count += 1;
    }

    const trend = getTrend(count, previousCount);

    return {
      id: group.id,
      label: group.label,
      plainLanguage: group.plainLanguage,
      count,
      previousCount,
      trend,
    };
  });
}

function countKeys(
  source: Record<string, number> | undefined,
  keys: string[],
): number {
  if (!source) return 0;
  return keys.reduce((sum, key) => sum + (source[key] || 0), 0);
}

function getTrend(
  count: number,
  previousCount: number | undefined,
): PatternGroupSummary["trend"] {
  if (previousCount == null) return count > 0 ? "new" : "stable";
  if (count > previousCount) return "increasing";
  if (count < previousCount) return "decreasing";
  return "stable";
}

export function getReferralReasons(input: {
  persistence?: string;
  avoidanceBehaviors?: string[];
  physicalBehaviors?: string[];
  impact?: string | null;
  fastOrUnclearSpeech?: string;
  patternGroups?: PatternGroupSummary[];
}): string[] {
  const reasons: string[] = [];

  if (input.persistence === "years" || input.persistence === "worsening") {
    reasons.push("longstanding or worsening fluency concerns");
  }

  if ((input.avoidanceBehaviors?.length ?? 0) >= 3) {
    reasons.push("strong avoidance patterns");
  }

  if ((input.physicalBehaviors?.length ?? 0) > 0) {
    reasons.push("speech-linked physical behaviors");
  }

  if (input.impact === "significant" || input.impact === "severe") {
    reasons.push("significant work, social, or emotional impact");
  }

  if (input.fastOrUnclearSpeech === "often" || input.fastOrUnclearSpeech === "very-often") {
    reasons.push("fast or hard-to-understand speech patterns");
  }

  const clutteringGroup = input.patternGroups?.find((group) => group.id === "clutteringLike");
  if (clutteringGroup && clutteringGroup.count > 0) {
    reasons.push("possible cluttering-like practice signals");
  }

  return reasons;
}
