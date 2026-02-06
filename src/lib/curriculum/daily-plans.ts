/**
 * 90-Day Structured Stuttering Treatment Curriculum
 *
 * Phase 1 (Days 1-14): Foundation — breathing, gentle onset, basic DAF
 * Phase 2 (Days 15-30): Building Blocks — light contact, prolonged speech, FAF
 * Phase 3 (Days 31-50): Technique Integration — cancellation, pull-out, choral
 * Phase 4 (Days 51-70): Real-World Practice — AI conversations, phone sims, feared words
 * Phase 5 (Days 71-90): Mastery & Maintenance — advanced scenarios, community, independence
 */

export type TaskType =
  | "warmup"
  | "exercise"
  | "audio-lab"
  | "journal"
  | "ai"
  | "mindfulness"
  | "learn"
  | "challenge"
  | "feared-words";

export interface DailyTask {
  title: string;
  subtitle: string;
  duration: string;
  type: TaskType;
  /** Route to navigate to */
  href: string;
  /** True if task requires Pro subscription */
  premium?: boolean;
}

export interface DailyPlan {
  day: number;
  phase: number;
  phaseLabel: string;
  title: string;
  affirmation: string;
  tasks: DailyTask[];
}

export const PHASE_LABELS: Record<number, string> = {
  1: "Foundation",
  2: "Building Blocks",
  3: "Technique Integration",
  4: "Real-World Practice",
  5: "Mastery & Maintenance",
};

export const PHASE_RANGES: Record<number, [number, number]> = {
  1: [1, 14],
  2: [15, 30],
  3: [31, 50],
  4: [51, 70],
  5: [71, 90],
};

const affirmations = [
  "My voice has value. I speak at my own pace, and that pace is perfect.",
  "Every word I say matters — not how I say it.",
  "I am more than my stutter. My ideas deserve to be heard.",
  "Progress isn't always linear. Every practice session counts.",
  "I choose courage over comfort. My speech gets better each day.",
  "I am patient with myself. Growth takes time.",
  "My stutter does not define my intelligence or worth.",
  "I deserve to be heard, just like everyone else.",
  "Today, I practice not for perfection, but for progress.",
  "I am building new neural pathways with every exercise.",
];

function getAffirmation(day: number): string {
  return affirmations[(day - 1) % affirmations.length];
}

function getPhase(day: number): number {
  if (day <= 14) return 1;
  if (day <= 30) return 2;
  if (day <= 50) return 3;
  if (day <= 70) return 4;
  return 5;
}

/* ─── Generate all 90 daily plans ─── */
export function generateDailyPlans(): DailyPlan[] {
  const plans: DailyPlan[] = [];

  for (let day = 1; day <= 90; day++) {
    const phase = getPhase(day);
    plans.push({
      day,
      phase,
      phaseLabel: PHASE_LABELS[phase],
      title: getDayTitle(day, phase),
      affirmation: getAffirmation(day),
      tasks: getDayTasks(day, phase),
    });
  }

  return plans;
}

