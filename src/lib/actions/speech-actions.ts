"use server";

import { db } from "@/lib/db/client";
import { speechAnalyses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export async function saveSpeechAnalysis(data: {
  sessionId?: string;
  fluencyScore: number;
  speakingRate: number;
  stutteredSyllablesPercent: number;
  disfluencyMap: Record<string, number>;
  stutterFingerprintJson?: Record<string, unknown>;
  triggerPhonemes?: string[];
}) {
  const user = await requireAuth();

  const [analysis] = await db
    .insert(speechAnalyses)
    .values({
      userId: user.id,
      sessionId: data.sessionId ?? null,
      fluencyScore: data.fluencyScore,
      speakingRate: data.speakingRate,
      stutteredSyllablesPercent: data.stutteredSyllablesPercent,
      disfluencyMap: data.disfluencyMap,
      stutterFingerprintJson: data.stutterFingerprintJson ?? null,
      triggerPhonemes: data.triggerPhonemes ?? null,
    })
    .returning();

  return analysis;
}

export async function getRecentAnalyses(limit = 5) {
  const user = await requireAuth();

  return db
    .select()
    .from(speechAnalyses)
    .where(eq(speechAnalyses.userId, user.id))
    .orderBy(desc(speechAnalyses.analyzedAt))
    .limit(limit);
}
