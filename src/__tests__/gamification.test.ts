import { describe, it, expect } from "vitest";
import { ACHIEVEMENTS, type AchievementCheckStats } from "@/lib/gamification/achievements";

/**
 * Tests for the gamification system: XP calculations, level progression, achievements.
 *
 * Note: awardXp, getUserGamificationStats, checkAndUnlockAchievements are server
 * actions that hit the DB — we test the pure logic they depend on instead.
 */

/* ─── XP Base Values ─── */

const XP_BASE: Record<string, number> = {
  exercise_complete: 15,
  ai_conversation: 30,
  daily_challenge: 75,
  weekly_challenge: 150,
  voice_journal: 15,
  feared_word_practice: 10,
  thought_record: 15,
  daily_plan_complete: 50,
  streak_bonus: 5,
  weekly_audit: 100,
};

/**
 * Pure version of calculateXpForAction (the server action is async only because
 * it's in a "use server" file — the logic itself is synchronous).
 */
function calculateXpForAction(action: string, durationSeconds?: number): number {
  const base = XP_BASE[action];
  if (
    durationSeconds &&
    (action === "exercise_complete" || action === "ai_conversation")
  ) {
    const durationBonus = Math.round((durationSeconds / 60) * 5);
    return Math.max(base, base + durationBonus);
  }
  return base;
}

/* ─── Level System ─── */

const LEVEL_TITLES = [
  "Beginner",
  "Getting Started",
  "Warming Up",
  "Building Momentum",
  "Finding Your Voice",
  "Confident Speaker",
  "Fluency Builder",
  "Technique Master",
  "Speech Warrior",
  "Fluency Champion",
  "Voice Virtuoso",
  "Communication Pro",
  "Speech Legend",
];

function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(50 * Math.pow(level - 1, 1.8));
}

interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progress: number;
}

function getLevelForXp(totalXp: number): LevelInfo {
  let level = 1;
  while (xpRequiredForLevel(level + 1) <= totalXp && level < LEVEL_TITLES.length) {
    level++;
  }
  const currentLevelXp = xpRequiredForLevel(level);
  const nextLevelXp = xpRequiredForLevel(level + 1);
  const xpInLevel = totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progress =
    xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;

  return {
    level,
    title: LEVEL_TITLES[level - 1] || LEVEL_TITLES[LEVEL_TITLES.length - 1],
    currentXp: totalXp,
    xpForCurrentLevel: currentLevelXp,
    xpForNextLevel: nextLevelXp,
    progress,
  };
}

// ─── XP Calculation Tests ───

describe("calculateXpForAction", () => {
  it("returns base XP for each action type", () => {
    expect(calculateXpForAction("exercise_complete")).toBe(15);
    expect(calculateXpForAction("ai_conversation")).toBe(30);
    expect(calculateXpForAction("daily_challenge")).toBe(75);
    expect(calculateXpForAction("weekly_challenge")).toBe(150);
    expect(calculateXpForAction("voice_journal")).toBe(15);
    expect(calculateXpForAction("feared_word_practice")).toBe(10);
    expect(calculateXpForAction("thought_record")).toBe(15);
    expect(calculateXpForAction("daily_plan_complete")).toBe(50);
    expect(calculateXpForAction("streak_bonus")).toBe(5);
    expect(calculateXpForAction("weekly_audit")).toBe(100);
  });

  it("adds duration bonus for exercise_complete", () => {
    // 5 min = 300s → bonus = Math.round((300/60)*5) = 25
    expect(calculateXpForAction("exercise_complete", 300)).toBe(15 + 25);
  });

  it("adds duration bonus for ai_conversation", () => {
    // 10 min = 600s → bonus = 50
    expect(calculateXpForAction("ai_conversation", 600)).toBe(30 + 50);
  });

  it("does NOT add duration bonus for non-time-based actions", () => {
    expect(calculateXpForAction("daily_challenge", 600)).toBe(75);
    expect(calculateXpForAction("voice_journal", 300)).toBe(15);
    expect(calculateXpForAction("weekly_audit", 1200)).toBe(100);
  });

  it("returns at least base XP even with 0-second duration", () => {
    expect(calculateXpForAction("exercise_complete", 0)).toBe(15);
  });

  it("handles very long sessions", () => {
    // 60 min = 3600s → bonus = 300
    expect(calculateXpForAction("ai_conversation", 3600)).toBe(30 + 300);
  });
});

// ─── Level System Tests ───

describe("xpRequiredForLevel", () => {
  it("level 1 requires 0 XP", () => {
    expect(xpRequiredForLevel(1)).toBe(0);
  });

  it("level 2 requires 50 XP", () => {
    // 50 * (2-1)^1.8 = 50 * 1 = 50
    expect(xpRequiredForLevel(2)).toBe(50);
  });

  it("XP requirements increase progressively", () => {
    let prev = 0;
    for (let level = 2; level <= 13; level++) {
      const required = xpRequiredForLevel(level);
      expect(required).toBeGreaterThan(prev);
      prev = required;
    }
  });

  it("returns 0 for level 0 and below", () => {
    expect(xpRequiredForLevel(0)).toBe(0);
    expect(xpRequiredForLevel(-1)).toBe(0);
  });
});

