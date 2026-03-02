import { describe, it, expect } from "vitest";
import {
  getDailyPlan,
  getPhaseInfo,
  PHASE_LABELS,
  PHASE_RANGES,
  generateDailyPlans,
} from "@/lib/curriculum/daily-plans";
import {
  getWeekForDay,
  getWeekInfo,
  getDaysForWeek,
  getAllWeeks,
  getWeeksByPhase,
  getNextMilestone,
} from "@/lib/curriculum/weeks";
import {
  TECHNIQUE_CATEGORIES,
  FLUENCY_SHAPING_TECHNIQUES,
  MODIFICATION_TECHNIQUES,
  ALL_TECHNIQUES,
  getCategoryForTechnique,
} from "@/lib/curriculum/technique-categories";

// ─── Daily Plans ───

describe("getDailyPlan", () => {
  it("returns null for day 0 and below", () => {
    expect(getDailyPlan(0)).toBeNull();
    expect(getDailyPlan(-1)).toBeNull();
  });

  it("returns a valid plan for day 1", () => {
    const plan = getDailyPlan(1);
    expect(plan).not.toBeNull();
    expect(plan!.day).toBe(1);
    expect(plan!.phase).toBe(1);
    expect(plan!.phaseLabel).toBe("Quick Wins");
    expect(plan!.title).toBeTruthy();
    expect(plan!.affirmation).toBeTruthy();
    expect(plan!.tasks.length).toBeGreaterThan(0);
  });

  it("returns valid plans for all 90 days", () => {
    for (let day = 1; day <= 90; day++) {
      const plan = getDailyPlan(day);
      expect(plan).not.toBeNull();
      expect(plan!.day).toBe(day);
      expect(plan!.phase).toBeGreaterThanOrEqual(1);
      expect(plan!.phase).toBeLessThanOrEqual(5);
      expect(plan!.tasks.length).toBeGreaterThan(0);
      expect(plan!.affirmation).toBeTruthy();
    }
  });

  it("returns adaptive plan for day 91+", () => {
    const plan = getDailyPlan(91);
    expect(plan).not.toBeNull();
    expect(plan!.day).toBe(91);
    expect(plan!.phase).toBe(6);
  });

  it("each task has required fields", () => {
    const plan = getDailyPlan(1)!;
    for (const task of plan.tasks) {
      expect(task.title).toBeTruthy();
      expect(task.subtitle).toBeTruthy();
      expect(task.duration).toBeTruthy();
      expect(task.type).toBeTruthy();
      expect(task.href).toBeTruthy();
    }
  });
});