function getDayTitle(day: number, phase: number): string {
  // Phase 1 titles
  if (phase === 1) {
    const titles = [
      "Getting Started",
      "Breath Control Basics",
      "Gentle Onset Introduction",
      "Easy Breathing + Onset",
      "First DAF Session",
      "DAF Reading Practice",
      "Pausing Strategy",
      "Combining Breath + Onset",
      "DAF with Sentences",
      "Prolonged Speech Intro",
      "Review & Voice Journal",
      "Building Confidence",
      "Gentle Onset Phrases",
      "Foundation Checkpoint",
    ];
    return titles[day - 1] || `Foundation Day ${day}`;
  }

  // Phase 2 titles
  if (phase === 2) {
    const idx = day - 15;
    const titles = [
      "Light Contact Introduction",
      "FAF First Session",
      "Prolonged Speech Practice",
      "Combining DAF + FAF",
      "Continuous Phonation",
      "Light Contact Words",
      "FAF Reading Practice",
      "Breathing Under Pressure",
      "Sentence-Level Fluency",
      "Rate Control Practice",
      "Midpoint Review",
      "Paragraph Reading with DAF",
      "Emotional Awareness",
      "Building Block Phrases",
      "Confidence Check",
      "Phase 2 Checkpoint",
    ];
    return titles[idx] || `Building Blocks Day ${day}`;
  }

  // Phase 3 titles
  if (phase === 3) {
    const idx = day - 31;
    const titles = [
      "Cancellation Technique",
      "Pull-Out Introduction",
      "Preparatory Set Basics",
      "Choral Speaking First Session",
      "Cancellation Practice",
      "Pull-Out with Sentences",
      "Combined Modification",
      "Choral Reading Long Passage",
      "Voluntary Stuttering",
      "Desensitization Day",
      "Technique Choice Practice",
      "CBT: Thought Records",
      "Feared Sounds Drill",
      "Mixed Techniques",
      "Passage Reading Fluency",
      "Conversation Prep",
      "AI Practice Introduction",
      "Phone Anxiety Prep",
      "Technique Integration Review",
      "Phase 3 Checkpoint",
    ];
    return titles[idx] || `Integration Day ${day}`;
  }

  // Phase 4 titles
  if (phase === 4) {
    const idx = day - 51;
    const titles = [
      "AI Conversation: Ordering Food",
      "Phone Call Simulator",
      "Real-World Challenge Day",
      "AI: Job Interview Prep",
      "Feared Words Deep Dive",
      "AI: Doctor Appointment",
      "Community Practice Room",
      "AI: Meeting Introduction",
      "Phone Call Challenge",
      "AI: Presentation Practice",
      "Real-World: Coffee Shop Order",
      "Disclosure Practice",
      "AI: Small Talk at Party",
      "Advanced DAF + Conversation",
      "Weekly Coaching Review",
      "AI: Customer Service Call",
      "Real-World: Phone a Friend",
      "AI: Asking for Directions",
      "Confidence Building Day",
      "Phase 4 Checkpoint",
    ];
    return titles[idx] || `Real-World Day ${day}`;
  }

  // Phase 5 titles
  const idx = day - 71;
  const titles = [
    "Advanced Conversation",
    "Public Speaking Prep",
    "Maintenance Strategies",
    "Teaching Others Your Techniques",
    "Relapse Prevention",
    "Long Conversation Practice",
    "Presentation Mode Practice",
    "Community Mentoring",
    "Advanced Phone Challenges",
    "Stress Testing Your Fluency",
    "Creating Your Toolbox",
    "AI: Unscripted Conversation",
    "Real-World Challenge Marathon",
    "Reflection & Voice Journal",
    "Advanced AI Scenarios",
    "Maintenance Planning",
    "Celebrating Your Journey",
    "Your Personal Toolkit",
    "Looking Forward",
    "Day 90: Graduation!",
  ];
  return titles[idx] || `Mastery Day ${day}`;
}

