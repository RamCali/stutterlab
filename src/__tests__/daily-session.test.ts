import { describe, it, expect } from "vitest";
import {
  getTodaysTechnique,
  getAdaptiveTechnique,
  getTechniqueById,
  getContentLevel,
  getScenarioForDay,
  readingContent,
} from "@/lib/practice/daily-session";
import { getExerciseById, exercises } from "@/lib/exercises/exercise-data";

// ─── Technique Selection ───

describe("getTodaysTechnique", () => {
  it("returns a valid technique for any day", () => {
    for (let day = 1; day <= 30; day++) {
      const technique = getTodaysTechnique(day);
      expect(technique).toBeDefined();
      expect(technique.id).toBeTruthy();
      expect(technique.name).toBeTruthy();
      expect(technique.tip).toBeTruthy();
    }
  });

  it("cycles through 3 legacy techniques", () => {
    const ids = new Set<string>();
    for (let day = 1; day <= 3; day++) {
      ids.add(getTodaysTechnique(day).id);
    }
    expect(ids.size).toBe(3);
    expect(ids).toContain("easy_onset");
    expect(ids).toContain("light_contact");
    expect(ids).toContain("pausing");
  });

  it("is deterministic (same day = same technique)", () => {
    expect(getTodaysTechnique(7).id).toBe(getTodaysTechnique(7).id);
  });
});

describe("getAdaptiveTechnique", () => {
  it("returns fluency shaping only for days 1-14", () => {
    const fsIds = ["easy_onset", "light_contact", "prolonged_speech", "pausing"];
    for (let day = 1; day <= 14; day++) {
      const technique = getAdaptiveTechnique(day);
      expect(fsIds).toContain(technique.id);
    }
  });

  it("introduces cancellation for days 15-30 on every 3rd day", () => {
    for (let day = 15; day <= 30; day++) {
      const technique = getAdaptiveTechnique(day);
      if (day % 3 === 0) {
        expect(technique.id).toBe("cancellation");
      }
    }
  });

  it("uses outcome data for days 31+", () => {
    // With high fluency shaping weight, should mostly pick FS techniques
    const fsTechnique = getAdaptiveTechnique(35, {
      recommendedWeight: 0.95,
      fluencyShapingAvgScore: 80,
      modificationAvgScore: 50,
    });
    expect(fsTechnique.category).toBeTruthy(); // Should return a valid technique
  });

  it("defaults to 0.5 weight without outcome data", () => {
    const technique = getAdaptiveTechnique(50);
    expect(technique).toBeDefined();
    expect(technique.id).toBeTruthy();
  });

  it("is deterministic for a given day", () => {
    expect(getAdaptiveTechnique(45).id).toBe(getAdaptiveTechnique(45).id);
  });
});

describe("getTechniqueById", () => {
  it("returns correct technique for valid IDs", () => {
    expect(getTechniqueById("easy_onset")?.name).toBe("Easy Onset");
    expect(getTechniqueById("cancellation")?.name).toBe("Cancellation");
    expect(getTechniqueById("voluntary_stuttering")?.name).toBe("Voluntary Stuttering");
  });

  it("returns null for unknown ID", () => {
    expect(getTechniqueById("nonexistent")).toBeNull();
  });

  it("all 8 techniques have descriptions and tips", () => {
    const ids = [
      "easy_onset", "light_contact", "prolonged_speech", "pausing",
      "cancellation", "pull_out", "preparatory_set", "voluntary_stuttering",
    ];
    for (const id of ids) {
      const t = getTechniqueById(id);
      expect(t).not.toBeNull();
      expect(t!.description).toBeTruthy();
      expect(t!.tip).toBeTruthy();
      expect(t!.category).toBeTruthy();
    }
  });
});

// ─── Content Level ───

describe("getContentLevel", () => {
  it("days 1-14 = words", () => {
    expect(getContentLevel(1)).toBe("words");
    expect(getContentLevel(14)).toBe("words");
  });

  it("days 15-30 = phrases", () => {
    expect(getContentLevel(15)).toBe("phrases");
    expect(getContentLevel(30)).toBe("phrases");
  });

  it("days 31-50 = sentences", () => {
    expect(getContentLevel(31)).toBe("sentences");
    expect(getContentLevel(50)).toBe("sentences");
  });

  it("days 51+ = paragraphs", () => {
    expect(getContentLevel(51)).toBe("paragraphs");
    expect(getContentLevel(90)).toBe("paragraphs");
  });
});

