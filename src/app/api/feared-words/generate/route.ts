import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { word, difficulty } = await req.json();

    if (!word || typeof word !== "string") {
      return NextResponse.json({ error: "word is required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured. Add ANTHROPIC_API_KEY to .env" },
        { status: 503 }
      );
    }

    const difficultyGuide: Record<string, string> = {
      easy: "Use simple, everyday contexts — ordering food, greeting someone, casual conversation. Keep sentences short (8-12 words).",
      medium: "Use workplace and social contexts — meetings, phone calls, shopping. Medium-length sentences (10-16 words).",
      hard: "Use stressful contexts — presentations, job interviews, confrontations, phone calls to strangers. Longer, more complex sentences (14-20 words).",
    };

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: `You are a speech therapy assistant generating practice content for someone who stutters. Your job is to create reading material that naturally incorporates a target word.

Rules:
- Every phrase, sentence, and paragraph MUST contain the target word at least once
- Use everyday, conversational language — nothing clinical or awkward
- The word should appear in realistic, natural contexts
- Paragraphs should be 3-4 sentences, like a short story or scenario
- Return ONLY valid JSON with no extra text, no markdown, no code fences`,
      messages: [
        {
          role: "user",
          content: `Generate practice content for the feared word: "${word}"

Difficulty: ${difficulty || "medium"}
${difficultyGuide[difficulty] || difficultyGuide.medium}

Return this exact JSON format:
{
  "phrases": ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5"],
  "sentences": ["sentence1", "sentence2", "sentence3", "sentence4", "sentence5"],
  "paragraphs": ["paragraph1", "paragraph2"]
}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    try {
      const parsed = JSON.parse(text);

      // Validate shape
      if (
        !Array.isArray(parsed.phrases) ||
        !Array.isArray(parsed.sentences) ||
        !Array.isArray(parsed.paragraphs)
      ) {
        throw new Error("Invalid shape");
      }

      return NextResponse.json({ content: parsed });
    } catch {
      // Parse failed — return fallback content
      return NextResponse.json({
        content: {
          phrases: [
            `say ${word}`,
            `the word ${word}`,
            `about ${word}`,
            `my ${word}`,
            `this ${word}`,
          ],
          sentences: [
            `I can say the word ${word} with confidence.`,
            `Let me practice saying ${word} out loud.`,
            `The word ${word} is becoming easier for me.`,
            `Every day I practice ${word} and improve.`,
            `I feel comfortable saying ${word} now.`,
          ],
          paragraphs: [
            `Today I am practicing the word ${word}. Every time I say ${word}, I feel more confident. Using my techniques, ${word} is becoming a word I can say smoothly and naturally.`,
            `In my daily life, I encounter the word ${word} often. Whether at work or with friends, saying ${word} is getting easier. I take a breath, use gentle onset, and let ${word} flow naturally.`,
          ],
        },
      });
    }
  } catch (error) {
    console.error("Feared words content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
