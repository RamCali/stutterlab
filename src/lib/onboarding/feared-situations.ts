import { DISFLUENCY_TYPES } from "@/lib/clinical/disfluency";
import type {
  AssessmentProfile,
  AssessmentScores,
} from "@/lib/onboarding/scoring";

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
  fearedWords?: string[];
  wordReflection?: string;
  painPoints?: string[];
  /** Derived label for DB backwards compat (computed from 3-dimension scoring) */
  severity: "mild" | "moderate" | "severe" | null;
  speechChallenges?: string[];
  northStarGoal?: string;
  preferredPracticeTime?: string;
  practicePace?: string;
  coachingTone?: string;
  commitmentReason?: string;
  // Assessment scoring fields
  confidenceRatings?: Record<string, number>;
  avoidanceBehaviors?: string[];
  stutteringTypes?: string[];
  speakingFrequency?: string;
  /** 3-dimension severity inputs */
  stutterFrequency?: string;
  stutterDuration?: string;
  stutterImpact?: string;
  severityScore?: number;
  confidenceScore?: number;
  fluencyPersistence?: string;
  physicalBehaviors?: string[];
  fastOrUnclearSpeech?: string;
  familyHistory?: string;
  // Deep profile fields (added Jun 2026)
  userType?: string;
  ageRange?: string;
  onsetTiming?: string;
  therapyHistory?: string;
  tensionLocations?: string[];
  blockEmotions?: string[];
  primaryGoalType?: string;
  dailyTimeCommitment?: string;
  referralGuidance?: {
    shouldRecommendSlp: boolean;
    urgency: "routine" | "recommended";
    reasons: string[];
  };
  assessmentProfile?: AssessmentProfile;
  recommendedEmphasis?: AssessmentScores["recommendedEmphasis"];
  contactPhoneNumber?: string;
  smsConsent?: boolean;
  phoneCallConsent?: boolean;
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

export interface PhysicalBehavior {
  id: string;
  label: string;
  emoji: string;
}

export const PHYSICAL_BEHAVIORS: PhysicalBehavior[] = [
  { id: "eye-blink", label: "Blinking or closing my eyes", emoji: "👁" },
  { id: "look-away", label: "Looking away during a stutter", emoji: "↗" },
  { id: "mouth-tension", label: "Tensing my mouth, jaw, or lips", emoji: "〰" },
  { id: "cover-mouth", label: "Covering my mouth or hiding the moment", emoji: "✋" },
  { id: "cough-yawn", label: "Coughing, yawning, or restarting to mask it", emoji: "💭" },
];

export interface StutteringType {
  id: string;
  label: string;
  description: string;
  example: string;
  category: "typical" | "stutter-like";
  emoji: string;
}

export const STUTTERING_TYPES: StutteringType[] = [
  ...DISFLUENCY_TYPES,
];

export const FLUENCY_PERSISTENCE_OPTIONS = [
  { id: "months", label: "Months", desc: "A newer or recently noticeable concern" },
  { id: "years", label: "Years", desc: "Something I have dealt with for a long time" },
  { id: "worsening", label: "Worsening", desc: "It has become harder recently" },
  { id: "varies", label: "It varies", desc: "Some seasons or contexts are harder" },
] as const;

export const FAST_OR_UNCLEAR_SPEECH_OPTIONS = [
  { id: "rarely", label: "Rarely", desc: "My rate and clarity usually feel steady" },
  { id: "sometimes", label: "Sometimes", desc: "It happens under pressure or excitement" },
  { id: "often", label: "Often", desc: "People sometimes ask me to slow down or repeat" },
  { id: "very-often", label: "Very often", desc: "Fast or unclear speech is a major pattern" },
] as const;

export const FAMILY_HISTORY_OPTIONS = [
  { id: "yes", label: "Yes", desc: "A family member stutters or clutters" },
  { id: "no", label: "No", desc: "Not that I know of" },
  { id: "unsure", label: "Unsure", desc: "I am not certain" },
] as const;

export const USER_TYPE_OPTIONS = [
  { id: "self", label: "It's for me", desc: "Adult or teen using StutterLab for myself", emoji: "🧑" },
  { id: "parent", label: "I'm a parent or guardian", desc: "Setting it up for my child", emoji: "👨‍👧" },
  { id: "slp", label: "I'm a speech-language pathologist", desc: "Using it with clients", emoji: "🩺" },
] as const;

