import type { ThinkingTrapId } from "./thinking-traps";

// ── Types ──────────────────────────────────────────────

export interface Emotion {
  name: string;
  intensity: number; // 1-10
}

export interface ThoughtRecord {
  id: string;
  situation: string;
  automaticThought: string;
  emotions: Emotion[];
  thinkingTraps: ThinkingTrapId[];
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
  createdAt: string;
}

export interface Prediction {
  id: string;
  situation: string;
  prediction: string;
  confidenceLevel: number; // 1-10
  anxietyBefore: number; // 1-10
  anxietyAfter: number | null;
  actualOutcome: string | null;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface CBTStore {
  thoughtRecords: ThoughtRecord[];
  predictions: Prediction[];
}

// ── Constants ──────────────────────────────────────────

const STORAGE_KEY = "stutterlab_cbt";

const EMPTY_STORE: CBTStore = {
  thoughtRecords: [],
  predictions: [],
};

export const EMOTIONS = [
  { name: "anxious", emoji: "😰" },
  { name: "frustrated", emoji: "😤" },
  { name: "embarrassed", emoji: "😳" },
  { name: "hopeless", emoji: "😞" },
  { name: "angry", emoji: "😠" },
  { name: "sad", emoji: "😢" },
  { name: "ashamed", emoji: "😔" },
  { name: "fearful", emoji: "😨" },
] as const;

// ── Store Access ───────────────────────────────────────

export function getCBTStore(): CBTStore {
  if (typeof window === "undefined") return EMPTY_STORE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STORE;
    return JSON.parse(raw) as CBTStore;
  } catch {
    return EMPTY_STORE;
  }
}

function saveCBTStore(store: CBTStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

// ── Thought Records ────────────────────────────────────

export function addThoughtRecord(
  record: Omit<ThoughtRecord, "id" | "createdAt">
): ThoughtRecord {
  const store = getCBTStore();
  const full: ThoughtRecord = {
    ...record,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  store.thoughtRecords.unshift(full);
  saveCBTStore(store);
  return full;
}

export function deleteThoughtRecord(id: string): void {
  const store = getCBTStore();
  store.thoughtRecords = store.thoughtRecords.filter((r) => r.id !== id);
  saveCBTStore(store);
}

export function getThoughtRecordStats() {
  const store = getCBTStore();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const trapCounts: Partial<Record<ThinkingTrapId, number>> = {};
  let totalTraps = 0;

  for (const record of store.thoughtRecords) {
    for (const trap of record.thinkingTraps) {
      trapCounts[trap] = (trapCounts[trap] ?? 0) + 1;
      totalTraps++;
    }
  }

  const thisWeek = store.thoughtRecords.filter(
    (r) => new Date(r.createdAt) >= weekAgo
  ).length;

  return {
    total: store.thoughtRecords.length,
    totalTraps,
    trapCounts,
    thisWeek,
  };
}

// ── Predictions ────────────────────────────────────────

export function addPrediction(
  prediction: Omit<Prediction, "id" | "createdAt" | "completedAt" | "completed" | "anxietyAfter" | "actualOutcome">
): Prediction {
  const store = getCBTStore();
  const full: Prediction = {
    ...prediction,
    id: Date.now().toString(),
    anxietyAfter: null,
    actualOutcome: null,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  store.predictions.unshift(full);
  saveCBTStore(store);
  return full;
}

export function completePrediction(
  id: string,
  actualOutcome: string,
  anxietyAfter: number
): void {
  const store = getCBTStore();
  const prediction = store.predictions.find((p) => p.id === id);
  if (!prediction) return;
  prediction.actualOutcome = actualOutcome;
  prediction.anxietyAfter = anxietyAfter;
  prediction.completed = true;
  prediction.completedAt = new Date().toISOString();
  saveCBTStore(store);
}

export function deletePrediction(id: string): void {
  const store = getCBTStore();
  store.predictions = store.predictions.filter((p) => p.id !== id);
  saveCBTStore(store);
}

export function getPendingPredictions(): Prediction[] {
  return getCBTStore().predictions.filter((p) => !p.completed);
}

export function getCompletedPredictions(): Prediction[] {
  return getCBTStore().predictions.filter((p) => p.completed);
}

export function getPredictionById(id: string): Prediction | undefined {
  return getCBTStore().predictions.find((p) => p.id === id);
}
