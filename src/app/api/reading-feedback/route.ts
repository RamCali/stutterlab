import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/lib/auth/helpers";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { passage, transcript, sectionIndex } = await req.json();

    if (!passage || !transcript) {
      return NextResponse.json(
        { error: "Missing passage or transcript" },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 300,
      system: `You are a warm, supportive speech partner listening to someone read aloud. They are practicing reading to build confidence with social pressure. Your role is to:
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
"${transcript}"

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
