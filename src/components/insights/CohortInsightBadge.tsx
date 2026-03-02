"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, ExternalLink } from "lucide-react";
import { getCohortInsight } from "@/lib/analysis/cohort-insights";
import type { CohortContext, CohortInsight } from "@/lib/analysis/types";

interface CohortInsightBadgeProps {
  context: CohortContext;
}

const SEEN_KEY = "stutterlab-cohort-seen";

function getSeenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markSeen(id: string) {
  if (typeof window === "undefined") return;
  try {
    const seen = getSeenIds();
    seen.add(id);
    // Keep only last 20
    const arr = [...seen].slice(-20);
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export function CohortInsightBadge({ context }: CohortInsightBadgeProps) {
  const [insight, setInsight] = useState<CohortInsight | null>(null);

  useEffect(() => {
    const result = getCohortInsight(context);
    if (result) {
      setInsight(result);
      markSeen(result.id);
    }
  }, [context.page, context.scenario, context.day, context.streak]);

  if (!insight) return null;

  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-amber-500/5 border border-primary/10">
      <Users className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
      <div className="space-y-1 min-w-0">
        <p className="text-[10px] font-medium text-primary uppercase tracking-wide">
          Community Insight
        </p>
        <p className="text-xs leading-relaxed">{insight.text}</p>
        {insight.source && (
          <p className="text-[10px] text-muted-foreground italic">
            Source: {insight.source}
          </p>
        )}
      </div>
    </div>
  );
}