export const AGE_RANGE_OPTIONS = [
  { id: "under-13", label: "Under 13", desc: "Child" },
  { id: "13-17", label: "13–17", desc: "Teen" },
  { id: "18-24", label: "18–24", desc: "Young adult" },
  { id: "25-34", label: "25–34", desc: "Adult" },
  { id: "35-49", label: "35–49", desc: "Adult" },
  { id: "50-plus", label: "50+", desc: "Adult" },
] as const;

export const ONSET_OPTIONS = [
  { id: "childhood", label: "Since childhood", desc: "I've stuttered as long as I can remember", emoji: "🧒" },
  { id: "teen", label: "Started in my teens", desc: "It became noticeable in adolescence", emoji: "📚" },
  { id: "adult-gradual", label: "Started in adulthood — gradually", desc: "It built up over time as an adult", emoji: "🌱" },
  { id: "adult-sudden", label: "Started in adulthood — suddenly", desc: "After an event, injury, stress, or for no clear reason", emoji: "⚡" },
  { id: "dont-remember", label: "I'm not sure", desc: "I don't remember when it started", emoji: "❓" },
] as const;

export const THERAPY_HISTORY_OPTIONS = [
  { id: "helpful", label: "Yes, and it was helpful", desc: "I learned techniques that worked for me", emoji: "✅" },
  { id: "not-helpful", label: "Yes, but it wasn't effective", desc: "It didn't stick, or I didn't connect with the approach", emoji: "⚠️" },
  { id: "currently", label: "I'm working with one now", desc: "Currently in therapy with an SLP", emoji: "🩺" },
  { id: "never", label: "No, this is my first time", desc: "I've never worked with an SLP for fluency", emoji: "🌱" },
] as const;

export interface TensionLocation {
  id: string;
  label: string;
  emoji: string;
}

export const TENSION_LOCATIONS: TensionLocation[] = [
  { id: "throat", label: "Throat or vocal cords", emoji: "🗣" },
  { id: "jaw-lips", label: "Jaw, lips, or tongue", emoji: "👄" },
  { id: "chest", label: "Chest or breathing", emoji: "🫁" },
  { id: "shoulders", label: "Shoulders, neck, or upper body", emoji: "💪" },
  { id: "face", label: "Face or eyes", emoji: "😬" },
  { id: "none", label: "No noticeable tension", emoji: "✨" },
];

export interface BlockEmotion {
  id: string;
  label: string;
  emoji: string;
}

export const BLOCK_EMOTIONS: BlockEmotion[] = [
  { id: "anxious", label: "Anxious or nervous", emoji: "😰" },
  { id: "frustrated", label: "Frustrated or fatigued", emoji: "😤" },
  { id: "embarrassed", label: "Embarrassed or ashamed", emoji: "😳" },
  { id: "angry", label: "Angry at myself or the situation", emoji: "😠" },
  { id: "helpless", label: "Stuck or helpless", emoji: "😔" },
  { id: "neutral", label: "Neutral — I push through", emoji: "🙂" },
];

export const PRIMARY_GOAL_OPTIONS = [
  {
    id: "fluency",
    label: "Speak more smoothly",
    desc: "Reduce blocks and physical tension (fluency shaping & modification)",
    emoji: "🌊",
  },
  {
    id: "confidence",
    label: "Speak with more confidence",
    desc: "Reduce anxiety, avoidance, and fear around speaking (desensitization)",
    emoji: "💪",
  },
  {
    id: "real-world",
    label: "Show up in real situations",
    desc: "Make calls, order food, present at work without avoiding",
    emoji: "🎯",
  },
  {
    id: "tracking",
    label: "Track and understand my patterns",
    desc: "Build awareness of triggers, progress, and what works",
    emoji: "📊",
  },
] as const;

export const DAILY_TIME_OPTIONS = [
  { id: "5-min", label: "5 minutes", desc: "Quick daily check-in" },
  { id: "10-15-min", label: "10–15 minutes", desc: "Standard practice routine" },
  { id: "20-plus-min", label: "20+ minutes", desc: "Intensive training" },
  { id: "varies", label: "It varies", desc: "Some days more, some days less" },
] as const;

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