describe("generateDailyPlans", () => {
  it("generates exactly 90 plans", () => {
    const plans = generateDailyPlans();
    expect(plans.length).toBe(90);
  });

  it("plans are ordered by day", () => {
    const plans = generateDailyPlans();
    for (let i = 0; i < plans.length; i++) {
      expect(plans[i].day).toBe(i + 1);
    }
  });

  it("all plans have at least 2 tasks", () => {
    const plans = generateDailyPlans();
    for (const plan of plans) {
      expect(plan.tasks.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("getPhaseInfo", () => {
  it("day 1 is Phase 1", () => {
    const info = getPhaseInfo(1);
    expect(info.phase).toBe(1);
    expect(info.label).toBe("Quick Wins");
  });

  it("day 14 is still Phase 1", () => {
    expect(getPhaseInfo(14).phase).toBe(1);
  });

  it("day 15 is Phase 2", () => {
    expect(getPhaseInfo(15).phase).toBe(2);
  });

  it("day 31 is Phase 3", () => {
    expect(getPhaseInfo(31).phase).toBe(3);
  });

  it("day 51 is Phase 4", () => {
    expect(getPhaseInfo(51).phase).toBe(4);
  });

  it("day 71 is Phase 5", () => {
    expect(getPhaseInfo(71).phase).toBe(5);
  });

  it("day 91 is Phase 6 (maintenance)", () => {
    expect(getPhaseInfo(91).phase).toBe(6);
  });

  it("returns dayInPhase correctly", () => {
    expect(getPhaseInfo(1).dayInPhase).toBe(1);
    expect(getPhaseInfo(14).dayInPhase).toBe(14);
    expect(getPhaseInfo(15).dayInPhase).toBe(1);
    expect(getPhaseInfo(31).dayInPhase).toBe(1);
  });
});

describe("PHASE_LABELS", () => {
  it("has labels for phases 1-6", () => {
    for (let p = 1; p <= 6; p++) {
      expect(PHASE_LABELS[p]).toBeTruthy();
    }
  });
});

describe("PHASE_RANGES", () => {
  it("has ranges for phases 1-6", () => {
    for (let p = 1; p <= 6; p++) {
      expect(PHASE_RANGES[p]).toBeDefined();
      expect(PHASE_RANGES[p].length).toBe(2);
      expect(PHASE_RANGES[p][0]).toBeLessThanOrEqual(PHASE_RANGES[p][1]);
    }
  });

  it("phases cover all 90 days without gaps", () => {
    // Phase 1 starts at 1, phase 5 ends at 90
    expect(PHASE_RANGES[1][0]).toBe(1);
    expect(PHASE_RANGES[5][1]).toBe(90);

    // Each phase starts right after the previous ends
    for (let p = 2; p <= 5; p++) {
      expect(PHASE_RANGES[p][0]).toBe(PHASE_RANGES[p - 1][1] + 1);
    }
  });
});

// ─── Week System ───

describe("getWeekForDay", () => {
  it("day 1-7 is week 1", () => {
    expect(getWeekForDay(1)).toBe(1);
    expect(getWeekForDay(7)).toBe(1);
  });

  it("day 8-14 is week 2", () => {
    expect(getWeekForDay(8)).toBe(2);
    expect(getWeekForDay(14)).toBe(2);
  });

  it("day 85-90 is week 13", () => {
    expect(getWeekForDay(85)).toBe(13);
    expect(getWeekForDay(90)).toBe(13);
  });

  it("day 91+ is week 14 (maintenance)", () => {
    expect(getWeekForDay(91)).toBe(14);
    expect(getWeekForDay(200)).toBe(14);
  });

  it("day <= 0 returns 1", () => {
    expect(getWeekForDay(0)).toBe(1);
    expect(getWeekForDay(-5)).toBe(1);
  });
});

describe("getWeekInfo", () => {
  it("returns valid info for week 1", () => {
    const info = getWeekInfo(1);
    expect(info.weekNumber).toBe(1);
    expect(info.startDay).toBe(1);
    expect(info.endDay).toBe(7);
    expect(info.title).toBeTruthy();
    expect(info.milestone).toBeTruthy();
  });

  it("week 13 ends at day 90", () => {
    const info = getWeekInfo(13);
    expect(info.endDay).toBe(90);
  });

  it("all 13 weeks have titles", () => {
    for (let w = 1; w <= 13; w++) {
      const info = getWeekInfo(w);
      expect(info.title).toBeTruthy();
    }
  });
});

describe("getDaysForWeek", () => {
  it("week 1 has 7 days", () => {
    const days = getDaysForWeek(1, 1);
    expect(days.length).toBe(7);
  });

  it("marks current day correctly", () => {
    const days = getDaysForWeek(1, 3);
    expect(days[2].isCurrent).toBe(true);
    expect(days[0].isCompleted).toBe(true);
    expect(days[4].isLocked).toBe(true);
  });

  it("week 13 covers remaining days to 90", () => {
    const days = getDaysForWeek(13, 85);
    expect(days[0].dayNumber).toBe(85);
    expect(days[days.length - 1].dayNumber).toBe(90);
  });
});

describe("getAllWeeks", () => {
  it("returns exactly 13 weeks", () => {
    expect(getAllWeeks().length).toBe(13);
  });

  it("weeks are ordered sequentially", () => {
    const weeks = getAllWeeks();
    for (let i = 0; i < weeks.length; i++) {
      expect(weeks[i].weekNumber).toBe(i + 1);
    }
  });
});

describe("getWeeksByPhase", () => {
  it("returns at least 4 phase groups", () => {
    const phases = getWeeksByPhase();
    expect(phases.length).toBeGreaterThanOrEqual(4);
  });

  it("each phase group has at least 1 week", () => {
    for (const phase of getWeeksByPhase()) {
      expect(phase.weeks.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("getNextMilestone", () => {
  it("returns a milestone for day 1", () => {
    const milestone = getNextMilestone(1);
    expect(milestone).not.toBeNull();
    expect(milestone!.daysUntil).toBeGreaterThan(0);
  });

  it("returns null for day 91+ (maintenance)", () => {
    expect(getNextMilestone(91)).toBeNull();
  });

  it("milestone type is week or phase", () => {
    const milestone = getNextMilestone(5);
    expect(["week", "phase"]).toContain(milestone?.type);
  });
});

// ─── Technique Categories ───

describe("TECHNIQUE_CATEGORIES", () => {
  it("has all 10 techniques classified", () => {
    expect(Object.keys(TECHNIQUE_CATEGORIES).length).toBe(10);
  });

  it("fluency shaping techniques are classified correctly", () => {
    for (const t of FLUENCY_SHAPING_TECHNIQUES) {
      expect(TECHNIQUE_CATEGORIES[t]).toBe("fluency_shaping");
    }
  });

  it("modification techniques are classified correctly", () => {
    for (const t of MODIFICATION_TECHNIQUES) {
      expect(TECHNIQUE_CATEGORIES[t]).toBe("stuttering_modification");
    }
  });
});

describe("getCategoryForTechnique", () => {
  it("returns correct category for known techniques", () => {
    expect(getCategoryForTechnique("easy_onset")).toBe("fluency_shaping");
    expect(getCategoryForTechnique("cancellation")).toBe("stuttering_modification");
  });

  it("returns null for unknown techniques", () => {
    expect(getCategoryForTechnique("unknown_technique")).toBeNull();
  });
});

describe("ALL_TECHNIQUES", () => {
  it("contains all fluency shaping + modification techniques", () => {
    expect(ALL_TECHNIQUES.length).toBe(
      FLUENCY_SHAPING_TECHNIQUES.length + MODIFICATION_TECHNIQUES.length
    );
    for (const t of FLUENCY_SHAPING_TECHNIQUES) {
      expect(ALL_TECHNIQUES).toContain(t);
    }
    for (const t of MODIFICATION_TECHNIQUES) {
      expect(ALL_TECHNIQUES).toContain(t);
    }
  });
});