function getDayTasks(day: number, phase: number): DailyTask[] {
  const tasks: DailyTask[] = [];

  // Every day starts with a warm-up breathing exercise
  tasks.push({
    title: "Diaphragmatic Breathing",
    subtitle:
      phase >= 3
        ? "Advanced breathing with body scan"
        : "Belly breathing warm-up",
    duration: phase >= 3 ? "2 min" : "3 min",
    type: "warmup",
    href: "/exercises",
  });

  // Phase-specific exercises
  if (phase === 1) {
    // Foundation: gentle onset, basic DAF, journal
    if (day <= 4) {
      tasks.push({
        title: "Gentle Onset Practice",
        subtitle: day <= 2 ? "Single words" : "Short phrases",
        duration: "5 min",
        type: "exercise",
        href: "/exercises",
      });
    }
    if (day >= 5) {
      tasks.push({
        title: "DAF Reading Exercise",
        subtitle: day <= 9 ? "Easy passage" : "Medium passage",
        duration: "10 min",
        type: "audio-lab",
        href: "/audio-lab",
      });
    }
    if (day >= 7) {
      tasks.push({
        title: "Pausing Strategy Practice",
        subtitle: "Read with deliberate pauses",
        duration: "5 min",
        type: "exercise",
        href: "/exercises",
      });
    }
  } else if (phase === 2) {
    // Building Blocks: light contact, FAF, prolonged speech
    tasks.push({
      title:
        day % 3 === 0
          ? "Prolonged Speech Practice"
          : day % 3 === 1
          ? "Light Articulatory Contact"
          : "Continuous Phonation",
      subtitle: "Sentence-level practice",
      duration: "8 min",
      type: "exercise",
      href: "/exercises",
    });
    tasks.push({
      title: day % 2 === 0 ? "FAF Reading Session" : "DAF + FAF Combined",
      subtitle: "Paragraph-level reading",
      duration: "10 min",
      type: "audio-lab",
      href: "/audio-lab",
      premium: true,
    });
  } else if (phase === 3) {
    // Technique Integration: modification techniques, choral, CBT
    tasks.push({
      title:
        day % 4 === 0
          ? "Cancellation Practice"
          : day % 4 === 1
          ? "Pull-Out Technique"
          : day % 4 === 2
          ? "Preparatory Set Drill"
          : "Voluntary Stuttering",
      subtitle: "Stuttering modification technique",
      duration: "8 min",
      type: "exercise",
      href: "/exercises",
      premium: true,
    });
    if (day % 3 === 0) {
      tasks.push({
        title: "Choral Speaking Session",
        subtitle: "Read along with AI voice",
        duration: "8 min",
        type: "audio-lab",
        href: "/audio-lab",
        premium: true,
      });
    }
    if (day >= 43) {
      tasks.push({
        title: "AI Conversation Warm-Up",
        subtitle: "Easy scenario practice",
        duration: "5 min",
        type: "ai",
        href: "/ai-practice",
        premium: true,
      });
    }
  } else if (phase === 4) {
    // Real-World Practice: AI conversations, phone sims, challenges
    tasks.push({
      title: "Technique Refresher",
      subtitle: "Quick review of today's focus technique",
      duration: "5 min",
      type: "exercise",
      href: "/exercises",
    });
    tasks.push({
      title:
        day % 3 === 0
          ? "Phone Call Simulator"
          : day % 3 === 1
          ? "AI Conversation Practice"
          : "Feared Words Drill",
      subtitle:
        day % 3 === 0
          ? "Practice a real phone scenario"
          : day % 3 === 1
          ? "Dynamic AI scenario"
          : "Target your trigger words",
      duration: day % 3 === 2 ? "5 min" : "8 min",
      type: day % 3 === 2 ? "feared-words" : "ai",
      href: day % 3 === 2 ? "/feared-words" : "/ai-practice",
      premium: true,
    });
    if (day % 4 === 0) {
      tasks.push({
        title: "Real-World Challenge",
        subtitle: "Take your practice into the real world",
        duration: "varies",
        type: "challenge",
        href: "/challenges",
        premium: true,
      });
    }
  } else {
    // Mastery & Maintenance: advanced scenarios, maintenance planning
    tasks.push({
      title: "Advanced Technique Practice",
      subtitle: "Choose your own technique combination",
      duration: "8 min",
      type: "exercise",
      href: "/exercises",
      premium: true,
    });
    tasks.push({
      title:
        day % 2 === 0 ? "Advanced AI Scenario" : "Long Conversation Practice",
      subtitle: "Extended real-world simulation",
      duration: "10 min",
      type: "ai",
      href: "/ai-practice",
      premium: true,
    });
    if (day % 3 === 0) {
      tasks.push({
        title: "Real-World Challenge",
        subtitle: "Advanced real-life speaking mission",
        duration: "varies",
        type: "challenge",
        href: "/challenges",
        premium: true,
      });
    }
  }

  // Every day ends with a voice journal entry
  tasks.push({
    title: "Voice Journal Entry",
    subtitle: "Record how your speech feels today",
    duration: "2 min",
    type: "journal",
    href: "/voice-journal/new",
  });

  // CBT/mindfulness on select days
  if (day % 5 === 0) {
    tasks.push({
      title: "Mindfulness Check-In",
      subtitle: "2-minute guided breathing + anxiety rating",
      duration: "2 min",
      type: "mindfulness",
      href: "/mindfulness",
    });
  }

  // Educational content on select days
  if (day % 7 === 0) {
    tasks.push({
      title: "Learn Something New",
      subtitle: "Short educational module",
      duration: "5 min",
      type: "learn",
      href: "/learn",
    });
  }

  return tasks;
}

/** Get plan for a specific day */
export function getDailyPlan(day: number): DailyPlan | null {
  if (day < 1 || day > 90) return null;
  const plans = generateDailyPlans();
  return plans[day - 1];
}

/** Get current phase info */
export function getPhaseInfo(day: number) {
  const phase = getPhase(day);
  const [start, end] = PHASE_RANGES[phase];
  const daysInPhase = end - start + 1;
  const dayInPhase = day - start + 1;
  return {
    phase,
    label: PHASE_LABELS[phase],
    dayInPhase,
    daysInPhase,
    progress: Math.round((dayInPhase / daysInPhase) * 100),
  };
}
