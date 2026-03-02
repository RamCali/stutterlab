/**
 * Measured Roleplay — Session Scorer (Feature 5)
 *
 * Multi-dimensional grading for AI conversation sessions.
 * Produces a scorecard with letter grades and historical comparisons.
 */

import type {
  SessionScorecard,
  SessionDimension,
  SessionComparison,
  ScoringTurn,
} from "./types";
import { estimateSyllables } from "@/lib/audio/speech-metrics";

// ─── Grade Mapping ───

export function scoreToGrade(score: number): string {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 60) return "D";
  return "F";
}

// ─── Dimension Scoring ───

function scoreFluency(userTurns: ScoringTurn[]): SessionDimension {
  if (userTurns.length === 0) {
    return { name: "Fluency", score: 0, grade: "F", trend: null, notes: "No turns recorded" };
  }

  const totalDisfluencies = userTurns.reduce((s, t) => s + t.disfluencyCount, 0);
  const totalSyllables = userTurns.reduce(
    (s, t) => s + estimateSyllables(t.text),
    0
  );

  // Disfluency rate per 100 syllables
  const rate = totalSyllables > 0 ? (totalDisfluencies / totalSyllables) * 100 : 0;

  // Score: 0 disfluencies per 100 syl = 100, 10+ = 0
  const score = Math.max(0, Math.min(100, Math.round(100 - rate * 10)));

  let notes = "";
  if (score >= 90) notes = "Excellent fluency — minimal disfluencies";
  else if (score >= 75) notes = "Good fluency with occasional disfluencies";
  else if (score >= 60) notes = "Moderate disfluencies — keep practicing techniques";
  else notes = "High disfluency rate — focus on technique fundamentals";

  return {
    name: "Fluency",
    score,
    grade: scoreToGrade(score),
    trend: null,
    notes,
  };
}

function scoreTechniqueApplication(userTurns: ScoringTurn[]): SessionDimension {
  const totalDisfluencies = userTurns.reduce((s, t) => s + t.disfluencyCount, 0);
  const totalTechniques = userTurns.reduce(
    (s, t) => s + (t.techniquesUsed?.length ?? 0),
    0
  );

  let score: number;
  if (totalDisfluencies === 0 && totalTechniques === 0) {
    // No disfluencies, no technique needed — decent score
    score = 75;
  } else if (totalDisfluencies === 0) {
    // No disfluencies + used techniques proactively = great
    score = 90 + Math.min(10, totalTechniques * 2);
  } else {
    // Ratio of techniques to disfluencies (using techniques when needed)
    const ratio = totalTechniques / Math.max(1, totalDisfluencies);
    score = Math.min(100, Math.round(ratio * 50 + 30));
  }

  score = Math.max(0, Math.min(100, score));

  let notes = "";
  if (totalTechniques === 0 && totalDisfluencies > 2) {
    notes = "No techniques detected during disfluent moments — try gentle onset or pacing";
  } else if (totalTechniques >= totalDisfluencies && totalDisfluencies > 0) {
    notes = "Good technique usage — you applied techniques when disfluencies occurred";
  } else if (totalTechniques > 0) {
    notes = `${totalTechniques} technique${totalTechniques !== 1 ? "s" : ""} detected across ${userTurns.length} turns`;
  } else {
    notes = "Clean speech without needing techniques";
  }

  return {
    name: "Technique",
    score,
    grade: scoreToGrade(score),
    trend: null,
    notes,
  };
}

function scorePaceControl(userTurns: ScoringTurn[]): SessionDimension {
  if (userTurns.length === 0) {
    return { name: "Pace", score: 0, grade: "F", trend: null, notes: "No turns" };
  }

  // % of turns in target zone
  const inTarget = userTurns.filter((t) => t.spmZone === "target").length;
  const targetPercent = inTarget / userTurns.length;

  // Rate variance (lower is better)
  const rates = userTurns.map((t) => t.speakingRate).filter((r) => r > 0);
  const avgRate = rates.length > 0 ? rates.reduce((s, r) => s + r, 0) / rates.length : 0;
  const variance =
    rates.length > 1
      ? Math.sqrt(
          rates.reduce((s, r) => s + Math.pow(r - avgRate, 2), 0) /
            rates.length
        )
      : 0;

  // Score: 60% weight on target zone, 40% on consistency
  const zoneScore = targetPercent * 100;
  const consistencyScore = Math.max(0, 100 - variance * 1.5);
  const score = Math.round(zoneScore * 0.6 + consistencyScore * 0.4);

  let notes = "";
  if (score >= 85) notes = "Excellent pace control — steady and on-target";
  else if (score >= 70) notes = "Good pace with some variation";
  else if (targetPercent < 0.4) notes = "Most turns were outside target pace — try slowing down";
  else notes = "Pace was inconsistent — focus on maintaining steady rate";

  return {
    name: "Pace",
    score: Math.max(0, Math.min(100, score)),
    grade: scoreToGrade(Math.max(0, Math.min(100, score))),
    trend: null,
    notes,
  };
}

