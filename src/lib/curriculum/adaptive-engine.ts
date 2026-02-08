/**
 * Adaptive Engine — generates infinite personalized daily plans for day 91+.
 *
 * Days 1-90 use the curated curriculum from daily-plans.ts.
 * Day 91+ switches to this engine, which selects techniques based on
 * the user's A/B outcome data (fluency shaping vs stuttering modification).
 *
 * This module is pure — no DB calls. It takes pre-fetched outcome data as input.
 */

import type { DailyPlan, DailyTask } from "./daily-plans";
import type { TechniqueOutcomeSummary } from "@/lib/actions/user-progress";
import {
  FLUENCY_SHAPING_TECHNIQUES,
  MODIFICATION_TECHNIQUES,
} from "./technique-categories";
import { getAdaptiveTechnique, getContentLevel } from "@/lib/practice/daily-session";

/* ─── Affirmations (shared with daily-plans.ts, duplicated here to keep module pure) ─── */

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

/* ─── Scenario pools for AI practice tasks ─── */

const AI_SCENARIOS = [
  "ordering-food",
  "small-talk",
  "asking-directions",
  "phone-call",
  "job-interview",
  "doctor-appointment",
  "meeting-intro",
  "customer-service",
  "class-presentation",
];

/**
 * Determine the phase label for maintenance mode based on weighting.
 */
function getMaintenancePhaseLabel(weight: number): string {
  if (weight >= 0.65) return "Maintenance: Fluency Shaping Focus";
  if (weight <= 0.35) return "Maintenance: Modification Focus";
  return "Maintenance: Balanced";
}

/**
 * Generate a daily plan for day 91+.
 * Pure function — no side effects or DB calls.
 */
export function getAdaptiveDailyPlan(
  day: number,
  userOutcomes?: TechniqueOutcomeSummary | null
): DailyPlan {
  const weight = userOutcomes?.recommendedWeight ?? 0.5;
  const technique = getAdaptiveTechnique(day, userOutcomes);
  const contentLevel = getContentLevel(day);

  const tasks: DailyTask[] = [];

  // Every day starts with breathing warm-up
  tasks.push({
    title: "Diaphragmatic Breathing",
    subtitle: "Advanced breathing with body scan",
    duration: "2 min",
    type: "warmup",
    href: "/exercises",
  });

  // Main technique practice (weighted by approach)
  tasks.push({
    title: `${technique.name} Practice`,
    subtitle: `${capitalizeFirst(contentLevel)}-level practice`,
    duration: "8 min",
    type: "exercise",
    href: "/exercises",
    premium: true,
  });

  // Audio Lab rotation (every other day)
  if (day % 2 === 0) {
    tasks.push({
      title: day % 4 === 0 ? "DAF + FAF Combined" : "DAF Reading Session",
      subtitle: "Paragraph-level auditory feedback practice",
      duration: "10 min",
      type: "audio-lab",
      href: "/audio-lab",
      premium: true,
    });
  }

  // AI conversation (every 3rd day)
  if (day % 3 === 0) {
    const scenarioIdx = (day - 1) % AI_SCENARIOS.length;
    tasks.push({
      title: "AI Conversation Practice",
      subtitle: `Scenario: ${formatScenarioName(AI_SCENARIOS[scenarioIdx])}`,
      duration: "8 min",
      type: "ai",
      href: "/ai-practice",
      premium: true,
    });
  }

  // Feared words drill (every 4th day)
  if (day % 4 === 1) {
    tasks.push({
      title: "Feared Words Drill",
      subtitle: "Target your trigger words with today's technique",
      duration: "5 min",
      type: "feared-words",
      href: "/feared-words",
      premium: true,
    });
  }

  // Voice journal every day
  tasks.push({
    title: "Voice Journal Entry",
    subtitle: "Record how your speech feels today",
    duration: "2 min",
    type: "journal",
    href: "/voice-journal/new",
  });

  // Mindfulness every 5th day
  if (day % 5 === 0) {
    tasks.push({
      title: "Mindfulness Check-In",
      subtitle: "2-minute guided breathing + anxiety rating",
      duration: "2 min",
      type: "mindfulness",
      href: "/mindfulness",
    });
  }

  // Real-world challenge every 7th day
  if (day % 7 === 0) {
    tasks.push({
      title: "Real-World Challenge",
      subtitle: "Take your practice into the real world",
      duration: "varies",
      type: "challenge",
      href: "/challenges",
      premium: true,
    });
  }

  return {
    day,
    phase: 6, // Maintenance phase
    phaseLabel: getMaintenancePhaseLabel(weight),
    title: getMaintenanceDayTitle(day, technique.name),
    affirmation: affirmations[(day - 1) % affirmations.length],
    tasks,
  };
}

function getMaintenanceDayTitle(day: number, techniqueName: string): string {
  const dayInMaintenance = day - 90;
  const cycle = dayInMaintenance % 7;
  const titles = [
    `${techniqueName} Focus Day`,
    "Technique Combination",
    "Fluency Strengthening",
    `${techniqueName} Deep Practice`,
    "Mixed Skills Review",
    "Advanced Application",
    "Weekly Challenge Day",
  ];
  return titles[cycle];
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatScenarioName(scenario: string): string {
  return scenario
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
