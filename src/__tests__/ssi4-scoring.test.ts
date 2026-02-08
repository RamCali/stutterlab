import { describe, it, expect } from "vitest";
import {
  getFrequencyScore,
  getDurationScore,
  getPhysicalScore,
  getSeverityFromSSI4,
  getRecommendations,
} from "@/components/progress/ClinicalReport";

// ─── getFrequencyScore ─────────────────────────────────────

describe("getFrequencyScore", () => {
  it("returns 2 for %SS below 1", () => {
    expect(getFrequencyScore(0)).toBe(2);
    expect(getFrequencyScore(0.5)).toBe(2);
    expect(getFrequencyScore(0.99)).toBe(2);
  });

  it("returns 4 for %SS 2–3 (normal range)", () => {
    expect(getFrequencyScore(2)).toBe(4);
    expect(getFrequencyScore(2.9)).toBe(4);
  });

  it("returns 7 for %SS 5–7 (moderate range)", () => {
    expect(getFrequencyScore(5)).toBe(7);
    expect(getFrequencyScore(6.9)).toBe(7);
  });

  it("returns 9 for %SS 9–12 (severe range)", () => {
    expect(getFrequencyScore(9)).toBe(9);
    expect(getFrequencyScore(11.9)).toBe(9);
  });

  it("returns 16 for %SS ≥ 25", () => {
    expect(getFrequencyScore(25)).toBe(16);
    expect(getFrequencyScore(50)).toBe(16);
  });

  it("increases monotonically with higher %SS", () => {
    const values = [0, 1, 2, 3, 4, 5, 7, 9, 12, 14, 17, 20, 25, 30];
    const scores = values.map(getFrequencyScore);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
    }
  });
});

// ─── getDurationScore ─────────────────────────────────────

describe("getDurationScore", () => {
  it("returns 4 when no breakdown provided", () => {
    expect(getDurationScore()).toBe(4);
    expect(getDurationScore(undefined)).toBe(4);
  });

  it("returns 4 for empty breakdown", () => {
    expect(getDurationScore({})).toBe(4);
  });

  it("returns 4 for all-zero breakdown", () => {
    expect(getDurationScore({ blocks: 0, repetitions: 0 })).toBe(4);
  });

  it("returns 4 for mostly repetitions (short events)", () => {
    expect(getDurationScore({ repetitions: 10, blocks: 0 })).toBe(4);
  });

  it("returns 6 for moderate block/prolongation ratio (16-30%)", () => {
    expect(getDurationScore({ repetitions: 7, blocks: 2, prolongations: 1 })).toBe(6);
  });

  it("returns 8 for higher block/prolongation ratio (31-50%)", () => {
    expect(getDurationScore({ repetitions: 5, blocks: 3, prolongations: 2 })).toBe(8);
  });

  it("returns 10 for majority blocks/prolongations (>50%)", () => {
    expect(getDurationScore({ blocks: 5, prolongations: 5, repetitions: 2 })).toBe(10);
  });

  it("handles singular key names (block, prolongation)", () => {
    expect(getDurationScore({ block: 8, prolongation: 4, repetitions: 2 })).toBe(10);
  });
});

// ─── getPhysicalScore ─────────────────────────────────────

describe("getPhysicalScore", () => {
  it("returns 3 (default) when no analysis provided", () => {
    expect(getPhysicalScore()).toBe(3);
    expect(getPhysicalScore(null)).toBe(3);
    expect(getPhysicalScore(undefined)).toBe(3);
  });

  it("returns 3 when no vocal_effort key exists", () => {
    expect(getPhysicalScore({ some_other_key: 0.5 })).toBe(3);
  });

  it("returns 1 for low vocal effort (≤0.3)", () => {
    expect(getPhysicalScore({ vocal_effort: 0.1 })).toBe(1);
    expect(getPhysicalScore({ vocal_effort: 0.3 })).toBe(1);
  });

  it("returns 3 for moderate vocal effort (0.3–0.5)", () => {
    expect(getPhysicalScore({ vocal_effort: 0.4 })).toBe(3);
    expect(getPhysicalScore({ vocal_effort: 0.5 })).toBe(3);
  });

  it("returns 6 for high vocal effort (0.5–0.7)", () => {
    expect(getPhysicalScore({ vocal_effort: 0.6 })).toBe(6);
    expect(getPhysicalScore({ vocal_effort: 0.7 })).toBe(6);
  });

  it("returns 10 for very high vocal effort (>0.7)", () => {
    expect(getPhysicalScore({ vocal_effort: 0.8 })).toBe(10);
    expect(getPhysicalScore({ vocal_effort: 1.0 })).toBe(10);
  });

  it("accepts camelCase 'vocalEffort' key", () => {
    expect(getPhysicalScore({ vocalEffort: 0.9 })).toBe(10);
  });
});

// ─── getSeverityFromSSI4 ─────────────────────────────────

