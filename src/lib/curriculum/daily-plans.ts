/**
 * 90-Day Structured Stuttering Treatment Curriculum
 *
 * Design principles:
 *   - 10 min average session (8-12 min range) — fits a busy professional's day
 *   - Front-load "wow" features: DAF on Day 1, AI chat by Day 3, challenges by Day 5
 *   - Every day = 1 foundation skill + 1 exciting feature (no boring days)
 *   - Journal every 2-3 days, mindfulness every 4-5 days, learn modules weekly
 *
 * Phase 1 (Days 1-14):  Quick Wins — taste everything, build the hook
 * Phase 2 (Days 15-30): Technique Depth — go deeper on fluency shaping
 * Phase 3 (Days 31-50): Modification & Mindset — stuttering modification + CBT
 * Phase 4 (Days 51-70): Real-World Transfer — harder scenarios, real conversations
 * Phase 5 (Days 71-90): Independence — mastery, maintenance, graduation
 * Phase 6 (Day 91+):   Adaptive Maintenance — infinite personalized plans
 */

import { getAdaptiveDailyPlan as getAdaptiveDailyPlanImport } from "./adaptive-engine";

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
  1: "Quick Wins",
  2: "Technique Depth",
  3: "Modification & Mindset",
  4: "Real-World Transfer",
  5: "Independence",
  6: "Adaptive Maintenance",
};

export const PHASE_RANGES: Record<number, [number, number]> = {
  1: [1, 14],
  2: [15, 30],
  3: [31, 50],
  4: [51, 70],
  5: [71, 90],
  6: [91, Infinity],
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
  "Stuttering is neurology, not a character flaw. I practice to rewire, not to fix who I am.",
  "fMRI studies prove that practice changes brain structure. Every session is literally reshaping my speech circuits.",
  "70 million people stutter worldwide. I'm not alone, and I'm doing something about it.",
  "Avoidance makes stuttering harder. Speaking up — even imperfectly — is the path forward.",
  "The same brain that stutters also compensates, adapts, and grows. Neuroplasticity is on my side.",
  "Talking more helps, not hurts. Every conversation is practice, and every practice strengthens new pathways.",
  "My stutter has zero correlation with my intelligence. Research confirms this — repeatedly.",
  "Stress doesn't cause stuttering — it just raises tension temporarily. I have techniques for that.",
  "I speak not because it's easy, but because what I have to say matters.",
  "Singing and reading aloud use different neural pathways. I'm building those alternative circuits right now.",
];

function getAffirmation(day: number): string {
  return affirmations[(day - 1) % affirmations.length];
}

