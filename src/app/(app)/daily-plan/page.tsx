"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AudioWaveform,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  GraduationCap,
  Heart,
  Lock,
  MapPin,
  Mic,
  Sparkles,
  Target,
  Wind,
} from "lucide-react";
import {
  getDailyPlan,
  getPhaseInfo,
  PHASE_LABELS,
  type TaskType,
} from "@/lib/curriculum/daily-plans";

/* ─── Icon map for task types ─── */
const typeIcons: Record<TaskType, typeof Wind> = {
  warmup: Wind,
  exercise: BookOpen,
  "audio-lab": AudioWaveform,
  journal: Mic,
  ai: Brain,
  mindfulness: Heart,
  learn: GraduationCap,
  challenge: MapPin,
  "feared-words": Target,
};

function getTypeColor(type: TaskType) {
  switch (type) {
    case "warmup":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400";
    case "exercise":
      return "bg-sage-100 text-sage-600 dark:bg-sage-500/15 dark:text-sage-500";
    case "audio-lab":
      return "bg-primary/10 text-primary";
    case "journal":
      return "bg-warm-100 text-warm-600 dark:bg-warm-500/15 dark:text-warm-500";
    case "ai":
      return "bg-violet-500/10 text-violet-600 dark:text-violet-400";
    case "mindfulness":
      return "bg-rose-500/10 text-rose-500";
    case "learn":
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
    case "challenge":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "feared-words":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getPhaseColor(phase: number) {
  switch (phase) {
    case 1:
      return "from-sky-500/10 to-sky-500/5";
    case 2:
      return "from-sage-100 to-sage-50 dark:from-sage-500/10 dark:to-sage-500/5";
    case 3:
      return "from-violet-500/10 to-violet-500/5";
    case 4:
      return "from-primary/10 to-primary/5";
    case 5:
      return "from-amber-500/10 to-amber-500/5";
    default:
      return "from-muted to-muted";
  }
}

export default function DailyPlanPage() {
  const [currentDay, setCurrentDay] = useState(1);

  const plan = getDailyPlan(currentDay);
  const phaseInfo = getPhaseInfo(currentDay);

  if (!plan) return null;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header with day navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            90-Day Curriculum
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Structured daily exercises for lasting fluency
          </p>
        </div>
      </div>

      {/* Day Navigator */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentDay <= 1}
              onClick={() => setCurrentDay((d) => Math.max(1, d - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <div className="text-center">
              <p className="text-lg font-bold">Day {plan.day}</p>
              <p className="text-xs text-muted-foreground">{plan.title}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentDay >= 90}
              onClick={() => setCurrentDay((d) => Math.min(90, d + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {/* Phase progress */}
          <div className="mt-3 flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs border-primary/30 text-primary"
            >
              Phase {phaseInfo.phase} — {phaseInfo.label}
            </Badge>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${phaseInfo.progress}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              Day {phaseInfo.dayInPhase}/{phaseInfo.daysInPhase}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Phase Overview Strip */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((p) => (
          <button
            key={p}
            onClick={() => {
              const starts: Record<number, number> = {
                1: 1,
                2: 15,
                3: 31,
                4: 51,
                5: 71,
              };
              setCurrentDay(starts[p]);
            }}
            className={`flex-1 py-2 rounded-lg text-center transition-all ${
              p === phaseInfo.phase
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <p className="text-[10px] font-medium">Phase {p}</p>
            <p className="text-[9px] opacity-70">{PHASE_LABELS[p]}</p>
          </button>
        ))}
      </div>

      {/* Affirmation */}
      <Card
        className={`border-0 shadow-sm bg-gradient-to-br ${getPhaseColor(
          phaseInfo.phase
        )}`}
      >
        <CardContent className="pt-4 pb-3 text-center">
          <Sparkles className="h-4 w-4 text-primary mx-auto mb-1.5" />
          <p className="text-sm italic text-foreground/80 leading-relaxed">
            &ldquo;{plan.affirmation}&rdquo;
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
            Day {plan.day} of 90
          </p>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Day {plan.day}: {plan.title}
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {plan.tasks.length} tasks
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {plan.tasks.map((task, index) => {
            const Icon = typeIcons[task.type] || BookOpen;
            return (
              <Link
                key={index}
                href={task.href}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors"
              >
                {/* Step number */}
                <div className="flex-shrink-0 h-6 w-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className={`flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${getTypeColor(
                    task.type
                  )}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium leading-tight">
                      {task.title}
                    </p>
                    {task.premium && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1 py-0"
                      >
                        Pro
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {task.subtitle}
                  </p>
                </div>

                {/* Duration + Arrow */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.duration}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {/* Day Navigation Grid (mini calendar) */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Jump to Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 90 }, (_, i) => i + 1).map((d) => {
              const isActive = d === currentDay;
              const phase = d <= 14 ? 1 : d <= 30 ? 2 : d <= 50 ? 3 : d <= 70 ? 4 : 5;
              return (
                <button
                  key={d}
                  onClick={() => setCurrentDay(d)}
                  className={`h-7 w-full rounded text-[10px] font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={`Day ${d} — Phase ${phase}: ${PHASE_LABELS[phase]}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
