/**
 * Transfer Gap Detection (Feature 7)
 *
 * Identifies when techniques work in practice but don't transfer
 * to real-world situations, and suggests bridging exercises.
 */

import type {
  TransferGap,
  BridgingExercise,
  TransferReport,
  TransferGapInput,
} from "./types";

// ─── Gap Severity Thresholds ───

function getSeverity(drop: number): "mild" | "moderate" | "severe" {
  if (drop >= 35) return "severe";
  if (drop >= 25) return "moderate";
  return "mild";
}

// ─── Bridging Exercise Library ───

const BRIDGING_EXERCISES: Record<string, BridgingExercise[]> = {
  "reading-to-conversation": [
    {
      title: "Summarize What You Read",
      description:
        "Read a passage using your techniques, then close the text and summarize it in your own words. This bridges structured reading into spontaneous speech.",
      targetGap: "reading-to-conversation",
      difficulty: "easy",
      estimatedMinutes: 5,
      href: "/app/practice",
    },
    {
      title: "Prepared Topic Discussion",
      description:
        "Write 3 bullet points about a topic, then discuss them aloud without reading. Use the same techniques you use while reading.",
      targetGap: "reading-to-conversation",
      difficulty: "medium",
      estimatedMinutes: 5,
    },
    {
      title: "Carrier Phrase Practice",
      description:
        'Use carrier phrases ("I think that...", "The thing is...") to create smooth transitions from your planned words to spontaneous speech.',
      targetGap: "reading-to-conversation",
      difficulty: "easy",
      estimatedMinutes: 3,
    },
  ],
  "low-stress-to-high-stress": [
    {
      title: "Gradual Stress Ramp",
      description:
        "Start an AI conversation at stress level 0, then increase to level 1 halfway through. Your techniques need practice under graduated pressure.",
      targetGap: "low-stress-to-high-stress",
      difficulty: "medium",
      estimatedMinutes: 8,
      href: "/app/ai-practice",
    },
    {
      title: "Feared Word Integration",
      description:
        "Add your top 3 feared words into an easy AI scenario. Practice saying them with gentle onset in a low-pressure environment before using them under stress.",
      targetGap: "low-stress-to-high-stress",
      difficulty: "medium",
      estimatedMinutes: 5,
      href: "/app/ai-practice",
    },
    {
      title: "Progressive Muscle Relaxation",
      description:
        "Practice PMR before a stress-level session. Learning to relax your speech muscles under tension is key to transfer.",
      targetGap: "low-stress-to-high-stress",
      difficulty: "easy",
      estimatedMinutes: 5,
    },
  ],
  "practice-to-real-world": [
    {
      title: "Exposure Ladder Advancement",
      description:
        "Move up one rung on your exposure ladder this week. Real-world practice is the bridge from AI sessions to daily life.",
      targetGap: "practice-to-real-world",
      difficulty: "hard",
      estimatedMinutes: 10,
      href: "/app/exposure-ladder",
    },
    {
      title: "Daily Micro-Challenge",
      description:
        "Complete today's real-world micro-challenge. Small, daily exposures build the confidence that transfers techniques to real situations.",
      targetGap: "practice-to-real-world",
      difficulty: "medium",
      estimatedMinutes: 5,
      href: "/app/dashboard",
    },
    {
      title: "Pre-Situation Rehearsal",
      description:
        "Before a real-world speaking situation, run through it once in an AI conversation. Mental rehearsal improves real-world technique usage by 30%.",
      targetGap: "practice-to-real-world",
      difficulty: "easy",
      estimatedMinutes: 5,
      href: "/app/ai-practice",
    },
  ],
  "technique-transfer": [
    {
      title: "Technique Focus Sessions",
      description:
        "Practice one specific technique for 5 minutes, then immediately use it in a real-world situation (ordering coffee, greeting someone). The shorter the gap between practice and real use, the better the transfer.",
      targetGap: "technique-transfer",
      difficulty: "medium",
      estimatedMinutes: 8,
    },
    {
      title: "Technique Self-Check",
      description:
        "After a real-world speaking situation, immediately note which techniques you used (or forgot to use). Self-monitoring closes the transfer gap.",
      targetGap: "technique-transfer",
      difficulty: "easy",
      estimatedMinutes: 2,
    },
  ],
};

