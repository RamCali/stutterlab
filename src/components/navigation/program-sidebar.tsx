"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Check,
  Lock,
  ChevronDown,
  ChevronRight,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getWeeksByPhase, getDaysForWeek, getWeekForDay, type WeekInfo } from "@/lib/curriculum/weeks";

interface ProgramSidebarProps {
  currentDay: number;
}

export function ProgramSidebar({ currentDay }: ProgramSidebarProps) {
  const pathname = usePathname();
  const currentWeek = getWeekForDay(currentDay);
  const [expandedWeek, setExpandedWeek] = useState<number>(currentWeek);
  const weeksByPhase = getWeeksByPhase();

  function toggleWeek(weekNumber: number) {
    setExpandedWeek((prev) => (prev === weekNumber ? -1 : weekNumber));
  }

  // Phase colors for left border accent
  const phaseColors: Record<number, string> = {
    1: "border-l-teal-500",
    2: "border-l-blue-500",
    3: "border-l-violet-500",
    4: "border-l-amber-500",
    5: "border-l-emerald-500",
  };

  return (
    <nav className="flex-1 overflow-y-auto py-2 px-2">
      {weeksByPhase.map(({ phase, label, weeks }) => {
        const phaseCompleted = weeks.every(
          (w) => currentDay > w.endDay
        );
        const phaseCurrent = weeks.some(
          (w) => currentDay >= w.startDay && currentDay <= w.endDay
        );
        const phaseFuture = !phaseCompleted && !phaseCurrent;

        return (
          <div key={phase} className="mb-1">
            {/* Phase header */}
            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider",
                phaseCurrent && "text-primary",
                phaseCompleted && "text-muted-foreground",
                phaseFuture && "text-muted-foreground/40"
              )}
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  phaseCurrent && "bg-primary",
                  phaseCompleted && "bg-muted-foreground",
                  phaseFuture && "bg-muted-foreground/30"
                )}
              />
              {label}
            </div>

            {/* Weeks in this phase */}
            {weeks.map((week) => (
              <WeekAccordion
                key={week.weekNumber}
                week={week}
                currentDay={currentDay}
                currentWeek={currentWeek}
                isExpanded={expandedWeek === week.weekNumber}
                onToggle={() => toggleWeek(week.weekNumber)}
                phaseColor={phaseColors[phase] || "border-l-primary"}
                pathname={pathname}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

interface WeekAccordionProps {
  week: WeekInfo;
  currentDay: number;
  currentWeek: number;
  isExpanded: boolean;
  onToggle: () => void;
  phaseColor: string;
  pathname: string;
}

function WeekAccordion({
  week,
  currentDay,
  currentWeek,
  isExpanded,
  onToggle,
  phaseColor,
  pathname,
}: WeekAccordionProps) {
  const isCompleted = currentDay > week.endDay;
  const isCurrent = week.weekNumber === currentWeek;
  const isLocked = currentDay < week.startDay;

  const days = isExpanded ? getDaysForWeek(week.weekNumber, currentDay) : [];

  return (
    <div className={cn("mb-0.5", isExpanded && "mb-1")}>
      {/* Week header */}
      <button
        onClick={isLocked ? undefined : onToggle}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium transition-all text-left",
          isCurrent && "bg-primary/5 border border-primary/20",
          isCompleted && "hover:bg-sidebar-accent",
          isLocked && "opacity-40 cursor-default",
          !isCurrent && !isLocked && "hover:bg-sidebar-accent"
        )}
      >
        {/* Status icon */}
        {isCompleted ? (
          <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        ) : isLocked ? (
          <Lock className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
        ) : isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        )}

        <span className={cn(
          "flex-1 truncate",
          isCurrent && "text-foreground",
          isCompleted && "text-sidebar-foreground/70",
          isLocked && "text-muted-foreground/50"
        )}>
          Week {week.weekNumber}
        </span>

        {isCurrent && (
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
            Now
          </span>
        )}
      </button>

      {/* Expanded day list */}
      {isExpanded && days.length > 0 && (
        <div className={cn("ml-3 pl-3 border-l-2 mt-0.5 space-y-0.5", phaseColor)}>
          {days.map((day) => {
            const isActive = pathname === `/app/practice` && day.isCurrent;

            return (
              <Link
                key={day.dayNumber}
                href={day.isLocked ? "#" : "/app/practice"}
                onClick={(e) => day.isLocked && e.preventDefault()}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all",
                  day.isCurrent && "bg-primary/10 text-primary font-semibold",
                  day.isCompleted && "text-sidebar-foreground/60 hover:bg-sidebar-accent",
                  day.isLocked && "text-muted-foreground/30 cursor-default",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                {day.isCompleted ? (
                  <Check className="h-3 w-3 text-primary flex-shrink-0" />
                ) : day.isCurrent ? (
                  <Circle className="h-3 w-3 fill-primary text-primary flex-shrink-0" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground/20 flex-shrink-0" />
                )}
                <span className="flex-1 truncate">Day {day.dayNumber}</span>
                <span className="text-[10px] text-muted-foreground/60">
                  {day.taskCount} tasks
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
