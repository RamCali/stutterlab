import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users, profiles, userStats, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";
import { ensureUserStats } from "@/lib/actions/user-progress";

/**
 * GET /api/mobile/profile
 * Returns the user profile, stats, and subscription info.
 */
export async function GET() {
  try {
    const authUser = await requireAuth();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await ensureUserStats(authUser.id);

    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, authUser.id))
      .limit(1);

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, authUser.id))
      .limit(1);

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, authUser.id))
      .limit(1);

    const treatmentPath = (profile?.treatmentPath as Record<string, unknown>) ?? {};

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      onboardingCompleted: !!treatmentPath.stutteringType,
      severity: treatmentPath.severity ?? null,
      goals: treatmentPath.goals ?? [],
      currentDay: stats?.currentDay ?? 1,
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      totalXp: stats?.totalXp ?? 0,
      level: stats?.level ?? 1,
      totalPracticeSeconds: stats?.totalPracticeSeconds ?? 0,
      totalExercisesCompleted: stats?.totalExercisesCompleted ?? 0,
      subscriptionPlan: sub?.plan ?? "free",
      subscriptionStatus: sub?.status ?? "active",
      lastPracticeDate: stats?.lastPracticeDate ?? null,
      northStarGoal: (treatmentPath.northStarGoal as string) ?? null,
      speechChallenges: (treatmentPath.speechChallenges as string[]) ?? [],
    });
  } catch (error) {
    console.error("Mobile profile GET error:", error);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

/**
 * PUT /api/mobile/profile
 * Update user profile (name, onboarding data, etc.)
 */
export async function PUT(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const body = await req.json();

    // Update user name/image if provided
    if (body.name || body.image) {
      await db
        .update(users)
        .set({
          ...(body.name && { name: body.name }),
          ...(body.image && { image: body.image }),
        })
        .where(eq(users.id, authUser.id));
    }

    // Update treatment path (onboarding data) if provided
    if (body.treatmentPath) {
      const [existing] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, authUser.id))
        .limit(1);

      if (existing) {
        const merged = {
          ...((existing.treatmentPath as Record<string, unknown>) ?? {}),
          ...body.treatmentPath,
        };
        await db
          .update(profiles)
          .set({ treatmentPath: merged })
          .where(eq(profiles.userId, authUser.id));
      } else {
        await db.insert(profiles).values({
          userId: authUser.id,
          treatmentPath: body.treatmentPath,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mobile profile PUT error:", error);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
