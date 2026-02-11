"use server";

import { db } from "@/lib/db/client";
import { fearedWords } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

interface FearedWordSync {
  word: string;
  difficulty: "easy" | "medium" | "hard";
  practiceCount: number;
  mastered: boolean;
}

export async function syncFearedWordsToDb(words: FearedWordSync[]) {
  const user = await requireAuth();

  for (const word of words) {
    const [existing] = await db
      .select()
      .from(fearedWords)
      .where(
        and(
          eq(fearedWords.userId, user.id),
          eq(fearedWords.word, word.word)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(fearedWords)
        .set({
          difficulty: word.difficulty,
          practiceCount: word.practiceCount,
          mastered: word.mastered,
        })
        .where(eq(fearedWords.id, existing.id));
    } else {
      await db.insert(fearedWords).values({
        userId: user.id,
        word: word.word,
        difficulty: word.difficulty,
        practiceCount: word.practiceCount,
        mastered: word.mastered,
      });
    }
  }
}

export async function getFearedWordsFromDb() {
  const user = await requireAuth();

  return db
    .select()
    .from(fearedWords)
    .where(eq(fearedWords.userId, user.id));
}
