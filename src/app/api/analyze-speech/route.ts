import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/lib/auth/helpers";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const {
      transcript,
      metrics,
      disfluencies,
    } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "No transcript" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 512,
      system: `You are StutterLab's AI speech analyst, designed by a licensed Speech-Language Pathologist. Analyze the speech session data and provide a concise clinical assessment.

Return a JSON object with:
- stutterFingerprint: { primaryType: string, triggers: string[], patterns: string[] }
- recommendations: string[] (2-3 actionable technique suggestions)
- encouragement: string (1 sentence of genuine, specific encouragement)
- severityEstimate: "normal" | "mild" | "moderate" | "severe"

Base severity on %SS: <3% normal, 3-5% mild, 5-8% moderate, >8% severe.
Keep it clinical but warm. No disclaimers about not being a replacement for SLP — the app already states this.`,
      messages: [
        {
          role: "user",
          content: `Session data:
Transcript: "${transcript}"
Fluency Score: ${metrics.fluencyScore}/100
Speaking Rate: ${metrics.speakingRate} syl/min
Total Syllables: ${metrics.totalSyllables}
Total Disfluencies: ${metrics.totalDisfluencies}
Vocal Effort: ${(metrics.vocalEffort * 100).toFixed(0)}%
Disfluency breakdown: ${JSON.stringify(disfluencies)}

User ID: ${user.id}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Speech analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
