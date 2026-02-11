import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/lib/auth/helpers";
import { isPremium } from "@/lib/auth/premium";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (!(await isPremium(user.id))) {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    const {
      transcript,
      prompt,
      metrics,
      disfluencies,
      previousAudits,
    }: {
      transcript: string;
      prompt: string;
      metrics: {
        speakingRate: number;
        fluencyScore: number;
        totalSyllables: number;
        totalDisfluencies: number;
        vocalEffort: number;
        durationSeconds: number;
      };
      disfluencies: {
        type: string;
        word: string;
        timestamp: number;
      }[];
      previousAudits: {
        percentSS: number;
        severityRating: string;
        fluencyScore: number;
        speakingRate: number;
      }[];
    } = await req.json();

    if (!transcript || !prompt) {
      return NextResponse.json(
        { error: "Missing transcript or prompt" },
        { status: 400 }
      );
    }

    // Build previous audits context for week-over-week comparison
    let previousContext = "";
    if (previousAudits && previousAudits.length > 0) {
      previousContext = `\n\nPrevious audit history (most recent first):\n${previousAudits
        .map(
          (a, i) =>
            `Week -${i + 1}: %SS=${a.percentSS}, severity=${a.severityRating}, fluency=${a.fluencyScore}, rate=${a.speakingRate} spm`
        )
        .join("\n")}`;
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: `You are StutterLab's Weekly Clinical Audit system, designed by a licensed Speech-Language Pathologist. You provide rigorous, SSI-4-grade analysis of a 2-minute diagnostic narrative.

Analyze the user's speech transcript and detected disfluencies to produce a comprehensive clinical assessment. Be precise with syllable counts and percentages. Provide actionable, encouraging insights grounded in evidence-based practice.

Return ONLY a valid JSON object with this exact structure:
{
  "percentSS": number,
  "stutteredSyllables": number,
  "severityRating": "normal" | "mild" | "moderate" | "severe",
  "fluencyScore": number (0-100, where 100 is perfectly fluent),
  "disfluencyBreakdown": {
    "blocks": { "count": number, "examples": [string] },
    "prolongations": { "count": number, "examples": [string] },
    "repetitions": { "count": number, "examples": [string] },
    "interjections": { "count": number, "examples": [string] }
  },
  "techniqueAnalysis": {
    "windowAnalysis": [
      {
        "startSeconds": number,
        "endSeconds": number,
        "fluencyLevel": "high" | "moderate" | "low",
        "techniquesDetected": [string],
        "notes": string
      }
    ],
    "techniqueEffectiveness": {
      "<technique_name>": number (0-100 effectiveness score)
    }
  },
  "rateAnalysis": {
    "overallRate": number (syllables per minute),
    "stability": "stable" | "variable" | "highly_variable",
    "windows": [{ "startSeconds": number, "endSeconds": number, "rate": number }],
    "trend": "accelerating" | "decelerating" | "steady"
  },
  "weekOverWeekChange": {
    "percentSSDelta": number | null,
    "fluencyDelta": number | null,
    "rateDelta": number | null,
    "severityChange": string | null,
    "summary": string
  },
  "phonemeHeatmap": { "<phoneme>": number },
  "insights": [
    {
      "type": "strength" | "focus_area" | "technique_tip" | "trend",
      "text": string
    }
  ]
}`,
      messages: [
        {
          role: "user",
          content: `Narrative prompt: "${prompt}"

Transcript:
"${transcript}"

Client-side speech metrics:
- Speaking rate: ${metrics.speakingRate} spm
- Total syllables: ${metrics.totalSyllables}
- Total disfluencies detected: ${metrics.totalDisfluencies}
- Vocal effort score: ${metrics.vocalEffort}
- Duration: ${metrics.durationSeconds} seconds

Detected disfluencies:
${
  disfluencies && disfluencies.length > 0
    ? disfluencies
        .map(
          (d) =>
            `- [${d.timestamp.toFixed(1)}s] ${d.type}: "${d.word}"`
        )
        .join("\n")
    : "No disfluencies detected by client-side analysis."
}${previousContext}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Analysis failed to parse" },
        { status: 500 }
      );
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Weekly audit analysis error:", error);
    return NextResponse.json(
      { error: "Weekly audit analysis failed" },
      { status: 500 }
    );
  }
}
