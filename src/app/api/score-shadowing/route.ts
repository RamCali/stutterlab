import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/helpers";
import { isPremium } from "@/lib/auth/premium";
import { checkRateLimit } from "@/lib/security/rate-limit";

const TECHNIQUE_RUBRICS: Record<string, string> = {
  "Gentle Onset":
    "Gentle Onset means starting words with soft, easy airflow — no hard attacks on vowels or consonants. Score higher if the speaker sounds relaxed at word beginnings.",
  "Prolonged Speech":
    "Prolonged Speech means stretching vowels and maintaining steady airflow. Words should feel elongated but smooth. Score higher for consistent stretching.",
  "Light Contact":
    "Light Contact means barely touching articulators (tongue, lips) on consonants. Score higher if consonants sound soft and flowing rather than pressed.",
  "Pacing & Pausing":
    "Pacing & Pausing means leaving natural breathing spaces between phrases. Score higher for deliberate pauses and unhurried speech rhythm.",
  "Cancellation":
    "Cancellation means stopping after a block, pausing, then restarting the word with easy onset. Score higher if the restart is smooth and relaxed.",
};

const scoreShadowingSchema = z.object({
  technique: z.string().min(1).max(80),
  transcript: z.string().min(1).max(1000),
  durationSeconds: z.number().min(1).max(300),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const hasPremium = await isPremium(user.id);
    if (!hasPremium) {
      return NextResponse.json(
        { error: "Premium subscription required for AI scoring" },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(`score-shadowing:${user.id}`, 20, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many scoring requests. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const parsed = scoreShadowingSchema.safeParse({
      technique: formData.get("technique"),
      transcript: formData.get("transcript"),
      durationSeconds: Number(formData.get("durationSeconds")),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { technique, transcript, durationSeconds } = parsed.data;

    const score = buildPracticeEstimate(technique, transcript, durationSeconds);

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Score shadowing error:", error);
    return NextResponse.json(
      { error: "Failed to score shadowing" },
      { status: 500 }
    );
  }
}

function buildPracticeEstimate(
  technique: string,
  transcript: string,
  durationSeconds: number
) {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  const targetWordsPerMinute = Math.round((wordCount / durationSeconds) * 60);
  const base = targetWordsPerMinute > 0 && targetWordsPerMinute < 150 ? 72 : 66;
  const techniqueBonus = TECHNIQUE_RUBRICS[technique] ? 6 : 0;
  const overallScore = Math.min(82, base + techniqueBonus);
  const stars = overallScore >= 85 ? 3 : overallScore >= 65 ? 2 : 1;

  return {
    overallScore,
    rhythmMatch: Math.max(0, overallScore - 3),
    techniqueAccuracy: overallScore,
    paceMatch: Math.min(100, overallScore + 4),
    stars,
    feedback:
      "Practice estimate saved. Full acoustic scoring is coming soon; for now, use this as a completion marker, not a clinical score.",
    techniqueNotes:
      TECHNIQUE_RUBRICS[technique] ||
      "Keep practicing with steady pacing and low physical effort.",
    xpEarned: stars * 15,
    scoringMode: "practice_estimate",
  };
}
