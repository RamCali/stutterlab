"use server";

import { db } from "@/lib/db/client";
import { voiceJournalEntries } from "@/lib/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export async function getJournalEntries() {
  const user = await requireAuth();

  return db
    .select()
    .from(voiceJournalEntries)
    .where(eq(voiceJournalEntries.userId, user.id))
    .orderBy(desc(voiceJournalEntries.createdAt))
    .limit(100);
}

export async function createJournalEntry(data: {
  recordingUrl: string;
  notes?: string;
  emotionalTag?: "confident" | "anxious" | "frustrated" | "proud" | "neutral" | "hopeful" | "discouraged";
}) {
  const user = await requireAuth();

  const [entry] = await db
    .insert(voiceJournalEntries)
    .values({
      userId: user.id,
      recordingUrl: data.recordingUrl,
      notes: data.notes ?? null,
      emotionalTag: data.emotionalTag ?? "neutral",
    })
    .returning();

  return entry;
}

export async function getJournalStats() {
  const user = await requireAuth();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(voiceJournalEntries)
    .where(eq(voiceJournalEntries.userId, user.id));

  const [weekResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(voiceJournalEntries)
    .where(
      and(
        eq(voiceJournalEntries.userId, user.id),
        gte(voiceJournalEntries.createdAt, weekAgo)
      )
    );

  const [avgResult] = await db
    .select({ avg: sql<number>`round(avg(${voiceJournalEntries.fluencyScore})::numeric, 1)` })
    .from(voiceJournalEntries)
    .where(
      and(
        eq(voiceJournalEntries.userId, user.id),
        sql`${voiceJournalEntries.fluencyScore} is not null`
      )
    );

  return {
    totalEntries: totalResult?.count ?? 0,
    thisWeek: weekResult?.count ?? 0,
    avgFluency: avgResult?.avg ?? null,
  };
}
