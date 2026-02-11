import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      severity,
      fearedSituations,
      speechChallenges,
      northStarGoal,
      fearedWords,
      confidenceRatings,
      avoidanceBehaviors,
      stutteringTypes,
      speakingFrequency,
      severityScore,
      confidenceScore,
      assessmentProfile,
      recommendedEmphasis,
    } = body;

    const {
      stutterFrequency,
      stutterDuration,
      stutterImpact,
    } = body;

    const treatmentPath = {
      fearedSituations: fearedSituations || [],
      speechChallenges: speechChallenges || [],
      northStarGoal: northStarGoal || "",
      fearedWords: fearedWords || [],
      confidenceRatings: confidenceRatings || {},
      avoidanceBehaviors: avoidanceBehaviors || [],
      stutteringTypes: stutteringTypes || [],
      speakingFrequency: speakingFrequency || null,
      stutterFrequency: stutterFrequency || null,
      stutterDuration: stutterDuration || null,
      stutterImpact: stutterImpact || null,
      severity: severity || null,
      severityScore: severityScore || null,
      confidenceScore: confidenceScore || null,
      assessmentProfile: assessmentProfile || null,
      recommendedEmphasis: recommendedEmphasis || null,
    };

    // Upsert profile
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(profiles)
        .set({
          displayName: name || existing[0].displayName,
          stutteringSeverity: severity || existing[0].stutteringSeverity,
          treatmentPath,
          onboardingCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId));
    } else {
      await db.insert(profiles).values({
        userId,
        displayName: name,
        stutteringSeverity: severity,
        treatmentPath,
        onboardingCompleted: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding save error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .select({
        displayName: profiles.displayName,
        stutteringSeverity: profiles.stutteringSeverity,
        treatmentPath: profiles.treatmentPath,
        onboardingCompleted: profiles.onboardingCompleted,
      })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ onboardingCompleted: false });
    }

    const profile = result[0];
    const tp = (profile.treatmentPath as Record<string, unknown>) || {};

    return NextResponse.json({
      onboardingCompleted: profile.onboardingCompleted,
      name: profile.displayName,
      severity: profile.stutteringSeverity,
      fearedSituations: tp.fearedSituations || [],
      speechChallenges: tp.speechChallenges || [],
      northStarGoal: tp.northStarGoal || "",
      fearedWords: tp.fearedWords || [],
      confidenceRatings: tp.confidenceRatings || {},
      avoidanceBehaviors: tp.avoidanceBehaviors || [],
      stutteringTypes: tp.stutteringTypes || [],
      speakingFrequency: tp.speakingFrequency || null,
      severityScore: tp.severityScore || null,
      confidenceScore: tp.confidenceScore || null,
      assessmentProfile: tp.assessmentProfile || null,
      recommendedEmphasis: tp.recommendedEmphasis || null,
    });
  } catch (error) {
    console.error("Onboarding fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding data" },
      { status: 500 }
    );
  }
}
