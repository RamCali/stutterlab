"use client";

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
  Moon,
  Play,
  Sparkles,
  Sun,
  Target,
  Trophy,
  TrendingUp,
  Wind,
  Zap,
  CheckCircle2,
  Circle,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

/* ─── Daily Plan Data (Day 1 example) ─── */
const dailyPlan = {
  day: 1,
  phase: "Foundation",
  title: "Getting Started",
  tasks: [
    {
      id: 1,
      title: "Diaphragmatic Breathing",
      subtitle: "Learn proper breathing technique",
      duration: "3 min",
      type: "warmup" as const,
      icon: Wind,
      completed: false,
      href: "/exercises",
    },
    {
      id: 2,
      title: "Gentle Onset Practice",
      subtitle: "Single words with soft start",
      duration: "5 min",
      type: "exercise" as const,
      icon: BookOpen,
      completed: false,
      href: "/exercises",
    },
    {
      id: 3,
      title: "DAF Reading — Easy Passage",
      subtitle: "Read along with delayed auditory feedback",
      duration: "10 min",
      type: "audio-lab" as const,
      icon: AudioWaveform,
      completed: false,
      href: "/audio-lab",
    },
    {
      id: 4,
      title: "Voice Journal Entry",
      subtitle: "Record how your speech feels today",
      duration: "2 min",
      type: "journal" as const,
      icon: Mic,
      completed: false,
      href: "/voice-journal/new",
    },
    {
      id: 5,
      title: "AI Conversation — Ordering Food",
      subtitle: "Practice a real-world scenario",
      duration: "5 min",
      type: "ai" as const,
      icon: Brain,
      completed: false,
      locked: true,
      href: "/ai-practice",
    },
  ],
};

const completedCount = dailyPlan.tasks.filter((t) => t.completed).length;
const progressPercent = Math.round(
  (completedCount / dailyPlan.tasks.length) * 100
);

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
    color: "bg-sage-100 text-sage-600 dark:bg-sage-500/15 dark:text-sage-500",
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
    color: "bg-warm-100 text-warm-600 dark:bg-warm-500/15 dark:text-warm-500",
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

/* ─── Type Color Map ─── */
function getTypeColor(type: string) {
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
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Welcome + Day Badge */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good morning!
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Your daily practice makes a real difference.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-0 text-sm px-3 py-1"
        >
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          Day {dailyPlan.day}
        </Badge>
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
              {completedCount} of {dailyPlan.tasks.length} tasks done
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ~25 min remaining
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">0</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Day Streak
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">0</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total XP
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">0</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Exercises
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
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

      {/* ═══ Daily Practice Plan ═══ */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">
                Day {dailyPlan.day}: {dailyPlan.title}
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="text-xs border-primary/30 text-primary"
            >
              Phase 1 — {dailyPlan.phase}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete all tasks in order for the best results
          </p>
        </CardHeader>
        <CardContent className="space-y-1">
          {dailyPlan.tasks.map((task, index) => {
            const TaskIcon = task.icon;
            const isLocked = task.locked;
            return (
              <Link
                key={task.id}
                href={isLocked ? "#" : task.href}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  task.completed
                    ? "bg-primary/5 opacity-75"
                    : isLocked
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-muted/60"
                }`}
              >
                {/* Step number / check */}
                <div className="flex-shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : isLocked ? (
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
                      task.completed ? "line-through text-muted-foreground" : ""
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
                  {!isLocked && !task.completed && (
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
              <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="pt-4 pb-3 flex flex-col items-center text-center">
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center ${tool.color} group-hover:scale-105 transition-transform`}
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
        <Card className="border-0 shadow-sm bg-gradient-to-br from-sage-50 to-sage-100 dark:from-sage-500/10 dark:to-sage-600/5">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-sage-500/15 flex items-center justify-center flex-shrink-0">
                <Sun className="h-5 w-5 text-sage-600 dark:text-sage-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Smart Daily Warm-Up</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI-personalized 2-minute breathing + gentle onset routine
                </p>
                <Button
                  size="sm"
                  className="mt-3 bg-sage-600 hover:bg-sage-500 text-white"
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
        <Card className="border-0 shadow-sm bg-gradient-to-br from-warm-50 to-warm-100 dark:from-warm-500/10 dark:to-warm-600/5">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-warm-200 dark:bg-warm-500/15 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-warm-600 dark:text-warm-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Daily Affirmation</h3>
                <p className="text-sm text-foreground/80 mt-1 italic leading-relaxed">
                  &ldquo;My voice has value. I speak at my own pace, and that
                  pace is perfect.&rdquo;
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">
                  Day 1 of 90
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ Weekly Challenge ═══ */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
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
