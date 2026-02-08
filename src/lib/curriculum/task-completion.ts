/**
 * Client-side per-task completion tracking using localStorage.
 * Provides granular checkmarks on the dashboard for individual daily tasks.
 */

const STORAGE_KEY = "stutterlab_task_completions";

interface DayCompletions {
  day: number;
  date: string;
  completedTypes: string[];
}

function getStoredCompletions(): DayCompletions[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCompletions(completions: DayCompletions[]) {
  if (typeof window === "undefined") return;
  // Keep only last 7 days of completions to avoid bloat
  const recent = completions.slice(-7);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
}

/** Get completed task types for the current day */
export function getTodaysCompletions(currentDay: number): Set<string> {
  const all = getStoredCompletions();
  const today = all.find((d) => d.day === currentDay);
  return new Set(today?.completedTypes || []);
}

/** Mark a task type as completed for the current day */
export function markTaskCompleted(currentDay: number, taskType: string): void {
  const all = getStoredCompletions();
  const todayIndex = all.findIndex((d) => d.day === currentDay);

  if (todayIndex >= 0) {
    if (!all[todayIndex].completedTypes.includes(taskType)) {
      all[todayIndex].completedTypes.push(taskType);
    }
  } else {
    all.push({
      day: currentDay,
      date: new Date().toISOString().split("T")[0],
      completedTypes: [taskType],
    });
  }

  saveCompletions(all);
}

/** Check if all tasks for the day are completed */
export function isDayFullyCompleted(currentDay: number, totalTasks: number): boolean {
  const completed = getTodaysCompletions(currentDay);
  return completed.size >= totalTasks;
}
