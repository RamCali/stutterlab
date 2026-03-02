/**
 * Curated practice words organized by initial phoneme.
 * Used to generate targeted practice sentences for difficult phonemes.
 */

export const PHONEME_WORD_BANK: Record<string, string[]> = {
  // Plosives (commonly difficult for PWS)
  b: ["baby", "better", "begin", "brother", "button", "borrow", "building", "breakfast", "balance", "behind", "believe", "birthday"],
  p: ["people", "paper", "practice", "problem", "picture", "purple", "payment", "patient", "parking", "present", "perfect", "pleasant"],
  d: ["dinner", "different", "dollar", "during", "deliver", "discuss", "double", "drawing", "distant", "December", "design", "develop"],
  t: ["table", "together", "tomorrow", "thirteen", "teacher", "telephone", "trouble", "Tuesday", "training", "toaster", "ticket", "typical"],
  g: ["garden", "gather", "golden", "grocery", "grateful", "glasses", "gentle", "going", "giving", "getting", "growing", "goodbye"],
  k: ["kitchen", "kindness", "keeping", "courage", "college", "comment", "customer", "company", "calendar", "carpet", "captain", "careful"],

  // Fricatives
  f: ["family", "finally", "favorite", "feeling", "figure", "finish", "flower", "follow", "foreign", "forget", "forward", "freedom"],
  v: ["value", "various", "village", "visit", "voice", "volume", "vacation", "vegetable", "venture", "version", "victory", "violin"],
  s: ["Saturday", "several", "simple", "sister", "sixteen", "solution", "special", "student", "subject", "suggest", "suppose", "surface"],
  z: ["zero", "zipper", "zoning", "zombie", "zealous", "zigzag", "zephyr", "zenith", "zucchini", "zodiac"],
  h: ["happy", "having", "healthy", "helpful", "herself", "highway", "history", "holiday", "homework", "honest", "hospital", "hundred"],
  th: ["thankful", "therapy", "thirteen", "thinking", "thousand", "Thursday", "together", "therefore", "throughout", "theory"],
  sh: ["shadow", "sharing", "shelter", "shifting", "shopping", "shoulder", "showing", "shuttle", "shining", "shortage"],

  // Affricates
  ch: ["chapter", "challenge", "champion", "changing", "charging", "checking", "children", "chocolate", "choosing", "chairman"],
  j: ["jacket", "January", "jealous", "jewelry", "joining", "journal", "journey", "judgment", "jumping", "justice", "junior", "gentle"],

  // Nasals
  m: ["making", "manager", "married", "material", "meaning", "measure", "meeting", "member", "memory", "message", "million", "morning"],
  n: ["narrow", "national", "natural", "neither", "nervous", "nothing", "November", "number", "nursing", "neighbor", "neutral", "notice"],

  // Liquids
  l: ["language", "lasting", "leading", "learning", "leaving", "letters", "library", "listen", "living", "looking", "loving", "lucky"],
  r: ["rather", "reading", "reason", "recent", "regular", "relation", "remember", "report", "require", "result", "review", "running"],

  // Glides
  w: ["walking", "wanting", "warning", "watching", "weather", "website", "wedding", "weekend", "welcome", "willing", "window", "working"],
  y: ["yearly", "yellow", "yesterday", "yielding", "younger", "yourself"],

  // Common clusters
  st: ["standing", "starting", "station", "staying", "stepping", "sticker", "stomach", "stopping", "storing", "stranger", "student", "studying"],
  str: ["straight", "strange", "strategy", "strength", "strictly", "striking", "strongly", "struggle", "structure", "stretching"],
  sp: ["speaking", "special", "specific", "spending", "spinning", "sporting", "spotlight", "spreading", "sprinkle", "spiritual"],
  bl: ["blanket", "bleeding", "blessing", "blending", "blowing", "blueberry", "blurring", "blocking", "blooming", "blueprint"],
  br: ["brainstorm", "breakfast", "breaking", "breathing", "bridges", "brilliant", "bringing", "brother", "brushing", "building"],
  cl: ["classic", "cleaning", "clearing", "climbing", "clinical", "closet", "clothing", "clumsy", "cluster", "classroom"],
  cr: ["cracking", "creative", "creating", "critical", "crossing", "crowding", "crystal", "current", "customer", "craving"],
  dr: ["drawing", "dreaming", "dressing", "drinking", "driving", "dropping", "drumming", "drifting", "dramatic", "draining"],
  fl: ["falling", "family", "feature", "feeling", "finally", "finding", "fishing", "fitting", "flexible", "floating", "flowing", "flying"],
  fr: ["fraction", "freedom", "freezing", "frequent", "friendly", "frontier", "frozen", "fruitful", "frustrated", "framework"],
  gl: ["glasses", "glancing", "gleaming", "gliding", "glimpse", "glitter", "global", "gloomy", "glorious", "glowing"],
  gr: ["graceful", "gradual", "grammar", "grandma", "grateful", "greatest", "greeting", "gripping", "grocery", "growing"],
  pl: ["placing", "planning", "platform", "playing", "pleasant", "pleasure", "plenty", "plotting", "plowing", "plumbing"],
  pr: ["practice", "prayer", "precious", "predict", "prefer", "prepare", "present", "pressure", "pretend", "princess", "probably", "problem"],
  tr: ["trading", "traffic", "training", "transfer", "travel", "treasure", "treatment", "trending", "triangle", "trouble", "trusting", "trying"],
  sw: ["swallow", "sweater", "sweeping", "swimming", "swinging", "switching", "swollen", "swiftly"],
  sc: ["scandal", "scatter", "schedule", "scholar", "scissors", "scooping", "scoring", "scramble", "scratch", "screening"],
  sl: ["slacking", "sleeping", "slender", "slicing", "sliding", "slightly", "slipping", "slowing", "slumber", "smallest"],
  sm: ["smaller", "smarter", "smelling", "smiling", "smoking", "smoothly", "smuggling", "snapshot"],
  sn: ["snacking", "snapping", "sneaking", "sneezing", "sniffing", "snoring", "snowfall", "snuggle"],
  tw: ["twelve", "twenty", "twisting", "twitching", "twitter", "twilight"],

  // Vowels
  a: ["after", "always", "answer", "apple", "asking", "another", "attitude", "average", "amazing", "ability"],
  e: ["early", "easier", "eating", "effort", "either", "eleven", "empty", "ending", "enough", "evening", "every", "exactly"],
  i: ["idea", "image", "impact", "import", "include", "indeed", "inside", "instead", "interest", "issue"],
  o: ["obvious", "occur", "office", "often", "online", "only", "opening", "opposite", "orange", "order", "other", "outside"],
  u: ["uncle", "under", "unique", "unless", "until", "update", "upper", "upset", "useful", "using", "usually", "utter"],
};

