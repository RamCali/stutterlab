import type { DailyPlan } from "@/lib/curriculum/daily-plans";

export const OFFLINE_BUNDLE_KEY = "stutterlab_offline_daily_bundle";
export const OFFLINE_QUEUE_KEY = "stutterlab_offline_sync_queue";

export interface OfflineDailyBundle {
  cachedAt: string;
  day: number;
  plan: DailyPlan | null;
  techniqueSummaries: { title: string; instructions: string }[];
}

export interface OfflineSyncItem {
  type: "moment_log" | "micro_challenge" | "weekly_review";
  payload: Record<string, unknown>;
  createdAt: string;
}

export function cacheOfflineBundle(bundle: OfflineDailyBundle): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(OFFLINE_BUNDLE_KEY, JSON.stringify(bundle));
}

export function getOfflineBundle(): OfflineDailyBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(OFFLINE_BUNDLE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OfflineDailyBundle;
  } catch {
    return null;
  }
}

export function queueOfflineSync(item: OfflineSyncItem): void {
  if (typeof window === "undefined") return;
  const existing = getOfflineQueue();
  existing.push(item);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(existing));
}

export function getOfflineQueue(): OfflineSyncItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OfflineSyncItem[];
  } catch {
    return [];
  }
}

export function clearOfflineQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}
