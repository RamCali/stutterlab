import { describe, it, expect } from "vitest";
import {
  countSyllables,
  calculatePercentSS,
  getSeverityRating,
} from "@/lib/assessment/syllable-counter";
import {
  calculateScores,
  getProfileDescription,
  type ScoringInput,
} from "@/lib/onboarding/scoring";

// ─── Syllable Counter ───

describe("countSyllables", () => {
  it("counts single-syllable words", () => {
    expect(countSyllables("cat")).toBe(1);
    expect(countSyllables("dog")).toBe(1);
    expect(countSyllables("the")).toBe(1);
  });

  it("counts multi-syllable words", () => {
    expect(countSyllables("hello")).toBe(2);
    expect(countSyllables("together")).toBe(3);
    expect(countSyllables("beautiful")).toBe(3);
  });

  it("counts syllables in phrases", () => {
    const count = countSyllables("I am practicing");
    expect(count).toBeGreaterThanOrEqual(4);
    expect(count).toBeLessThanOrEqual(6);
  });

  it("handles empty string", () => {
    expect(countSyllables("")).toBe(0);
  });

  it("strips non-alphabetic characters", () => {
    expect(countSyllables("hello!")).toBe(2);
    expect(countSyllables("it's")).toBeGreaterThanOrEqual(1);
  });

  it("handles short words (1-2 chars)", () => {
    expect(countSyllables("I")).toBe(1);
    expect(countSyllables("an")).toBe(1);
    expect(countSyllables("go")).toBe(1);
  });

  it("handles silent e", () => {
    // "make" — silent e should not add a syllable
    const count = countSyllables("make");
    expect(count).toBe(1);
  });

  it("handles -ed suffix correctly", () => {
    // "walked" should be 1 syllable, not 2
    const walked = countSyllables("walked");
    expect(walked).toBe(1);
  });
});

// ─── Percent SS ───

describe("calculatePercentSS", () => {
  it("returns 0 for 0 total syllables", () => {
    expect(calculatePercentSS(5, 0)).toBe(0);
  });

  it("calculates correct percentage", () => {
    expect(calculatePercentSS(5, 100)).toBe(5);
    expect(calculatePercentSS(10, 200)).toBe(5);
  });

  it("returns 100 when all syllables stuttered", () => {
    expect(calculatePercentSS(50, 50)).toBe(100);
  });

  it("handles decimal results", () => {
    const result = calculatePercentSS(3, 100);
    expect(result).toBe(3);
  });
});

// ─── Severity Rating ───

describe("getSeverityRating", () => {
  it("returns normal for < 3%", () => {
    expect(getSeverityRating(0)).toBe("normal");
    expect(getSeverityRating(2.9)).toBe("normal");
  });

  it("returns mild for 3-5%", () => {
    expect(getSeverityRating(3)).toBe("mild");
    expect(getSeverityRating(4.9)).toBe("mild");
  });

  it("returns moderate for 5-8%", () => {
    expect(getSeverityRating(5)).toBe("moderate");
    expect(getSeverityRating(7.9)).toBe("moderate");
  });

  it("returns severe for >= 8%", () => {
    expect(getSeverityRating(8)).toBe("severe");
    expect(getSeverityRating(25)).toBe("severe");
  });
});

// ─── Assessment Scoring ───

