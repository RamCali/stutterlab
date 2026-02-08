/**
 * Week-based mapping layer on top of the 90-day curriculum.
 * Maps days 1-90 to weeks 1-13 for program navigation UI.
 */

import { getDailyPlan, getPhaseInfo, PHASE_LABELS, PHASE_RANGES } from "./daily-plans";

export interface WeekInfo {
  weekNumber: number;
  startDay: number;
  endDay: number;
  phase: number;
  phaseLabel: string;
  title: string;
  milestone: string;
}

export interface DayInfo {
  dayNumber: number;
  weekNumber: number;
  dayOfWeek: number;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  taskCount: number;
}

const WEEK_TITLES: Record<number, string> = {
  1: "Getting Started",
  2: "Building Your Foundation",
  3: "New Techniques",
  4: "Finding Your Flow",
  5: "Combining Skills",
  6: "Deepening Practice",
  7: "Advanced Techniques",
  8: "Facing the Real World",
  9: "Confidence in Action",
  10: "Pushing Boundaries",
  11: "Mastery Begins",
  12: "Strengthening Gains",
  13: "Graduation",
};

const WEEK_MILESTONES: Record<number, string> = {
  1: "Breathing mastered, gentle onset introduced",
  2: "Foundation checkpoint — ready for new techniques",
  3: "Light contact & prolonged speech unlocked",
  4: "FAF introduced, building blocks solidifying",
  5: "Cancellation & pull-out techniques learned",
  6: "Preparatory set & voluntary stuttering practiced",
  7: "All core techniques integrated",
  8: "First AI conversation completed",
  9: "Phone simulation conquered",
  10: "Feared words practice underway",
  11: "Advanced scenarios with confidence",
  12: "Community engagement & independence",
  13: "Program complete — maintenance mode unlocked",
};

/** Get the week number for a given day (1-13 for days 1-90, 14+ for 91+) */
export function getWeekForDay(day: number): number {
  if (day <= 0) return 1;
  if (day > 90) return 14; // maintenance
  return Math.ceil(day / 7);
}

/** Get the phase number for a given week */
function getPhaseForWeek(weekNumber: number): number {
  const midDay = (weekNumber - 1) * 7 + 4; // mid-point of the week
  const clamped = Math.min(midDay, 90);
  return getPhaseInfo(clamped).phase;
}

/** Get info for a specific week */
export function getWeekInfo(weekNumber: number): WeekInfo {
  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay = weekNumber === 13 ? 90 : weekNumber * 7;
  const phase = getPhaseForWeek(weekNumber);

  return {
    weekNumber,
    startDay,
    endDay,
    phase,
    phaseLabel: PHASE_LABELS[phase] || "Maintenance",
    title: WEEK_TITLES[weekNumber] || `Week ${weekNumber}`,
    milestone: WEEK_MILESTONES[weekNumber] || "",
  };
}

/** Get day details for a week, with completion state relative to currentDay */
export function getDaysForWeek(weekNumber: number, currentDay: number): DayInfo[] {
  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay = weekNumber === 13 ? 90 : weekNumber * 7;
  const days: DayInfo[] = [];

  for (let d = startDay; d <= endDay; d++) {
    const plan = getDailyPlan(d);
    days.push({
      dayNumber: d,
      weekNumber,
      dayOfWeek: (d - startDay),
      title: plan?.title || `Day ${d}`,
      isCompleted: d < currentDay,
      isCurrent: d === currentDay,
      isLocked: d > currentDay,
      taskCount: plan?.tasks?.length || 0,
    });
  }

  return days;
}

/** Get all 13 weeks */
export function getAllWeeks(): WeekInfo[] {
  return Array.from({ length: 13 }, (_, i) => getWeekInfo(i + 1));
}

/** Get weeks grouped by phase */
export function getWeeksByPhase(): { phase: number; label: string; weeks: WeekInfo[] }[] {
  const allWeeks = getAllWeeks();
  const phases: { phase: number; label: string; weeks: WeekInfo[] }[] = [];

  for (const week of allWeeks) {
    const existing = phases.find((p) => p.phase === week.phase);
    if (existing) {
      existing.weeks.push(week);
    } else {
      phases.push({
        phase: week.phase,
        label: week.phaseLabel,
        weeks: [week],
      });
    }
  }

  return phases;
}

/** Get the next milestone from current day */
export function getNextMilestone(currentDay: number): {
  type: "week" | "phase";
  label: string;
  daysUntil: number;
} | null {
  if (currentDay > 90) return null;

  const currentWeek = getWeekForDay(currentDay);
  const weekInfo = getWeekInfo(currentWeek);
  const daysUntilWeekEnd = weekInfo.endDay - currentDay + 1;

  // Check if a phase transition happens before end of week
  const currentPhase = getPhaseInfo(currentDay).phase;
  for (let d = currentDay + 1; d <= weekInfo.endDay; d++) {
    if (getPhaseInfo(d).phase !== currentPhase) {
      return {
        type: "phase",
        label: `Phase ${currentPhase + 1}: ${PHASE_LABELS[currentPhase + 1]} begins`,
        daysUntil: d - currentDay,
      };
    }
  }

  return {
    type: "week",
    label: weekInfo.milestone,
    daysUntil: daysUntilWeekEnd,
  };
}