function getPhase(day: number): number {
  if (day <= 14) return 1;
  if (day <= 30) return 2;
  if (day <= 50) return 3;
  if (day <= 70) return 4;
  if (day <= 90) return 5;
  return 6;
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
  if (phase === 1) {
    const titles = [
      "Your First Session",           // Day 1: DAF demo — the "whoa" moment
      "Building Your Base",            // Day 2: deeper onset + DAF
      "Your First AI Conversation",    // Day 3: easy AI chat — "I did it"
      "Pausing Power",                 // Day 4: strategic pausing + DAF
      "Your First Challenge",          // Day 5: real-world micro-mission
      "Audio Lab Explorer",            // Day 6: DAF + FAF preview
      "Week 1 Check-In",              // Day 7: reflect + baseline
      "Onset Sentences",               // Day 8: gentle onset levels up
      "Feared Words Introduction",     // Day 9: meet your triggers
      "DAF Confidence Builder",        // Day 10: DAF with longer passages
      "AI Chat + Technique Combo",     // Day 11: combine what you know
      "Prolonged Speech Preview",      // Day 12: taste next technique
      "Real-World Courage",            // Day 13: second challenge
      "Quick Wins Checkpoint",         // Day 14: assessment + celebration
    ];
    return titles[day - 1] || `Quick Wins Day ${day}`;
  }

  if (phase === 2) {
    const idx = day - 15;
    const titles = [
      "Light Contact Introduction",    // Day 15: new technique unlocked
      "FAF First Full Session",        // Day 16: proper FAF training
      "Prolonged Speech Practice",     // Day 17: stretch those syllables
      "DAF + FAF Combined",            // Day 18: dual audio therapy
      "Continuous Phonation",          // Day 19: smooth speech flow
      "AI Practice: Ordering Food",    // Day 20: safe scenario
      "Rate Control Basics",           // Day 21: speaking pace mastery
      "Light Contact Sentences",       // Day 22: level up the technique
      "Feared Words Round 2",          // Day 23: deeper trigger work
      "Paragraph-Level Fluency",       // Day 24: longer passages
      "Midpoint Check-In",            // Day 25: celebrate progress
      "DAF Reading Marathon",          // Day 26: endurance session
      "AI Practice: Small Talk",       // Day 27: social scenario
      "Technique Mix Day",             // Day 28: choose your combo
      "Breathing Under Pressure",      // Day 29: stress + technique
      "Technique Depth Checkpoint",    // Day 30: phase 2 assessment
    ];
    return titles[idx] || `Technique Depth Day ${day}`;
  }

  if (phase === 3) {
    const idx = day - 31;
    const titles = [
      "Cancellation Technique",        // Day 31: first modification skill
      "Pull-Out Introduction",         // Day 32: mid-stutter recovery
      "Preparatory Set Basics",        // Day 33: pre-word technique
      "Choral Speaking Session",       // Day 34: speak with a partner voice
      "CBT: Your First Thought Record",// Day 35: mental game begins
      "Voluntary Stuttering",          // Day 36: desensitization power move
      "Cancellation in Sentences",     // Day 37: apply in context
      "AI Practice: Asking Directions",// Day 38: easy real-world AI
      "Pull-Out with Paragraphs",      // Day 39: harder context
      "Anxiety Ladder Introduction",   // Day 40: map your fears
      "Technique Choice Day",          // Day 41: pick your own
      "Choral Reading Long Passage",   // Day 42: extended choral
      "Feared Sounds Deep Drill",      // Day 43: phoneme-level work
      "AI Practice: Phone Call",       // Day 44: phone scenario intro
      "CBT: Thinking Traps",          // Day 45: cognitive distortions
      "Mixed Techniques Practice",     // Day 46: all tools at once
      "Real-World Challenge",          // Day 47: take it outside
      "AI Practice: Meeting Intro",    // Day 48: professional scenario
      "Modification Review",           // Day 49: technique check
      "Modification Checkpoint",       // Day 50: phase 3 assessment
    ];
    return titles[idx] || `Modification Day ${day}`;
  }

  if (phase === 4) {
    const idx = day - 51;
    const titles = [
      "AI: Job Interview Warm-Up",     // Day 51: high-stakes scenario
      "Phone Call Simulator",           // Day 52: phone practice
      "Real-World: Order at Counter",   // Day 53: live challenge
      "AI: Doctor Appointment",         // Day 54: healthcare scenario
      "Feared Words in Conversation",   // Day 55: triggers in context
      "AI: Customer Service Call",      // Day 56: complaint scenario
      "Disclosure Practice",            // Day 57: owning your stutter
      "AI: Class Presentation",         // Day 58: public speaking
      "Real-World: Phone a Friend",     // Day 59: real phone call
      "AI: Shopping & Returns",         // Day 60: assertiveness
      "Advanced DAF Conversation",      // Day 61: tech + real talk
      "CBT: Prediction Testing",        // Day 62: anxiety vs. reality
      "AI: Meeting with Questions",     // Day 63: extended professional
      "Real-World: Ask a Stranger",     // Day 64: social courage
      "Phone Marathon Day",             // Day 65: multiple calls
      "AI: Networking Event",           // Day 66: social mingling
      "Confidence Building Day",        // Day 67: celebrate + push
      "AI: Difficult Conversation",     // Day 68: emotional scenario
      "Real-World: Presentation",       // Day 69: live speaking
      "Transfer Checkpoint",            // Day 70: phase 4 assessment
    ];
    return titles[idx] || `Transfer Day ${day}`;
  }

  const idx = day - 71;
  const titles = [
    "Self-Directed Practice",          // Day 71: you choose the plan
    "Public Speaking Prep",             // Day 72: presentation skills
    "Maintenance Strategy Design",      // Day 73: build your routine
    "AI: Unscripted Conversation",      // Day 74: no safety net
    "Relapse Prevention Plan",          // Day 75: prepare for setbacks
    "Long Conversation Endurance",      // Day 76: 10+ min conversation
    "Teaching Your Techniques",         // Day 77: explain to someone
    "Real-World Challenge Marathon",    // Day 78: 3 challenges in 1 day
    "Advanced Phone Challenges",        // Day 79: cold calls
    "Stress Testing Your Fluency",      // Day 80: hardest scenarios
    "Creating Your Personal Toolbox",   // Day 81: technique reference
    "AI: High-Stakes Negotiation",      // Day 82: intense scenario
    "Community Mentoring Intro",        // Day 83: help newer users
    "Reflection & Voice Journal",       // Day 84: deep reflection
    "AI: Free-Form Practice",           // Day 85: any scenario you want
    "Your Maintenance Routine",         // Day 86: finalize daily plan
    "Celebrating Your Journey",         // Day 87: review all progress
    "Your Personal Toolkit",            // Day 88: reference card
    "Looking Forward",                  // Day 89: beyond 90 days
    "Day 90: Graduation!",             // Day 90: final assessment
  ];
  return titles[idx] || `Independence Day ${day}`;
}

