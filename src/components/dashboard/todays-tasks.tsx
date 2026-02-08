"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wind,
  BookOpen,
  AudioWaveform,
  BookHeart,
  Brain,
  Flower2,
  GraduationCap,
  Trophy,
  AlertTriangle,
  Play,
  Check,
  Sparkles,
} from "lucide-react";
import type { DailyPlan, TaskType } from "@/lib/curriculum/daily-plans";
import {
  getTodaysCompletions,
  markTaskCompleted,
} from "@/lib/curriculum/task-completion";

const TASK_TYPE_ICONS: Record<TaskType, React.ElementType> = {
  warmup: Wind,
  exercise: BookOpen,
  "audio-lab": AudioWaveform,
  journal: BookHeart,
  ai: Brain,
  mindfulness: Flower2,
  learn: GraduationCap,
  challenge: Trophy,
  "feared-words": AlertTriangle,
};

interface TodaysTasksProps {
  dailyPlan: DailyPlan;
  currentDay: number;
}

export function TodaysTasks({ dailyPlan, currentDay }: TodaysTasksProps) {
  const [completedTypes, setCompletedTypes] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompletedTypes(getTodaysCompletions(currentDay));
  }, [currentDay]);

  function handleToggleTask(taskType: string) {
    markTaskCompleted(currentDay, taskType);
    setCompletedTypes(getTodaysCompletions(currentDay));
  }

  const allCompleted = completedTypes.size >= dailyPlan.tasks.length;

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Today&apos;s Tasks
          </h3>
          <span className="text-xs text-muted-foreground">
            {completedTypes.size}/{dailyPlan.tasks.length}
          </span>
        </div>
        <p className="text-lg font-bold mb-1">{dailyPlan.title}</p>

        {dailyPlan.affirmation && (
          <div className="flex items-start gap-2 mb-4 p-2 rounded-md bg-muted/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs italic text-muted-foreground">
              &ldquo;{dailyPlan.affirmation}&rdquo;
            </p>
          </div>
        )}

        <div className="space-y-1.5 mb-4">
          {dailyPlan.tasks.map((task, i) => {
            const Icon = TASK_TYPE_ICONS[task.type] || BookOpen;
            const isCompleted = completedTypes.has(task.type);

            return (
              <Link
                key={`${task.type}-${i}`}
                href={task.href}
                onClick={() => handleToggleTask(task.type)}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                }`}>
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{task.subtitle}</p>
                </div>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
                  {task.duration}
                </span>
              </Link>
            );
          })}
        </div>

        {allCompleted ? (
          <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
            <Check className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-primary">All done for today!</p>
            <p className="text-xs text-muted-foreground mt-1">Great work. See you tomorrow.</p>
          </div>
        ) : (
          <Link href="/practice">
            <Button className="w-full" size="lg">
              <Play className="h-4 w-4 mr-2" />
              Start Today&apos;s Session
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
