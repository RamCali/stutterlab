"use server";

import { db } from "@/lib/db/client";
import { fearedWords } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export async function getFearedWords() {
  const user = await requireAuth();

  return db
    .select()
    .from(fearedWords)
    .where(eq(fearedWords.userId, user.id))
    .orderBy(fearedWords.createdAt);
}

export async function addFearedWord(data: {
  word: string;
  phoneme?: string;
  difficulty?: string;
}) {
  const user = await requireAuth();

  const [word] = await db
    .insert(fearedWords)
    .values({
      userId: user.id,
      word: data.word.trim().toLowerCase(),
      phoneme: data.phoneme ?? null,
      difficulty: data.difficulty ?? "medium",
    })
    .returning();

  return word;
}

export async function removeFearedWord(wordId: string) {
  const user = await requireAuth();

  await db
    .delete(fearedWords)
    .where(
      and(eq(fearedWords.id, wordId), eq(fearedWords.userId, user.id))
    );

  return { success: true };
}

export async function practiceFearedWord(wordId: string) {
  const user = await requireAuth();

  await db
    .update(fearedWords)
    .set({
      practiceCount: sql`${fearedWords.practiceCount} + 1`,
      lastPracticed: new Date(),
    })
    .where(
      and(eq(fearedWords.id, wordId), eq(fearedWords.userId, user.id))
    );

  return { success: true };
}

export async function toggleMastered(wordId: string) {
  const user = await requireAuth();

  const [word] = await db
    .select()
    .from(fearedWords)
    .where(
      and(eq(fearedWords.id, wordId), eq(fearedWords.userId, user.id))
    )
    .limit(1);

  if (!word) throw new Error("Word not found");

  await db
    .update(fearedWords)
    .set({ mastered: !word.mastered })
    .where(eq(fearedWords.id, wordId));

  return { mastered: !word.mastered };
}