function getDayTasks(day: number, phase: number): DailyTask[] {
  const tasks: DailyTask[] = [];

  // ─── Breathing warmup (every day, 2 min) ───
  tasks.push({
    title: "Breathing Warmup",
    subtitle: phase <= 2 ? "Diaphragmatic belly breathing" : "Body scan + belly breathing",
    duration: "2 min",
    type: "warmup",
    href: "/app/exercises",
  });

  // ─── Phase 1: Quick Wins (Days 1-14) ───
  // Design: taste DAF, AI, challenges, feared words in first 2 weeks
  // Target: ~10 min/day (8-12 range)
  if (phase === 1) {
    if (day === 1) {
      // THE "WHOA" MOMENT: DAF demo on Day 1
      tasks.push({
        title: "Gentle Onset — Easy Words",
        subtitle: "Say 5 words with a soft start",
        duration: "3 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "DAF Demo",
        subtitle: "Read a sentence with delayed feedback — feel the difference",
        duration: "3 min",
        type: "audio-lab",
        href: "/app/audio-lab",
      });
      tasks.push({
        title: "Voice Journal",
        subtitle: "Record how that felt — your Day 1 baseline",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    } else if (day === 2) {
      tasks.push({
        title: "Gentle Onset — Short Phrases",
        subtitle: "Soft starts on 2-3 word phrases",
        duration: "3 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "DAF Reading Practice",
        subtitle: "Read a short paragraph with DAF on",
        duration: "4 min",
        type: "audio-lab",
        href: "/app/audio-lab",
      });
    } else if (day === 3) {
      // FIRST AI CHAT: the "I just practiced a real conversation" moment
      tasks.push({
        title: "Gentle Onset Review",
        subtitle: "Quick refresher on soft starts",
        duration: "2 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "AI Chat: Ordering Coffee",
        subtitle: "Your first practice conversation — just 3 turns",
        duration: "4 min",
        type: "ai",
        href: "/app/ai-practice",
        premium: true,
      });
      tasks.push({
        title: "Voice Journal",
        subtitle: "How did it feel to practice a real conversation?",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    } else if (day === 4) {
      tasks.push({
        title: "Pausing Strategy",
        subtitle: "Learn to use deliberate pauses as a tool",
        duration: "3 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "DAF + Pausing Combined",
        subtitle: "Read with DAF and add intentional pauses",
        duration: "4 min",
        type: "audio-lab",
        href: "/app/audio-lab",
      });
      tasks.push({
        title: "Mindfulness Check-In",
        subtitle: "1-minute anxiety rating + breathing reset",
        duration: "2 min",
        type: "mindfulness",
        href: "/app/mindfulness",
      });
    } else if (day === 5) {
      // FIRST CHALLENGE: take it into the real world
      tasks.push({
        title: "Gentle Onset — Sentences",
        subtitle: "Full sentences with soft starts",
        duration: "3 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "Micro-Challenge: Say Hi",
        subtitle: "Greet someone new today using gentle onset",
        duration: "3 min",
        type: "challenge",
        href: "/app/challenges",
      });
      tasks.push({
        title: "Voice Journal",
        subtitle: "Record how the real-world moment went",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    } else if (day === 6) {
      tasks.push({
        title: "DAF Extended Reading",
        subtitle: "Longer passage with delayed feedback",
        duration: "4 min",
        type: "audio-lab",
        href: "/app/audio-lab",
      });
      tasks.push({
        title: "FAF Preview",
        subtitle: "Try pitch-shifted feedback — hear your voice differently",
        duration: "3 min",
        type: "audio-lab",
        href: "/app/audio-lab",
        premium: true,
      });
    } else if (day === 7) {
      tasks.push({
        title: "Week 1 Technique Review",
        subtitle: "Gentle onset + pausing — combine what you learned",
        duration: "4 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "Voice Journal — Weekly Reflection",
        subtitle: "Compare today to Day 1 — notice the difference",
        duration: "3 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
      tasks.push({
        title: "Mindfulness",
        subtitle: "4-7-8 breathing to close the week",
        duration: "2 min",
        type: "mindfulness",
        href: "/app/mindfulness",
      });
    } else if (day === 8) {
      tasks.push({
        title: "Gentle Onset — Longer Sentences",
        subtitle: "3-4 word phrases flowing into full sentences",
        duration: "3 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "DAF with New Passage",
        subtitle: "Fresh reading material to keep it interesting",
        duration: "4 min",
        type: "audio-lab",
        href: "/app/audio-lab",
      });
    } else if (day === 9) {
      // FEARED WORDS: meet your triggers
      tasks.push({
        title: "Feared Words Introduction",
        subtitle: "Add your first 3 trigger words",
        duration: "3 min",
        type: "feared-words",
        href: "/app/feared-words",
      });
      tasks.push({
        title: "AI Chat: Easy Small Talk",
        subtitle: "Casual conversation practice — low pressure",
        duration: "4 min",
        type: "ai",
        href: "/app/ai-practice",
        premium: true,
      });
      tasks.push({
        title: "Voice Journal",
        subtitle: "Reflect on which words feel hardest",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    } else if (day === 10) {
      tasks.push({
        title: "DAF Confidence Builder",
        subtitle: "Read a full paragraph fluently with DAF support",
        duration: "4 min",
        type: "audio-lab",
        href: "/app/audio-lab",
      });
      tasks.push({
        title: "Gentle Onset + Pausing Combo",
        subtitle: "Combine both techniques in reading",
        duration: "3 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "Mindfulness Check-In",
        subtitle: "Rate your confidence 1-5 and breathe",
        duration: "2 min",
        type: "mindfulness",
        href: "/app/mindfulness",
      });
    } else if (day === 11) {
      tasks.push({
        title: "AI Chat: Asking Directions",
        subtitle: "Quick, low-pressure real-world scenario",
        duration: "4 min",
        type: "ai",
        href: "/app/ai-practice",
        premium: true,
      });
      tasks.push({
        title: "Feared Words Practice",
        subtitle: "Say your trigger words with gentle onset",
        duration: "3 min",
        type: "feared-words",
        href: "/app/feared-words",
      });
    } else if (day === 12) {
      tasks.push({
        title: "Prolonged Speech Preview",
        subtitle: "Taste the next technique — stretch syllables slowly",
        duration: "3 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "DAF + Prolonged Speech",
        subtitle: "Combine stretching with delayed feedback",
        duration: "4 min",
        type: "audio-lab",
        href: "/app/audio-lab",
      });
      tasks.push({
        title: "Voice Journal",
        subtitle: "How does prolonged speech feel different?",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    } else if (day === 13) {
      tasks.push({
        title: "Micro-Challenge: Order Something",
        subtitle: "Order a drink or meal using gentle onset",
        duration: "3 min",
        type: "challenge",
        href: "/app/challenges",
      });
      tasks.push({
        title: "Technique Combo Practice",
        subtitle: "Gentle onset + pausing + DAF — all together",
        duration: "4 min",
        type: "exercise",
        href: "/app/exercises",
      });
    } else if (day === 14) {
      // CHECKPOINT: celebrate + assess
      tasks.push({
        title: "Phase 1 Assessment",
        subtitle: "Read a passage — see how far you've come since Day 1",
        duration: "4 min",
        type: "exercise",
        href: "/app/progress/assess",
      });
      tasks.push({
        title: "Voice Journal — Phase Reflection",
        subtitle: "What worked? What surprised you? What's next?",
        duration: "3 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
      tasks.push({
        title: "Mindfulness Celebration",
        subtitle: "You completed Phase 1 — breathe and appreciate that",
        duration: "2 min",
        type: "mindfulness",
        href: "/app/mindfulness",
      });
    }
  }

  // ─── Phase 2: Technique Depth (Days 15-30) ───
  // Design: deeper technique work with regular AI practice + feared words
  // Target: ~10 min/day
  else if (phase === 2) {
    const dayInPhase = day - 14;
    const rotation = dayInPhase % 6;

    if (rotation === 1) {
      // Technique day: fluency shaping focus
      const techniques = [
        { title: "Light Articulatory Contact", sub: "Barely touch your lips and tongue to form sounds" },
        { title: "Prolonged Speech Drill", sub: "Stretch vowels smoothly through sentences" },
        { title: "Continuous Phonation", sub: "Keep your voice flowing without hard stops" },
      ];
      const t = techniques[(dayInPhase - 1) % techniques.length];
      tasks.push({
        title: t.title,
        subtitle: t.sub,
        duration: "4 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "DAF Support Practice",
        subtitle: "Apply today's technique with DAF on",
        duration: "4 min",
        type: "audio-lab",
        href: "/app/audio-lab",
      });
    } else if (rotation === 2) {
      // Audio Lab day: FAF + combined
      tasks.push({
        title: dayInPhase <= 8 ? "FAF Training Session" : "DAF + FAF Combined",
        subtitle: dayInPhase <= 8 ? "Practice with pitch-shifted feedback" : "Dual audio therapy reading",
        duration: "5 min",
        type: "audio-lab",
        href: "/app/audio-lab",
        premium: true,
      });
      tasks.push({
        title: "Rate Control Practice",
        subtitle: "Read at 3 different speeds — slow, medium, natural",
        duration: "3 min",
        type: "exercise",
        href: "/app/exercises",
      });
    } else if (rotation === 3) {
      // AI day
      const scenarios = ["Ordering Food", "Small Talk", "Asking Directions"];
      const scenario = scenarios[(dayInPhase - 1) % scenarios.length];
      tasks.push({
        title: `AI Practice: ${scenario}`,
        subtitle: "Apply your techniques in a practice conversation",
        duration: "5 min",
        type: "ai",
        href: "/app/ai-practice",
        premium: true,
      });
      tasks.push({
        title: "Voice Journal",
        subtitle: "How did your techniques hold up in conversation?",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    } else if (rotation === 4) {
      // Feared words + technique
      tasks.push({
        title: "Feared Words in Sentences",
        subtitle: "Use your trigger words in full sentences",
        duration: "3 min",
        type: "feared-words",
        href: "/app/feared-words",
      });
      tasks.push({
        title: "Light Contact + Prolonged Speech",
        subtitle: "Combine two techniques in paragraph reading",
        duration: "4 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "Mindfulness Check-In",
        subtitle: "Box breathing + anxiety rating",
        duration: "2 min",
        type: "mindfulness",
        href: "/app/mindfulness",
      });
    } else if (rotation === 5) {
      // Challenge + audio
      tasks.push({
        title: "Real-World Micro-Challenge",
        subtitle: "Use today's technique in a real interaction",
        duration: "3 min",
        type: "challenge",
        href: "/app/challenges",
      });
      tasks.push({
        title: "DAF Reading — New Passage",
        subtitle: "Fresh material to build fluency confidence",
        duration: "4 min",
        type: "audio-lab",
        href: "/app/audio-lab",
      });
    } else {
      // Review + learn day
      tasks.push({
        title: "Technique Review",
        subtitle: "Pick your favorite technique and practice freestyle",
        duration: "4 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "Learn: How Fluency Shaping Works",
        subtitle: "The neuroscience behind your techniques",
        duration: "3 min",
        type: "learn",
        href: "/app/learn",
      });
      tasks.push({
        title: "Voice Journal",
        subtitle: "What technique feels most natural so far?",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    }

    // Phase 2 checkpoint on last day
    if (day === 30) {
      tasks.length = 1; // keep warmup
      tasks.push({
        title: "Phase 2 Assessment",
        subtitle: "Read a passage — compare to your Day 14 baseline",
        duration: "4 min",
        type: "exercise",
        href: "/app/progress/assess",
      });
      tasks.push({
        title: "Voice Journal — Phase Reflection",
        subtitle: "Which techniques are becoming your go-to?",
        duration: "3 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    }
  }

  // ─── Phase 3: Modification & Mindset (Days 31-50) ───
  // Design: stuttering modification techniques + CBT/mindset work
  // Target: ~10 min/day
  else if (phase === 3) {
    const dayInPhase = day - 30;
    const rotation = dayInPhase % 7;

    if (rotation === 1) {
      // Modification technique day
      const techniques = [
        { title: "Cancellation Practice", sub: "Pause after a stutter, then say it again smoothly" },
        { title: "Pull-Out Technique", sub: "Ease out of a stutter mid-word instead of forcing" },
        { title: "Preparatory Set Drill", sub: "Set up your mouth before a hard word" },
      ];
      const t = techniques[(dayInPhase - 1) % techniques.length];
      tasks.push({
        title: t.title,
        subtitle: t.sub,
        duration: "4 min",
        type: "exercise",
        href: "/app/exercises",
        premium: true,
      });
      tasks.push({
        title: "Apply in Sentences",
        subtitle: "Use today's technique in 5 sentences",
        duration: "4 min",
        type: "exercise",
        href: "/app/exercises",
      });
    } else if (rotation === 2) {
      // CBT / mindset day
      const cbtTasks = [
        { title: "CBT: Thought Record", sub: "Capture a speech-anxiety thought and reframe it", href: "/app/mindset/new-thought" },
        { title: "CBT: Thinking Traps", sub: "Identify which cognitive distortions trip you up", href: "/app/mindset/traps" },
        { title: "Anxiety Ladder Step", sub: "Rate and rank your feared situations", href: "/mindfulness" },
      ];
      const c = cbtTasks[(dayInPhase - 1) % cbtTasks.length];
      tasks.push({
        title: c.title,
        subtitle: c.sub,
        duration: "4 min",
        type: "mindfulness",
        href: c.href,
        premium: true,
      });
      tasks.push({
        title: "Feared Words Drill",
        subtitle: "Practice trigger words with modification techniques",
        duration: "3 min",
        type: "feared-words",
        href: "/app/feared-words",
      });
      tasks.push({
        title: "Voice Journal",
        subtitle: "What thoughts come up before speaking?",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    } else if (rotation === 3) {
      // AI practice day (medium scenarios)
      const scenarios = ["Phone Call", "Meeting Introduction", "Asking Directions", "Shopping"];
      const scenario = scenarios[(dayInPhase - 1) % scenarios.length];
      tasks.push({
        title: `AI Practice: ${scenario}`,
        subtitle: "Use your modification techniques in conversation",
        duration: "5 min",
        type: "ai",
        href: "/app/ai-practice",
        premium: true,
      });
      tasks.push({
        title: "Technique Reflection",
        subtitle: "Which technique did you reach for? How did it go?",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    } else if (rotation === 4) {
      // Choral speaking + audio
      tasks.push({
        title: "Choral Speaking Session",
        subtitle: "Read along with an AI voice for the choral effect",
        duration: "4 min",
        type: "audio-lab",
        href: "/app/audio-lab",
        premium: true,
      });
      tasks.push({
        title: "Voluntary Stuttering",
        subtitle: "Stutter on purpose — reduce the fear of stuttering",
        duration: "3 min",
        type: "exercise",
        href: "/app/exercises",
        premium: true,
      });
    } else if (rotation === 5) {
      // Real-world challenge
      tasks.push({
        title: "Real-World Challenge",
        subtitle: "Use a modification technique in a real interaction today",
        duration: "3 min",
        type: "challenge",
        href: "/app/challenges",
        premium: true,
      });
      tasks.push({
        title: "DAF + Modification Combo",
        subtitle: "Practice cancellation or pull-out with DAF support",
        duration: "4 min",
        type: "audio-lab",
        href: "/app/audio-lab",
      });
    } else if (rotation === 6) {
      // Mixed technique + feared words
      tasks.push({
        title: "Mixed Techniques Practice",
        subtitle: "Fluency shaping + modification — use what fits",
        duration: "4 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "Feared Words in Paragraphs",
        subtitle: "Your trigger words embedded in longer text",
        duration: "3 min",
        type: "feared-words",
        href: "/app/feared-words",
      });
      tasks.push({
        title: "Mindfulness",
        subtitle: "Pre-speaking calm-down technique",
        duration: "2 min",
        type: "mindfulness",
        href: "/app/mindfulness",
      });
    } else {
      // Learn + review day
      tasks.push({
        title: "Learn: Stuttering Modification Science",
        subtitle: "Why cancellation and pull-out work",
        duration: "3 min",
        type: "learn",
        href: "/app/learn",
      });
      tasks.push({
        title: "Technique Choice Practice",
        subtitle: "Read a passage — choose your own techniques",
        duration: "4 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: "Voice Journal",
        subtitle: "Are you more a shaper or a modifier? Which fits you?",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    }

    // Phase 3 checkpoint
    if (day === 50) {
      tasks.length = 1;
      tasks.push({
        title: "Phase 3 Assessment",
        subtitle: "Full passage reading — measure your progress",
        duration: "4 min",
        type: "exercise",
        href: "/app/progress/assess",
      });
      tasks.push({
        title: "Voice Journal — Halfway Celebration",
        subtitle: "You're halfway through the program!",
        duration: "3 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    }
  }

  // ─── Phase 4: Real-World Transfer (Days 51-70) ───
  // Design: harder AI scenarios, phone sims, real challenges, disclosure
  // Target: ~10 min/day (some days 12 for longer AI conversations)
  else if (phase === 4) {
    const dayInPhase = day - 50;
    const rotation = dayInPhase % 5;

    if (rotation === 1) {
      // AI conversation day — harder scenarios
      const scenarios = [
        { title: "AI: Job Interview", sub: "Handle tough questions with fluency techniques" },
        { title: "AI: Doctor Appointment", sub: "Describe symptoms clearly under pressure" },
        { title: "AI: Customer Service Call", sub: "Navigate a complaint scenario" },
        { title: "AI: Class Presentation", sub: "Present to a virtual audience" },
      ];
      const s = scenarios[(dayInPhase - 1) % scenarios.length];
      tasks.push({
        title: "Quick Technique Warm-Up",
        subtitle: "30 seconds of your go-to technique",
        duration: "1 min",
        type: "exercise",
        href: "/app/exercises",
      });
      tasks.push({
        title: s.title,
        subtitle: s.sub,
        duration: "6 min",
        type: "ai",
        href: "/app/ai-practice",
        premium: true,
      });
      tasks.push({
        title: "Voice Journal",
        subtitle: "Rate your fluency and confidence after that scenario",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    } else if (rotation === 2) {
      // Phone simulation day
      tasks.push({
        title: "Phone Call Simulator",
        subtitle: "Practice a phone conversation — no visual cues",
        duration: "5 min",
        type: "ai",
        href: "/app/ai-practice",
        premium: true,
      });
      tasks.push({
        title: "Feared Words in Conversation",
        subtitle: "Work your trigger words into practice dialogue",
        duration: "3 min",
        type: "feared-words",
        href: "/app/feared-words",
      });
    } else if (rotation === 3) {
      // Real-world challenge day
      tasks.push({
        title: "Real-World Challenge",
        subtitle: "Take your skills into a real interaction today",
        duration: "5 min",
        type: "challenge",
        href: "/app/challenges",
        premium: true,
      });
      tasks.push({
        title: "CBT: Prediction vs. Reality",
        subtitle: "What did you predict? What actually happened?",
        duration: "3 min",
        type: "mindfulness",
        href: "/app/mindset",
        premium: true,
      });
    } else if (rotation === 4) {
      // Disclosure + technique
      tasks.push({
        title: dayInPhase <= 10 ? "Disclosure Practice" : "Advanced Technique Mix",
        subtitle: dayInPhase <= 10
          ? "Practice telling someone about your stutter — own it"
          : "Combine fluency shaping + modification + breathing",
        duration: "4 min",
        type: "exercise",
        href: "/app/exercises",
        premium: true,
      });
      tasks.push({
        title: "DAF Conversation Practice",
        subtitle: "Talk freely with DAF — build transfer confidence",
        duration: "4 min",
        type: "audio-lab",
        href: "/app/audio-lab",
      });
    } else {
      // Mixed practice + mindfulness
      tasks.push({
        title: "AI: Extended Conversation",
        subtitle: "Longer scenario — push past the 5-minute mark",
        duration: "6 min",
        type: "ai",
        href: "/app/ai-practice",
        premium: true,
      });
      tasks.push({
        title: "Mindfulness Reset",
        subtitle: "Breathing exercise + confidence affirmation",
        duration: "2 min",
        type: "mindfulness",
        href: "/app/mindfulness",
      });
    }

    // Phase 4 checkpoint
    if (day === 70) {
      tasks.length = 1;
      tasks.push({
        title: "Phase 4 Assessment",
        subtitle: "Full reading passage + conversation — your best yet?",
        duration: "5 min",
        type: "exercise",
        href: "/app/progress/assess",
      });
      tasks.push({
        title: "Voice Journal — Real-World Reflection",
        subtitle: "How has your speaking changed outside the app?",
        duration: "3 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    }
  }

  // ─── Phase 5: Independence (Days 71-90) ───
  // Design: self-directed practice, advanced scenarios, maintenance planning
  // Target: ~10 min/day
  else {
    const dayInPhase = day - 70;
    const rotation = dayInPhase % 5;

    if (rotation === 1) {
      // Self-directed technique day
      tasks.push({
        title: "Self-Directed Practice",
        subtitle: "Choose your own technique and passage — you lead",
        duration: "5 min",
        type: "exercise",
        href: "/app/exercises",
        premium: true,
      });
      tasks.push({
        title: "Voice Journal",
        subtitle: "What did you choose and why? Track your instincts",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    } else if (rotation === 2) {
      // Advanced AI day
      const scenarios = [
        { title: "AI: Unscripted Conversation", sub: "No safety net — handle whatever comes" },
        { title: "AI: High-Stakes Negotiation", sub: "Stay fluent under pressure" },
        { title: "AI: Free-Form Practice", sub: "Pick any scenario — full control" },
        { title: "AI: Long Conversation", sub: "10+ turns — build endurance" },
      ];
      const s = scenarios[(dayInPhase - 1) % scenarios.length];
      tasks.push({
        title: s.title,
        subtitle: s.sub,
        duration: "6 min",
        type: "ai",
        href: "/app/ai-practice",
        premium: true,
      });
      tasks.push({
        title: "Mindfulness",
        subtitle: "Post-conversation calm-down and reflection",
        duration: "2 min",
        type: "mindfulness",
        href: "/app/mindfulness",
      });
    } else if (rotation === 3) {
      // Real-world marathon day
      tasks.push({
        title: "Real-World Challenge",
        subtitle: "Advanced mission — phone call, presentation, or social",
        duration: "5 min",
        type: "challenge",
        href: "/app/challenges",
        premium: true,
      });
      tasks.push({
        title: "CBT: Prediction Testing",
        subtitle: "Log your prediction, do the challenge, compare reality",
        duration: "3 min",
        type: "mindfulness",
        href: "/app/mindset",
        premium: true,
      });
    } else if (rotation === 4) {
      // Maintenance planning / teaching
      tasks.push({
        title: dayInPhase <= 10 ? "Build Your Maintenance Routine" : "Teach Your Techniques",
        subtitle: dayInPhase <= 10
          ? "Design your post-90-day daily practice plan"
          : "Explain a technique out loud — teaching deepens mastery",
        duration: "4 min",
        type: "exercise",
        href: "/app/exercises",
        premium: true,
      });
      tasks.push({
        title: "Feared Words Mastery Check",
        subtitle: "Review your trigger words — how many feel easy now?",
        duration: "3 min",
        type: "feared-words",
        href: "/app/feared-words",
      });
      tasks.push({
        title: "Voice Journal",
        subtitle: "What would you tell Day 1 you?",
        duration: "2 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
    } else {
      // Review + learn
      tasks.push({
        title: dayInPhase <= 10 ? "Relapse Prevention Planning" : "Your Personal Toolkit",
        subtitle: dayInPhase <= 10
          ? "Identify your triggers and build a plan for tough days"
          : "Finalize your go-to techniques for any situation",
        duration: "4 min",
        type: "learn",
        href: "/app/learn",
        premium: true,
      });
      tasks.push({
        title: "Advanced DAF + Free Speech",
        subtitle: "Talk about anything with DAF — practice being natural",
        duration: "4 min",
        type: "audio-lab",
        href: "/app/audio-lab",
      });
    }

    // Day 90: Graduation
    if (day === 90) {
      tasks.length = 1;
      tasks.push({
        title: "Final Assessment",
        subtitle: "Your graduation reading — see your full journey",
        duration: "4 min",
        type: "exercise",
        href: "/app/progress/assess",
      });
      tasks.push({
        title: "Voice Journal — Graduation",
        subtitle: "Record your graduation message to yourself",
        duration: "3 min",
        type: "journal",
        href: "/app/voice-journal/new",
      });
      tasks.push({
        title: "Celebrate & Plan Ahead",
        subtitle: "Review your achievements and set your next goal",
        duration: "2 min",
        type: "mindfulness",
        href: "/app/mindfulness",
      });
    }
  }

  return tasks;
}

/** Get plan for a specific day (days 1-90 use curated curriculum, 91+ use adaptive engine) */
export function getDailyPlan(day: number): DailyPlan | null {
  if (day < 1) return null;
  if (day <= 90) {
    const plans = generateDailyPlans();
    return plans[day - 1];
  }
  // Day 91+: delegate to adaptive engine (balanced default when no outcome data)
  return getAdaptiveDailyPlanImport(day);
}

/** Get current phase info */
export function getPhaseInfo(day: number) {
  const phase = getPhase(day);
  const [start, end] = PHASE_RANGES[phase];

  // Maintenance phase (day 91+) has no fixed end
  if (phase === 6) {
    const dayInPhase = day - start + 1;
    return {
      phase,
      label: PHASE_LABELS[phase],
      dayInPhase,
      daysInPhase: null as number | null,
      progress: 100, // always "complete" in maintenance
    };
  }

  const daysInPhase = end - start + 1;
  const dayInPhase = day - start + 1;
  return {
    phase,
    label: PHASE_LABELS[phase],
    dayInPhase,
    daysInPhase: daysInPhase as number | null,
    progress: Math.round((dayInPhase / daysInPhase) * 100),
  };
}
