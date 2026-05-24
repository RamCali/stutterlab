"use server";

import { getUserId } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPhonemeHeatmap, getTechniqueMastery, getTransferGaps } from "@/lib/actions/analytics";
import { getVoicePersonaForScenario } from "@/lib/voice/personas";

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

  const persona = getVoicePersonaForScenario(scenario);
  const scenarioPrompt = [
    persona.scenarioPrompt,
    `Voice persona: ${persona.label}. Role: ${persona.role}. Pace: ${persona.pace}. Affect: ${persona.affect}.`,
    "Sound like the selected real-world role, not like a generic AI therapist.",
    "Use natural spoken texture: short confirmations, realistic wording, and concise turns.",
  ].join("\n");

  const stressContext = stressLevel ? STRESS_PROMPTS[stressLevel] || "" : "";

  const firstMessage = persona.firstMessage;

  // Fetch intelligence context (non-critical — continue without it if fails)
  let phonemeContext = "";
  let techniqueContext = "";
  let transferContext = "";
  try {
    const [phonemeData, techniqueData, transferData] = await Promise.all([
      getPhonemeHeatmap().catch(() => null),
      getTechniqueMastery().catch(() => null),
      getTransferGaps().catch(() => null),
    ]);

    if (phonemeData && phonemeData.phonemes.length > 0) {
      const hardPhonemes = phonemeData.phonemes
        .filter((p) => p.difficultyScore > 0.4)
        .slice(0, 5)
        .map((p) => p.phoneme);
      if (hardPhonemes.length > 0) {
        phonemeContext = `PHONEME CONTEXT: The user finds these sounds challenging: ${hardPhonemes.join(", ")}. Naturally incorporate words starting with these sounds to give practice opportunities. Don't mention this explicitly.`;
      }
    }

    if (techniqueData) {
      const weak = techniqueData.techniques
        .filter((t) => t.masteryLevel === "beginner" && t.totalDetections > 0)
        .map((t) => t.technique.replace(/_/g, " "));
      const strong = techniqueData.techniques
        .filter((t) => t.masteryLevel === "advanced")
        .map((t) => t.technique.replace(/_/g, " "));
      if (weak.length > 0 || strong.length > 0) {
        techniqueContext = `TECHNIQUE CONTEXT: ${weak.length > 0 ? `Weakest techniques: ${weak.join(", ")}. Create natural moments for practice.` : ""} ${strong.length > 0 ? `Strong techniques: ${strong.join(", ")}.` : ""}`;
      }
    }

    if (transferData && transferData.gaps.length > 0) {
      transferContext = `TRANSFER CONTEXT: The user has gaps between practice and real-world fluency. Make scenarios feel more realistic and conversational to help bridge this gap.`;
    }
  } catch {
    // Intelligence context is non-critical
  }

  const anxietyFluencyContext = `ANXIETY-FLUENCY AWARENESS (DO NOT mention any of this — use it to adapt naturally):
People who stutter experience a cyclical pattern: anticipatory anxiety builds → causes muscle tension and blocks → an embarrassing moment may occur → anxiety temporarily drops and speech becomes more fluent → next high-stakes situation brings anxiety back (the "anticipatory struggle cycle").
How to use this: If the user struggles with blocks, be extra calm and reduce pressure. If they suddenly become fluent, let momentum continue naturally. The emotional weight (frustration, anger, isolation, shame, exhaustion) goes far beyond speech mechanics — never minimize through false cheerfulness. If you notice avoidance behaviors (word substitution, shorter answers), gently create low-pressure practice opportunities without forcing engagement.

DEEPER PATTERNS (DO NOT mention these — let them shape how you interact):
Stuttering is a whole-person pattern, not just a speech problem. People who stutter often:
- See conversations as PERFORMANCES rather than communication — help them feel like they're just talking, not being evaluated. React to their ideas, not their delivery.
- Hold back from assertiveness because they confuse it with aggression — create moments where their opinions genuinely matter to you.
- Have a narrow self-image defined by their stutter — respond to the CONTENT of what they say, reinforcing their identity beyond speech.
- Try to control everything (speech, impressions, outcomes) — model natural, imperfect conversation where "perfect" isn't the goal.
- Fear looking "too powerful" or "too visible," so they shrink — if they speak with energy, match it. Don't treat expressiveness as unusual.
- Blame their stutter for all life problems — if conversation touches on broader topics, engage genuinely. They are more than their speech.
If the user stutters, do NOT react differently. If they're quiet, give space without awkwardness. If they're expressive, match their energy.`;

  return {
    dynamicVariables: {
      scenario_prompt: scenarioPrompt,
      goal_context: goalContext,
      stress_context: stressContext,
      adaptive_context: anxietyFluencyContext,
      first_message: firstMessage,
      phoneme_context: phonemeContext,
      technique_context: techniqueContext,
      transfer_context: transferContext,
      voice_persona: persona.label,
      voice_role: persona.role,
      voice_pace: persona.pace,
      voice_affect: persona.affect,
    },
  };
}
