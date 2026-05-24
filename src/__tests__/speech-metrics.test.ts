import { describe, it, expect } from "vitest";
import {
  classifyDisfluencies,
  cleanTranscriptForSummary,
  countDisfluencies,
  estimateSyllables,
} from "@/lib/audio/speech-metrics";

// ─── Disfluency Counting ───

describe("countDisfluencies", () => {
  it("returns 0 for clean speech", () => {
    expect(countDisfluencies("Hello how are you today")).toBe(0);
  });

  it("counts filler words", () => {
    expect(countDisfluencies("um I want to um order")).toBe(2);
    expect(countDisfluencies("uh what was that uh again")).toBe(2);
  });

  it("counts 'like' as filler", () => {
    expect(countDisfluencies("I was like going to the store")).toBe(1);
  });

  it("counts 'you know' as filler", () => {
    expect(countDisfluencies("it was you know pretty good")).toBe(1);
  });

  it("counts 'i mean' as filler", () => {
    expect(countDisfluencies("well i mean I tried")).toBe(1);
  });

  it("counts word repetitions", () => {
    expect(countDisfluencies("I I went to the store")).toBe(1);
    expect(countDisfluencies("the the cat sat on the the mat")).toBe(2);
  });

  it("counts combination of fillers and repetitions", () => {
    const text = "um I I went to uh the the store";
    const count = countDisfluencies(text);
    // "um" (1) + "I I" (1) + "uh" (1) + "the the" (1) = 4
    expect(count).toBe(4);
  });

  it("is case-insensitive for fillers", () => {
    expect(countDisfluencies("Um I was Uh going")).toBe(2);
  });

  it("returns 0 for empty string", () => {
    expect(countDisfluencies("")).toBe(0);
  });

  it("handles multiple fillers in sequence", () => {
    expect(countDisfluencies("um uh er ah")).toBe(4);
  });
});

describe("classifyDisfluencies", () => {
  it("separates typical transcript disfluencies from stutter-like patterns", () => {
    const metrics = classifyDisfluencies("um I I saw a b-b-ball");
    expect(metrics.fillerCount).toBe(1);
    expect(metrics.wholeWordRepetitionCount).toBe(1);
    expect(metrics.possibleSoundRepetitionCount).toBe(1);
    expect(metrics.typical).toBe(2);
    expect(metrics.stutterLike).toBe(1);
    expect(metrics.total).toBe(3);
  });

  it("detects possible syllable repetitions when transcripts preserve hyphens", () => {
    const metrics = classifyDisfluencies("I want the ba-ba-ball");
    expect(metrics.possibleSyllableRepetitionCount).toBe(1);
    expect(metrics.stutterLike).toBeGreaterThanOrEqual(1);
  });
});

describe("cleanTranscriptForSummary", () => {
  it("removes non-meaningful repeated words", () => {
    expect(cleanTranscriptForSummary("it's, it's very good")).toBe("it's very good");
  });

  it("preserves meaningful emphatic repetitions", () => {
    expect(cleanTranscriptForSummary("Yes, yes, it's, it's very good")).toBe(
      "Yes, yes, it's very good"
    );
  });

  it("edits down overused verbal tics while leaving natural flavor", () => {
    expect(
      cleanTranscriptForSummary(
        "I was you know thinking that you know this is sort of useful sort of"
      )
    ).toBe("I was, you know, thinking that this is, sort of, useful");
  });
});

// ─── Syllable Estimation ───

describe("estimateSyllables", () => {
  it("returns 0 for empty string", () => {
    expect(estimateSyllables("")).toBe(0);
  });

  it("counts single-syllable words", () => {
    expect(estimateSyllables("cat")).toBe(1);
    expect(estimateSyllables("dog")).toBe(1);
  });

  it("counts multi-syllable words", () => {
    expect(estimateSyllables("hello")).toBe(2);
    expect(estimateSyllables("beautiful")).toBe(3);
  });

  it("counts short words (1-2 chars) as 1 syllable", () => {
    expect(estimateSyllables("I")).toBe(1);
    expect(estimateSyllables("go")).toBe(1);
  });

  it("handles phrases correctly", () => {
    const count = estimateSyllables("I went to the store");
    expect(count).toBeGreaterThanOrEqual(4);
    expect(count).toBeLessThanOrEqual(6);
  });

  it("strips non-alpha characters", () => {
    expect(estimateSyllables("hello!")).toBe(2);
    expect(estimateSyllables("it's fine")).toBeGreaterThanOrEqual(2);
  });

  it("handles trailing silent e", () => {
    // "make" has one vowel group minus silent e = 1 syllable
    expect(estimateSyllables("make")).toBe(1);
  });

  it("handles longer texts", () => {
    const text = "I am practicing my speech techniques today";
    const count = estimateSyllables(text);
    // Approximate: I(1) am(1) prac-tic-ing(3) my(1) speech(1) tech-niques(2) to-day(2) = ~11
    expect(count).toBeGreaterThanOrEqual(8);
    expect(count).toBeLessThanOrEqual(14);
  });
});