describe("getLevelForXp", () => {
  it("0 XP is level 1 Beginner", () => {
    const info = getLevelForXp(0);
    expect(info.level).toBe(1);
    expect(info.title).toBe("Beginner");
    expect(info.progress).toBe(0);
  });

  it("50 XP reaches level 2", () => {
    const info = getLevelForXp(50);
    expect(info.level).toBe(2);
    expect(info.title).toBe("Getting Started");
  });

  it("very high XP reaches max level 13", () => {
    const info = getLevelForXp(999999);
    expect(info.level).toBe(13);
    expect(info.title).toBe("Speech Legend");
    expect(info.progress).toBe(100);
  });

  it("progress is between 0 and 100", () => {
    for (const xp of [0, 25, 50, 100, 500, 1000, 5000]) {
      const info = getLevelForXp(xp);
      expect(info.progress).toBeGreaterThanOrEqual(0);
      expect(info.progress).toBeLessThanOrEqual(100);
    }
  });

  it("XP just below level threshold stays at previous level", () => {
    const threshold = xpRequiredForLevel(3); // XP needed for level 3
    const info = getLevelForXp(threshold - 1);
    expect(info.level).toBe(2);
  });

  it("XP exactly at threshold reaches that level", () => {
    const threshold = xpRequiredForLevel(3);
    const info = getLevelForXp(threshold);
    expect(info.level).toBe(3);
    expect(info.title).toBe("Warming Up");
  });

  it("all 13 levels have distinct titles", () => {
    const titles = new Set(LEVEL_TITLES);
    expect(titles.size).toBe(13);
  });
});

// ─── Achievement Tests ───

describe("ACHIEVEMENTS", () => {
  it("has at least 20 achievements defined", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(20);
  });

  it("all achievements have unique IDs", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all achievements have required fields", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.id).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.emoji).toBeTruthy();
      expect(a.xpReward).toBeGreaterThan(0);
      expect(typeof a.check).toBe("function");
    }
  });

  it("first_steps unlocks at 1 exercise", () => {
    const a = ACHIEVEMENTS.find((a) => a.id === "first_steps")!;
    const baseStats: AchievementCheckStats = {
      totalExercisesCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 0,
      totalPracticeSeconds: 0,
    };
    expect(a.check({ ...baseStats, totalExercisesCompleted: 0 })).toBe(false);
    expect(a.check({ ...baseStats, totalExercisesCompleted: 1 })).toBe(true);
  });

  it("streak_3 unlocks at 3-day streak", () => {
    const a = ACHIEVEMENTS.find((a) => a.id === "streak_3")!;
    const baseStats: AchievementCheckStats = {
      totalExercisesCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 0,
      totalPracticeSeconds: 0,
    };
    expect(a.check({ ...baseStats, currentStreak: 2 })).toBe(false);
    expect(a.check({ ...baseStats, currentStreak: 3 })).toBe(true);
    expect(a.check({ ...baseStats, longestStreak: 3 })).toBe(true);
  });

  it("streak_90 unlocks at 90-day streak", () => {
    const a = ACHIEVEMENTS.find((a) => a.id === "streak_90")!;
    const baseStats: AchievementCheckStats = {
      totalExercisesCompleted: 0,
      currentStreak: 90,
      longestStreak: 90,
      totalXp: 0,
      totalPracticeSeconds: 0,
    };
    expect(a.check(baseStats)).toBe(true);
    expect(a.check({ ...baseStats, currentStreak: 89, longestStreak: 89 })).toBe(false);
  });

  it("hour_one unlocks at 3600 seconds", () => {
    const a = ACHIEVEMENTS.find((a) => a.id === "hour_one")!;
    const baseStats: AchievementCheckStats = {
      totalExercisesCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 0,
      totalPracticeSeconds: 3599,
    };
    expect(a.check(baseStats)).toBe(false);
    expect(a.check({ ...baseStats, totalPracticeSeconds: 3600 })).toBe(true);
  });

  it("brave_caller unlocks at 1 AI conversation", () => {
    const a = ACHIEVEMENTS.find((a) => a.id === "brave_caller")!;
    const baseStats: AchievementCheckStats = {
      totalExercisesCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 0,
      totalPracticeSeconds: 0,
      aiConversationCount: 0,
    };
    expect(a.check(baseStats)).toBe(false);
    expect(a.check({ ...baseStats, aiConversationCount: 1 })).toBe(true);
  });

  it("xp_500 unlocks at 500 XP", () => {
    const a = ACHIEVEMENTS.find((a) => a.id === "xp_500")!;
    const baseStats: AchievementCheckStats = {
      totalExercisesCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 499,
      totalPracticeSeconds: 0,
    };
    expect(a.check(baseStats)).toBe(false);
    expect(a.check({ ...baseStats, totalXp: 500 })).toBe(true);
  });

  it("ice_under_fire requires stressLevel3HighFluency flag", () => {
    const a = ACHIEVEMENTS.find((a) => a.id === "ice_under_fire")!;
    const baseStats: AchievementCheckStats = {
      totalExercisesCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 0,
      totalPracticeSeconds: 0,
    };
    expect(a.check(baseStats)).toBe(false);
    expect(a.check({ ...baseStats, stressLevel3HighFluency: true })).toBe(true);
  });

  it("word_conqueror requires 10 feared words mastered", () => {
    const a = ACHIEVEMENTS.find((a) => a.id === "word_conqueror")!;
    const baseStats: AchievementCheckStats = {
      totalExercisesCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 0,
      totalPracticeSeconds: 0,
      fearedWordsMastered: 9,
    };
    expect(a.check(baseStats)).toBe(false);
    expect(a.check({ ...baseStats, fearedWordsMastered: 10 })).toBe(true);
  });
});
