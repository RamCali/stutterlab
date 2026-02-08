"use client";

import { PHASE_LABELS, PHASE_RANGES } from "@/lib/curriculum/daily-plans";
import { cn } from "@/lib/utils";

interface PhaseTimelineProps {
  currentDay: number;
}

const PHASES = [
  { phase: 1, days: 14 },
  { phase: 2, days: 16 },
  { phase: 3, days: 20 },
  { phase: 4, days: 20 },
  { phase: 5, days: 20 },
];

const TOTAL_DAYS = 90;

export function PhaseTimeline({ currentDay }: PhaseTimelineProps) {
  return (
    <div className="space-y-2">
      {/* Phase bar segments */}
      <div className="flex gap-1 h-3 rounded-full overflow-hidden">
        {PHASES.map(({ phase, days }) => {
          const [start, end] = PHASE_RANGES[phase];
          const widthPercent = (days / TOTAL_DAYS) * 100;

          // Calculate fill within this phase
          let fillPercent = 0;
          if (currentDay > end) {
            fillPercent = 100;
          } else if (currentDay >= start) {
            fillPercent = ((currentDay - start) / (end - start + 1)) * 100;
          }

          const isCompleted = currentDay > end;
          const isCurrent = currentDay >= start && currentDay <= end;

          return (
            <div
              key={phase}
              className="relative h-full rounded-sm overflow-hidden bg-muted/40"
              style={{ width: `${widthPercent}%` }}
            >
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-sm transition-all duration-500",
                  isCompleted && "bg-primary",
                  isCurrent && "bg-gradient-to-r from-primary to-primary/60",
                  !isCompleted && !isCurrent && "bg-transparent"
                )}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Phase labels */}
      <div className="flex gap-1">
        {PHASES.map(({ phase, days }) => {
          const [start, end] = PHASE_RANGES[phase];
          const widthPercent = (days / TOTAL_DAYS) * 100;
          const isCompleted = currentDay > end;
          const isCurrent = currentDay >= start && currentDay <= end;

          return (
            <div
              key={phase}
              className="text-center"
              style={{ width: `${widthPercent}%` }}
            >
              <p
                className={cn(
                  "text-[10px] font-medium truncate",
                  isCurrent && "text-primary",
                  isCompleted && "text-muted-foreground",
                  !isCurrent && !isCompleted && "text-muted-foreground/50"
                )}
              >
                {PHASE_LABELS[phase]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
