/**
 * Predictive Coaching (Feature 4)
 *
 * Analyzes historical session data to identify patterns and
 * proactively coach users before difficulty occurs.
 */

import type { CoachingInsight, Prediction, PredictiveInput } from "./types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIME_PERIODS = ["morning", "afternoon", "evening"] as const;

function getTimePeriod(date: Date): (typeof TIME_PERIODS)[number] {
  const hour = date.getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

/**
 * Analyze patterns across historical session data.
 */
export function analyzePatterns(input: PredictiveInput): CoachingInsight {
  const predictions: Prediction[] = [];
  const warmupSuggestions: string[] = [];

  // ─── Day-of-Week Analysis ───
  const dayBuckets: Record<number, { total: number; sum: number }> = {};
  for (const conv of input.conversations) {
    if (conv.fluencyScore == null) continue;
    const day = conv.completedAt.getDay();
    if (!dayBuckets[day]) dayBuckets[day] = { total: 0, sum: 0 };
    dayBuckets[day].total++;
    dayBuckets[day].sum += conv.fluencyScore;
  }

  const dayEntries = Object.entries(dayBuckets)
    .filter(([, v]) => v.total >= 2)
    .map(([day, v]) => ({
      day: Number(day),
      avg: v.sum / v.total,
      count: v.total,
    }));

  if (dayEntries.length >= 3) {
    const overallAvg =
      dayEntries.reduce((s, e) => s + e.avg * e.count, 0) /
      dayEntries.reduce((s, e) => s + e.count, 0);

    for (const entry of dayEntries) {
      const diff = ((overallAvg - entry.avg) / overallAvg) * 100;
      if (diff > 15) {
        const dayName = DAY_NAMES[entry.day];
        predictions.push({
          type: "day_of_week",
          description: `Your fluency tends to be ${Math.round(diff)}% lower on ${dayName}s`,
          confidence: entry.count >= 5 ? "high" : "medium",
          suggestion: `Try a 2-minute gentle onset warm-up before ${dayName} sessions`,
        });
        warmupSuggestions.push(`Gentle onset warm-up (${dayName}s tend to be harder)`);
      }
    }

    // Also flag best days for encouragement
    const bestDay = dayEntries.reduce((best, e) =>
      e.avg > best.avg ? e : best
    );
    if (bestDay.avg > overallAvg * 1.1) {
      predictions.push({
        type: "day_of_week",
        description: `You perform best on ${DAY_NAMES[bestDay.day]}s — ${Math.round(bestDay.avg)} avg fluency`,
        confidence: bestDay.count >= 5 ? "high" : "medium",
        suggestion: `Use ${DAY_NAMES[bestDay.day]}s for your most challenging scenarios`,
      });
    }
  }

  // ─── Time-of-Day Analysis ───
  const timeBuckets: Record<string, { total: number; sum: number }> = {};
  for (const conv of input.conversations) {
    if (conv.fluencyScore == null) continue;
    const period = getTimePeriod(conv.completedAt);
    if (!timeBuckets[period]) timeBuckets[period] = { total: 0, sum: 0 };
    timeBuckets[period].total++;
    timeBuckets[period].sum += conv.fluencyScore;
  }

  const timeEntries = Object.entries(timeBuckets)
    .filter(([, v]) => v.total >= 3)
    .map(([period, v]) => ({ period, avg: v.sum / v.total, count: v.total }));

  if (timeEntries.length >= 2) {
    const bestTime = timeEntries.reduce((best, e) =>
      e.avg > best.avg ? e : best
    );
    const worstTime = timeEntries.reduce((worst, e) =>
      e.avg < worst.avg ? e : worst
    );

    if (bestTime.avg - worstTime.avg > 10) {
      predictions.push({
        type: "time_of_day",
        description: `You speak more fluently in the ${bestTime.period} (${Math.round(bestTime.avg)} avg) vs ${worstTime.period} (${Math.round(worstTime.avg)} avg)`,
        confidence: "medium",
        suggestion: `Schedule important conversations for the ${bestTime.period} when possible`,
      });
    }
  }

  // ─── Scenario Difficulty ───
  const scenarioBuckets: Record<string, { total: number; sum: number }> = {};
  for (const conv of input.conversations) {
    if (conv.fluencyScore == null) continue;
    if (!scenarioBuckets[conv.scenarioType]) {
      scenarioBuckets[conv.scenarioType] = { total: 0, sum: 0 };
    }
    scenarioBuckets[conv.scenarioType].total++;
    scenarioBuckets[conv.scenarioType].sum += conv.fluencyScore;
  }

  const scenarioEntries = Object.entries(scenarioBuckets)
    .filter(([, v]) => v.total >= 2)
    .map(([name, v]) => ({ name, avg: v.sum / v.total, count: v.total }))
    .sort((a, b) => a.avg - b.avg);

  if (scenarioEntries.length >= 2) {
    const hardest = scenarioEntries[0];
    const easiest = scenarioEntries[scenarioEntries.length - 1];

    if (easiest.avg - hardest.avg > 15) {
      const label = hardest.name.replace(/-/g, " ");
      predictions.push({
        type: "scenario",
        description: `"${label}" is your hardest scenario (${Math.round(hardest.avg)} avg fluency vs ${Math.round(easiest.avg)} in easier ones)`,
        confidence: hardest.count >= 3 ? "high" : "medium",
        suggestion: `Practice "${label}" with stress level 0 first, then gradually increase difficulty`,
      });
      warmupSuggestions.push(`Warm up with easy scenario before "${label}"`);
    }
  }

  // ─── Post-Gap Difficulty ───
  if (input.lastPracticeDate) {
    const now = new Date();
    const daysSinceLastPractice = Math.floor(
      (now.getTime() - input.lastPracticeDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastPractice >= 2) {
      // Check historical pattern: how does fluency compare after gaps?
      const postGapScores: number[] = [];
      const consecutiveScores: number[] = [];

      const sortedSessions = [...input.sessions]
        .filter((s) => s.aiFluencyScore != null)
        .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());

      for (let i = 1; i < sortedSessions.length; i++) {
        const gap = Math.floor(
          (sortedSessions[i].startedAt.getTime() -
            sortedSessions[i - 1].startedAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const score = sortedSessions[i].aiFluencyScore!;

        if (gap >= 2) postGapScores.push(score);
        else consecutiveScores.push(score);
      }

      if (postGapScores.length >= 2 && consecutiveScores.length >= 2) {
        const postGapAvg =
          postGapScores.reduce((s, v) => s + v, 0) / postGapScores.length;
        const consecutiveAvg =
          consecutiveScores.reduce((s, v) => s + v, 0) /
          consecutiveScores.length;

        if (consecutiveAvg - postGapAvg > 10) {
          predictions.push({
            type: "post_gap",
            description: `After breaks, your fluency drops by ~${Math.round(consecutiveAvg - postGapAvg)} points. You haven't practiced in ${daysSinceLastPractice} days.`,
            confidence: "high",
            suggestion:
              "Start with an easy warm-up session to rebuild momentum",
          });
          warmupSuggestions.push("Breathing warm-up + easy reading (returning after a break)");
        }
      } else if (daysSinceLastPractice >= 3) {
        predictions.push({
          type: "post_gap",
          description: `It's been ${daysSinceLastPractice} days since your last practice`,
          confidence: "low",
          suggestion: "Start with a short, easy session to get back into the groove",
        });
      }
    }
  }

  // ─── Motivational Note ───
  let motivationalNote = "Keep showing up — consistency beats perfection.";

  if (input.currentStreak >= 14) {
    motivationalNote = `${input.currentStreak}-day streak! You're building real habits that last.`;
  } else if (input.currentStreak >= 7) {
    motivationalNote = `${input.currentStreak} days and counting! A full week of practice shows dedication.`;
  } else if (input.currentStreak >= 3) {
    motivationalNote = `${input.currentStreak}-day streak building! Each day makes the next one easier.`;
  } else if (input.conversations.length > 20) {
    motivationalNote =
      "You've completed over 20 conversations — your experience is building real skill.";
  }

  // ─── Upcoming Challenges ───
  const upcomingChallenges: string[] = [];
  if (scenarioEntries.length > 0) {
    const hardestUnpracticed = scenarioEntries.find((s) => s.count < 3);
    if (hardestUnpracticed) {
      upcomingChallenges.push(
        `Try the "${hardestUnpracticed.name.replace(/-/g, " ")}" scenario — you've only practiced it ${hardestUnpracticed.count} time${hardestUnpracticed.count !== 1 ? "s" : ""}`
      );
    }
  }

  // Default warmup
  if (warmupSuggestions.length === 0) {
    warmupSuggestions.push("2-minute breathing exercise before your session");
  }

  return {
    predictions: predictions.slice(0, 4), // Max 4 predictions
    warmupSuggestions: warmupSuggestions.slice(0, 3),
    upcomingChallenges: upcomingChallenges.slice(0, 2),
    motivationalNote,
  };
}
