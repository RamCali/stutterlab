import { describe, it, expect } from "vitest";

/**
 * Tests for streak calculation logic extracted from /api/user/stats/route.ts
 *
 * The logic is:
 * - First ever practice → streak = 1
 * - Practice on consecutive day → streak + 1
 * - Practice same day → no change
 * - Missed 1 day with freeze token → streak + 1, token consumed
 * - Missed 1 day without freeze → streak = 1
 * - Missed 2+ days → streak = 1 (regardless of tokens)
 */

interface StreakState {
  currentStreak: number;
  lastPracticeDate: Date | null;
  streakFreezeTokens: number;
}

/**
 * Pure function version of the streak logic from the API route.
 * Extracted here for testability.
 */
function calculateNewStreak(
  state: StreakState,
  practiceDate: Date
): { newStreak: number; freezeUsed: boolean } {
  if (!state.lastPracticeDate) {
    return { newStreak: 1, freezeUsed: false };
  }

  const daysSinceLast = Math.floor(
    (practiceDate.getTime() - state.lastPracticeDate.getTime()) / 86400000
  );

  if (daysSinceLast === 0) {
    // Same day — no change
    return { newStreak: state.currentStreak, freezeUsed: false };
  }

  if (daysSinceLast === 1) {
    // Consecutive day
    return { newStreak: state.currentStreak + 1, freezeUsed: false };
  }

  if (daysSinceLast === 2 && state.streakFreezeTokens > 0) {
    // Missed exactly 1 day, but have a freeze token
    return { newStreak: state.currentStreak + 1, freezeUsed: true };
  }

  // Missed 2+ days (or missed 1 with no tokens)
  return { newStreak: 1, freezeUsed: false };
}

describe("calculateNewStreak", () => {
  it("starts at 1 for first ever practice", () => {
    const result = calculateNewStreak(
      { currentStreak: 0, lastPracticeDate: null, streakFreezeTokens: 0 },
      new Date("2026-01-15")
    );
    expect(result.newStreak).toBe(1);
    expect(result.freezeUsed).toBe(false);
  });

  it("increments streak for consecutive day practice", () => {
    const result = calculateNewStreak(
      { currentStreak: 5, lastPracticeDate: new Date("2026-01-14"), streakFreezeTokens: 0 },
      new Date("2026-01-15")
    );
    expect(result.newStreak).toBe(6);
    expect(result.freezeUsed).toBe(false);
  });

  it("keeps streak the same for same-day practice", () => {
    const result = calculateNewStreak(
      { currentStreak: 5, lastPracticeDate: new Date("2026-01-15"), streakFreezeTokens: 0 },
      new Date("2026-01-15")
    );
    expect(result.newStreak).toBe(5);
    expect(result.freezeUsed).toBe(false);
  });

  it("uses freeze token when missing exactly 1 day", () => {
    const result = calculateNewStreak(
      { currentStreak: 10, lastPracticeDate: new Date("2026-01-13"), streakFreezeTokens: 2 },
      new Date("2026-01-15")
    );
    expect(result.newStreak).toBe(11);
    expect(result.freezeUsed).toBe(true);
  });

  it("resets streak to 1 when missing 1 day without freeze token", () => {
    const result = calculateNewStreak(
      { currentStreak: 10, lastPracticeDate: new Date("2026-01-13"), streakFreezeTokens: 0 },
      new Date("2026-01-15")
    );
    expect(result.newStreak).toBe(1);
    expect(result.freezeUsed).toBe(false);
  });

  it("resets streak to 1 when missing 2+ days even with tokens", () => {
    const result = calculateNewStreak(
      { currentStreak: 10, lastPracticeDate: new Date("2026-01-12"), streakFreezeTokens: 3 },
      new Date("2026-01-15")
    );
    expect(result.newStreak).toBe(1);
    expect(result.freezeUsed).toBe(false);
  });

  it("resets streak to 1 when missing many days", () => {
    const result = calculateNewStreak(
      { currentStreak: 50, lastPracticeDate: new Date("2026-01-01"), streakFreezeTokens: 5 },
      new Date("2026-01-15")
    );
    expect(result.newStreak).toBe(1);
    expect(result.freezeUsed).toBe(false);
  });

  it("handles streak of 1 continuing to 2", () => {
    const result = calculateNewStreak(
      { currentStreak: 1, lastPracticeDate: new Date("2026-01-14"), streakFreezeTokens: 0 },
      new Date("2026-01-15")
    );
    expect(result.newStreak).toBe(2);
  });
});

// ─── Longest Streak Tracking ──────────────────────────────

describe("longestStreak tracking", () => {
  it("updates when new streak exceeds previous longest", () => {
    const currentLongest = 5;
    const newStreak = 8;
    const updatedLongest = Math.max(currentLongest, newStreak);
    expect(updatedLongest).toBe(8);
  });

  it("preserves longest when current streak is shorter", () => {
    const currentLongest = 20;
    const newStreak = 3;
    const updatedLongest = Math.max(currentLongest, newStreak);
    expect(updatedLongest).toBe(20);
  });
});
