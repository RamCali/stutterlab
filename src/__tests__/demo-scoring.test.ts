import { describe, it, expect } from "vitest";

/**
 * Tests for the generateDemoScore function from shadowing page.
 * Function is extracted here since it lives inside a page component.
 */

interface EchoClip {
  id: string;
  technique: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  durationSeconds: number;
  xpReward: number;
}

interface ShadowingScore {
  overallScore: number;
  rhythmMatch: number;
  techniqueAccuracy: number;
  paceMatch: number;
  stars: number;
  feedback: string;
  techniqueNote: string;
  xpEarned: number;
}

function generateDemoScore(clip: EchoClip): ShadowingScore {
  const base =
    clip.difficulty === "beginner"
      ? 80
      : clip.difficulty === "intermediate"
        ? 70
        : 60;
  const variance = () => Math.floor(Math.random() * 20) - 5;

  const rhythmMatch = Math.min(100, Math.max(40, base + variance()));
  const techniqueAccuracy = Math.min(100, Math.max(40, base - 5 + variance()));
  const paceMatch = Math.min(100, Math.max(40, base + 3 + variance()));
  const overallScore = Math.round(
    (rhythmMatch + techniqueAccuracy + paceMatch) / 3
  );
  const stars = overallScore >= 85 ? 3 : overallScore >= 65 ? 2 : 1;

  const feedbackOptions: Record<number, string> = {
    3: "Excellent work! Your rhythm and technique are spot-on. Keep this consistency going.",
    2: "Great effort! Your pacing is good. Focus on making the technique feel more natural.",
    1: "Good start! Try listening to the echo a few more times before recording. Match the rhythm first.",
  };

  const techniqueNotes: Record<string, string> = {
    "Gentle Onset":
      "Focus on starting words with a soft, easy airflow rather than a hard push.",
    "Prolonged Speech":
      "Stretch the vowels smoothly and maintain consistent airflow throughout.",
    "Light Contact":
      "Barely touch your tongue/lips on consonants — think gentle, not pressed.",
    "Pacing & Pausing":
      "Leave natural breathing spaces between phrases. Don't rush to fill silences.",
    Cancellation:
      "When you feel a block, pause completely, then restart the word with easy onset.",
  };

  return {
    overallScore,
    rhythmMatch,
    techniqueAccuracy,
    paceMatch,
    stars,
    feedback: feedbackOptions[stars],
    techniqueNote:
      techniqueNotes[clip.technique] ||
      "Practice matching the model's rhythm and technique.",
    xpEarned: clip.xpReward * stars,
  };
}

const beginnerClip: EchoClip = {
  id: "test-1",
  technique: "Gentle Onset",
  difficulty: "beginner",
  durationSeconds: 8,
  xpReward: 15,
};

const intermediateClip: EchoClip = {
  id: "test-2",
  technique: "Prolonged Speech",
  difficulty: "intermediate",
  durationSeconds: 7,
  xpReward: 25,
};

const advancedClip: EchoClip = {
  id: "test-3",
  technique: "Cancellation",
  difficulty: "advanced",
  durationSeconds: 10,
  xpReward: 40,
};

describe("generateDemoScore", () => {
  it("returns all required fields", () => {
    const score = generateDemoScore(beginnerClip);
    expect(score).toHaveProperty("overallScore");
    expect(score).toHaveProperty("rhythmMatch");
    expect(score).toHaveProperty("techniqueAccuracy");
    expect(score).toHaveProperty("paceMatch");
    expect(score).toHaveProperty("stars");
    expect(score).toHaveProperty("feedback");
    expect(score).toHaveProperty("techniqueNote");
    expect(score).toHaveProperty("xpEarned");
  });

  it("clamps individual scores between 40 and 100", () => {
    // Run multiple times due to randomness
    for (let i = 0; i < 50; i++) {
      const score = generateDemoScore(beginnerClip);
      expect(score.rhythmMatch).toBeGreaterThanOrEqual(40);
      expect(score.rhythmMatch).toBeLessThanOrEqual(100);
      expect(score.techniqueAccuracy).toBeGreaterThanOrEqual(40);
      expect(score.techniqueAccuracy).toBeLessThanOrEqual(100);
      expect(score.paceMatch).toBeGreaterThanOrEqual(40);
      expect(score.paceMatch).toBeLessThanOrEqual(100);
    }
  });

  it("computes overallScore as average of three sub-scores", () => {
    const score = generateDemoScore(beginnerClip);
    const expected = Math.round(
      (score.rhythmMatch + score.techniqueAccuracy + score.paceMatch) / 3
    );
    expect(score.overallScore).toBe(expected);
  });

  it("assigns correct star rating", () => {
    for (let i = 0; i < 100; i++) {
      const score = generateDemoScore(beginnerClip);
      if (score.overallScore >= 85) {
        expect(score.stars).toBe(3);
      } else if (score.overallScore >= 65) {
        expect(score.stars).toBe(2);
      } else {
        expect(score.stars).toBe(1);
      }
    }
  });

  it("provides feedback matching star count", () => {
    for (let i = 0; i < 50; i++) {
      const score = generateDemoScore(beginnerClip);
      if (score.stars === 3) {
        expect(score.feedback).toContain("Excellent");
      } else if (score.stars === 2) {
        expect(score.feedback).toContain("Great effort");
      } else {
        expect(score.feedback).toContain("Good start");
      }
    }
  });

  it("gives technique-specific notes", () => {
    const gentleScore = generateDemoScore(beginnerClip);
    expect(gentleScore.techniqueNote).toContain("soft, easy airflow");

    const prolongedScore = generateDemoScore(intermediateClip);
    expect(prolongedScore.techniqueNote).toContain("Stretch the vowels");

    const cancelScore = generateDemoScore(advancedClip);
    expect(cancelScore.techniqueNote).toContain("block");
  });

  it("falls back to generic note for unknown technique", () => {
    const unknownClip = { ...beginnerClip, technique: "SomethingNew" };
    const score = generateDemoScore(unknownClip);
    expect(score.techniqueNote).toContain("Practice matching");
  });

  it("calculates XP as xpReward * stars", () => {
    for (let i = 0; i < 50; i++) {
      const score = generateDemoScore(beginnerClip);
      expect(score.xpEarned).toBe(beginnerClip.xpReward * score.stars);
    }
  });

  it("beginner scores trend higher than advanced scores", () => {
    let beginnerTotal = 0;
    let advancedTotal = 0;
    const runs = 200;
    for (let i = 0; i < runs; i++) {
      beginnerTotal += generateDemoScore(beginnerClip).overallScore;
      advancedTotal += generateDemoScore(advancedClip).overallScore;
    }
    expect(beginnerTotal / runs).toBeGreaterThan(advancedTotal / runs);
  });
});
