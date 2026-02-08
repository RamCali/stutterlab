import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/lib/auth/helpers";
import { getPassage } from "@/lib/assessment/reading-passages";
import {
  countSyllables,
  calculatePercentSS,
  getSeverityRating,
} from "@/lib/assessment/syllable-counter";
import { db } from "@/lib/db/client";
import { monthlyReports } from "@/lib/db/schema";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { passageId, transcription } = await req.json();

    if (!passageId || !transcription) {
      return NextResponse.json(
        { error: "Missing passageId or transcription" },
        { status: 400 }
      );
    }

    const passage = getPassage(passageId);
    if (!passage) {
      return NextResponse.json(
        { error: "Invalid passage ID" },
        { status: 400 }
      );
    }

    // Use Claude to identify stuttered syllables by comparing expected vs actual
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: `You are a clinical speech analysis system designed by a licensed SLP. Compare the expected passage text with the user's transcription to identify stuttering events.

Identify:
1. Word repetitions (e.g., "the the the")
2. Sound/syllable repetitions (e.g., "b-b-because")
3. Prolongations (e.g., "ssssun")
4. Blocks (words that appear to have been started and restarted, or noticeable gaps)
5. Interjections (um, uh, er, etc.)

Return a JSON object:
{
  "stutteredSyllableCount": number,
  "disfluencies": [{ "type": "repetition"|"prolongation"|"block"|"interjection", "word": string, "estimatedSyllables": number }],
  "speakingRateEstimate": number (syllables per minute estimate based on passage length),
  "recommendations": [string, string, string],
  "encouragement": string
}

Be precise about syllable counts. Each stuttered event counts the affected syllables.`,
      messages: [
        {
          role: "user",
          content: `Expected passage (${passage.title}):\n"${passage.text}"\n\nUser's transcription:\n"${transcription}"\n\nExpected syllable count: ${passage.syllableCount}`,
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
    const totalSyllables =
      passage.syllableCount || countSyllables(passage.text);
    const stutteredSyllables = analysis.stutteredSyllableCount || 0;
    const percentSS = calculatePercentSS(stutteredSyllables, totalSyllables);
    const severity = getSeverityRating(percentSS);

    // Fluency score: inverse of %SS mapped to 0-100
    const fluencyScore = Math.max(
      0,
      Math.round(100 - percentSS * 5)
    );

    // Save to database
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [report] = await db
      .insert(monthlyReports)
      .values({
        userId: user.id,
        month: monthStart,
        passageId,
        transcription,
        totalSyllables,
        stutteredSyllables,
        percentSS: Math.round(percentSS * 100) / 100,
        severityRating: severity,
        speakingRate: analysis.speakingRateEstimate || null,
        fluencyScore,
        analysisJson: {
          disfluencies: analysis.disfluencies,
          passageTitle: passage.title,
        },
        recommendationsJson: {
          recommendations: analysis.recommendations,
          encouragement: analysis.encouragement,
        },
        shareToken: crypto.randomUUID(),
      })
      .returning();

    return NextResponse.json({
      report: {
        id: report.id,
        percentSS: report.percentSS,
        severityRating: report.severityRating,
        fluencyScore: report.fluencyScore,
        totalSyllables: report.totalSyllables,
        stutteredSyllables: report.stutteredSyllables,
        speakingRate: report.speakingRate,
        analysis: analysis.disfluencies,
        recommendations: analysis.recommendations,
        encouragement: analysis.encouragement,
        shareToken: report.shareToken,
      },
    });
  } catch (error) {
    console.error("Assessment error:", error);
    return NextResponse.json(
      { error: "Assessment failed" },
      { status: 500 }
    );
  }
}
