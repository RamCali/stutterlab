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
  Phone,
  Coffee,
  MapPin,
  ShoppingBag,
  Users,
  Briefcase,
  BookOpen,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getUserGamificationStats, type LevelInfo } from "@/lib/gamification/engine";
import { getAchievementStatus } from "@/lib/gamification/achievements";
import {
  getTodayChallenge,
  completeDailyChallenge,
  type DailyChallenge,
} from "@/lib/actions/challenges";

const CATEGORY_ICONS: Record<string, typeof Phone> = {
  phone: Phone,
  social: Users,
  ordering: Coffee,
  work: Briefcase,
  general: BookOpen,
};

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
  const [completing, setCompleting] = useState(false);

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

  async function handleCompleteChallenge() {
    if (!todayData || todayData.completed || completing) return;
    setCompleting(true);
    try {
      const result = await completeDailyChallenge(todayData.challenge.id);
      setTodayData((prev) => prev ? { ...prev, completed: true } : null);
      // Refresh stats
      const [newStats, newAch] = await Promise.all([
        getUserGamificationStats(""),
        getAchievementStatus(""),
      ]);
      setStats(newStats);
      setAchievements(newAch);
    } catch {
      // Handle error silently
    } finally {
      setCompleting(false);
    }
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const level = stats?.level;
  const CategoryIcon = todayData
    ? CATEGORY_ICONS[todayData.challenge.category] || Target
    : Target;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Challenges & Achievements
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-world practice missions to build lasting confidence
        </p>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{loading ? "..." : stats?.totalXp ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Star className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{loading ? "..." : level?.level ?? 1}</p>
            <p className="text-[10px] text-muted-foreground">{level?.title ?? "Beginner"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{loading ? "..." : stats?.currentStreak ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">
              {loading ? "..." : `${unlockedCount}/${achievements.length}`}
            </p>
            <p className="text-[10px] text-muted-foreground">Achievements</p>
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

      {/* Today's Real-World Challenge */}
      <Card className={todayData?.completed ? "border-emerald-500/30 bg-emerald-500/5" : "border-primary/30 bg-primary/5"}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Today&apos;s Real-World Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayData ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{todayData.challenge.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{todayData.challenge.title}</h3>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${DIFFICULTY_COLORS[todayData.challenge.difficulty]}`}
                    >
                      {todayData.challenge.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      +{todayData.challenge.xpReward} XP
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {todayData.challenge.description}
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="pl-14 space-y-1">
                {todayData.challenge.tips.map((tip, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    {tip}
                  </p>
                ))}
              </div>

              {todayData.completed ? (
                <div className="pl-14 flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium text-sm">Completed! +{todayData.challenge.xpReward} XP earned</span>
                </div>
              ) : (
                <div className="pl-14">
                  <Button
                    onClick={handleCompleteChallenge}
                    disabled={completing}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {completing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    I Did It!
                  </Button>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Complete this challenge in real life, then tap &quot;I Did It&quot; to earn XP.
                  </p>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Achievements */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map((a) => (
            <Card key={a.id} className={a.unlocked ? "border-primary/20" : "opacity-40"}>
              <CardContent className="pt-4 pb-3 text-center">
                <span className="text-2xl">{a.emoji}</span>
                <p className="font-medium text-xs mt-1">{a.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.description}</p>
                {a.unlocked && (
                  <Badge variant="secondary" className="mt-1.5 text-[9px]">
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
