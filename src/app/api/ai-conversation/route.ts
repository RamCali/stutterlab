import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getUserId } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export async function POST(req: NextRequest) {
  try {
    const { scenario, messages, userMessage, voiceMode, speechMetrics, stressLevel } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured. Add ANTHROPIC_API_KEY to .env" },
        { status: 503 }
      );
    }

    // Fetch user goal context from DB
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

    const systemPrompt = `You are helping someone who stutters practice real-world speaking scenarios. ${
      SCENARIO_PROMPTS[scenario] ||
      "You are a friendly conversation partner. Have a natural conversation with the user."
    }

IMPORTANT RULES:
- Keep responses SHORT (1-3 sentences). This is a conversation, not a monologue.
- Be patient, warm, and natural. Never mention or react to stuttering.
- Stay in character. Don't break the fourth wall.
- Ask one question at a time to keep the conversation flowing.
- Match the user's energy and pace.${
      voiceMode
        ? "\n- VOICE MODE: Keep responses even shorter (1-2 sentences max). Use simple, conversational language. Avoid lists, bullet points, or complex formatting."
        : ""
    }${adaptiveContext}${goalContext}${stressContext}`;

    const conversationHistory = (messages || []).map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })
    );

    if (userMessage) {
      conversationHistory.push({ role: "user", content: userMessage });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 256,
      system: systemPrompt,
      messages: conversationHistory,
    });

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
