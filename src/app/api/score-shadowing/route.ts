import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const technique = formData.get("technique") as string;
    const transcript = formData.get("transcript") as string;
    const durationSeconds = Number(formData.get("durationSeconds"));

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const rubric = TECHNIQUE_RUBRICS[technique] || "Evaluate overall speech fluency and clarity.";

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 400,
      system: `You are a speech-language pathology AI assistant that scores "shadowing" exercises for people who stutter.
The user listened to a model clip and recorded themselves repeating it.

Scoring rubric for the technique "${technique}":
${rubric}

Target clip transcript: "${transcript}"
Target duration: ${durationSeconds} seconds

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "overallScore": <number 0-100>,
  "rhythmMatch": <number 0-100>,
  "techniqueAccuracy": <number 0-100>,
  "paceMatch": <number 0-100>,
  "stars": <1|2|3>,
  "feedback": "<1-2 sentence coach feedback>",
  "techniqueNotes": "<1-2 sentence technique-specific tip>",
  "xpEarned": <number>
}

Scoring guidelines:
- rhythmMatch: How well the speaker's rhythm matches the model clip's pacing pattern
- techniqueAccuracy: How well the speaker applied the specific technique
- paceMatch: How close the speaking rate was to the model
- stars: 3 = score >= 85, 2 = score >= 65, 1 = below 65
- xpEarned: stars * 15
- Be encouraging but honest. This is for adults who stutter.
- NEVER mention stuttering negatively. Focus on technique usage.`,
      messages: [
        {
          role: "user",
          content:
            "The user has submitted their shadowing recording. Since we cannot process the audio directly in this demo, please generate a realistic score based on the technique difficulty and a typical intermediate-level performance. Vary the sub-scores naturally — don't make them all the same.",
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const score = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Score shadowing error:", error);
    return NextResponse.json(
      { error: "Failed to score shadowing" },
      { status: 500 }
    );
  }
}
