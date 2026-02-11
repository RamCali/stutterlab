"use server";

import { db } from "@/lib/db/client";
import { weeklyAudits, userStats } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";
import { ensureUserStats } from "@/lib/actions/user-progress";

// ==================== NARRATIVE PROMPTS ====================

const NARRATIVE_PROMPTS = [
  "Describe your morning routine in detail, from waking up to leaving the house.",
  "Tell us about a recent conversation you had that went well.",
  "Explain your job or daily activities to someone who knows nothing about them.",
  "Describe a memorable meal you've had — where was it, and what made it special?",
  "Talk about a challenge you overcame and what you learned from it.",
  "Describe your favorite place to relax and why it feels comfortable.",
  "Tell us about a hobby or interest you're passionate about.",
  "Explain the plot of a movie or book you enjoyed recently.",
  "Describe what your ideal weekend looks like from start to finish.",
  "Talk about a person who has had a significant influence on your life.",
  "Describe the neighborhood or area where you live to a visitor.",
  "Tell us about a trip or vacation that stands out in your memory.",
  "Explain how to make your favorite recipe step by step.",
  "Describe a time when you felt proud of something you accomplished.",
  "Talk about what you would do if you had an entire free day with no obligations.",
  "Describe a pet or animal you've known and what made them unique.",
  "Tell us about a skill you've been working to improve lately.",
  "Explain a topic you find fascinating to someone hearing about it for the first time.",
  "Describe the changes you've noticed in your speech over the past few weeks.",
  "Talk about your goals for the next few months and how you plan to reach them.",
];

// ==================== HELPERS ====================

/** Returns current ISO week string like "2026-W07" */
function getISOWeek(): string {
  const now = new Date();
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const dayOfYear =
    Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;
  const jan4DayOfWeek = jan4.getDay() || 7;
  const weekNum = Math.ceil((dayOfYear + jan4DayOfWeek - 1) / 7);
  const paddedWeek = String(weekNum).padStart(2, "0");
  return `${now.getFullYear()}-W${paddedWeek}`;
}

// ==================== SERVER ACTIONS ====================

/** Check whether the user has completed an audit this week */
export async function getWeeklyAuditStatus() {
  const user = await requireAuth();
  const currentWeek = getISOWeek();

  const [currentAudit] = await db
    .select()
    .from(weeklyAudits)
    .where(
      and(
        eq(weeklyAudits.userId, user.id),
        eq(weeklyAudits.weekNumber, currentWeek)
      )
    )
    .limit(1);

  // Determine which prompt to show based on how many audits this user has done
  const allAudits = await db
    .select({ id: weeklyAudits.id })
    .from(weeklyAudits)
    .where(eq(weeklyAudits.userId, user.id));

  const promptIndex = allAudits.length % NARRATIVE_PROMPTS.length;
  const prompt = NARRATIVE_PROMPTS[promptIndex];

  return {
    completed: !!currentAudit,
    weekNumber: currentWeek,
    prompt,
  };
}

/** Get past audit history, most recent first */
export async function getAuditHistory(limit = 12) {
  const user = await requireAuth();

  return db
    .select()
    .from(weeklyAudits)
    .where(eq(weeklyAudits.userId, user.id))
    .orderBy(desc(weeklyAudits.createdAt))
    .limit(limit);
}

/** Save a completed weekly audit and award XP */
export async function saveWeeklyAudit(data: {
  weekNumber: string;
  prompt: string;
  transcription: string;
  durationSeconds: number;
  percentSS: number;
  severityRating: string;
  fluencyScore: number;
  speakingRate: number;
  totalSyllables: number;
  stutteredSyllables: number;
  disfluencyBreakdown: unknown;
  techniqueAnalysis: unknown;
  rateAnalysis: unknown;
  weekOverWeekChange: unknown;
  insights: unknown;
  phonemeHeatmap: unknown;
}) {
  const user = await requireAuth();
  await ensureUserStats(user.id);

  const shareToken = crypto.randomUUID();

  await db.insert(weeklyAudits).values({
    userId: user.id,
    weekNumber: data.weekNumber,
    prompt: data.prompt,
    transcription: data.transcription,
    durationSeconds: data.durationSeconds,
    percentSS: data.percentSS,
    severityRating: data.severityRating as
      | "normal"
      | "mild"
      | "moderate"
      | "severe",
    fluencyScore: data.fluencyScore,
    speakingRate: data.speakingRate,
    totalSyllables: data.totalSyllables,
    stutteredSyllables: data.stutteredSyllables,
    disfluencyBreakdown: data.disfluencyBreakdown,
    techniqueAnalysis: data.techniqueAnalysis,
    rateAnalysis: data.rateAnalysis,
    weekOverWeekChange: data.weekOverWeekChange,
    insights: data.insights,
    phonemeHeatmap: data.phonemeHeatmap,
    shareToken,
  });

  // Award XP: 100 XP for completing a weekly audit
  const xp = 100;

  await db
    .update(userStats)
    .set({
      totalXp: sql`${userStats.totalXp} + ${xp}`,
      totalPracticeSeconds: sql`${userStats.totalPracticeSeconds} + ${data.durationSeconds}`,
      lastPracticeDate: new Date(),
    })
    .where(eq(userStats.userId, user.id));

  return { xp };
}
