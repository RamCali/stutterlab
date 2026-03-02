import { describe, it, expect } from "vitest";
import { getAdaptiveDailyPlan } from "@/lib/curriculum/adaptive-engine";

// ─── Adaptive Engine (Day 91+ Plans) ───

describe("getAdaptiveDailyPlan", () => {
  it("returns a valid plan for day 91", () => {
    const plan = getAdaptiveDailyPlan(91);
    expect(plan.day).toBe(91);
    expect(plan.phase).toBe(6);
    expect(plan.phaseLabel).toContain("Maintenance");
    expect(plan.affirmation).toBeTruthy();
    expect(plan.tasks.length).toBeGreaterThan(0);
  });

  it("always includes breathing warmup as first task", () => {
    for (const day of [91, 95, 100, 120]) {
      const plan = getAdaptiveDailyPlan(day);
      expect(plan.tasks[0].type).toBe("warmup");
      expect(plan.tasks[0].title).toContain("Breathing");
    }
  });

  it("always includes voice journal", () => {
    for (const day of [91, 92, 100, 150]) {
      const plan = getAdaptiveDailyPlan(day);
      const journal = plan.tasks.find((t) => t.type === "journal");
      expect(journal).toBeDefined();
    }
  });

  it("includes audio lab on even days", () => {
    const evenPlan = getAdaptiveDailyPlan(92);
    const audioTask = evenPlan.tasks.find((t) => t.type === "audio-lab");
    expect(audioTask).toBeDefined();

    const oddPlan = getAdaptiveDailyPlan(91);
    const noAudio = oddPlan.tasks.find((t) => t.type === "audio-lab");
    expect(noAudio).toBeUndefined();
  });

  it("includes AI conversation every 3rd day", () => {
    const plan93 = getAdaptiveDailyPlan(93);
    const aiTask = plan93.tasks.find((t) => t.type === "ai");
    expect(aiTask).toBeDefined();

    const plan91 = getAdaptiveDailyPlan(91);
    const noAi = plan91.tasks.find((t) => t.type === "ai");
    expect(noAi).toBeUndefined();
  });

  it("includes feared words every 4th day starting from day%4===1", () => {
    const plan93 = getAdaptiveDailyPlan(93); // 93%4 = 1
    const fw = plan93.tasks.find((t) => t.type === "feared-words");
    expect(fw).toBeDefined();
  });

  it("includes mindfulness every 5th day", () => {
    const plan95 = getAdaptiveDailyPlan(95);
    const mindfulness = plan95.tasks.find((t) => t.type === "mindfulness");
    expect(mindfulness).toBeDefined();
  });

  it("includes real-world challenge every 7th day", () => {
    const plan98 = getAdaptiveDailyPlan(98); // 98%7 = 0
    const challenge = plan98.tasks.find((t) => t.type === "challenge");
    expect(challenge).toBeDefined();
  });

  it("adjusts emphasis label based on weight", () => {
    const fluencyPlan = getAdaptiveDailyPlan(100, {
      recommendedWeight: 0.7,
      fluencyShapingAvgScore: 80,
      modificationAvgScore: 50,
    });
    expect(fluencyPlan.phaseLabel).toContain("Fluency Shaping");

    const modPlan = getAdaptiveDailyPlan(100, {
      recommendedWeight: 0.3,
      fluencyShapingAvgScore: 50,
      modificationAvgScore: 80,
    });
    expect(modPlan.phaseLabel).toContain("Modification");

    const balancedPlan = getAdaptiveDailyPlan(100, {
      recommendedWeight: 0.5,
      fluencyShapingAvgScore: 65,
      modificationAvgScore: 65,
    });
    expect(balancedPlan.phaseLabel).toContain("Balanced");
  });

  it("cycles affirmations", () => {
    const plan91 = getAdaptiveDailyPlan(91);
    const plan111 = getAdaptiveDailyPlan(111);
    // Both day 91 and 111 should produce non-empty affirmations
    expect(plan91.affirmation).toBeTruthy();
    expect(plan111.affirmation).toBeTruthy();
  });

  it("all tasks have reasons explaining why", () => {
    const plan = getAdaptiveDailyPlan(100);
    for (const task of plan.tasks) {
      expect(task.reason).toBeTruthy();
    }
  });

  it("premium tasks are marked", () => {
    const plan = getAdaptiveDailyPlan(92); // Even day → audio-lab
    const audioTask = plan.tasks.find((t) => t.type === "audio-lab");
    expect(audioTask?.premium).toBe(true);
  });
});
