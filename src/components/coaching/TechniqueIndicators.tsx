"use client";

import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { TechniqueType, TechniqueDetection } from "@/lib/audio/SpeechCoach";

interface TechniqueIndicatorsProps {
  detections: TechniqueDetection[];
  counts: Record<TechniqueType, number>;
}

const TECHNIQUE_LABELS: Record<TechniqueType, string> = {
  gentle_onset: "Gentle Onset",
  pacing: "Pacing",
  rate_compliance: "Rate",
  prolonged_speech: "Prolonged",
  cancellation: "Cancel",
  pull_out: "Pull-out",
};

export function TechniqueIndicators({
  detections,
  counts,
}: TechniqueIndicatorsProps) {
  // Only show techniques that have been detected at least once this session
  // plus the top 3 most relevant ones if nothing detected yet
  const activeTechniques = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([type]) => type as TechniqueType);

  const defaultShow: TechniqueType[] = ["gentle_onset", "pacing", "rate_compliance"];
  const toShow =
    activeTechniques.length > 0
      ? [...new Set([...activeTechniques, ...defaultShow])]
      : defaultShow;

  // Which techniques were detected in the recent window (last 10s)?
  const recentTypes = new Set(detections.map((d) => d.technique));

  return (
    <div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        Techniques
      </span>
      <div className="flex flex-wrap gap-1 mt-1">
        {toShow.map((type) => {
          const isActive = recentTypes.has(type);
          const count = counts[type];

          return (
            <Badge
              key={type}
              variant={isActive ? "default" : "secondary"}
              className={`text-[9px] gap-0.5 transition-colors duration-300 ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "opacity-50"
              }`}
            >
              {isActive && <Check className="h-2 w-2" />}
              {TECHNIQUE_LABELS[type]}
              {count > 0 && (
                <span className="ml-0.5 opacity-70">{count}</span>
              )}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
