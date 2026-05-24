/**
 * Shared speech metrics utilities used by both the legacy VoiceConversation
 * pipeline and the ElevenLabs Conversational AI hook.
 */

const FILLER_WORDS = ["um", "uh", "er", "ah", "like", "you know", "i mean"];
const MEANINGFUL_REPETITIONS = new Set(["yes", "no", "right", "okay", "ok"]);
const VERBAL_TICS = ["you know", "sort of", "kind of", "i mean", "like"];

export interface DisfluencyMetrics {
  total: number;
  typical: number;
  stutterLike: number;
  fillerCount: number;
  wholeWordRepetitionCount: number;
  possibleSoundRepetitionCount: number;
  possibleSyllableRepetitionCount: number;
}

/** Count disfluencies (filler words + word repetitions) in transcript text */
export function countDisfluencies(text: string): number {
  return classifyDisfluencies(text).total;
}

/** Classify transcript-visible disfluencies into typical and stutter-like buckets. */
export function classifyDisfluencies(text: string): DisfluencyMetrics {
  let count = 0;
  const lower = text.toLowerCase();
  let fillerCount = 0;

  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches) fillerCount += matches.length;
  }

  // Word repetitions (e.g., "I I went" or "the the store")
  const repMatches = text.match(/\b(\w+)\s+\1\b/gi);
  const wholeWordRepetitionCount = repMatches?.length ?? 0;

  // Approximate sound repetitions in transcripts that preserve hyphenation (e.g., "b-b-ball").
  const soundRepMatches = text.match(/\b([a-z])(?:-\1){1,}-?[a-z]*\b/gi);
  const possibleSoundRepetitionCount = soundRepMatches?.length ?? 0;

  // Approximate syllable repetitions in transcripts that preserve hyphenation (e.g., "ba-ba-ball").
  const syllableRepMatches = text.match(/\b([a-z]{2,4})(?:-\1){1,}-?[a-z]*\b/gi);
  const possibleSyllableRepetitionCount = syllableRepMatches?.length ?? 0;

  const typical = fillerCount + wholeWordRepetitionCount;
  const stutterLike = possibleSoundRepetitionCount + possibleSyllableRepetitionCount;
  count = typical + stutterLike;

  return {
    total: count,
    typical,
    stutterLike,
    fillerCount,
    wholeWordRepetitionCount,
    possibleSoundRepetitionCount,
    possibleSyllableRepetitionCount,
  };
}

/**
 * Clean transcript text for coaching summaries while preserving speech-analysis
 * evidence in the raw transcript. This removes non-meaningful repeated words and
 * trims overused verbal tics without flattening emphatic repetitions like
 * "Yes, yes".
 */
export function cleanTranscriptForSummary(text: string): string {
  if (!text.trim()) return "";

  let cleaned = text.replace(/\s+/g, " ").trim();
  cleaned = removeNonMeaningfulRepeatedWords(cleaned);
  cleaned = reduceVerbalTics(cleaned);
  cleaned = normalizeSpacingAndPunctuation(cleaned);

  return cleaned;
}

function removeNonMeaningfulRepeatedWords(text: string): string {
  return text.replace(
    /\b([a-z]+(?:'[a-z]+)?)(?:[,\s]+)\1\b/gi,
    (match, word: string) => {
      const lower = word.toLowerCase();
      if (MEANINGFUL_REPETITIONS.has(lower)) return match;
      return word;
    }
  );
}

function reduceVerbalTics(text: string): string {
  let result = text;

  for (const tic of VERBAL_TICS) {
    const regex = new RegExp(`\\b${escapeRegExp(tic)}\\b`, "gi");
    let seen = 0;
    result = result.replace(regex, (match, offset, fullText) => {
      seen += 1;
      if (seen > 1) return "";

      // Keep a little natural flavor and set retained multi-word tics off.
      if (tic.includes(" ")) return addCommasAround(match, offset, fullText);
      return match;
    });
  }

  return result;
}

function addCommasAround(match: string, offset: number, fullText: string): string {
  const before = fullText.slice(0, offset).trimEnd();
  const after = fullText.slice(offset + match.length).trimStart();
  const prefix = before && !before.endsWith(",") ? ", " : "";
  const suffix = after && !after.startsWith(",") ? ", " : "";
  return `${prefix}${match}${suffix}`;
}

function normalizeSpacingAndPunctuation(text: string): string {
  return text
    .replace(/\s+,/g, ",")
    .replace(/,\s*,+/g, ",")
    .replace(/\s+([.!?])/g, "$1")
    .replace(/,\s*([.!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Estimate syllable count for speaking rate calculation */
export function estimateSyllables(text: string): number {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  let total = 0;
  for (const word of words) {
    if (word.length <= 2) {
      total += 1;
      continue;
    }
    const vowelGroups = word.match(/[aeiouy]+/g);
    let count = vowelGroups ? vowelGroups.length : 1;
    if (word.endsWith("e") && count > 1) count--;
    total += Math.max(1, count);
  }
  return total;
}
