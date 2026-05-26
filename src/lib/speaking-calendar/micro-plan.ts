export type SpeakingEventType =
  | "interview"
  | "presentation"
  | "meeting"
  | "phone"
  | "social"
  | "other";

export interface MicroPlanStep {
  dayOffset: number;
  title: string;
  action: string;
  href?: string;
}

export interface EventMicroPlan {
  eventTitle: string;
  eventDate: string;
  steps: MicroPlanStep[];
}

export function buildMicroPlanForEvent(
  title: string,
  eventType: SpeakingEventType,
  eventDate: Date
): EventMicroPlan {
  const iso = eventDate.toISOString();
  const base: MicroPlanStep[] = [
    {
      dayOffset: -3,
      title: "Prep rep",
      action: "10-min technique practice + one feared-word drill.",
      href: "/app/techniques",
    },
    {
      dayOffset: -1,
      title: "AI rehearsal",
      action: "Run one AI scenario matched to this situation.",
      href: "/app/ai-practice",
    },
    {
      dayOffset: 0,
      title: "Day-of calm",
      action: "2-min Quick Calm + set one speaking intention.",
      href: "/app/mindfulness",
    },
  ];

  const typeSteps: Record<SpeakingEventType, MicroPlanStep[]> = {
    interview: [
      {
        dayOffset: -2,
        title: "Interview answers",
        action: "Practice 3 answers with gentle onset on the first word.",
        href: "/app/ai-practice/job-interview",
      },
    ],
    presentation: [
      {
        dayOffset: -2,
        title: "Opening lines",
        action: "Read your opening aloud twice with pausing.",
        href: "/app/exercises",
      },
    ],
    meeting: [
      {
        dayOffset: -2,
        title: "One contribution",
        action: "Plan one comment you will make in the meeting.",
        href: "/app/mindset/new-thought",
      },
    ],
    phone: [
      {
        dayOffset: -2,
        title: "Phone rep",
        action: "Complete one AI phone practice call.",
        href: "/app/ai-practice/phone-call",
      },
    ],
    social: [
      {
        dayOffset: -2,
        title: "Exposure step",
        action: "Log one exposure-ladder rung related to this event.",
        href: "/app/exposure-ladder",
      },
    ],
    other: [
      {
        dayOffset: -2,
        title: "Real-world micro-challenge",
        action: "Complete today's speaking challenge with before/after anxiety ratings.",
        href: "/app/challenges",
      },
    ],
  };

  return {
    eventTitle: title,
    eventDate: iso,
    steps: [...base, ...typeSteps[eventType]].sort((a, b) => a.dayOffset - b.dayOffset),
  };
}

export function getActivePlanSteps(
  plan: EventMicroPlan,
  now = new Date()
): MicroPlanStep[] {
  const eventMs = new Date(plan.eventDate).getTime();
  const msPerDay = 24 * 60 * 60 * 1000;
  return plan.steps.filter((step) => {
    const stepDate = eventMs + step.dayOffset * msPerDay;
    const daysUntil = Math.ceil((stepDate - now.getTime()) / msPerDay);
    return daysUntil >= 0 && daysUntil <= 3;
  });
}