// ─── Main Detection Logic ───

/**
 * Detect transfer gaps across multiple contexts.
 */
export function detectTransferGaps(data: TransferGapInput): TransferReport {
  const gaps: TransferGap[] = [];
  const recommendations: string[] = [];
  const bridgingExercises: BridgingExercise[] = [];

  // ─── Gap 1: Reading vs Conversation ───
  const readingScores = data.reports
    .filter((r) => r.fluencyScore != null)
    .map((r) => r.fluencyScore!);
  const conversationScores = data.conversations
    .filter((c) => c.fluencyScore != null)
    .map((c) => c.fluencyScore!);

  if (readingScores.length >= 2 && conversationScores.length >= 3) {
    const avgReading =
      readingScores.reduce((s, v) => s + v, 0) / readingScores.length;
    const avgConversation =
      conversationScores.reduce((s, v) => s + v, 0) /
      conversationScores.length;
    const drop = Math.round(avgReading - avgConversation);

    if (drop > 15) {
      const severity = getSeverity(drop);
      gaps.push({
        id: "reading-to-conversation",
        from: "Reading exercises",
        to: "Conversational speech",
        fromScore: Math.round(avgReading),
        toScore: Math.round(avgConversation),
        fluencyDrop: drop,
        severity,
        suggestedBridge:
          "Practice summarizing passages in your own words to bridge structured and spontaneous speech",
        dataPoints: readingScores.length + conversationScores.length,
      });
      recommendations.push(
        `Your reading fluency (${Math.round(avgReading)}) is ${drop} points higher than conversational fluency (${Math.round(avgConversation)}). Focus on carrier phrases and prepared topics.`
      );
      bridgingExercises.push(
        ...(BRIDGING_EXERCISES["reading-to-conversation"] ?? [])
      );
    }
  }

  // ─── Gap 2: Low-stress vs High-stress ───
  const lowStressScores = data.conversations
    .filter(
      (c) =>
        c.fluencyScore != null && (c.stressLevel == null || c.stressLevel === 0)
    )
    .map((c) => c.fluencyScore!);
  const highStressScores = data.conversations
    .filter(
      (c) => c.fluencyScore != null && c.stressLevel != null && c.stressLevel >= 2
    )
    .map((c) => c.fluencyScore!);

  if (lowStressScores.length >= 3 && highStressScores.length >= 2) {
    const avgLow =
      lowStressScores.reduce((s, v) => s + v, 0) / lowStressScores.length;
    const avgHigh =
      highStressScores.reduce((s, v) => s + v, 0) / highStressScores.length;
    const drop = Math.round(avgLow - avgHigh);

    if (drop > 15) {
      const severity = getSeverity(drop);
      gaps.push({
        id: "low-stress-to-high-stress",
        from: "Calm practice",
        to: "Stressful scenarios",
        fromScore: Math.round(avgLow),
        toScore: Math.round(avgHigh),
        fluencyDrop: drop,
        severity,
        suggestedBridge:
          "Gradually increase stress levels rather than jumping from calm to high pressure",
        dataPoints: lowStressScores.length + highStressScores.length,
      });
      recommendations.push(
        `Stress impacts your fluency significantly (${drop}-point drop). Practice with graduated stress levels.`
      );
      bridgingExercises.push(
        ...(BRIDGING_EXERCISES["low-stress-to-high-stress"] ?? [])
      );
    }
  }

  // ─── Gap 3: Practice vs Real-world ───
  const practiceScores = conversationScores; // AI conversation fluency
  const realWorldScores = data.situations
    .filter((s) => s.fluencyRating != null)
    .map((s) => s.fluencyRating! * 10); // Scale 1-10 to 0-100

  if (practiceScores.length >= 3 && realWorldScores.length >= 2) {
    const avgPractice =
      practiceScores.reduce((s, v) => s + v, 0) / practiceScores.length;
    const avgRealWorld =
      realWorldScores.reduce((s, v) => s + v, 0) / realWorldScores.length;
    const drop = Math.round(avgPractice - avgRealWorld);

    if (drop > 15) {
      const severity = getSeverity(drop);
      gaps.push({
        id: "practice-to-real-world",
        from: "AI practice",
        to: "Real-world situations",
        fromScore: Math.round(avgPractice),
        toScore: Math.round(avgRealWorld),
        fluencyDrop: drop,
        severity,
        suggestedBridge:
          "Increase real-world exposure through the exposure ladder and daily challenges",
        dataPoints: practiceScores.length + realWorldScores.length,
      });
      recommendations.push(
        `Your AI practice fluency (${Math.round(avgPractice)}) doesn't fully transfer to real situations (${Math.round(avgRealWorld)}). Focus on exposure ladder and daily challenges.`
      );
      bridgingExercises.push(
        ...(BRIDGING_EXERCISES["practice-to-real-world"] ?? [])
      );
    }
  }

  // ─── Gap 4: Technique usage in practice vs real-world ───
  const practiceTechniqueCount = data.conversations.reduce((sum, c) => {
    const techs = c.techniquesUsed;
    if (Array.isArray(techs)) return sum + techs.length;
    return sum;
  }, 0);
  const practiceSessionCount = data.conversations.length;

  const realWorldTechniqueCount = data.situations.reduce((sum, s) => {
    const techs = s.techniquesUsed;
    if (Array.isArray(techs)) return sum + techs.length;
    return sum;
  }, 0);
  const realWorldSessionCount = data.situations.length;

  if (practiceSessionCount >= 3 && realWorldSessionCount >= 2) {
    const practiceRate = practiceTechniqueCount / practiceSessionCount;
    const realWorldRate = realWorldTechniqueCount / realWorldSessionCount;

    if (practiceRate > 0 && realWorldRate < practiceRate * 0.3) {
      gaps.push({
        id: "technique-transfer",
        from: "Technique use in practice",
        to: "Technique use in real-world",
        fromScore: Math.round(practiceRate * 20), // Normalize for display
        toScore: Math.round(realWorldRate * 20),
        fluencyDrop: Math.round((practiceRate - realWorldRate) * 20),
        severity: "moderate",
        suggestedBridge:
          "Practice techniques right before real-world situations to prime your speech muscles",
        dataPoints: practiceSessionCount + realWorldSessionCount,
      });
      recommendations.push(
        "You use techniques well in practice but rarely in real situations. Try technique-then-transfer drills."
      );
      bridgingExercises.push(
        ...(BRIDGING_EXERCISES["technique-transfer"] ?? [])
      );
    }
  }

  // ─── Overall Transfer Score ───
  // 100 = perfect transfer (no gaps), 0 = large gaps everywhere
  let transferScore = 100;
  for (const gap of gaps) {
    if (gap.severity === "severe") transferScore -= 25;
    else if (gap.severity === "moderate") transferScore -= 15;
    else transferScore -= 8;
  }
  transferScore = Math.max(0, transferScore);

  // Add general recommendations
  if (gaps.length === 0 && practiceScores.length >= 5) {
    recommendations.push(
      "Great transfer! Your practice performance matches your real-world skills. Keep pushing to harder scenarios."
    );
  } else if (gaps.length > 2) {
    recommendations.push(
      "Multiple transfer gaps detected. Focus on one gap at a time — start with the practice-to-real-world gap."
    );
  }

  return {
    gaps,
    recommendations: recommendations.slice(0, 4),
    bridgingExercises: bridgingExercises.slice(0, 6), // Max 6 exercises
    overallTransferScore: transferScore,
  };
}
