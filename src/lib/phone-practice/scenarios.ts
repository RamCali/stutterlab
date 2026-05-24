export type PhonePracticeScenario = {
  id: string;
  title: string;
  businessName: string;
  agentName: string;
  agentRole: string;
  userGoal: string;
  difficulty: "Easy" | "Medium" | "Hard";
  openingLine: string;
  objectives: string[];
  stuckPrompts: string[];
};

export const PHONE_PRACTICE_SCENARIOS: PhonePracticeScenario[] = [
  {
    id: "coffee-hiring",
    title: "Coffee Shop Hiring",
    businessName: "The Daily Grind",
    agentName: "Sarah",
    agentRole: "a friendly but realistic coffee shop shift lead",
    userGoal: "Ask whether the coffee shop is hiring and get next steps.",
    difficulty: "Medium",
    openingLine: "Thanks for calling The Daily Grind. This is Sarah. How can I help you?",
    objectives: [
      "Answer whether the shop is hiring.",
      "Mention openings for barista and cashier positions when relevant.",
      "Ask which position the user is interested in, unless they already told you.",
      "Ask about relevant experience, unless they already told you.",
      "Ask about availability, unless they already told you.",
      "Ask whether they can come in to fill out an application or speak with the manager.",
    ],
    stuckPrompts: [
      "Are you interested in barista or cashier?",
      "What days are you usually available?",
    ],
  },
  {
    id: "doctor-appointment",
    title: "Doctor Appointment",
    businessName: "Maple Family Clinic",
    agentName: "Maya",
    agentRole: "a calm medical office receptionist",
    userGoal: "Schedule a basic doctor appointment.",
    difficulty: "Medium",
    openingLine: "Maple Family Clinic, this is Maya. How can I help you?",
    objectives: [
      "Ask what kind of appointment the user needs.",
      "Ask for a preferred day or time.",
      "Ask for a name, unless they already gave it.",
      "Offer a realistic appointment slot.",
      "Confirm the appointment details.",
    ],
    stuckPrompts: [
      "What kind of appointment are you looking for?",
      "Do mornings or afternoons work better?",
    ],
  },
  {
    id: "restaurant-reservation",
    title: "Restaurant Reservation",
    businessName: "Olive & Oak",
    agentName: "Jamie",
    agentRole: "a busy but polite restaurant host",
    userGoal: "Make a restaurant reservation.",
    difficulty: "Easy",
    openingLine: "Olive and Oak, this is Jamie. How can I help?",
    objectives: [
      "Ask what date and time the user wants.",
      "Ask how many people are in the party.",
      "Ask for a name, unless they already gave it.",
      "Confirm the reservation.",
    ],
    stuckPrompts: [
      "What time were you hoping for?",
      "How many people will be coming?",
    ],
  },
  {
    id: "customer-service-refund",
    title: "Customer Service Refund",
    businessName: "Northstar Online",
    agentName: "Alex",
    agentRole: "a professional customer support representative",
    userGoal: "Ask about a refund for an online order.",
    difficulty: "Hard",
    openingLine: "Thanks for calling Northstar Online support. This is Alex. How can I help today?",
    objectives: [
      "Ask for the order issue.",
      "Ask for an order number or email, unless already provided.",
      "Ask one clarifying question about the refund request.",
      "Give a realistic next step.",
      "Confirm whether the user needs anything else.",
    ],
    stuckPrompts: [
      "What happened with the order?",
      "Do you have the order number or email used for the purchase?",
    ],
  },
  {
    id: "friend-callback",
    title: "Calling A Friend Back",
    businessName: "personal call",
    agentName: "Jordan",
    agentRole: "a relaxed friend returning a call",
    userGoal: "Call a friend back and make simple plans.",
    difficulty: "Easy",
    openingLine: "Hey, it's Jordan. What's up?",
    objectives: [
      "Ask why the user called.",
      "Respond naturally as a friend.",
      "Ask one casual follow-up question.",
      "Help make or confirm a simple plan.",
    ],
    stuckPrompts: [
      "What did you want to talk about?",
      "Were you thinking today or later this week?",
    ],
  },
];

export function getPhonePracticeScenario(id?: string) {
  return (
    PHONE_PRACTICE_SCENARIOS.find((scenario) => scenario.id === id) ||
    PHONE_PRACTICE_SCENARIOS[0]
  );
}
