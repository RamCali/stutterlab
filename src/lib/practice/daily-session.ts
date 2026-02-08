import type { TechniqueCategory } from "@/lib/curriculum/technique-categories";
import {
  FLUENCY_SHAPING_TECHNIQUES,
  MODIFICATION_TECHNIQUES,
} from "@/lib/curriculum/technique-categories";
import type { TechniqueOutcomeSummary } from "@/lib/actions/user-progress";

/* ─── All 8 techniques ─── */

const ALL_TECHNIQUE_IDS = [
  ...FLUENCY_SHAPING_TECHNIQUES,
  ...MODIFICATION_TECHNIQUES,
] as const;

export type Technique = (typeof ALL_TECHNIQUE_IDS)[number];

export interface TechniqueInfo {
  id: Technique;
  name: string;
  tip: string;
  description: string;
  category: TechniqueCategory;
}

const TECHNIQUE_DATA: Record<string, TechniqueInfo> = {
  // ── Fluency Shaping ──
  easy_onset: {
    id: "easy_onset",
    name: "Easy Onset",
    tip: "Begin each word with a soft, breathy start. Let air flow before voicing.",
    description:
      "Start words gently by letting airflow precede voicing. Reduces blocks on initial sounds.",
    category: "fluency_shaping",
  },
  light_contact: {
    id: "light_contact",
    name: "Light Contact",
    tip: "Use minimal pressure when your lips, tongue, and teeth make contact for sounds.",
    description:
      "Reduce articulatory tension by keeping contacts light. Prevents getting 'stuck' on consonants.",
    category: "fluency_shaping",
  },
  prolonged_speech: {
    id: "prolonged_speech",
    name: "Prolonged Speech",
    tip: "Stretch vowel sounds and blend words together for continuous, flowing speech.",
    description:
      "Slow your rate by stretching vowels. Continuous phonation activates different neural pathways.",
    category: "fluency_shaping",
  },
  pausing: {
    id: "pausing",
    name: "Pausing & Phrasing",
    tip: "Break sentences into short phrase groups. Pause naturally between phrases.",
    description:
      "Chunk speech into manageable phrases with natural pauses. Reduces time pressure and improves fluency.",
    category: "fluency_shaping",
  },
  // ── Stuttering Modification ──
  cancellation: {
    id: "cancellation",
    name: "Cancellation",
    tip: "After stuttering on a word, pause, then say it again using a technique.",
    description:
      "Post-stutter correction that builds awareness and voluntary control over speech motor patterns.",
    category: "stuttering_modification",
  },
  pull_out: {
    id: "pull_out",
    name: "Pull-Out",
    tip: "While in a stutter, consciously slow down and ease out of the block smoothly.",
    description:
      "Mid-stutter technique: shift from right-hemisphere compensation back to left-hemisphere control in real-time.",
    category: "stuttering_modification",
  },
  preparatory_set: {
    id: "preparatory_set",
    name: "Preparatory Set",
    tip: "Before a feared word, pre-plan your articulatory position and use gentle onset.",
    description:
      "The most proactive modification technique. Prevents stuttering before it occurs by pre-setting the motor plan.",
    category: "stuttering_modification",
  },
  voluntary_stuttering: {
    id: "voluntary_stuttering",
    name: "Voluntary Stuttering",
    tip: "Intentionally stutter on easy words to reduce fear and avoidance behaviors.",
    description:
      "Deliberate disfluency that lowers the brain's threat response and breaks the avoidance cycle.",
    category: "stuttering_modification",
  },
};

/**
 * Legacy: simple 3-technique rotation for backward compatibility.
 * Used by existing code that calls getTodaysTechnique(day).
 */
const LEGACY_TECHNIQUES: Technique[] = ["easy_onset", "light_contact", "pausing"];

export function getTodaysTechnique(day: number): TechniqueInfo {
  const technique = LEGACY_TECHNIQUES[(day - 1) % LEGACY_TECHNIQUES.length];
  return TECHNIQUE_DATA[technique];
}

/**
 * Adaptive technique selection that considers:
 * - Day/phase (foundation uses fluency shaping only)
 * - User outcome data (weights toward better-performing category)
 */
export function getAdaptiveTechnique(
  day: number,
  outcomes?: TechniqueOutcomeSummary | null
): TechniqueInfo {
  // Phase 1 (days 1-14): Fluency shaping only (foundation)
  if (day <= 14) {
    const idx = (day - 1) % FLUENCY_SHAPING_TECHNIQUES.length;
    return TECHNIQUE_DATA[FLUENCY_SHAPING_TECHNIQUES[idx]];
  }

  // Phase 2 (days 15-30): Mix fluency shaping + first modification technique
  if (day <= 30) {
    if (day % 3 === 0) {
      return TECHNIQUE_DATA["cancellation"]; // introduce modification
    }
    const fsIdx = (day - 1) % FLUENCY_SHAPING_TECHNIQUES.length;
    return TECHNIQUE_DATA[FLUENCY_SHAPING_TECHNIQUES[fsIdx]];
  }

  // Days 31+: Use outcome data to weight selection
  const weight = outcomes?.recommendedWeight ?? 0.5;

  // Deterministic "random" based on day number
  const dayHash = ((day * 2654435761) >>> 0) / 4294967296; // Knuth multiplicative hash → 0-1

  let pool: readonly string[];
  if (dayHash < weight) {
    pool = FLUENCY_SHAPING_TECHNIQUES;
  } else {
    pool = MODIFICATION_TECHNIQUES;
  }

  const idx = (day - 1) % pool.length;
  return TECHNIQUE_DATA[pool[idx]];
}

export function getTechniqueById(id: string): TechniqueInfo | null {
  return TECHNIQUE_DATA[id] ?? null;
}

export function getContentLevel(
  day: number
): "words" | "phrases" | "sentences" | "paragraphs" {
  if (day <= 14) return "words";
  if (day <= 30) return "phrases";
  if (day <= 50) return "sentences";
  return "paragraphs";
}

const EASY_SCENARIOS = ["ordering-food", "small-talk", "asking-directions"];

export function getScenarioForDay(day: number): string {
  return EASY_SCENARIOS[(day - 1) % EASY_SCENARIOS.length];
}

/* ─── Reading content for technique practice ─── */
export const readingContent = {
  words: [
    "hello", "morning", "water", "today", "happy",
    "beautiful", "sunshine", "together", "wonderful", "practice",
    "breathing", "gentle", "slowly", "natural", "progress",
  ],
  phrases: [
    "Good morning",
    "How are you today",
    "I would like to order",
    "My name is",
    "Thank you very much",
    "Nice to meet you",
    "Can I help you",
    "I'm doing well",
  ],
  sentences: [
    "I am practicing my speech techniques today.",
    "The weather is beautiful this morning.",
    "Could you please help me find the right section?",
    "I'd like to schedule an appointment for next week.",
    "Thank you for your patience and understanding.",
    "I'm working on improving my fluency every day.",
  ],
  paragraphs: [
    "Speaking is a skill that improves with practice. Every time you use your techniques — gentle onset, light contact, or pacing — you build new neural pathways. The key is consistency, not perfection. Some days will feel easier than others, and that is completely normal.",
    "The ocean waves rolled gently onto the shore as the sun began to set. A cool breeze carried the scent of salt and seaweed. Children played near the water's edge while their parents watched from colorful beach chairs. It was the perfect end to a long summer day.",
  ],
};
