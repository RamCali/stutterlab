import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getAIConversationAnalytics,
  getFearedWordsAnalytics,
  getAnxietyTrend,
} from "@/lib/actions/analytics";

/**
 * GET /api/mobile/analytics
 * Returns bundled premium analytics for the iOS app.
 */
export async function GET() {
  try {
    await requireAuth();

    const [aiAnalytics, fearedWordsAnalytics, anxietyTrend] =
      await Promise.all([
        getAIConversationAnalytics(),
        getFearedWordsAnalytics(),
        getAnxietyTrend(),
      ]);

    return NextResponse.json({
      ai: {
        totalConversations: aiAnalytics.totalConversations,
        avgFluency: aiAnalytics.avgFluency,
        totalMinutes: aiAnalytics.totalAIMinutes,
        recentTrend: aiAnalytics.recentTrend,
        scenarioBreakdown: aiAnalytics.scenarioBreakdown,
        techniqueFrequency: aiAnalytics.techniqueFrequency,
      },
      fearedWords: {
        total: fearedWordsAnalytics.total,
        mastered: fearedWordsAnalytics.mastered,
        masteryPercent: fearedWordsAnalytics.masteryPercent,
        byDifficulty: fearedWordsAnalytics.byDifficulty,
        totalReps: fearedWordsAnalytics.totalPracticeReps,
      },
      anxiety: anxietyTrend
        ? {
            totalSituations: anxietyTrend.totalSituations,
            avgReduction: anxietyTrend.avgAnxietyReduction,
            trend: anxietyTrend.trend,
            byType: anxietyTrend.byType,
          }
        : null,
    });
  } catch (error) {
    console.error("Mobile analytics GET error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