/**
 * Generate practice sentences that are rich in the specified difficult phonemes.
 */
export function generatePhonemeTargetedPractice(
  phonemes: string[],
  count = 8
): string[] {
  const sentences: string[] = [];
  const allWords: string[] = [];

  // Gather words for all specified phonemes
  for (const phoneme of phonemes) {
    const words = PHONEME_WORD_BANK[phoneme];
    if (words) {
      allWords.push(...words);
    }
  }

  if (allWords.length === 0) return [];

  // Sentence templates that incorporate target words naturally
  const templates = [
    (w1: string, w2: string) => `I would like to talk about ${w1} and ${w2} today.`,
    (w1: string, w2: string) => `Could you tell me more about the ${w1} near the ${w2}?`,
    (w1: string, w2: string) => `The ${w1} was really ${w2} this morning.`,
    (w1: string, w2: string) => `I think ${w1} is more important than ${w2}.`,
    (w1: string, w2: string) => `Let me explain why ${w1} matters for ${w2}.`,
    (w1: string, w2: string) => `She mentioned the ${w1} during the ${w2}.`,
    (w1: string, w2: string) => `We should consider ${w1} before ${w2}.`,
    (w1: string, w2: string) => `The best part was the ${w1} and the ${w2}.`,
    (w1: string, w2: string) => `I remember the ${w1} from last ${w2}.`,
    (w1: string, w2: string) => `Next week I plan to work on ${w1} and ${w2}.`,
    (w1: string, w2: string) => `After the ${w1}, we decided to try ${w2}.`,
    (w1: string, w2: string) => `My favorite part is the ${w1} combined with ${w2}.`,
  ];

  // Shuffle words for variety
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count && i < templates.length; i++) {
    const w1 = shuffled[i % shuffled.length];
    const w2 = shuffled[(i + 1) % shuffled.length];
    sentences.push(templates[i](w1, w2));
  }

  return sentences;
}
