"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Coffee,
  Flame,
  MapPin,
  Mic,
  Phone,
  ShoppingCart,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

/* ─── Today's Real-World Challenges ─── */
const todaysChallenges = [
  {
    id: 1,
    title: "Order at a coffee shop",
    description: "Order a drink by name — no pointing at the menu!",
    xp: 50,
    icon: Coffee,
    difficulty: "beginner",
    completed: false,
    category: "ordering",
  },
  {
    id: 2,
    title: "Call a store to ask hours",
    description: "Make a real phone call to ask when a store opens or closes.",
    xp: 75,
    icon: Phone,
    difficulty: "intermediate",
    completed: false,
    category: "phone",
  },
  {
    id: 3,
    title: "Introduce yourself to someone new",
    description: 'Say "Hi, my name is..." to someone you haven\'t met before.',
    xp: 100,
    icon: Users,
    difficulty: "intermediate",
    completed: false,
    category: "social",
  },
];

/* ─── Weekly Challenges ─── */
const weeklyChallenges = [
  {
    id: 10,
    title: "5-Day Practice Streak",
    description: "Complete your daily plan for 5 consecutive days.",
    xp: 200,
    icon: Flame,
    progress: 2,
    total: 5,
    completed: false,
  },
  {
    id: 11,
    title: "Phone Warrior",
    description: "Complete 3 real phone calls this week.",
    xp: 250,
    icon: Phone,
    progress: 0,
    total: 3,
    completed: false,
  },
  {
    id: 12,
    title: "Voice Journal Streak",
    description: "Record a voice journal entry 7 days in a row.",
    xp: 150,
    icon: Mic,
    progress: 1,
    total: 7,
    completed: false,
  },
];

/* ─── Achievement Milestones ─── */
const milestones = [
  {
    title: "First Order",
    description: "Order food or drink using your voice",
    icon: Coffee,
    earned: true,
  },
  {
    title: "Phone Phobia Crusher",
    description: "Complete 10 phone calls",
    icon: Phone,
    earned: false,
  },
  {
    title: "Social Butterfly",
    description: "Introduce yourself 20 times",
    icon: Users,
    earned: false,
  },
  {
    title: "30-Day Warrior",
    description: "Complete real-world challenges for 30 days",
    icon: Calendar,
    earned: false,
  },
  {
    title: "Conversation Master",
    description: "Have 50 real-world conversations",
    icon: Star,
    earned: false,
  },
  {
    title: "Fearless Speaker",
    description: "Complete all challenge categories",
    icon: Trophy,
    earned: false,
  },
];

function getDiffBadge(difficulty: string) {
  switch (difficulty) {
    case "beginner":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "intermediate":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "advanced":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function ChallengesPage() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Real-World Challenges
          </h1>
          <p className="text-muted-foreground mt-1">
            Take your practice from the app into real life. Earn XP for every
            challenge completed.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs text-muted-foreground">Challenges Done</p>
          </CardContent>
        </Card>
        <Card className="border-0">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card className="border-0">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Challenges */}
      <Card className="border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Today&apos;s Challenges</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              0/{todaysChallenges.length} done
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete at least one to keep your streak alive
          </p>
        </CardHeader>
        <CardContent className="space-y-1">
          {todaysChallenges.map((challenge) => {
            const Icon = challenge.icon;
            return (
              <div
                key={challenge.id}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/60 transition-colors"
              >
                {/* Check */}
                <button className="flex-shrink-0">
                  {challenge.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground/30 hover:text-primary/50 transition-colors" />
                  )}
                </button>

                {/* Icon */}
                <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {challenge.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 ${getDiffBadge(
                        challenge.difficulty
                      )}`}
                    >
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {challenge.description}
                  </p>
                </div>

                {/* XP + Mark Done */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  >
                    +{challenge.xp} XP
                  </Badge>
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    Done
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Weekly Challenges */}
      <Card className="border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Weekly Challenges</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {weeklyChallenges.map((challenge) => {
            const Icon = challenge.icon;
            const progressPct = Math.round(
              (challenge.progress / challenge.total) * 100
            );
            return (
              <div
                key={challenge.id}
                className="p-3 rounded-md border border-border/60 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {challenge.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                      >
                        +{challenge.xp} XP
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {challenge.description}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {challenge.progress}/{challenge.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Achievement Milestones */}
      <Card className="border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">
              Challenge Milestones
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {milestones.map((milestone) => {
              const Icon = milestone.icon;
              return (
                <div
                  key={milestone.title}
                  className={`p-3 rounded-md border text-center ${
                    milestone.earned
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/60 opacity-50"
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-md mx-auto flex items-center justify-center ${
                      milestone.earned
                        ? "bg-primary/10"
                        : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        milestone.earned
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <p className="text-xs font-semibold mt-2">
                    {milestone.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {milestone.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tip */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary dark:text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Pro Tip</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                After completing a real-world challenge, record a voice journal
                entry about the experience. How did it feel? What technique
                helped most? This reflection accelerates your progress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