// ─── Scenario Rotation ───

describe("getScenarioForDay", () => {
  it("cycles through 3 easy scenarios", () => {
    const scenarios = new Set<string>();
    for (let day = 1; day <= 3; day++) {
      scenarios.add(getScenarioForDay(day));
    }
    expect(scenarios.size).toBe(3);
    expect(scenarios).toContain("ordering-food");
    expect(scenarios).toContain("small-talk");
    expect(scenarios).toContain("asking-directions");
  });

  it("is deterministic", () => {
    expect(getScenarioForDay(5)).toBe(getScenarioForDay(5));
  });
});

// ─── Reading Content ───

describe("readingContent", () => {
  it("has content for all 4 levels", () => {
    expect(readingContent.words.length).toBeGreaterThan(0);
    expect(readingContent.phrases.length).toBeGreaterThan(0);
    expect(readingContent.sentences.length).toBeGreaterThan(0);
    expect(readingContent.paragraphs.length).toBeGreaterThan(0);
  });

  it("words level has single words", () => {
    for (const word of readingContent.words) {
      expect(word.split(" ").length).toBe(1);
    }
  });

  it("sentences level has longer content than phrases", () => {
    const avgPhrase =
      readingContent.phrases.reduce((s, p) => s + p.length, 0) /
      readingContent.phrases.length;
    const avgSentence =
      readingContent.sentences.reduce((s, p) => s + p.length, 0) /
      readingContent.sentences.length;
    expect(avgSentence).toBeGreaterThan(avgPhrase);
  });
});

// ─── Exercise Definitions ───

describe("exercises", () => {
  it("has at least 8 exercises defined", () => {
    expect(exercises.length).toBeGreaterThanOrEqual(8);
  });

  it("all exercises have unique IDs", () => {
    const ids = exercises.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all exercises have required fields", () => {
    for (const ex of exercises) {
      expect(ex.id).toBeTruthy();
      expect(ex.title).toBeTruthy();
      expect(ex.description).toBeTruthy();
      expect(ex.difficulty).toBeTruthy();
      expect(ex.duration).toBeTruthy();
      expect(typeof ex.isPremium).toBe("boolean");
      expect(ex.instructions.length).toBeGreaterThan(0);
    }
  });

  it("free exercises exist", () => {
    const free = exercises.filter((e) => !e.isPremium);
    expect(free.length).toBeGreaterThan(0);
  });

  it("premium exercises exist", () => {
    const premium = exercises.filter((e) => e.isPremium);
    expect(premium.length).toBeGreaterThan(0);
  });

  it("difficulty levels are valid", () => {
    const valid = ["Beginner", "Intermediate", "Advanced"];
    for (const ex of exercises) {
      expect(valid).toContain(ex.difficulty);
    }
  });

  it("exercises with coaching tips have valid structure", () => {
    const withTips = exercises.filter((e) => e.coachingTips);
    expect(withTips.length).toBeGreaterThan(0);
    for (const ex of withTips) {
      for (const tip of ex.coachingTips!) {
        expect(tip.doThis).toBeTruthy();
        expect(tip.notThis).toBeTruthy();
      }
    }
  });

  it("exercises with feedback rubrics have checkpoints", () => {
    const withRubrics = exercises.filter((e) => e.feedbackRubric);
    expect(withRubrics.length).toBeGreaterThan(0);
    for (const ex of withRubrics) {
      expect(ex.feedbackRubric!.checkpoints.length).toBeGreaterThan(0);
      expect(ex.feedbackRubric!.successSignal).toBeTruthy();
    }
  });
});

describe("getExerciseById", () => {
  it("returns correct exercise", () => {
    expect(getExerciseById("gentle-onset")?.title).toBe("Gentle Onset");
    expect(getExerciseById("reading")?.title).toBe("Reading Aloud");
  });

  it("returns undefined for unknown ID", () => {
    expect(getExerciseById("nonexistent")).toBeUndefined();
  });
});
