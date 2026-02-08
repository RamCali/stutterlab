import { describe, it, expect } from "vitest";

/**
 * Tests for the report/before-after data computation logic.
 * Extracted from report-actions.ts and before-after-card.tsx.
 */

// ─── Month Difference Calculation ─────────────────────────

function calculateTotalMonths(firstMonth: Date, latestMonth: Date): number {
  return Math.max(
    1,
    Math.round(
      (latestMonth.getTime() - firstMonth.getTime()) / (30.44 * 86400000)
    )
  );
}

describe("calculateTotalMonths", () => {
  it("returns 1 for same month", () => {
    const date = new Date("2026-01-01");
    expect(calculateTotalMonths(date, date)).toBe(1);
  });

  it("returns 1 for dates within same month", () => {
    expect(
      calculateTotalMonths(new Date("2026-01-01"), new Date("2026-01-28"))
    ).toBe(1);
  });

  it("returns ~3 for 3 months apart", () => {
    const result = calculateTotalMonths(
      new Date("2026-01-01"),
      new Date("2026-04-01")
    );
    expect(result).toBe(3);
  });

  it("returns ~12 for a year apart", () => {
    const result = calculateTotalMonths(
      new Date("2025-01-01"),
      new Date("2026-01-01")
    );
    expect(result).toBe(12);
  });

  it("never returns less than 1", () => {
    const result = calculateTotalMonths(
      new Date("2026-01-15"),
      new Date("2026-01-01") // earlier date
    );
    expect(result).toBeGreaterThanOrEqual(1);
  });
});

// ─── Severity Color Mapping ───────────────────────────────

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "normal":
      return "text-[#00E676]";
    case "mild":
      return "text-[#FFB347]";
    case "moderate":
      return "text-[#FF8C00]";
    case "severe":
      return "text-[#FF5252]";
    default:
      return "text-muted-foreground";
  }
}

describe("getSeverityColor", () => {
  it("returns green for normal", () => {
    expect(getSeverityColor("normal")).toContain("#00E676");
  });

  it("returns orange for mild", () => {
    expect(getSeverityColor("mild")).toContain("#FFB347");
  });

  it("returns darker orange for moderate", () => {
    expect(getSeverityColor("moderate")).toContain("#FF8C00");
  });

  it("returns red for severe", () => {
    expect(getSeverityColor("severe")).toContain("#FF5252");
  });

  it("returns muted for unknown severity", () => {
    expect(getSeverityColor("unknown")).toContain("muted");
  });
});

// ─── Before/After Improvement Calculation ─────────────────

describe("before/after improvement math", () => {
  it("calculates positive SS improvement (decrease)", () => {
    const firstSS = 8.5;
    const latestSS = 3.2;
    const ssChange = firstSS - latestSS;
    expect(ssChange).toBeCloseTo(5.3, 1);
    expect(ssChange > 0).toBe(true); // improved
  });

  it("calculates negative SS change (worsened)", () => {
    const firstSS = 3.0;
    const latestSS = 5.5;
    const ssChange = firstSS - latestSS;
    expect(ssChange).toBeCloseTo(-2.5, 1);
    expect(ssChange > 0).toBe(false); // not improved
  });

  it("calculates fluency improvement (increase)", () => {
    const firstFluency = 60;
    const latestFluency = 82;
    const fluencyChange = latestFluency - firstFluency;
    expect(fluencyChange).toBe(22);
    expect(fluencyChange > 0).toBe(true); // improved
  });

  it("handles zero change", () => {
    const ssChange = 5.0 - 5.0;
    expect(ssChange).toBe(0);
    expect(ssChange > 0).toBe(false);
  });
});

// ─── Days Since Last Report ───────────────────────────────

describe("days since last report", () => {
  it("calculates correct number of days", () => {
    const reportDate = new Date("2026-01-01");
    const now = new Date("2026-01-15");
    const diff = now.getTime() - reportDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    expect(days).toBe(14);
  });

  it("returns 0 for same day", () => {
    const d = new Date("2026-02-01");
    const diff = d.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    expect(days).toBe(0);
  });
});
