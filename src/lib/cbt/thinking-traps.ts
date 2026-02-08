export type ThinkingTrapId =
  | "catastrophizing"
  | "mind-reading"
  | "all-or-nothing"
  | "over-generalization"
  | "mental-filter"
  | "fortune-telling";

export interface ThinkingTrap {
  id: ThinkingTrapId;
  name: string;
  emoji: string;
  description: string;
  example: string;
  challenge: string;
  color: string; // Tailwind bg + text class pair
}

export const THINKING_TRAPS: ThinkingTrap[] = [
  {
    id: "catastrophizing",
    name: "Catastrophizing",
    emoji: "🌋",
    description:
      "Assuming the worst possible outcome will happen, blowing things out of proportion.",
    example:
      "\"Everyone will think I'm incompetent if I stutter during this meeting.\"",
    challenge:
      "What's the most likely outcome, not the worst? Has the worst case ever actually happened?",
    color: "bg-red-500/10 text-red-600",
  },
  {
    id: "mind-reading",
    name: "Mind-Reading",
    emoji: "🔮",
    description:
      "Believing you know what others are thinking without any real evidence.",
    example:
      "\"They're thinking I'm nervous and can't handle this job.\"",
    challenge:
      "What evidence do you actually have about what they think? Could they be thinking something else entirely?",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    id: "all-or-nothing",
    name: "All-or-Nothing",
    emoji: "⚖️",
    description:
      "Seeing things in black and white — if it's not perfect, it's a failure.",
    example:
      "\"If I stutter even once, the whole presentation is ruined.\"",
    challenge:
      "Is there a middle ground? Can something still be successful even if it wasn't 100% smooth?",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    id: "over-generalization",
    name: "Over-Generalization",
    emoji: "🔁",
    description:
      "Taking one bad experience and assuming it will always happen.",
    example:
      "\"I always stutter on phone calls, so I'll definitely stutter on this one too.\"",
    challenge:
      "Has there ever been a time when this didn't happen? Is 'always' really accurate?",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    id: "mental-filter",
    name: "Mental Filter",
    emoji: "🕶️",
    description:
      "Focusing only on the negative parts and ignoring everything that went well.",
    example:
      "\"I stuttered on one word, so the whole conversation was a disaster.\"",
    challenge:
      "What parts of the situation actually went well? Are you filtering out the positives?",
    color: "bg-slate-500/10 text-slate-600",
  },
  {
    id: "fortune-telling",
    name: "Fortune-Telling",
    emoji: "🎱",
    description:
      "Predicting negative outcomes as if they're certain to happen.",
    example:
      "\"I know I'm going to block on my name when I introduce myself.\"",
    challenge:
      "How many times has your prediction actually come true? What would you tell a friend who said this?",
    color: "bg-indigo-500/10 text-indigo-600",
  },
];

export function getTrapById(id: ThinkingTrapId): ThinkingTrap | undefined {
  return THINKING_TRAPS.find((t) => t.id === id);
}

export function getTrapColor(id: ThinkingTrapId): string {
  return getTrapById(id)?.color ?? "bg-muted text-muted-foreground";
}
