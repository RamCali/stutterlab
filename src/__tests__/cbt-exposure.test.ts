import { describe, it, expect } from "vitest";
import {
  THINKING_TRAPS,
  getTrapById,
  getTrapColor,
} from "@/lib/cbt/thinking-traps";
import {
  EXPOSURE_LADDER,
  getRungById,
  type ExposureAttempt,
} from "@/lib/exposure/exposure-ladder";

// ─── CBT Thinking Traps ───

describe("THINKING_TRAPS", () => {
  it("has exactly 6 thinking traps", () => {
    expect(THINKING_TRAPS.length).toBe(6);
  });

  it("all traps have unique IDs", () => {
    const ids = THINKING_TRAPS.map((t) => t.id);
    expect(new Set(ids).size).toBe(6);
  });

  it("all traps have required fields", () => {
    for (const trap of THINKING_TRAPS) {
      expect(trap.id).toBeTruthy();
      expect(trap.name).toBeTruthy();
      expect(trap.emoji).toBeTruthy();
      expect(trap.description).toBeTruthy();
      expect(trap.example).toBeTruthy();
      expect(trap.challenge).toBeTruthy();
      expect(trap.color).toBeTruthy();
    }
  });

  it("includes all expected trap types", () => {
    const ids = THINKING_TRAPS.map((t) => t.id);
    expect(ids).toContain("catastrophizing");
    expect(ids).toContain("mind-reading");
    expect(ids).toContain("all-or-nothing");
    expect(ids).toContain("over-generalization");
    expect(ids).toContain("mental-filter");
    expect(ids).toContain("fortune-telling");
  });
});

describe("getTrapById", () => {
  it("returns correct trap for valid ID", () => {
    const trap = getTrapById("catastrophizing");
    expect(trap).toBeDefined();
    expect(trap!.name).toBe("Catastrophizing");
  });

  it("returns undefined for unknown ID", () => {
    expect(getTrapById("nonexistent" as never)).toBeUndefined();
  });
});

describe("getTrapColor", () => {
  it("returns correct color for known trap", () => {
    const color = getTrapColor("catastrophizing");
    expect(color).toContain("bg-red");
  });

  it("returns fallback for unknown trap", () => {
    const color = getTrapColor("nonexistent" as never);
    expect(color).toContain("bg-muted");
  });
});

// ─── Exposure Ladder ───

describe("EXPOSURE_LADDER", () => {
  it("has exactly 10 rungs", () => {
    expect(EXPOSURE_LADDER.length).toBe(10);
  });

  it("rungs are ordered by level 1-10", () => {
    for (let i = 0; i < EXPOSURE_LADDER.length; i++) {
      expect(EXPOSURE_LADDER[i].level).toBe(i + 1);
    }
  });

  it("all rungs have unique IDs", () => {
    const ids = EXPOSURE_LADDER.map((r) => r.id);
    expect(new Set(ids).size).toBe(10);
  });

  it("all rungs have required fields", () => {
    for (const rung of EXPOSURE_LADDER) {
      expect(rung.id).toBeTruthy();
      expect(rung.title).toBeTruthy();
      expect(rung.description).toBeTruthy();
      expect(rung.category).toBeTruthy();
      expect(rung.suggestedTechniques.length).toBeGreaterThan(0);
      expect(rung.missions.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("categories progress from solo → familiar → stranger → phone → group → high-stakes", () => {
    const categories = EXPOSURE_LADDER.map((r) => r.category);
    // First 3 are solo, then familiar, stranger, etc.
    expect(categories[0]).toBe("solo");
    expect(categories[1]).toBe("solo");
    expect(categories[2]).toBe("solo");
    expect(categories[3]).toBe("familiar");
    expect(categories[9]).toBe("high-stakes");
  });

  it("rung 1 is the easiest (reading alone)", () => {
    expect(EXPOSURE_LADDER[0].id).toBe("reading-alone");
    expect(EXPOSURE_LADDER[0].level).toBe(1);
  });

  it("rung 10 is the hardest (presentation)", () => {
    expect(EXPOSURE_LADDER[9].id).toBe("presentation");
    expect(EXPOSURE_LADDER[9].level).toBe(10);
  });
});

describe("getRungById", () => {
  it("returns correct rung for valid ID", () => {
    const rung = getRungById("phone-call");
    expect(rung).toBeDefined();
    expect(rung!.level).toBe(7);
    expect(rung!.title).toBe("Making a Phone Call");
  });

  it("returns undefined for unknown ID", () => {
    expect(getRungById("nonexistent")).toBeUndefined();
  });
});

// ─── Exposure Unlock Logic ───

describe("exposure unlock logic", () => {
  // Test the pure unlock logic extracted from saveExposureAttempt
  function shouldUnlock(
    currentUnlocked: number,
    rungLevel: number,
    attempt: Pick<ExposureAttempt, "outcome" | "actualAnxiety">,
    completionCount: number
  ): number {
    let newUnlocked = currentUnlocked;
    const nextLevel = rungLevel + 1;

    // Low-anxiety completion unlocks next level
    if (attempt.outcome === "completed" && attempt.actualAnxiety <= 5) {
      if (nextLevel > newUnlocked && nextLevel <= 10) {
        newUnlocked = nextLevel;
      }
    }

    // 3+ completions also unlocks next level
    if (completionCount >= 3) {
      if (nextLevel > newUnlocked && nextLevel <= 10) {
        newUnlocked = nextLevel;
      }
    }

    return newUnlocked;
  }

  it("unlocks next level on low-anxiety completion", () => {
    const newLevel = shouldUnlock(1, 1, { outcome: "completed", actualAnxiety: 3 }, 1);
    expect(newLevel).toBe(2);
  });

  it("does NOT unlock on high-anxiety completion (single attempt)", () => {
    const newLevel = shouldUnlock(1, 1, { outcome: "completed", actualAnxiety: 7 }, 1);
    expect(newLevel).toBe(1);
  });

  it("unlocks after 3 completions regardless of anxiety", () => {
    const newLevel = shouldUnlock(1, 1, { outcome: "completed", actualAnxiety: 9 }, 3);
    expect(newLevel).toBe(2);
  });

  it("does NOT unlock on skipped attempt", () => {
    const newLevel = shouldUnlock(1, 1, { outcome: "skipped", actualAnxiety: 2 }, 1);
    expect(newLevel).toBe(1);
  });

  it("does NOT exceed level 10", () => {
    const newLevel = shouldUnlock(10, 10, { outcome: "completed", actualAnxiety: 1 }, 5);
    expect(newLevel).toBe(10);
  });

  it("does NOT downgrade already-unlocked levels", () => {
    const newLevel = shouldUnlock(5, 1, { outcome: "completed", actualAnxiety: 1 }, 1);
    expect(newLevel).toBe(5);
  });
});
