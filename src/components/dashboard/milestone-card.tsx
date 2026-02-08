"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Flag, Zap } from "lucide-react";
import { getNextMilestone } from "@/lib/curriculum/weeks";
import { getWeekForDay } from "@/lib/curriculum/weeks";

interface MilestoneCardProps {
  currentDay: number;
}

export function MilestoneCard({ currentDay }: MilestoneCardProps) {
  const milestone = getNextMilestone(currentDay);
  const currentWeek = getWeekForDay(currentDay);

  if (!milestone) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Program Complete!</p>
              <p className="text-xs text-muted-foreground">
                You&apos;ve finished the 90-day program. Adaptive maintenance mode is active.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Flag className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Next Milestone</p>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium">
                {milestone.daysUntil} day{milestone.daysUntil !== 1 ? "s" : ""} away
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {milestone.type === "phase" ? milestone.label : `Week ${currentWeek}: ${milestone.label}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
