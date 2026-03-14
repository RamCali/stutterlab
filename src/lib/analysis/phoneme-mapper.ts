/**
 * Phoneme-Level Difficulty Mapping (Feature 1)
 *
 * Maps English words to their initial phonemes/consonant clusters
 * and aggregates disfluency data by phoneme for heatmap visualization.
 */

// Common English digraphs and consonant clusters (ordered longest-first for matching)
const INITIAL_CLUSTERS = [
  // 3-letter clusters
  "str", "spr", "spl", "scr", "squ", "thr", "shr",
  // 2-letter clusters
  "bl", "br", "ch", "cl", "cr", "dr", "dw", "fl", "fr", "gl", "gr",
  "kn", "ph", "pl", "pr", "qu", "sc", "sh", "sk", "sl", "sm", "sn",
  "sp", "st", "sw", "th", "tr", "tw", "wh", "wr",
];

// Silent letter exceptions: initial letter(s) are silent
const SILENT_INITIAL: Record<string, string> = {
  // kn- words: k is silent
  know: "n", knife: "n", knee: "n", knot: "n", knock: "n", knit: "n",
  knight: "n", kneel: "n", knack: "n", knob: "n",
  // wr- words: w is silent
  write: "r", wrong: "r", wrap: "r", wrist: "r", wreck: "r",
  wrath: "r", wrinkle: "r", wrote: "r", written: "r",
  // ps- words: p is silent
  psychology: "s", psyche: "s", psalm: "s", pseudo: "s", psycho: "s",
  // gn- words: g is silent
  gnaw: "n", gnat: "n", gnome: "n", gnu: "n",
  // pn- words: p is silent
  pneumonia: "n", pneumatic: "n",
  // mn- words: m is silent
  mnemonic: "n",
  // ph sounds like f
  phone: "f", photo: "f", phrase: "f", physical: "f", pharmacy: "f",
  phase: "f", phenomenon: "f", philosophy: "f", phantom: "f",
};

/**
 * Get the initial phoneme/cluster of an English word.
 * Returns a simplified phoneme representation.
 */
export function getInitialPhoneme(word: string): string {
  const lower = word.toLowerCase().trim();
  if (!lower) return "";

  // Check silent letter exceptions first
  const exception = SILENT_INITIAL[lower];
  if (exception) return exception;

  // Check for multi-letter clusters (longest match first)
  for (const cluster of INITIAL_CLUSTERS) {
    if (lower.startsWith(cluster)) {
      // Map digraphs to their phoneme equivalents
      if (cluster === "ph") return "f";
      if (cluster === "kn") return "n";
      if (cluster === "wr") return "r";
      return cluster;
    }
  }

  // Single letter — handle vowels
  const first = lower[0];
  if ("aeiou".includes(first)) return first;

  // Handle 'c' and 'g' soft/hard
  if (first === "c") {
    const next = lower[1] || "";
    if ("eiy".includes(next)) return "s"; // soft c (city, cell)
    return "k"; // hard c (cat, come)
  }
  if (first === "g") {
    const next = lower[1] || "";
    if (next === "e" || next === "i") return "j"; // soft g (gem, gin) — approximation
  }

  // x at start sounds like z
  if (first === "x") return "z";

  return first;
}

/**
 * Get a display-friendly phoneme label for UI rendering.
 */
export function getPhonemeLabel(phoneme: string): string {
  const labels: Record<string, string> = {
    a: "/æ/", b: "/b/", d: "/d/", e: "/ɛ/", f: "/f/", g: "/ɡ/",
    h: "/h/", i: "/ɪ/", j: "/dʒ/", k: "/k/", l: "/l/", m: "/m/",
    n: "/n/", o: "/ɒ/", p: "/p/", r: "/r/", s: "/s/", t: "/t/",
    u: "/ʌ/", v: "/v/", w: "/w/", y: "/j/", z: "/z/",
    bl: "/bl/", br: "/br/", ch: "/tʃ/", cl: "/kl/", cr: "/kr/",
    dr: "/dr/", fl: "/fl/", fr: "/fr/", gl: "/ɡl/", gr: "/ɡr/",
    pl: "/pl/", pr: "/pr/", sh: "/ʃ/", sk: "/sk/", sl: "/sl/",
    sm: "/sm/", sn: "/sn/", sp: "/sp/", st: "/st/", str: "/str/",
    sw: "/sw/", th: "/θ/", tr: "/tr/", tw: "/tw/", wh: "/w/",
    spr: "/spr/", spl: "/spl/", scr: "/skr/", squ: "/skw/",
    thr: "/θr/", shr: "/ʃr/",
  };
  return labels[phoneme] || `/${phoneme}/`;
}

