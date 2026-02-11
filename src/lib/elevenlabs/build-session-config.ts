"use server";

import { getUserId } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SCENARIO_PROMPTS: Record<string, string> = {
  "phone-call":
    "You are a receptionist at a doctor's office. The user is calling to schedule an appointment. Be natural, ask relevant questions (name, preferred date/time, reason for visit). Be patient and kind.",
  "job-interview":
    "You are a friendly but professional hiring manager conducting a job interview. Ask common interview questions one at a time. Be encouraging. The user is practicing speaking fluently during interviews.",
  "ordering-food":
    "You are a barista/waiter at a coffee shop. Take the user's order naturally. Ask about size, additions, name for the order. Be casual and friendly.",
  "class-presentation":
    "You are a supportive audience member at a presentation. The user will present a topic. Ask a question or two after they finish. Be encouraging.",
  "small-talk":
    "You are at a casual social gathering. Start a light conversation with the user. Topics: weather, weekend plans, hobbies, movies. Be warm and easygoing.",
  "shopping":
    "You are a store employee. The user wants to return an item or ask about a product. Be helpful but ask for details like receipt, reason for return, etc.",
  "asking-directions":
    "You are a friendly stranger. The user is asking for directions to a place. Give clear but conversational directions. Ask if they need clarification.",
  "customer-service":
    "You are a customer service representative on a phone call. Help the user resolve an issue with their account/order. Ask for details, be professional.",
  "meeting-intro":
    "You are at a professional meeting. The user is introducing themselves. React naturally, ask a follow-up question about their role or background.",
};

const FIRST_MESSAGES: Record<string, string> = {
  "phone-call":
    "Hello, thank you for calling Dr. Johnson's office. How can I help you today?",
  "job-interview":
    "Hi, welcome! Thanks for coming in today. Why don't you start by telling me a little about yourself?",
  "ordering-food":
    "Hi there! Welcome to The Daily Grind. What can I get started for you?",
  "class-presentation":
    "Hi! I'm excited to hear your presentation. Whenever you're ready, go ahead.",
  "small-talk":
    "Hey! Great to see you here. How's your week been going?",
  "shopping":
    "Hi there, welcome! Is there something I can help you find today?",
  "asking-directions":
    "Oh hey, sure thing! Where are you trying to get to?",
  "customer-service":
    "Thank you for calling customer support. My name is Alex. How can I help you today?",
  "meeting-intro":
    "Welcome to the team meeting! We'd love to hear a quick introduction from you.",
};

const STRESS_PROMPTS: Record<number, string> = {
  1: `STRESS SIMULATION (Level 1 — Mild):
Occasionally ask clarifying questions like "Sorry, what was that?" Show very slight impatience after long pauses. Ask occasional unexpected follow-ups. STILL be fundamentally respectful.`,
  2: `STRESS SIMULATION (Level 2 — Moderate):
Sometimes interrupt the user mid-sentence. Express mild impatience like "We're running short on time..." Ask unexpected follow-ups. Show distraction. STILL be respectful — never mock.`,
  3: `STRESS SIMULATION (Level 3 — High):
Frequently interrupt mid-sentence. Express urgency. Change topics suddenly. Ask rapid-fire questions. Show impatience with pauses. CRITICAL: NEVER mock stuttering. You are a realistic but safe practice partner.`,
};

export async function buildSessionConfig(
  scenario: string,
  stressLevel?: number
) {
  // Fetch goal context from DB (non-critical — continue without it if fails)
  let goalContext = "";
  try {
    const userId = await getUserId();
    if (userId) {
      const result = await db
        .select({ treatmentPath: profiles.treatmentPath })
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

      if (result.length > 0 && result[0].treatmentPath) {
        const tp = result[0].treatmentPath as Record<string, unknown>;
        const challenges = (tp.speechChallenges as string[]) || [];
        const northStar = (tp.northStarGoal as string) || "";
        if (challenges.length > 0 || northStar) {
          goalContext = `
GOAL CONTEXT (DO NOT mention any of this to the user — use it to adapt naturally):
${challenges.length > 0 ? `- Main challenges: ${challenges.join(", ")}` : ""}
${northStar ? `- Personal goal: "${northStar}"` : ""}
Adapt naturally: if they're practicing a feared situation, be extra patient and supportive. Never mention their goals or challenges explicitly — stay fully in character.`;
        }
      }
    }
  } catch {
    // Goal fetch is non-critical
  }

  const scenarioPrompt =
    SCENARIO_PROMPTS[scenario] ||
    "You are a friendly conversation partner. Have a natural conversation with the user.";

  const stressContext = stressLevel ? STRESS_PROMPTS[stressLevel] || "" : "";

  const firstMessage =
    FIRST_MESSAGES[scenario] || "Hi there! How are you doing today?";

  return {
    dynamicVariables: {
      scenario_prompt: scenarioPrompt,
      goal_context: goalContext,
      stress_context: stressContext,
      adaptive_context: "",
      first_message: firstMessage,
    },
  };
}
