import { db } from "@/lib/db/client";
import {
  behavioralPredictions,
  oasesCheckIns,
  profiles,
  sessions,
  userStats,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { parseResearchConsent } from "@/lib/research/consent";
import {
  pseudonymizeUserId,
  pushRow,
  rowsToCsv,
  type ResearchExportRow,
} from "@/lib/research/export-csv";

export type ResearchExportResult =
  | { ok: true; csv: string; filename: string }
  | { ok: false; error: string; status: 401 | 403 };

export async function buildResearchExportCsvForUser(
  userId: string,
): Promise<ResearchExportResult> {
  const [profile] = await db
    .select({ treatmentPath: profiles.treatmentPath })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  const consent = parseResearchConsent(
    (profile?.treatmentPath as Record<string, unknown>) ?? {},
  );
  if (!consent.consented) {
    return {
      ok: false,
      status: 403,
      error: "Enable research participation consent in Settings before exporting.",
    };
  }

  const pseudoId = pseudonymizeUserId(userId);
  const exportedAt = new Date().toISOString();
  const rows: ResearchExportRow[] = [];

  pushRow(rows, "meta", "export_version", "1");
  pushRow(rows, "meta", "exported_at", exportedAt);
  pushRow(rows, "meta", "participant_id", pseudoId);
  pushRow(rows, "meta", "consent_at", consent.consentedAt);

  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (stats) {
    pushRow(rows, "adherence", "current_streak", stats.currentStreak);
    pushRow(rows, "adherence", "longest_streak", stats.longestStreak);
    pushRow(rows, "adherence", "total_practice_seconds", stats.totalPracticeSeconds);
    pushRow(rows, "adherence", "total_exercises_completed", stats.totalExercisesCompleted);
    pushRow(rows, "adherence", "last_practice_date", stats.lastPracticeDate);
    pushRow(rows, "adherence", "level", stats.level);
  }

  const oasesRows = await db
    .select()
    .from(oasesCheckIns)
    .where(eq(oasesCheckIns.userId, userId))
    .orderBy(desc(oasesCheckIns.checkInDate));

  for (const row of oasesRows) {
    pushRow(rows, "oases_check_in", "check_in_date", row.checkInDate);
    pushRow(rows, "oases_check_in", "impact_score", row.impactScore);
    pushRow(rows, "oases_check_in", "scores_json", JSON.stringify(row.scores));
  }

  const predictionRows = await db
    .select()
    .from(behavioralPredictions)
    .where(eq(behavioralPredictions.userId, userId))
    .orderBy(desc(behavioralPredictions.createdAt));

  for (const row of predictionRows) {
    pushRow(rows, "behavioral_experiment", "created_at", row.createdAt.toISOString());
    pushRow(rows, "behavioral_experiment", "completed", row.completed);
    pushRow(rows, "behavioral_experiment", "situation", row.situation);
    pushRow(rows, "behavioral_experiment", "prediction", row.prediction);
    pushRow(rows, "behavioral_experiment", "confidence_level", row.confidenceLevel);
    pushRow(rows, "behavioral_experiment", "anxiety_before", row.anxietyBefore);
    pushRow(rows, "behavioral_experiment", "anxiety_after", row.anxietyAfter);
    pushRow(rows, "behavioral_experiment", "actual_outcome", row.actualOutcome);
    pushRow(
      rows,
      "behavioral_experiment",
      "completed_at",
      row.completedAt?.toISOString() ?? null,
    );
    pushRow(rows, "behavioral_experiment", "record_separator", "---");
  }

  const sessionRows = await db
    .select({
      startedAt: sessions.startedAt,
      durationSeconds: sessions.durationSeconds,
      exerciseType: sessions.exerciseType,
      selfRatedFluency: sessions.selfRatedFluency,
      aiFluencyScore: sessions.aiFluencyScore,
      techniqueCategory: sessions.techniqueCategory,
      confidenceBefore: sessions.confidenceBefore,
      confidenceAfter: sessions.confidenceAfter,
    })
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.startedAt))
    .limit(500);

  for (const row of sessionRows) {
    pushRow(rows, "practice_session", "started_at", row.startedAt.toISOString());
    pushRow(rows, "practice_session", "duration_seconds", row.durationSeconds);
    pushRow(rows, "practice_session", "exercise_type", row.exerciseType);
    pushRow(rows, "practice_session", "self_rated_fluency", row.selfRatedFluency);
    pushRow(rows, "practice_session", "ai_fluency_score", row.aiFluencyScore);
    pushRow(rows, "practice_session", "technique_category", row.techniqueCategory);
    pushRow(rows, "practice_session", "confidence_before", row.confidenceBefore);
    pushRow(rows, "practice_session", "confidence_after", row.confidenceAfter);
    pushRow(rows, "practice_session", "record_separator", "---");
  }

  const tp = (profile?.treatmentPath as Record<string, unknown>) ?? {};
  if (tp.assessmentProfile) {
    pushRow(rows, "profile", "assessment_profile", String(tp.assessmentProfile));
  }
  if (tp.severityScore != null) {
    pushRow(rows, "profile", "severity_score", tp.severityScore as number);
  }
  if (tp.confidenceScore != null) {
    pushRow(rows, "profile", "confidence_score", tp.confidenceScore as number);
  }

  const csv = rowsToCsv(rows);
  const date = exportedAt.split("T")[0];
  return {
    ok: true,
    csv,
    filename: `stutterlab-research-export-${pseudoId}-${date}.csv`,
  };
}
