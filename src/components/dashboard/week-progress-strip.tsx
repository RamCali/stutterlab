"use client";

import { Check } from "lucide-react";
import { getDaysForWeek, getWeekForDay } from "@/lib/curriculum/weeks";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeekProgressStripProps {
  currentDay: number;
}

export function WeekProgressStrip({ currentDay }: WeekProgressStripProps) {
  const currentWeek = getWeekForDay(currentDay);
  const days = getDaysForWeek(currentWeek, currentDay);

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Week {currentWeek} of 13
      </p>
      <div className="flex gap-2 justify-between">
        {days.map((day, i) => (
          <div key={day.dayNumber} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground">
              {DAY_LABELS[i] || `D${i + 1}`}
            </span>
            <div
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                day.isCompleted && "bg-primary/10 text-primary",
                day.isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                day.isLocked && "bg-muted text-muted-foreground/40"
              )}
            >
              {day.isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                day.dayNumber
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
