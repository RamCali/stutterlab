import type { DailyPlan, DailyTask, TaskType } from "./daily-plans";
import type { OnboardingData } from "@/lib/onboarding/feared-situations";
import type { AssessmentProfile } from "@/lib/onboarding/scoring";
import { shouldDeemphasizeDaf } from "@/lib/audio/daf-responder";

export interface PracticeEmphasis {
  fluencyShaping: number;
  stutteringModification: number;
  cbt: number;
}

const DEEP_PRACTICE_TASK: DailyTask = {
  title: "Optional: Deep Practice",
  subtitle: "Add 10–20 extra minutes when you have time — consistency beats marathon sessions",
  duration: "+10–20 min",
  type: "exercise",
  href: "/app/exercises",
  reason:
    "Research on home practice often uses 20–30 minutes; this optional block lets you go deeper without breaking your daily habit.",
};

function getEmphasis(data?: OnboardingData | null): PracticeEmphasis | null {
  const e = data?.recommendedEmphasis;
  if (!e) return null;
  return {
    fluencyShaping: e.fluencyShaping,
    stutteringModification: e.stutteringModification,
    cbt: e.cbt,
  };
}

function getProfile(data?: OnboardingData | null): AssessmentProfile | null {
  if (data?.assessmentProfile) return data.assessmentProfile;
  const e = getEmphasis(data);
  if (!e) return null;
  if (e.cbt >= 0.4) return "anxiety-heavy";
  if (e.stutteringModification >= 0.38 && e.fluencyShaping >= 0.38) return "technique-ready";
  const avoidance = (data?.avoidanceBehaviors?.length ?? 0) >= 2;
  if (avoidance || e.cbt >= 0.3 && e.fluencyShaping < 0.4) return "avoidance-heavy";
  return "balanced";
}

/** Remove DAF/audio-lab before day 6 in early rotation */
function enforceDafIntroDay(plan: DailyPlan): DailyTask[] {
  if (plan.day >= 6) return plan.tasks;
  return plan.tasks.filter((t) => t.type !== "audio-lab");
}

function swapTaskType(
  tasks: DailyTask[],
  from: TaskType,
  to: TaskType,
  replacement: Partial<DailyTask>,
): DailyTask[] {
  const idx = tasks.findIndex((t) => t.type === from);
  if (idx === -1) return tasks;
  const next = [...tasks];
  next[idx] = {
    ...tasks[idx],
    ...replacement,
    type: to,
  };
  return next;
}

function ensureTaskType(tasks: DailyTask[], task: DailyTask): DailyTask[] {
  if (tasks.some((t) => t.type === task.type)) return tasks;
  return [...tasks, task];
}

function deemphasizeAudioLab(tasks: DailyTask[]): DailyTask[] {
  if (!shouldDeemphasizeDaf()) return tasks;
  return tasks.map((t) =>
    t.type === "audio-lab"
      ? {
          ...t,
          title: "Technique Practice (Audio Lab optional)",
          subtitle:
            "DAF has not helped much for you — prioritize shaping/modification drills today",
          href: "/app/exercises",
          type: "exercise" as TaskType,
        }
      : t,
  );
}

/**
 * Applies profile-based task changes to today's plan (Headspace-style daily practice).
 */
export function applyPracticePersonalization(
  plan: DailyPlan,
  onboardingData?: OnboardingData | null,
): DailyPlan {
  const profile = getProfile(onboardingData);
  const emphasis = getEmphasis(onboardingData);
  const busy = onboardingData?.painPoints?.includes("busy");
  let tasks = enforceDafIntroDay(plan);
  tasks = deemphasizeAudioLab(tasks);

  if (profile === "anxiety-heavy" && plan.phase <= 2) {
    if (tasks.some((t) => t.type === "audio-lab") && plan.day >= 6) {
      tasks = swapTaskType(tasks, "audio-lab", "mindfulness", {
        title: "Mindset Check-In",
        subtitle: "Anxiety rating + breathing — reduces tension before technique work",
        duration: "3 min",
        href: "/app/mindfulness",
      });
    }
    tasks = ensureTaskType(tasks, {
      title: "Exposure Ladder Step",
      subtitle: "One small graded speaking step — build evidence against catastrophic predictions",
      duration: "3 min",
      type: "mindfulness",
      href: "/app/mindset",
    });
  }

  if (profile === "avoidance-heavy") {
    tasks = ensureTaskType(tasks, {
      title: "Micro-Challenge",
      subtitle: "Break avoidance with one real-world speaking rep",
      duration: "3 min",
      type: "challenge",
      href: "/app/challenges",
    });
    if (plan.day >= 3) {
      tasks = ensureTaskType(tasks, {
        title: "Feared Words",
        subtitle: "Practice words you tend to substitute or skip",
        duration: "2 min",
        type: "feared-words",
        href: "/app/feared-words",
      });
    }
  }

  if (profile === "technique-ready" && plan.phase <= 3) {
    tasks = ensureTaskType(tasks, {
      title: "Technique Drill",
      subtitle: "Extra motor practice — you're ready for more shaping and modification reps",
      duration: "4 min",
      type: "exercise",
      href: "/app/techniques",
    });
  }

  if (emphasis && emphasis.cbt >= 0.35 && plan.phase >= 3 && plan.day % 2 === 0) {
    tasks = ensureTaskType(tasks, {
      title: "Behavioral Experiment",
      subtitle: "Write a prediction, try speaking, log what actually happened",
      duration: "3 min",
      type: "journal",
      href: "/app/mindset",
    });
  }

  if (!busy) {
    tasks = [...tasks, DEEP_PRACTICE_TASK];
  }

  const practiceTitle =
    plan.day <= 90
      ? "Today's Practice"
      : plan.title;

  const phaseLabel =
    plan.phase === 6
      ? "Your practice"
      : profile === "anxiety-heavy"
        ? "Focus: confidence & exposure"
        : profile === "avoidance-heavy"
          ? "Focus: real-world speaking"
          : profile === "technique-ready"
            ? "Focus: technique depth"
            : plan.phaseLabel;

  return {
    ...plan,
    title: practiceTitle,
    phaseLabel,
    tasks,
  };
}

export function getPracticeStreakLabel(practiceDay: number): string {
  if (practiceDay <= 1) return "Day 1 of your practice habit";
  return `${practiceDay} days of practice`;
}
