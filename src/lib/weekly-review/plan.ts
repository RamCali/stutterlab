export interface NextWeekPlan {
  focusSituation: string;
  dailyMicroChallenge: string;
  exposureRungHint: string;
  mindsetPrompt: string;
  suggestedHrefs: string[];
}

export function buildNextWeekPlan(input: {
  topWin: string;
  topAvoidance: string | null;
  targetSituation: string;
}): NextWeekPlan {
  const avoidance = input.topAvoidance?.trim() || "general speaking";
  return {
    focusSituation: input.targetSituation,
    dailyMicroChallenge: `One real-world rep related to: ${input.targetSituation}`,
    exposureRungHint: `Target avoidance pattern: ${avoidance}`,
    mindsetPrompt: input.topWin
      ? `Build on this win: ${input.topWin.slice(0, 120)}`
      : "What would you try if stuttering were less scary this week?",
    suggestedHrefs: [
      "/app/challenges",
      "/app/exposure-ladder",
      "/app/ai-practice",
      "/app/practice",
    ],
  };
}

export function getWeekStartISO(date = new Date()): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
