/**
 * Technique Detection Enhancement (Feature 2)
 *
 * Tracks per-technique mastery over time, computes mastery levels,
 * and generates recommendations for improvement.
 */

import type {
  TechniqueType,
  TechniqueMasteryData,
  TechniqueDetectionRecord,
} from "./types";

const ALL_TECHNIQUES: TechniqueType[] = [
  "gentle_onset",
  "pacing",
  "rate_compliance",
  "prolonged_speech",
  "cancellation",
  "pull_out",
];

const TECHNIQUE_LABELS: Record<TechniqueType, string> = {
  gentle_onset: "Gentle Onset",
  pacing: "Pacing",
  rate_compliance: "Rate Compliance",
  prolonged_speech: "Prolonged Speech",
  cancellation: "Cancellation",
  pull_out: "Pull-Out",
};

interface SessionTechniqueData {
  techniquesUsed: unknown; // JSONB from DB — either string[] or TechniqueDetectionRecord[]
  completedAt: Date;
}

/**
 * Parse techniquesUsed JSONB — handles both old format (string[])
 * and new format (TechniqueDetectionRecord[]).
 */
function parseTechniquesUsed(raw: unknown): TechniqueDetectionRecord[] {
  if (!Array.isArray(raw)) return [];

  const result: TechniqueDetectionRecord[] = [];

  for (const item of raw) {
    if (typeof item === "string") {
      // Old format: just a technique name
      result.push({
        technique: item,
        count: 1,
        highConfidence: 0,
        lowConfidence: 1,
      });
    } else if (item && typeof item === "object" && "technique" in item) {
      // New format: TechniqueDetectionRecord
      const record = item as TechniqueDetectionRecord;
      result.push({
        technique: record.technique,
        count: record.count || 1,
        highConfidence: record.highConfidence || 0,
        lowConfidence: record.lowConfidence || 0,
      });
    }
  }

  return result;
}

/**
 * Compute mastery level based on detection count and confidence rate.
 */
function getMasteryLevel(
  totalDetections: number,
  highConfidenceRate: number
): "beginner" | "intermediate" | "advanced" {
  if (totalDetections >= 20 && highConfidenceRate >= 0.5) return "advanced";
  if (totalDetections >= 5 && highConfidenceRate >= 0.3) return "intermediate";
  return "beginner";
}

/**
 * Compute trend by comparing recent vs older data.
 */
function computeTrend(
  recentRate: number,
  olderRate: number
): "improving" | "stable" | "declining" {
  const diff = recentRate - olderRate;
  if (diff > 0.1) return "improving";
  if (diff < -0.1) return "declining";
  return "stable";
}

/**
 * Compute technique mastery data from session history.
 */
export function computeTechniqueMastery(
  sessions: SessionTechniqueData[]
): TechniqueMasteryData[] {
  // Aggregate per technique
  const aggregate: Record<
    string,
    {
      totalDetections: number;
      highConfidence: number;
      sessionsUsed: number;
      lastUsed: Date | null;
      // For trend: split into recent half and older half
      recentDetections: number;
      recentHigh: number;
      olderDetections: number;
      olderHigh: number;
    }
  > = {};

  // Initialize all techniques
  for (const tech of ALL_TECHNIQUES) {
    aggregate[tech] = {
      totalDetections: 0,
      highConfidence: 0,
      sessionsUsed: 0,
      lastUsed: null,
      recentDetections: 0,
      recentHigh: 0,
      olderDetections: 0,
      olderHigh: 0,
    };
  }

  // Sort sessions by date (oldest first)
  const sorted = [...sessions].sort(
    (a, b) => a.completedAt.getTime() - b.completedAt.getTime()
  );
  const midpoint = Math.floor(sorted.length / 2);

  for (let i = 0; i < sorted.length; i++) {
    const session = sorted[i];
    const records = parseTechniquesUsed(session.techniquesUsed);
    const isRecent = i >= midpoint;
    const sessionTechniques = new Set<string>();

    for (const record of records) {
      const tech = record.technique;
      if (!aggregate[tech]) {
        aggregate[tech] = {
          totalDetections: 0,
          highConfidence: 0,
          sessionsUsed: 0,
          lastUsed: null,
          recentDetections: 0,
          recentHigh: 0,
          olderDetections: 0,
          olderHigh: 0,
        };
      }

      const agg = aggregate[tech];
      agg.totalDetections += record.count;
      agg.highConfidence += record.highConfidence;
      sessionTechniques.add(tech);

      if (isRecent) {
        agg.recentDetections += record.count;
        agg.recentHigh += record.highConfidence;
      } else {
        agg.olderDetections += record.count;
        agg.olderHigh += record.highConfidence;
      }

      if (
        !agg.lastUsed ||
        session.completedAt.getTime() > agg.lastUsed.getTime()
      ) {
        agg.lastUsed = session.completedAt;
      }
    }

    // Count distinct sessions per technique
    for (const tech of sessionTechniques) {
      aggregate[tech].sessionsUsed++;
    }
  }

  // Build mastery data
  return ALL_TECHNIQUES.map((tech) => {
    const agg = aggregate[tech];
    const highConfidenceRate =
      agg.totalDetections > 0
        ? agg.highConfidence / agg.totalDetections
        : 0;

    const recentRate =
      agg.recentDetections > 0
        ? agg.recentHigh / agg.recentDetections
        : 0;
    const olderRate =
      agg.olderDetections > 0
        ? agg.olderHigh / agg.olderDetections
        : 0;

    return {
      technique: tech,
      totalDetections: agg.totalDetections,
      highConfidenceCount: agg.highConfidence,
      highConfidenceRate: Math.round(highConfidenceRate * 100) / 100,
      sessionsUsed: agg.sessionsUsed,
      masteryLevel: getMasteryLevel(agg.totalDetections, highConfidenceRate),
      trend: agg.totalDetections >= 3
        ? computeTrend(recentRate, olderRate)
        : "stable",
      lastUsed: agg.lastUsed?.toISOString() ?? null,
    };
  });
}

