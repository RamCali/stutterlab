export interface FearedSituation {
  id: string;
  label: string;
  description: string;
  emoji: string;
  /** Maps to AI practice scenario IDs */
  scenarioIds: string[];
}

export const FEARED_SITUATIONS: FearedSituation[] = [
  {
    id: "strangers",
    label: "Talking to strangers",
    description: "Asking for help, directions, or making small talk",
    emoji: "👤",
    scenarioIds: ["small-talk", "asking-directions"],
  },
  {
    id: "phone-calls",
    label: "Phone calls",
    description: "Making or receiving calls — doctor, bank, delivery",
    emoji: "📞",
    scenarioIds: ["phone-call", "customer-service"],
  },
  {
    id: "ordering",
    label: "Ordering food or drinks",
    description: "At restaurants, coffee shops, or drive-throughs",
    emoji: "☕",
    scenarioIds: ["ordering-food"],
  },
  {
    id: "authority",
    label: "Talking to authority figures",
    description: "Boss, teacher, professor, or manager",
    emoji: "👔",
    scenarioIds: ["job-interview", "meeting-intro"],
  },
  {
    id: "romantic",
    label: "Talking to someone I like",
    description: "Dates, crushes, or romantic interests",
    emoji: "💬",
    scenarioIds: ["small-talk"],
  },
  {
    id: "presentations",
    label: "Presentations or public speaking",
    description: "Class presentations, work demos, or speeches",
    emoji: "🎤",
    scenarioIds: ["class-presentation", "meeting-intro"],
  },
  {
    id: "groups",
    label: "Group conversations",
    description: "Meetings, parties, or group hangouts",
    emoji: "👥",
    scenarioIds: ["meeting-intro", "small-talk"],
  },
  {
    id: "shopping",
    label: "Shopping or returning items",
    description: "Asking for help, making complaints, or returns",
    emoji: "🛒",
    scenarioIds: ["shopping"],
  },
];

const STORAGE_KEY = "stutterlab_onboarding";

export interface OnboardingData {
  completed: boolean;
  name: string;
  fearedSituations: string[];
  severity: "mild" | "moderate" | "severe" | null;
  speechChallenges?: string[];
  northStarGoal?: string;
  // Assessment scoring fields
  confidenceRatings?: Record<string, number>;
  avoidanceBehaviors?: string[];
  stutteringTypes?: string[];
  speakingFrequency?: string;
  severityScore?: number;
  confidenceScore?: number;
}

export interface ConfidenceSituation {
  id: string;
  label: string;
  emoji: string;
}

export const CONFIDENCE_SITUATIONS: ConfidenceSituation[] = [
  { id: "phone-call", label: "Making a phone call", emoji: "📞" },
  { id: "ordering", label: "Ordering food at a restaurant", emoji: "☕" },
  { id: "meeting", label: "Speaking up in a meeting", emoji: "🏢" },
  { id: "introduction", label: "Introducing yourself", emoji: "👋" },
  { id: "asking-question", label: "Asking a question in a group", emoji: "✋" },
  { id: "small-talk", label: "Making small talk with strangers", emoji: "💬" },
  { id: "presenting", label: "Giving a presentation", emoji: "🎤" },
  { id: "saying-name", label: "Saying your name", emoji: "🏷" },
];

export interface AvoidanceBehavior {
  id: string;
  label: string;
  emoji: string;
}

export const AVOIDANCE_BEHAVIORS: AvoidanceBehavior[] = [
  { id: "word-swap", label: "I substitute words to avoid stuttering", emoji: "🔄" },
  { id: "avoid-calls", label: "I avoid making phone calls", emoji: "📵" },
  { id: "stay-silent", label: "I stay silent rather than risk stuttering", emoji: "🤐" },
  { id: "let-others", label: "I let others speak for me", emoji: "👥" },
  { id: "avoid-eye", label: "I avoid eye contact when speaking", emoji: "👀" },
  { id: "rush-speech", label: "I rush through words", emoji: "⚡" },
];

export interface StutteringType {
  id: string;
  label: string;
  description: string;
  emoji: string;
}

export const STUTTERING_TYPES: StutteringType[] = [
  { id: "blocks", label: "Blocks", description: "Getting stuck, no sound comes out", emoji: "🧱" },
  { id: "repetitions", label: "Repetitions", description: "Repeating sounds: b-b-b-but", emoji: "🔁" },
  { id: "prolongations", label: "Prolongations", description: "Stretching sounds: ssssnake", emoji: "➡" },
  { id: "interjections", label: "Filler words", description: "Excessive um, uh, like", emoji: "💭" },
];

export interface SpeechChallenge {
  id: string;
  label: string;
  emoji: string;
}

export const SPEECH_CHALLENGES: SpeechChallenge[] = [
  { id: "work-calls", label: "Phone calls at work", emoji: "📞" },
  { id: "interviews", label: "Job interviews", emoji: "💼" },
  { id: "ordering", label: "Ordering food or drinks", emoji: "☕" },
  { id: "dating", label: "Dating & romantic conversations", emoji: "💬" },
  { id: "presentations", label: "Presentations & meetings", emoji: "🎤" },
  { id: "family", label: "Talking to family", emoji: "👨‍👩‍👧" },
  { id: "friends", label: "Making new friends", emoji: "🤝" },
  { id: "advocating", label: "Advocating for myself", emoji: "✊" },
];

export function getOnboardingData(): OnboardingData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveOnboardingData(data: OnboardingData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function isOnboardingComplete(): boolean {
  const data = getOnboardingData();
  return data?.completed ?? false;
}

/** Get scenario IDs prioritized by user's feared situations */
export function getPrioritizedScenarioIds(): string[] {
  const data = getOnboardingData();
  if (!data || data.fearedSituations.length === 0) {
    return []; // No preferences — show default order
  }

  const selected = FEARED_SITUATIONS.filter((fs) =>
    data.fearedSituations.includes(fs.id)
  );

  // Collect scenario IDs from selected fears, preserving order, deduped
  const prioritized: string[] = [];
  for (const situation of selected) {
    for (const id of situation.scenarioIds) {
      if (!prioritized.includes(id)) {
        prioritized.push(id);
      }
    }
  }

  return prioritized;
}