describe("calculateScores", () => {
  const baseInput: ScoringInput = {
    stutterFrequency: "sometimes",
    stutterDuration: "moderate",
    stutterImpact: "some",
    confidenceRatings: { phone: 3, meeting: 3, ordering: 3 },
    avoidanceBehaviors: [],
    stutteringTypes: [],
    speakingFrequency: "often",
    fearedSituations: [],
  };

  it("returns all required fields", () => {
    const scores = calculateScores(baseInput);
    expect(scores.severityScore).toBeGreaterThanOrEqual(1);
    expect(scores.severityScore).toBeLessThanOrEqual(100);
    expect(scores.confidenceScore).toBeGreaterThanOrEqual(1);
    expect(scores.confidenceScore).toBeLessThanOrEqual(100);
    expect(scores.profile).toBeTruthy();
    expect(scores.severityLabel).toBeTruthy();
    expect(scores.recommendedEmphasis).toBeDefined();
    expect(scores.recommendedEmphasis.fluencyShaping).toBeGreaterThan(0);
    expect(scores.recommendedEmphasis.stutteringModification).toBeGreaterThan(0);
    expect(scores.recommendedEmphasis.cbt).toBeGreaterThan(0);
  });

  it("mild input produces mild severity label", () => {
    const scores = calculateScores({
      ...baseInput,
      stutterFrequency: "rarely",
      stutterDuration: "brief",
      stutterImpact: "minimal",
    });
    expect(scores.severityLabel).toBe("mild");
  });

  it("severe input produces severe severity label", () => {
    const scores = calculateScores({
      ...baseInput,
      stutterFrequency: "very-often",
      stutterDuration: "very-long",
      stutterImpact: "severe",
      stutteringTypes: ["blocks", "prolongations", "repetitions"],
      avoidanceBehaviors: ["word-substitution", "avoiding-situations", "saying-less"],
    });
    expect(scores.severityLabel).toBe("severe");
  });

  it("high avoidance + low confidence produces avoidance-heavy profile", () => {
    const scores = calculateScores({
      ...baseInput,
      confidenceRatings: { phone: 1, meeting: 1, ordering: 2 },
      avoidanceBehaviors: ["word-sub", "avoiding", "saying-less"],
    });
    expect(scores.profile).toBe("avoidance-heavy");
  });

  it("very low confidence produces anxiety-heavy profile", () => {
    const scores = calculateScores({
      ...baseInput,
      confidenceRatings: { phone: 1, meeting: 1, ordering: 1 },
      avoidanceBehaviors: [],
    });
    expect(scores.profile).toBe("anxiety-heavy");
  });

  it("high confidence + low severity produces technique-ready profile", () => {
    const scores = calculateScores({
      ...baseInput,
      stutterFrequency: "rarely",
      stutterDuration: "brief",
      stutterImpact: "minimal",
      confidenceRatings: { phone: 4, meeting: 4, ordering: 5 },
    });
    expect(scores.profile).toBe("technique-ready");
  });

  it("severity increases with more stuttering types", () => {
    const base = calculateScores(baseInput);
    const withTypes = calculateScores({
      ...baseInput,
      stutteringTypes: ["blocks", "prolongations", "repetitions"],
    });
    expect(withTypes.severityScore).toBeGreaterThan(base.severityScore);
  });

  it("severity increases with more avoidance behaviors", () => {
    const base = calculateScores(baseInput);
    const withAvoidance = calculateScores({
      ...baseInput,
      avoidanceBehaviors: ["sub", "avoid", "less"],
    });
    expect(withAvoidance.severityScore).toBeGreaterThan(base.severityScore);
  });

  it("confidence decreases with more avoidance behaviors", () => {
    const base = calculateScores(baseInput);
    const withAvoidance = calculateScores({
      ...baseInput,
      avoidanceBehaviors: ["sub", "avoid", "less", "starter"],
    });
    expect(withAvoidance.confidenceScore).toBeLessThan(base.confidenceScore);
  });

  it("handles empty confidence ratings", () => {
    const scores = calculateScores({
      ...baseInput,
      confidenceRatings: {},
    });
    expect(scores.confidenceScore).toBe(50);
  });

  it("emphasis values sum to approximately 1.0", () => {
    const scores = calculateScores(baseInput);
    const total =
      scores.recommendedEmphasis.fluencyShaping +
      scores.recommendedEmphasis.stutteringModification +
      scores.recommendedEmphasis.cbt;
    expect(total).toBeCloseTo(1.0, 1);
  });
});

describe("getProfileDescription", () => {
  it("returns non-empty description for all profiles", () => {
    const profiles = [
      "avoidance-heavy",
      "anxiety-heavy",
      "technique-ready",
      "balanced",
    ] as const;
    for (const profile of profiles) {
      const desc = getProfileDescription(profile);
      expect(desc).toBeTruthy();
      expect(desc.length).toBeGreaterThan(20);
    }
  });
});
