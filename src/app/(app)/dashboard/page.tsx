"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AudioWaveform,
  BookOpen,
  Brain,
  Calendar,
  ChevronRight,
  Clock,
  Flame,
  Mic,
  Play,
  Sparkles,
  Sun,
  Target,
  Trophy,
  TrendingUp,
  Wind,
  Zap,
  CheckCircle2,
  Lock,
  Heart,
  Shield,
  Volume2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getDailyPlan,
  getPhaseInfo,
  type DailyPlan,
  type TaskType,
} from "@/lib/curriculum/daily-plans";

/* ─── Circular Progress Ring ─── */
function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  children,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/50"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ─── Quick Tools Grid ─── */
const quickTools = [
  {
    href: "/audio-lab",
    icon: AudioWaveform,
    label: "Audio Lab",
    color: "bg-primary/10 text-primary",
  },
  {
    href: "/exercises",
    icon: BookOpen,
    label: "Exercises",
    color: "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary",
  },
  {
    href: "/ai-practice",
    icon: Brain,
    label: "AI Practice",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    href: "/voice-journal",
    icon: Mic,
    label: "Journal",
    color: "bg-brand-amber/10 text-brand-amber dark:bg-brand-amber/15 dark:text-brand-amber",
  },
  {
    href: "/mindfulness",
    icon: Wind,
    label: "Breathe",
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    href: "/progress",
    icon: TrendingUp,
    label: "Progress",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
];

/* ─── Type Icon Map ─── */
function getTaskIcon(type: TaskType) {
  switch (type) {
    case "warmup":
      return Wind;
    case "exercise":
      return BookOpen;
    case "audio-lab":
      return AudioWaveform;
    case "journal":
      return Mic;
    case "ai":
      return Brain;
    case "mindfulness":
      return Heart;
    case "learn":
      return BookOpen;
    case "challenge":
      return Target;
    case "feared-words":
      return Shield;
    default:
      return BookOpen;
  }
}

/* ─── Type Color Map ─── */
function getTypeColor(type: string) {
  switch (type) {
    case "warmup":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400";
    case "exercise":
      return "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary";
    case "audio-lab":
      return "bg-primary/10 text-primary";
    case "journal":
      return "bg-brand-amber/10 text-brand-amber dark:bg-brand-amber/15 dark:text-brand-amber";
    case "ai":
      return "bg-violet-500/10 text-violet-600 dark:text-violet-400";
    case "mindfulness":
      return "bg-pink-500/10 text-pink-600 dark:text-pink-400";
    case "learn":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "challenge":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
    case "feared-words":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function DashboardPage() {
  // TODO: Replace with real user data from DB once auth is connected
  const currentDay = 1;
  const stats = {
    currentStreak: 0,
    totalXp: 0,
    totalExercisesCompleted: 0,
  };

  const plan = getDailyPlan(currentDay);
  const phaseInfo = getPhaseInfo(currentDay);

  // Track completed tasks locally (will be persisted to DB later)
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  if (!plan) return null;

  const completedCount = completedTasks.size;
  const totalTasks = plan.tasks.length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  const totalMinutes = plan.tasks.reduce((sum, t) => {
    const mins = parseInt(t.duration) || 0;
    return sum + mins;
  }, 0);
  const completedMinutes = plan.tasks.reduce((sum, t, i) => {
    if (completedTasks.has(i)) {
      return sum + (parseInt(t.duration) || 0);
    }
    return sum;
  }, 0);
  const remainingMinutes = totalMinutes - completedMinutes;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 17) return "Good afternoon!";
    return "Good evening!";
  })();

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Welcome + Day Badge */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-muted-foreground mt-0.5">
            Your daily practice makes a real difference.
          </p>
        </div>
        <Link href="/daily-plan">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-0 text-sm px-3 py-1 cursor-pointer hover:bg-primary/20 transition-colors"
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Day {plan.day}
          </Badge>
        </Link>
      </div>

      {/* ═══ Top Section: Circular Progress + Stats ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Progress Card — large circular ring */}
        <Card className="md:col-span-1 border-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <CircularProgress value={progressPercent} size={140} strokeWidth={10}>
              <span className="text-3xl font-bold">{progressPercent}%</span>
              <span className="text-[11px] text-muted-foreground">
                Today&apos;s Goal
              </span>
            </CircularProgress>
            <p className="mt-3 text-sm font-medium">
              {completedCount} of {totalTasks} tasks done
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ~{remainingMinutes} min remaining
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          <Card className="border-0">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-orange-500/10 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">
                    {stats.currentStreak}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Day Streak
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-yellow-500/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">
                    {stats.totalXp}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total XP
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">
                    {stats.totalExercisesCompleted}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Exercises
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">--</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fluency
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ Daily Practice Plan (from curriculum engine) ═══ */}
      <Card className="border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">
                Day {plan.day}: {plan.title}
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="text-xs border-primary/30 text-primary"
            >
              Phase {plan.phase} — {plan.phaseLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete all tasks in order for the best results
          </p>
        </CardHeader>
        <CardContent className="space-y-1">
          {plan.tasks.map((task, index) => {
            const TaskIcon = getTaskIcon(task.type);
            const isCompleted = completedTasks.has(index);
            const isPremium = task.premium;
            return (
              <Link
                key={index}
                href={isPremium ? "#" : task.href}
                className={`group flex items-center gap-3 p-3 rounded-md transition-colors ${
                  isCompleted
                    ? "bg-primary/5 opacity-75"
                    : isPremium
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-muted/60"
                }`}
                onClick={(e) => {
                  if (isPremium) {
                    e.preventDefault();
                    return;
                  }
                }}
              >
                {/* Step number / check */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : isPremium ? (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Icon */}
                <div
                  className={`flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${getTypeColor(
                    task.type
                  )}`}
                >
                  <TaskIcon className="h-4.5 w-4.5" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-tight ${
                      isCompleted ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.title}
                  </p>
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
                  {!isPremium && !isCompleted && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  )}
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {/* ═══ Quick Tools ═══ */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Tools
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickTools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <Card className="border-0 hover:border-primary/30 transition-all cursor-pointer group">
                <CardContent className="pt-4 pb-3 flex flex-col items-center text-center">
                  <div
                    className={`h-11 w-11 rounded-md flex items-center justify-center ${tool.color} group-hover:scale-105 transition-transform`}
                  >
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium mt-2">{tool.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ Bottom Row: Smart Warm-Up + Daily Affirmation ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Smart Warm-Up */}
        <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Sun className="h-5 w-5 text-primary dark:text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Smart Daily Warm-Up</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI-personalized 2-minute breathing + gentle onset routine
                </p>
                <Button
                  size="sm"
                  className="mt-3 bg-primary hover:bg-primary/90 text-white"
                  asChild
                >
                  <Link href="/exercises">
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    Start Warm-Up
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Affirmation */}
        <Card className="border-0 bg-gradient-to-br from-brand-amber/5 to-brand-amber/10 dark:from-brand-amber/10 dark:to-brand-amber/5">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-md bg-brand-amber/10 dark:bg-brand-amber/15 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-brand-amber dark:text-brand-amber" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Daily Affirmation</h3>
                <p className="text-sm text-foreground/80 mt-1 italic leading-relaxed">
                  &ldquo;{plan.affirmation}&rdquo;
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">
                  Day {plan.day} of 90 — {phaseInfo.progress}% through{" "}
                  {phaseInfo.label}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ Weekly Challenge ═══ */}
      <Card className="border-0">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-violet-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Weekly Challenge</h3>
                <p className="text-xs text-muted-foreground">
                  Complete 5 exercises this week — 0/5
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                +100 XP
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