/**
 * Generate actionable recommendations based on mastery data.
 */
export function getTechniqueRecommendations(
  mastery: TechniqueMasteryData[]
): string[] {
  const recommendations: string[] = [];

  for (const m of mastery) {
    const label = TECHNIQUE_LABELS[m.technique];

    if (m.totalDetections === 0) {
      recommendations.push(
        `You haven't used ${label} yet. Try incorporating it into your next practice session.`
      );
    } else if (m.masteryLevel === "beginner" && m.totalDetections < 5) {
      recommendations.push(
        `${label} needs more practice — you've used it ${m.totalDetections} time${m.totalDetections !== 1 ? "s" : ""}. Aim for 5+ detections to build consistency.`
      );
    } else if (m.highConfidenceRate < 0.3 && m.totalDetections >= 5) {
      recommendations.push(
        `Focus on ${label} quality — only ${Math.round(m.highConfidenceRate * 100)}% of your uses were high confidence. Slow down and be more deliberate.`
      );
    } else if (m.trend === "declining") {
      recommendations.push(
        `Your ${label} quality has been declining recently. Review the technique fundamentals and practice with easier content.`
      );
    }
  }

  // Positive reinforcement for advanced techniques
  const advanced = mastery.filter((m) => m.masteryLevel === "advanced");
  if (advanced.length > 0) {
    const names = advanced.map((m) => TECHNIQUE_LABELS[m.technique]).join(", ");
    recommendations.push(`Great mastery of ${names}! Keep using ${advanced.length > 1 ? "them" : "it"} in challenging scenarios.`);
  }

  // Suggest weakest technique if user has some practice
  const practiced = mastery.filter((m) => m.totalDetections > 0);
  if (practiced.length >= 2) {
    const weakest = [...practiced].sort(
      (a, b) => a.highConfidenceRate - b.highConfidenceRate
    )[0];
    if (weakest.masteryLevel !== "advanced") {
      recommendations.push(
        `Your weakest technique is ${TECHNIQUE_LABELS[weakest.technique]}. Dedicate one session this week to practicing it exclusively.`
      );
    }
  }

  return recommendations.slice(0, 4); // Max 4 recommendations
}

/**
 * Compute overall mastery score (0-100).
 */
export function computeOverallMasteryScore(
  mastery: TechniqueMasteryData[]
): number {
  if (mastery.length === 0) return 0;

  const scores = mastery.map((m) => {
    let score = 0;
    // Detection volume (max 40 points)
    score += Math.min(40, m.totalDetections * 2);
    // Confidence quality (max 40 points)
    score += Math.round(m.highConfidenceRate * 40);
    // Mastery level bonus (max 20 points)
    if (m.masteryLevel === "advanced") score += 20;
    else if (m.masteryLevel === "intermediate") score += 10;
    return Math.min(100, score);
  });

  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}
