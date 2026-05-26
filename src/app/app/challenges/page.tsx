"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  Trophy,
  Target,
  CheckCircle2,
  Flame,
  Star,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getUserGamificationStats } from "@/lib/gamification/engine";
import { getAchievementStatus } from "@/lib/gamification/achievements";
import {
  getTodayChallenge,
  type DailyChallenge,
} from "@/lib/actions/challenges";
import { UnifiedMicroChallenge } from "@/components/challenges/unified-micro-challenge";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

type GamificationStats = Awaited<ReturnType<typeof getUserGamificationStats>>;
type AchievementItem = Awaited<ReturnType<typeof getAchievementStatus>>[number];

export default function ChallengesPage() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [todayData, setTodayData] = useState<{
    challenge: DailyChallenge;
    completed: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getUserGamificationStats(""),
      getAchievementStatus(""),
      getTodayChallenge(),
    ])
      .then(([gamStats, achStatus, today]) => {
        setStats(gamStats);
        setAchievements(achStatus);
        setTodayData({ challenge: today.challenge, completed: today.completed });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const level = stats?.level;
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-7 w-7 text-primary" />
          Challenges & Achievements
        </h1>
        <p className="text-lg text-muted-foreground mt-1.5">
          Real-world practice missions to build lasting confidence
        </p>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{loading ? "..." : stats?.totalXp ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Star className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{loading ? "..." : level?.level ?? 1}</p>
            <p className="text-xs text-muted-foreground">{level?.title ?? "Beginner"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{loading ? "..." : stats?.currentStreak ?? 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">
              {loading ? "..." : `${unlockedCount}/${achievements.length}`}
            </p>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      {level && (
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Level {level.level}: {level.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {level.currentXp} / {level.xpForNextLevel} XP
              </span>
            </div>
            <Progress value={level.progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {todayData && !loading ? (
        <UnifiedMicroChallenge
          challengeId={todayData.challenge.id}
          challengeTitle={todayData.challenge.title}
          technique={todayData.challenge.tips[0]}
          tips={todayData.challenge.tips}
        />
      ) : loading ? (
        <Card>
          <CardContent className="py-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : null}

      {/* Achievements */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map((a) => (
            <Card key={a.id} className={a.unlocked ? "border-primary/20" : "opacity-40"}>
              <CardContent className="pt-4 pb-3 text-center">
                <span className="text-2xl">{a.emoji}</span>
                <p className="font-medium text-xs mt-1">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                {a.unlocked && (
                  <Badge variant="secondary" className="mt-1.5 text-xs">
                    +{a.xpReward} XP
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
