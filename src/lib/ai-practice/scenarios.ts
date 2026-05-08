export type ScenarioStep = {
  id: string;
  label: string;
  matcher: RegExp;
};

export type ScenarioTask = {
  scenario: string;
  goal: string;
  steps: ScenarioStep[];
};

export const SCENARIO_TASKS: Record<string, ScenarioTask> = {
  "ordering-food": {
    scenario: "ordering-food",
    goal: "Complete a simple restaurant or cafe order.",
    steps: [
      {
        id: "greeting",
        label: "Greet the server",
        matcher: /\b(hi|hello|hey|good morning|good afternoon)\b/i,
      },
      {
        id: "order-item",
        label: "Say what you want to order",
        matcher:
          /\b(want|like|have|order|get|take)\b.*\b(coffee|tea|water|sandwich|burger|salad|pizza|pasta|soup|latte|meal|food)\b/i,
      },
      {
        id: "option",
        label: "Answer one follow-up question",
        matcher:
          /\b(small|medium|large|regular|no|yes|please|without|with|for here|to go|takeout)\b/i,
      },
      {
        id: "confirm",
        label: "Confirm the order",
        matcher: /\b(that'?s all|yes|correct|sounds good|thank you|thanks)\b/i,
      },
      {
        id: "close",
        label: "End politely",
        matcher: /\b(thank you|thanks|bye|goodbye|have a good)\b/i,
      },
    ],
  },
  "phone-call": {
    scenario: "phone-call",
    goal: "Complete a short appointment-style phone call.",
    steps: [
      { id: "hello", label: "Answer the call", matcher: /\b(hello|hi|hey)\b/i },
      {
        id: "purpose",
        label: "State why you are calling",
        matcher: /\b(appointment|schedule|calling|need|want|like)\b/i,
      },
      {
        id: "details",
        label: "Provide a requested detail",
        matcher: /\b(name|time|date|today|tomorrow|morning|afternoon)\b/i,
      },
      {
        id: "close",
        label: "Close the call",
        matcher: /\b(thank you|thanks|bye|goodbye)\b/i,
      },
    ],
  },
};

export function getScenarioTask(scenario: string): ScenarioTask | null {
  return SCENARIO_TASKS[scenario] ?? null;
}

export function getCompletedScenarioSteps(
  task: ScenarioTask,
  userTexts: string[]
) {
  const fullText = userTexts.join("\n");
  return new Set(
    task.steps
      .filter((step) => step.matcher.test(fullText))
      .map((step) => step.id)
  );
}
