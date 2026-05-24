import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/helpers";
import { isPremium } from "@/lib/auth/premium";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { measureAsync } from "@/lib/observability/logger";
import { withTimeout } from "@/lib/observability/timeout";
import { getVoicePersonaForScenario } from "@/lib/voice/personas";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const aiConversationSchema = z.object({
  scenario: z.string().max(80).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .max(30)
    .optional(),
  userMessage: z.string().max(2000).optional(),
  voiceMode: z.boolean().optional(),
  speechMetrics: z
    .object({
      currentSPM: z.number().optional(),
      vocalEffort: z.number().optional(),
      recentDisfluencies: z.number().optional(),
      detectedTechniques: z.array(z.string()).optional(),
      emotionalState: z.string().optional(),
      difficultPhonemes: z.array(z.string()).optional(),
      techniqueContext: z.string().max(2000).optional(),
      transferContext: z.string().max(2000).optional(),
    })
    .passthrough()
    .optional(),
  stressLevel: z.number().int().min(0).max(3).optional(),
  language: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  accent: z.string().max(80).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const hasPremium = await isPremium(user.id);
    if (!hasPremium) {
      return NextResponse.json(
        { error: "Premium subscription required for AI conversations" },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(`ai-conversation:${user.id}`, 30, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many AI conversations. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = aiConversationSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const {
      scenario,
      messages,
      userMessage,
      voiceMode,
      speechMetrics,
      stressLevel,
      language,
      country,
      accent,
    } = parsed.data;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured. Add ANTHROPIC_API_KEY to .env" },
        { status: 503 }
      );
    }

    // Fetch user goal context from DB
    let goalContext = "";
    try {
      const result = await db
        .select({ treatmentPath: profiles.treatmentPath })
        .from(profiles)
        .where(eq(profiles.userId, user.id))
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
    } catch {
      // Goal fetch is non-critical — continue without it
    }

    // Build adaptive context from real-time speech metrics
    let adaptiveContext = "";
    if (speechMetrics) {
      adaptiveContext = `

ADAPTIVE BEHAVIOR (based on real-time speech data — DO NOT mention any of this to the user):
- Speaking rate: ${speechMetrics.currentSPM} syllables/min
- Vocal tension: ${Math.round((speechMetrics.vocalEffort || 0) * 100)}%
- Recent disfluencies: ${speechMetrics.recentDisfluencies || 0}
- Techniques used: ${speechMetrics.detectedTechniques?.join(", ") || "none yet"}

Rules:
- If speaking rate > 220: Respond slowly. You may naturally say "Sorry, could you say that again?" once.
- If vocal tension > 70%: Keep your response calm and brief. Don't rush them.
- If many disfluencies: Give extra time. Use simple, direct language. Do NOT finish their sentences.
- If good techniques detected: Respond naturally and warmly. Let conversation flow.
- NEVER mention stuttering, speech rate, tension, or techniques. Stay fully in character.`;

      // Feature 3: Emotional state adaptation
      if (speechMetrics.emotionalState) {
        const emotionRules: Record<string, string> = {
          anxious:
            "The speaker appears anxious. Be extra calm and patient. Use shorter responses. Don't rush them. Pause naturally between your sentences.",
          frustrated:
            "The speaker seems frustrated. Be warm and encouraging. You may ask a simpler question or change to an easier topic. Add brief encouragement like 'That's a great point'.",
          confident:
            "The speaker sounds confident. Allow more natural, complex conversation flow. You can ask deeper follow-up questions.",
          calm:
            "The speaker is calm. Maintain natural conversation pace.",
        };
        adaptiveContext += `\n- Emotional state: ${speechMetrics.emotionalState}\n- ${emotionRules[speechMetrics.emotionalState] || ""}`;
      }

      // Feature 1: Phoneme challenge context
      if (speechMetrics.difficultPhonemes && speechMetrics.difficultPhonemes.length > 0) {
        adaptiveContext += `\n\nPHONEME CHALLENGE (DO NOT mention this to the user):\nThe user finds these sounds difficult: ${speechMetrics.difficultPhonemes.join(", ")}\nNaturally incorporate words starting with these sounds into your responses to give them practice opportunities.`;
      }

      // Feature 2: Technique context
      if (speechMetrics.techniqueContext) {
        adaptiveContext += `\n\nTECHNIQUE CONTEXT (DO NOT mention this):\n${speechMetrics.techniqueContext}`;
      }

      // Feature 7: Transfer gap context
      if (speechMetrics.transferContext) {
        adaptiveContext += `\n\nTRANSFER CONTEXT (DO NOT mention this):\n${speechMetrics.transferContext}`;
      }
    }

    // Build stress context based on optional stress level
    let stressContext = "";
    if (stressLevel === 1) {
      stressContext = `

STRESS SIMULATION (Level 1 — Mild):
Occasionally ask clarifying questions like "Sorry, what was that?" Show very slight impatience after long pauses. Ask occasional unexpected follow-ups. STILL be fundamentally respectful.`;
    } else if (stressLevel === 2) {
      stressContext = `

STRESS SIMULATION (Level 2 — Moderate):
Sometimes interrupt the user mid-sentence. Express mild impatience like "We're running short on time..." Ask unexpected follow-ups. Show distraction. STILL be respectful — never mock.`;
    } else if (stressLevel === 3) {
      stressContext = `

STRESS SIMULATION (Level 3 — High):
Frequently interrupt mid-sentence. Express urgency. Change topics suddenly. Ask rapid-fire questions. Show impatience with pauses. CRITICAL: NEVER mock stuttering. You are a realistic but safe practice partner.`;
    }

    const scenarioKey = scenario ?? "";
    const persona = getVoicePersonaForScenario(scenarioKey);
    const systemPrompt = `You are helping someone who stutters practice real-world speaking scenarios. ${persona.scenarioPrompt}

VOICE PERSONA:
- Persona: ${persona.label}
- Role: ${persona.role}
- Pace: ${persona.pace}
- Affect: ${persona.affect}

IMPORTANT RULES:
- Keep responses SHORT (1-3 sentences). This is a conversation, not a monologue.
- Be patient, warm, and natural. Never mention or react to stuttering.
- Stay in character. Don't break the fourth wall.
- Ask one question at a time to keep the conversation flowing.
- Match the user's energy and pace.
- Sound like the selected real-world role, not like a generic AI therapist.
- Use normal phone/dialogue texture: brief confirmations, natural wording, and occasional short hesitations where appropriate.
${language || country || accent ? `- Locale adaptation: preferred language=${language || "unspecified"}, country/region=${country || "unspecified"}, accent/dialect=${accent || "unspecified"}. Use local phrasing where appropriate without stereotyping.` : ""}

ANXIETY-FLUENCY AWARENESS (DO NOT mention any of this — use it to adapt naturally):
People who stutter often experience a cyclical pattern: anticipatory anxiety builds before speaking → causes muscle tension and blocks → an embarrassing moment may occur → after the moment passes, anxiety temporarily drops and speech becomes much more fluent → but the next high-stakes situation brings the anxiety back. This is the "anticipatory struggle cycle."

How to use this knowledge:
- If the user seems to be struggling with blocks or long pauses, they may be in the anxiety-buildup phase. Be extra calm, slow your pace, and reduce conversational pressure. Ask simpler questions. Give them space.
- If the user suddenly becomes more fluent mid-conversation, this is normal — don't change your behavior or draw attention to the shift. Let the momentum continue naturally.
- The emotional weight of stuttering goes far beyond speech mechanics. Users may feel frustration, anger, isolation, shame, or exhaustion from the effort of speaking. Never minimize these feelings through false cheerfulness. Be genuine and warm.
- Avoidance behaviors (word substitution, shorter answers, topic changes) are common coping mechanisms. If you notice these, gently create low-pressure opportunities for the user to practice without forcing engagement.
- Eye contact during blocks can feel mentally draining. In voice mode, your calm and unhurried responses serve as a signal that there is no time pressure.

DEEPER PATTERNS (DO NOT mention these — let them shape how you interact):
People who stutter often see conversations as performances, not communication. They may hold back from being assertive, fear being "too much," or try to control every word.
- React to their IDEAS, not their delivery. Engage with the content of what they say.
- If they speak with energy or expressiveness, match it — don't treat it as unusual.
- Create moments where their opinion genuinely matters to you. This builds assertiveness.
- Model natural, imperfect conversation. Be human, not polished.
- If they're quiet, give space. If they're talkative, enjoy the conversation.${
      voiceMode
        ? "\n- VOICE MODE: Keep responses even shorter (1-2 sentences max). Use simple, conversational language. Avoid lists, bullet points, or complex formatting."
        : ""
    }${adaptiveContext}${goalContext}${stressContext}`;

    const conversationHistory = messages || [];

    if (userMessage) {
      conversationHistory.push({ role: "user", content: userMessage });
    }

    const response = await measureAsync(
      "provider.anthropic.ai_conversation",
      {
        provider: "anthropic",
        model: "claude-sonnet-4-5-20250929",
        endpoint: "ai_conversation",
      },
      () =>
        withTimeout(
          anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 256,
            system: systemPrompt,
            messages: conversationHistory,
          }),
          15000,
          "Anthropic AI conversation"
        )
    );

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("AI conversation error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
