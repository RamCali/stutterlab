/**
 * Graded Exposure Ladder — structured desensitization progression
 *
 * Each rung represents a real-world speaking situation ordered from
 * least anxiety-provoking to most. Users work their way up, logging
 * reflections after each attempt.
 */

export interface ExposureRung {
  id: string;
  level: number; // 1-10 (1 = easiest, 10 = hardest)
  title: string;
  description: string;
  category: "solo" | "familiar" | "stranger" | "phone" | "group" | "high-stakes";
  /** Specific technique suggestions for this level */
  suggestedTechniques: string[];
  /** Example missions for this rung */
  missions: string[];
}

export interface ExposureAttempt {
  rungId: string;
  date: string; // ISO date
  /** Predicted anxiety before (1-10) */
  predictedAnxiety: number;
  /** Actual anxiety during (1-10) */
  actualAnxiety: number;
  /** Confidence after (1-10) */
  confidenceAfter: number;
  /** Did they use avoidance? */
  usedAvoidance: boolean;
  /** Technique used */
  techniqueUsed: string;
  /** Free-form reflection */
  reflection: string;
  /** Outcome: completed, partial, skipped */
  outcome: "completed" | "partial" | "skipped";
}

export interface ExposureLadderState {
  attempts: ExposureAttempt[];
  unlockedLevel: number; // Highest unlocked level (starts at 1)
}

const STORAGE_KEY = "stutterlab-exposure-ladder";

export const EXPOSURE_LADDER: ExposureRung[] = [
  {
    id: "reading-alone",
    level: 1,
    title: "Reading Aloud Alone",
    description: "Read a passage out loud when no one else is around.",
    category: "solo",
    suggestedTechniques: ["Gentle Onset", "Prolonged Speech"],
    missions: [
      "Read a news article aloud in your room",
      "Read a recipe while cooking alone",
      "Read song lyrics out loud",
    ],
  },
  {
    id: "talking-to-pet-mirror",
    level: 2,
    title: "Talking to a Pet or Mirror",
    description: "Practice speaking to a pet, stuffed animal, or your reflection.",
    category: "solo",
    suggestedTechniques: ["Gentle Onset", "Pausing"],
    missions: [
      "Tell your pet about your day",
      "Practice self-introductions in the mirror",
      "Narrate what you're doing out loud",
    ],
  },
  {
    id: "ai-conversation",
    level: 3,
    title: "AI Conversation Practice",
    description: "Have a practice conversation with the StutterLab AI.",
    category: "solo",
    suggestedTechniques: ["Gentle Onset", "Light Contact", "Pausing"],
    missions: [
      "Complete an easy AI scenario (ordering food)",
      "Try the small talk scenario",
      "Ask the AI for directions",
    ],
  },
  {
    id: "familiar-person",
    level: 4,
    title: "Talking to a Close Friend or Family",
    description: "Have a conversation with someone you're very comfortable with.",
    category: "familiar",
    suggestedTechniques: ["Gentle Onset", "Voluntary Stuttering"],
    missions: [
      "Call a close friend and chat for 5 minutes",
      "Tell a family member about something you learned today",
      "Ask a family member about their day",
    ],
  },
  {
    id: "casual-stranger",
    level: 5,
    title: "Brief Interaction with a Stranger",
    description: "Short, low-stakes exchange like greeting or asking a simple question.",
    category: "stranger",
    suggestedTechniques: ["Gentle Onset", "Preparatory Set"],
    missions: [
      "Say good morning to a neighbor or passerby",
      "Ask someone for the time",
      "Thank a delivery person verbally",
    ],
  },
  {
    id: "ordering-service",
    level: 6,
    title: "Ordering Food or Requesting Service",
    description: "Place an order or make a request that requires specific words.",
    category: "stranger",
    suggestedTechniques: ["Preparatory Set", "Light Contact", "Pausing"],
    missions: [
      "Order food at a restaurant (no pointing at menu)",
      "Ask a store employee where something is",
      "Return an item and explain why",
    ],
  },
  {
    id: "phone-call",
    level: 7,
    title: "Making a Phone Call",
    description: "Phone calls remove visual cues and add time pressure.",
    category: "phone",
    suggestedTechniques: ["Gentle Onset", "Pausing", "Cancellation"],
    missions: [
      "Call to make a restaurant reservation",
      "Call a store to check if an item is in stock",
      "Schedule a haircut appointment by phone",
    ],
  },
  {
    id: "group-conversation",
    level: 8,
    title: "Joining a Group Conversation",
    description: "Contribute to a conversation with 3+ people.",
    category: "group",
    suggestedTechniques: ["Preparatory Set", "Pull-Out", "Voluntary Stuttering"],
    missions: [
      "Share an opinion in a group lunch conversation",
      "Ask a question in a group setting",
      "Tell a short story to a group of friends",
    ],
  },
  {
    id: "authority-figure",
    level: 9,
    title: "Speaking to an Authority Figure",
    description: "Talk to a boss, professor, doctor, or other authority figure.",
    category: "high-stakes",
    suggestedTechniques: ["Preparatory Set", "Cancellation", "Voluntary Stuttering"],
    missions: [
      "Ask your boss a question in person",
      "Speak up in a meeting or class",
      "Describe symptoms to a doctor without simplifying",
    ],
  },
  {
    id: "presentation",
    level: 10,
    title: "Giving a Presentation or Speech",
    description: "The peak: speaking to an audience with all eyes on you.",
    category: "high-stakes",
    suggestedTechniques: ["Gentle Onset", "Pausing", "Preparatory Set", "Voluntary Stuttering"],
    missions: [
      "Give a 2-minute presentation at work or school",
      "Tell a story at a social gathering",
      "Lead a meeting discussion",
    ],
  },
];

export function getExposureLadderState(): ExposureLadderState {
  if (typeof window === "undefined") {
    return { attempts: [], unlockedLevel: 1 };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return { attempts: [], unlockedLevel: 1 };
}

export function saveExposureAttempt(attempt: ExposureAttempt): ExposureLadderState {
  const state = getExposureLadderState();
  state.attempts.push(attempt);

  // Auto-unlock next level if current rung was completed with low anxiety
  const rung = EXPOSURE_LADDER.find((r) => r.id === attempt.rungId);
  if (rung && attempt.outcome === "completed" && attempt.actualAnxiety <= 5) {
    const nextLevel = rung.level + 1;
    if (nextLevel > state.unlockedLevel && nextLevel <= 10) {
      state.unlockedLevel = nextLevel;
    }
  }
  // Also unlock if they've completed the rung 3+ times regardless of anxiety
  if (rung) {
    const completions = state.attempts.filter(
      (a) => a.rungId === attempt.rungId && a.outcome === "completed"
    ).length;
    if (completions >= 3) {
      const nextLevel = rung.level + 1;
      if (nextLevel > state.unlockedLevel && nextLevel <= 10) {
        state.unlockedLevel = nextLevel;
      }
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  return state;
}

export function getAttemptsForRung(rungId: string): ExposureAttempt[] {
  const state = getExposureLadderState();
  return state.attempts.filter((a) => a.rungId === rungId);
}

export function getRungById(id: string): ExposureRung | undefined {
  return EXPOSURE_LADDER.find((r) => r.id === id);
}
