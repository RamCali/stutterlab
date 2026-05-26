/**
 * Tracks whether DAF helps this user in practice (self-reported + optional fluency note).
 * Used to de-emphasize Audio Lab for non-responders in personalized plans.
 */

const STORAGE_KEY = "stutterlab_daf_responder";

export type DafResponseRating = "helps" | "neutral" | "no_help" | "not_tried";

export interface DafResponderState {
  lastRatedAt: string | null;
  rating: DafResponseRating;
  /** Sessions where user practiced with DAF on */
  sessionsWithDaf: number;
}

const DEFAULT_STATE: DafResponderState = {
  lastRatedAt: null,
  rating: "not_tried",
  sessionsWithDaf: 0,
};

export function getDafResponderState(): DafResponderState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_STATE;
}

export function saveDafResponderState(state: DafResponderState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function recordDafPracticeSession(): void {
  const state = getDafResponderState();
  saveDafResponderState({
    ...state,
    sessionsWithDaf: state.sessionsWithDaf + 1,
  });
}

export function setDafResponseRating(rating: DafResponseRating): void {
  const state = getDafResponderState();
  saveDafResponderState({
    ...state,
    rating,
    lastRatedAt: new Date().toISOString(),
  });
}

/** True when we should reduce Audio Lab frequency in daily plans */
export function shouldDeemphasizeDaf(): boolean {
  const { rating } = getDafResponderState();
  return rating === "no_help";
}