describe("getSeverityFromSSI4", () => {
  it("returns 'Very Mild' for total ≤ 10", () => {
    expect(getSeverityFromSSI4(0).label).toBe("Very Mild");
    expect(getSeverityFromSSI4(10).label).toBe("Very Mild");
  });

  it("returns 'Mild' for total 11–17", () => {
    expect(getSeverityFromSSI4(11).label).toBe("Mild");
    expect(getSeverityFromSSI4(17).label).toBe("Mild");
  });

  it("returns 'Mild-Moderate' for total 18–24", () => {
    expect(getSeverityFromSSI4(18).label).toBe("Mild-Moderate");
    expect(getSeverityFromSSI4(24).label).toBe("Mild-Moderate");
  });

  it("returns 'Moderate' for total 25–31", () => {
    expect(getSeverityFromSSI4(25).label).toBe("Moderate");
    expect(getSeverityFromSSI4(31).label).toBe("Moderate");
  });

  it("returns 'Severe' for total 32–36", () => {
    expect(getSeverityFromSSI4(32).label).toBe("Severe");
    expect(getSeverityFromSSI4(36).label).toBe("Severe");
  });

  it("returns 'Very Severe' for total > 36", () => {
    expect(getSeverityFromSSI4(37).label).toBe("Very Severe");
    expect(getSeverityFromSSI4(50).label).toBe("Very Severe");
  });

  it("includes color, bg, and description fields", () => {
    const result = getSeverityFromSSI4(20);
    expect(result).toHaveProperty("color");
    expect(result).toHaveProperty("bg");
    expect(result).toHaveProperty("description");
    expect(result.color).toContain("text-");
    expect(result.bg).toContain("bg-");
    expect(result.description.length).toBeGreaterThan(0);
  });
});

// ─── End-to-End SSI-4 Calculation ───────────────────────

describe("SSI-4 full calculation", () => {
  it("computes correct total for a mild stutterer", () => {
    // 2.5% SS → freq score 4, ×2 = 8
    // All repetitions → duration 4
    // Low effort 0.2 → physical 1
    // Total: 8 + 4 + 1 = 13 → Mild
    const freq = getFrequencyScore(2.5) * 2;
    const dur = getDurationScore({ repetitions: 10 });
    const phys = getPhysicalScore({ vocal_effort: 0.2 });
    const total = freq + dur + phys;

    expect(freq).toBe(8);
    expect(dur).toBe(4);
    expect(phys).toBe(1);
    expect(total).toBe(13);
    expect(getSeverityFromSSI4(total).label).toBe("Mild");
  });

  it("computes correct total for a severe stutterer", () => {
    // 15% SS → freq score 11, ×2 = 22
    // Mostly blocks → duration 10
    // High effort 0.8 → physical 10
    // Total: 22 + 10 + 10 = 42 → Very Severe
    const freq = getFrequencyScore(15) * 2;
    const dur = getDurationScore({ blocks: 8, repetitions: 2 });
    const phys = getPhysicalScore({ vocal_effort: 0.8 });
    const total = freq + dur + phys;

    expect(freq).toBe(22);
    expect(dur).toBe(10);
    expect(phys).toBe(10);
    expect(total).toBe(42);
    expect(getSeverityFromSSI4(total).label).toBe("Very Severe");
  });
});

// ─── getRecommendations ─────────────────────────────────

describe("getRecommendations", () => {
  it("returns empty array when no breakdown provided", () => {
    expect(getRecommendations(undefined, null)).toEqual([]);
  });

  it("returns empty array for empty breakdown", () => {
    expect(getRecommendations({}, null)).toEqual([]);
  });

  it("recommends Cancellation & Pull-out for high block ratio", () => {
    const recs = getRecommendations({ blocks: 5, repetitions: 2 }, 8);
    const techniques = recs.map((r) => r.technique);
    expect(techniques).toContain("Cancellation & Pull-out");
  });

  it("recommends Gentle Onset for high prolongation ratio", () => {
    const recs = getRecommendations({ prolongations: 5, repetitions: 2 }, 6);
    const techniques = recs.map((r) => r.technique);
    expect(techniques).toContain("Gentle Onset");
  });

  it("recommends Pacing & Rate Control for high repetition ratio", () => {
    const recs = getRecommendations({ repetitions: 8, blocks: 1 }, 4);
    const techniques = recs.map((r) => r.technique);
    expect(techniques).toContain("Pacing & Rate Control");
  });

  it("recommends Pausing Strategy for high interjection ratio", () => {
    const recs = getRecommendations({ interjections: 5, repetitions: 2 }, 4);
    const techniques = recs.map((r) => r.technique);
    expect(techniques).toContain("Pausing Strategy");
  });

  it("recommends Prolonged Speech for %SS > 5", () => {
    const recs = getRecommendations({ repetitions: 5 }, 6);
    const techniques = recs.map((r) => r.technique);
    expect(techniques).toContain("Prolonged Speech");
  });

  it("falls back to Maintenance Practice when no specific issues", () => {
    // Spread counts so no type exceeds its threshold:
    // blocks ≤20%, prolongations ≤20%, repetitions ≤30%, interjections ≤20%, %SS ≤5
    const recs = getRecommendations(
      { repetitions: 3, interjections: 2, blocks: 2, prolongations: 2, revisions: 3 },
      2
    );
    expect(recs).toHaveLength(1);
    expect(recs[0].technique).toBe("Maintenance Practice");
    expect(recs[0].priority).toBe("low");
  });

  it("assigns high priority to primary technique recommendations", () => {
    const recs = getRecommendations({ blocks: 8 }, 10);
    const highPriority = recs.filter((r) => r.priority === "high");
    expect(highPriority.length).toBeGreaterThan(0);
  });
});
