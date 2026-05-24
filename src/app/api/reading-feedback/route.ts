import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/lib/auth/helpers";
import { isPremium } from "@/lib/auth/premium";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { CLINICAL_AI_SAFETY_RULES } from "@/lib/clinical/safety";
import { cleanTranscriptForSummary } from "@/lib/audio/speech-metrics";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!(await isPremium(user.id))) {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 });
    }

    const rate = checkRateLimit(`reading-feedback:${user.id}`, 30, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many reading feedback requests. Please try again later." },
        { status: 429 }
      );
    }

    const { passage, transcript, sectionIndex } = await req.json();

    if (!passage || !transcript) {
      return NextResponse.json(
        { error: "Missing passage or transcript" },
        { status: 400 }
      );
    }

    const cleanedTranscript = cleanTranscriptForSummary(transcript);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 300,
      system: `You are a warm, supportive speech partner listening to someone read aloud. They are practicing reading to build confidence with social pressure.

${CLINICAL_AI_SAFETY_RULES}

Your role is to:
1. Give a brief (1-2 sentence) encouraging reaction to their reading
2. Optionally ask one short question about the content to simulate engagement
3. If you notice repeated words, fillers, or disfluencies in the transcript, gently and positively acknowledge their effort without being clinical

Keep responses SHORT and conversational — like a supportive friend, not a therapist. Never use clinical terms like "disfluency" or "stuttering".`,
      messages: [
        {
          role: "user",
          content: `The reader just finished section ${sectionIndex + 1}.

Original passage:
"${passage}"

Their transcription:
"${cleanedTranscript}"

Give a brief, encouraging reaction.`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Try to split feedback and question
    const lines = text.split("\n").filter((l) => l.trim());
    const feedback = lines[0] || text;
    const question = lines.length > 1 ? lines.slice(1).join(" ") : undefined;

    return NextResponse.json({ feedback, question });
  } catch (error) {
    console.error("Reading feedback error:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
