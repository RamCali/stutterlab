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
  florist: {
    scenario: "florist",
    goal: "Place a simple flower order by phone.",
    steps: [
      { id: "hello", label: "Greet the florist", matcher: /\b(hello|hi|hey)\b/i },
      {
        id: "occasion",
        label: "Say what the flowers are for",
        matcher: /\b(birthday|anniversary|sympathy|wedding|gift|flowers|bouquet|arrangement)\b/i,
      },
      {
        id: "details",
        label: "Give a delivery or pickup detail",
        matcher: /\b(delivery|deliver|pickup|pick up|today|tomorrow|morning|afternoon|address|date)\b/i,
      },
      {
        id: "budget",
        label: "Answer a budget or color question",
        matcher: /\b(dollars?|budget|pink|red|white|yellow|blue|purple|bright|soft|small|medium|large)\b/i,
      },
      {
        id: "close",
        label: "Close the order politely",
        matcher: /\b(thank you|thanks|bye|goodbye|that'?s all)\b/i,
      },
    ],
  },
  "customer-service": {
    scenario: "customer-service",
    goal: "Complete a bank-style customer service call.",
    steps: [
      { id: "hello", label: "Answer the representative", matcher: /\b(hello|hi|hey)\b/i },
      {
        id: "issue",
        label: "Explain the account or card issue",
        matcher: /\b(account|card|charge|payment|transaction|balance|deposit|withdrawal|issue|problem)\b/i,
      },
      {
        id: "verify",
        label: "Provide a requested detail",
        matcher: /\b(name|number|address|email|phone|last four|date|yes|no)\b/i,
      },
      {
        id: "confirm",
        label: "Confirm next steps",
        matcher: /\b(yes|correct|okay|ok|sounds good|please|confirm)\b/i,
      },
      {
        id: "close",
        label: "End politely",
        matcher: /\b(thank you|thanks|bye|goodbye|have a good)\b/i,
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