function scoreVocalRelaxation(userTurns: ScoringTurn[]): SessionDimension {
  const turnsWithEffort = userTurns.filter((t) => t.vocalEffort != null);
  if (turnsWithEffort.length === 0) {
    return {
      name: "Relaxation",
      score: 75,
      grade: "B-",
      trend: null,
      notes: "Vocal effort data not available for this session",
    };
  }

  const avgEffort =
    turnsWithEffort.reduce((s, t) => s + (t.vocalEffort ?? 0), 0) /
    turnsWithEffort.length;

  // Lower effort = higher score. 0.0 effort = 100, 1.0 effort = 0
  const score = Math.max(0, Math.min(100, Math.round((1 - avgEffort) * 100)));

  let notes = "";
  if (avgEffort < 0.3) notes = "Great vocal relaxation — muscles stayed loose";
  else if (avgEffort < 0.5) notes = "Moderate effort — good control";
  else if (avgEffort < 0.7) notes = "Elevated effort — try diaphragmatic breathing before sessions";
  else notes = "High tension detected — focus on relaxation techniques";

  return {
    name: "Relaxation",
    score,
    grade: scoreToGrade(score),
    trend: null,
    notes,
  };
}

function scoreEngagement(
  userTurns: ScoringTurn[],
  durationSeconds: number
): SessionDimension {
  if (userTurns.length === 0) {
    return { name: "Engagement", score: 0, grade: "F", trend: null, notes: "No turns" };
  }

  // Turn count score (more turns = more engaged)
  const turnScore = Math.min(100, userTurns.length * 10);

  // Average turn length (words per turn)
  const avgWords =
    userTurns.reduce((s, t) => s + t.text.split(/\s+/).length, 0) /
    userTurns.length;
  const lengthScore = Math.min(100, avgWords * 5);

  // Duration engagement (did they stay the full session?)
  const durationScore = Math.min(100, (durationSeconds / 120) * 100);

  // Weighted combination
  const score = Math.round(
    turnScore * 0.35 + lengthScore * 0.35 + durationScore * 0.3
  );

  let notes = "";
  if (score >= 85) notes = "Highly engaged — great conversation participation";
  else if (score >= 70) notes = "Good engagement throughout the session";
  else if (userTurns.length < 4) notes = "Short conversation — try extending your sessions";
  else notes = "Try giving longer, more detailed responses";

  return {
    name: "Engagement",
    score: Math.max(0, Math.min(100, score)),
    grade: scoreToGrade(Math.max(0, Math.min(100, score))),
    trend: null,
    notes,
  };
}

// ─── Main Scorer ───

/**
 * Score an AI conversation session across 5 dimensions.
 */
export function scoreSession(
  turns: ScoringTurn[],
  _scenario: string,
  durationSeconds: number,
  comparison?: SessionComparison | null
): SessionScorecard {
  const userTurns = turns.filter((t) => t.role === "user");

  const dimensions: SessionDimension[] = [
    scoreFluency(userTurns),
    scoreTechniqueApplication(userTurns),
    scorePaceControl(userTurns),
    scoreVocalRelaxation(userTurns),
    scoreEngagement(userTurns, durationSeconds),
  ];

  // Overall = weighted average (fluency and technique matter most)
  const weights = [0.3, 0.25, 0.2, 0.15, 0.1];
  const overallScore = Math.round(
    dimensions.reduce((s, d, i) => s + d.score * weights[i], 0)
  );

  // Compute trends if comparison data exists
  if (comparison?.averages) {
    for (const dim of dimensions) {
      const avg = comparison.averages[dim.name];
      if (avg != null) {
        const diff = dim.score - avg;
        dim.trend =
          diff > 5 ? "improving" : diff < -5 ? "declining" : "stable";
      }
    }
  }

  // Build comparison arrays
  let comparisonToAverage = null;
  if (comparison?.averages) {
    comparisonToAverage = dimensions.map((d) => ({
      dimension: d.name,
      userScore: d.score,
      avgScore: Math.round(comparison.averages[d.name] ?? d.score),
      delta: Math.round(d.score - (comparison.averages[d.name] ?? d.score)),
    }));
  }

  let comparisonToPrevious = null;
  if (comparison?.previousSession) {
    comparisonToPrevious = dimensions.map((d) => {
      const prev = comparison.previousSession!.dimensions.find(
        (p) => p.name === d.name
      );
      return {
        dimension: d.name,
        current: d.score,
        previous: prev?.score ?? d.score,
        change: Math.round(d.score - (prev?.score ?? d.score)),
      };
    });
  }

  return {
    overall: { score: overallScore, grade: scoreToGrade(overallScore) },
    dimensions,
    comparisonToAverage,
    comparisonToPrevious,
  };
}
