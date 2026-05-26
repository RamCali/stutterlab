import { describe, it, expect } from "vitest";
import { getDailyPlan, personalizeDailyPlan } from "@/lib/curriculum/daily-plans";

describe("applyPracticePersonalization", () => {
  it("adds optional deep practice when user is not time-constrained", () => {
    const plan = personalizeDailyPlan(getDailyPlan(10)!, {
      completed: true,
      name: "Test",
      fearedSituations: [],
      severity: "moderate",
      assessmentProfile: "balanced",
      recommendedEmphasis: {
        fluencyShaping: 0.4,
        stutteringModification: 0.35,
        cbt: 0.25,
      },
    });
    expect(
      plan.tasks.some((t) => t.title.includes("Deep Practice")),
    ).toBe(true);
  });

  it("skips deep practice for busy users", () => {
    const plan = personalizeDailyPlan(getDailyPlan(10)!, {
      completed: true,
      name: "Test",
      fearedSituations: [],
      severity: "moderate",
      painPoints: ["busy"],
    });
    expect(
      plan.tasks.some((t) => t.title.includes("Deep Practice")),
    ).toBe(false);
  });

  it("renames plan title to Today's Practice", () => {
    const plan = personalizeDailyPlan(getDailyPlan(5)!, {
      completed: true,
      name: "Test",
      fearedSituations: [],
      severity: "moderate",
      assessmentProfile: "anxiety-heavy",
      recommendedEmphasis: {
        fluencyShaping: 0.3,
        stutteringModification: 0.25,
        cbt: 0.45,
      },
    });
    expect(plan.title).toBe("Today's Practice");
  });
});
