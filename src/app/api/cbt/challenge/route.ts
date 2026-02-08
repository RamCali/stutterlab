import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChallengeRequest {
  situation: string;
  automaticThought: string;
  emotions: { name: string; intensity: number }[];
}

interface ChallengeResponse {
  traps: string[];
  analysis: string;
  questions: string[];
  evidenceSuggestions: string[];
  balancedThought: string;
}

const FALLBACK_RESPONSE: ChallengeResponse = {
  traps: [],
  analysis:
    "Let's examine this thought together. Many thoughts feel true in the moment but may not reflect the full picture.",
  questions: [
    "What evidence do you have that this thought is true?",
    "What evidence do you have that this thought might not be completely accurate?",
    "What would you tell a close friend who had this same thought?",
  ],
  evidenceSuggestions: [
    "Think about times when the opposite happened",
    "Consider what a supportive friend would say",
    "Look for any part of the situation that went well",
  ],
  balancedThought:
    "While I may face challenges, I have skills and strategies to handle this situation. One moment does not define me.",
};

export async function POST(req: NextRequest) {
  try {
    const { situation, automaticThought, emotions } =
      (await req.json()) as ChallengeRequest;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const emotionList = emotions
      .map((e) => `${e.name} (${e.intensity}/10)`)
      .join(", ");

    const systemPrompt = `You are a cognitive behavioral therapist who specializes in helping adults who stutter manage speech-related anxiety. You are warm, non-judgmental, and evidence-based.

The user will share a situation they faced, the automatic thought that came up, and the emotions they felt. Your job is to:

1. Identify which thinking traps (cognitive distortions) are present. Choose ONLY from: "catastrophizing", "mind-reading", "all-or-nothing", "over-generalization", "mental-filter", "fortune-telling"
2. Write a brief, empathetic analysis (2-3 sentences) explaining why these thought patterns emerged and validating the person's feelings while gently noting the distortion
3. Ask 2-3 Socratic questions that help the person examine their thought from different angles
4. Suggest 2-3 specific pieces of evidence the person might consider that challenge the automatic thought
5. Offer a balanced alternative thought — realistic (not falsely positive), acknowledging the challenge while providing a more accurate perspective

IMPORTANT: Keep language warm, accessible, and free of clinical jargon. Never minimize stuttering — it's real and can be hard. Focus on the THOUGHT patterns, not the stuttering itself.

Respond ONLY with valid JSON in this exact format:
{
  "traps": ["trap-id-1", "trap-id-2"],
  "analysis": "Your empathetic analysis here...",
  "questions": ["Question 1?", "Question 2?", "Question 3?"],
  "evidenceSuggestions": ["Evidence 1", "Evidence 2"],
  "balancedThought": "A balanced alternative thought..."
}`;

    const userPrompt = `Situation: ${situation}

Automatic thought: "${automaticThought}"

Emotions: ${emotionList}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    try {
      const parsed = JSON.parse(text) as ChallengeResponse;
      return NextResponse.json(parsed);
    } catch {
      // JSON parse failed — return fallback
      return NextResponse.json(FALLBACK_RESPONSE);
    }
  } catch (error) {
    console.error("CBT challenge error:", error);
    return NextResponse.json(FALLBACK_RESPONSE);
  }
}
