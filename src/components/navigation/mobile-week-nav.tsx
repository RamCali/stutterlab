"use client";

import Link from "next/link";
import { Check, LineChart, Settings, Play } from "lucide-react";
import { getDaysForWeek, getWeekForDay } from "@/lib/curriculum/weeks";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface MobileWeekNavProps {
  currentDay: number;
}

export function MobileWeekNav({ currentDay }: MobileWeekNavProps) {
  const currentWeek = getWeekForDay(currentDay);
  const days = getDaysForWeek(currentWeek, currentDay);

  return (
    <div className="border-t border-border/60 bg-card pb-safe">
      {/* Day selector strip */}
      <div className="flex justify-around px-3 pt-2 pb-1">
        {days.map((day, i) => (
          <Link
            key={day.dayNumber}
            href={day.isLocked ? "#" : "/app/practice"}
            onClick={(e) => day.isLocked && e.preventDefault()}
            className="flex flex-col items-center gap-0.5"
          >
            <span className="text-[9px] text-muted-foreground">
              {DAY_LABELS[i] || "D"}
            </span>
            <div
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all",
                day.isCompleted && "bg-primary/10 text-primary",
                day.isCurrent && "bg-primary text-primary-foreground",
                day.isLocked && "bg-muted/50 text-muted-foreground/30"
              )}
            >
              {day.isCompleted ? (
                <Check className="h-3 w-3" />
              ) : (
                day.dayNumber
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex justify-around px-4 py-1.5 border-t border-border/40">
        <Link
          href="/app/practice"
          className="flex flex-col items-center gap-0.5 text-primary"
        >
          <Play className="h-5 w-5 stroke-[2.5]" />
          <span className="text-[10px] font-medium">Today</span>
        </Link>
        <Link
          href="/app/progress"
          className="flex flex-col items-center gap-0.5 text-muted-foreground"
        >
          <LineChart className="h-5 w-5" />
          <span className="text-[10px] font-medium">Progress</span>
        </Link>
        <Link
          href="/app/settings"
          className="flex flex-col items-center gap-0.5 text-muted-foreground"
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </div>
    </div>
  );
}
