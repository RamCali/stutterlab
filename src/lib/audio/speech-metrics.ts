/**
 * Shared speech metrics utilities used by both the legacy VoiceConversation
 * pipeline and the ElevenLabs Conversational AI hook.
 */

const FILLER_WORDS = ["um", "uh", "er", "ah", "like", "you know", "i mean"];

/** Count disfluencies (filler words + word repetitions) in transcript text */
export function countDisfluencies(text: string): number {
  let count = 0;
  const lower = text.toLowerCase();

  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }

  // Word repetitions (e.g., "I I went" or "the the store")
  const repMatches = text.match(/\b(\w+)\s+\1\b/gi);
  if (repMatches) count += repMatches.length;

  return count;
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
