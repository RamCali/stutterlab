/**
 * OASES-S (Overall Assessment of the Speaker's Experience of Stuttering — Short)
 * Simplified in-app impact check-in (not a licensed clinical administration).
 * Items inspired by the OASES impact domains; scores are for self-tracking only.
 */

export interface OasesSItem {
  id: string;
  label: string;
  domain: "general" | "speaking" | "participation";
}

export const OASES_S_ITEMS: OasesSItem[] = [
  {
    id: "impact-daily",
    label: "Stuttering affects my daily life",
    domain: "general",
  },
  {
    id: "impact-emotional",
    label: "I feel frustrated or embarrassed about my speech",
    domain: "general",
  },
  {
    id: "speaking-anxiety",
    label: "I feel anxious before speaking situations",
    domain: "speaking",
  },
  {
    id: "speaking-avoid",
    label: "I avoid speaking when I can",
    domain: "speaking",
  },
  {
    id: "participation-work",
    label: "Stuttering limits me at work or school",
    domain: "participation",
  },
  {
    id: "participation-social",
    label: "Stuttering limits my social life",
    domain: "participation",
  },
];

export interface OasesSCheckIn {
  date: string;
  /** Item id → 1 (minimal impact) to 5 (severe impact) */
  scores: Record<string, number>;
  /** Mean across items — lower is better */
  impactScore: number;
}

const STORAGE_KEY = "stutterlab_oases_checkins";
export const OASES_CHECKIN_INTERVAL_DAYS = 30;

export function getOasesCheckIns(): OasesSCheckIn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function saveOasesCheckIn(checkIn: OasesSCheckIn): void {
  if (typeof window === "undefined") return;
  const existing = getOasesCheckIns();
  const filtered = existing.filter((c) => c.date !== checkIn.date);
  filtered.push(checkIn);
  filtered.sort((a, b) => a.date.localeCompare(b.date));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export function computeImpactScore(scores: Record<string, number>): number {
  const values = OASES_S_ITEMS.map((item) => scores[item.id]).filter(
    (v): v is number => typeof v === "number" && v >= 1 && v <= 5,
  );
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export function daysSinceLastOasesCheckIn(): number | null {
  const checkIns = getOasesCheckIns();
  if (checkIns.length === 0) return null;
  const last = checkIns[checkIns.length - 1].date;
  const lastDate = new Date(last);
  const now = new Date();
  return Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOasesCheckInDue(): boolean {
  const days = daysSinceLastOasesCheckIn();
  if (days === null) return true;
  return days >= OASES_CHECKIN_INTERVAL_DAYS;
}
