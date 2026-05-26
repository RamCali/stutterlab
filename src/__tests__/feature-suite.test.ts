import { describe, it, expect } from "vitest";
import { buildMicroPlanForEvent, getActivePlanSteps } from "@/lib/speaking-calendar/micro-plan";
import { buildNextWeekPlan, getWeekStartISO } from "@/lib/weekly-review/plan";
import { QUICK_CALM_TECHNIQUES } from "@/lib/quick-calm/techniques";

describe("speaking calendar micro-plan", () => {
  it("builds steps for interview events", () => {
    const eventDate = new Date("2026-06-15T14:00:00Z");
    const plan = buildMicroPlanForEvent("Acme interview", "interview", eventDate);
    expect(plan.steps.length).toBeGreaterThan(3);
    expect(plan.steps.some((s) => s.href?.includes("ai-practice"))).toBe(true);
  });

  it("returns active steps near event", () => {
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 1);
    const plan = buildMicroPlanForEvent("Standup", "meeting", eventDate);
    const active = getActivePlanSteps(plan, new Date());
    expect(active.length).toBeGreaterThan(0);
  });
});

describe("weekly review plan", () => {
  it("builds next week plan from inputs", () => {
    const plan = buildNextWeekPlan({
      topWin: "Asked a question",
      topAvoidance: "Phone calls",
      targetSituation: "Call dentist",
    });
    expect(plan.focusSituation).toBe("Call dentist");
    expect(plan.suggestedHrefs.length).toBeGreaterThan(0);
  });

  it("returns ISO week start (Monday)", () => {
    const ws = getWeekStartISO(new Date("2026-05-25T12:00:00Z"));
    expect(ws).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("quick calm techniques", () => {
  it("includes core modification techniques", () => {
    const ids = QUICK_CALM_TECHNIQUES.map((t) => t.id);
    expect(ids).toContain("gentle_onset");
    expect(ids).toContain("voluntary_stutter");
  });
});