/** Disfluency event from transcription or session data */
export interface DisfluencyEvent {
  word: string;
  type: "repetition" | "prolongation" | "interjection" | "block";
}

/** Aggregated phoneme data from disfluency events */
export interface PhonemeAggregation {
  phoneme: string;
  attempts: number;
  disfluencyCount: number;
  words: string[];
}

/**
 * Map disfluency events to their initial phonemes and aggregate.
 */
export function mapDisfluenciesToPhonemes(
  disfluencies: DisfluencyEvent[]
): Map<string, PhonemeAggregation> {
  const map = new Map<string, PhonemeAggregation>();

  for (const d of disfluencies) {
    // Skip interjections (um, uh) — they aren't phoneme-specific
    if (d.type === "interjection") continue;

    const word = d.word.replace(/[^a-zA-Z]/g, "");
    if (!word) continue;

    const phoneme = getInitialPhoneme(word);
    if (!phoneme) continue;

    const existing = map.get(phoneme) || {
      phoneme,
      attempts: 0,
      disfluencyCount: 0,
      words: [],
    };

    existing.attempts++;
    existing.disfluencyCount++;
    if (!existing.words.includes(word.toLowerCase())) {
      existing.words.push(word.toLowerCase());
    }
    map.set(phoneme, existing);
  }

  return map;
}

/**
 * Bayesian difficulty score. Handles small sample sizes gracefully.
 * Returns 0-1 (higher = harder).
 */
export function computeDifficultyScore(
  disfluencyCount: number,
  totalAttempts: number
): number {
  // Bayesian: (successes + prior) / (total + prior_weight)
  // Prior: 0.2 difficulty (mild assumption), weight: 3
  return (disfluencyCount + 0.6) / (totalAttempts + 3);
}

/**
 * Extract disfluency events from aiConversation.disfluencyMoments (JSONB).
 * The stored format is an array of user turns with disfluencyCount > 0.
 */
export function extractDisfluencyWords(
  disfluencyMoments: unknown
): DisfluencyEvent[] {
  if (!Array.isArray(disfluencyMoments)) return [];

  const events: DisfluencyEvent[] = [];

  for (const moment of disfluencyMoments) {
    if (!moment || typeof moment !== "object") continue;
    const text = (moment as Record<string, unknown>).text;
    if (typeof text !== "string") continue;

    // Extract words that are likely disfluent using the same patterns as speech-metrics.ts
    const words = text.split(/\s+/);

    // Check for word repetitions
    for (let i = 1; i < words.length; i++) {
      const clean = words[i].replace(/[^a-zA-Z]/g, "").toLowerCase();
      const prev = words[i - 1].replace(/[^a-zA-Z]/g, "").toLowerCase();
      if (clean && prev && clean === prev) {
        events.push({ word: clean, type: "repetition" });
      }
    }

    // Check for filler words (interjections)
    const fillers = ["um", "uh", "er", "ah", "like", "you know", "i mean"];
    const lowerText = text.toLowerCase();
    for (const filler of fillers) {
      if (lowerText.includes(filler)) {
        events.push({ word: filler.split(" ")[0], type: "interjection" });
      }
    }

    // Check for prolongations (repeated letters: "sssnake")
    const prolongations = text.match(/\b(\w)\1{2,}\w*/gi);
    if (prolongations) {
      for (const word of prolongations) {
        events.push({
          word: word.replace(/[^a-zA-Z]/g, ""),
          type: "prolongation",
        });
      }
    }
  }

  return events;
}
