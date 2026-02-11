"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  LineChart,
  BarChart as BarChartIcon,
  Flame,
  Target,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  FileText,
  Crown,
  Activity,
  Brain,
  BookOpen,
  Shield,
  Zap,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis as BarXAxis,
  YAxis as BarYAxis,
  CartesianGrid as BarGrid,
  Tooltip as BarTooltip,
  ResponsiveContainer as BarContainer,
  Cell,
} from "recharts";
import { BeforeAfterPrompt } from "@/components/progress/before-after-card";
import { getUserOutcomeSummary, type TechniqueOutcomeSummary } from "@/lib/actions/user-progress";
import { getProgressData } from "@/lib/actions/progress";
import {
  getAIConversationAnalytics,
  getFearedWordsAnalytics,
  getAnxietyTrend,
} from "@/lib/actions/analytics";
import { checkAISimUsage } from "@/lib/auth/premium";
import type { PlanTier } from "@/lib/auth/premium";

/* ─── Heatmap helpers ─── */

function buildHeatmapFromCounts(dailyCounts: Record<string, number>) {
  const days: { date: Date; value: number }[] = [];
  const now = new Date();
  for (let i = 52 * 7 - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    days.push({ date, value: dailyCounts[key] || 0 });
  }
  return days;
}

function getHeatmapColor(value: number): string {
  if (value === 0) return "bg-muted";
  if (value <= 2) return "bg-green-200 dark:bg-green-900";
  if (value <= 4) return "bg-green-400 dark:bg-green-700";
  return "bg-green-600 dark:bg-green-500";
}

/* ─── Format helpers ─── */

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString();
}

/* ─── Personalization Card ─── */

function PersonalizationCard({ outcomes }: { outcomes: TechniqueOutcomeSummary | null }) {
  if (!outcomes || outcomes.totalSessions < 6) return null;

  const fs = outcomes.fluencyShaping;
  const mod = outcomes.modification;
  const weight = outcomes.recommendedWeight;
  const fsPercent = Math.round(weight * 100);
  const modPercent = 100 - fsPercent;

  const fsDelta = fs.avgConfidenceDelta;
  const modDelta = mod.avgConfidenceDelta;

  const better = fsDelta > modDelta ? "Fluency Shaping" : fsDelta < modDelta ? "Stuttering Modification" : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Your Personalization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {better && (
          <p className="text-sm text-muted-foreground">
            Based on {outcomes.totalSessions} sessions, <span className="font-medium text-foreground">{better}</span> techniques produce better confidence improvement for you.
          </p>
        )}

        {/* Fluency Shaping bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Fluency Shaping</span>
            <span className="text-muted-foreground">
              avg {fsDelta >= 0 ? "+" : ""}{fsDelta.toFixed(1)} confidence ({fs.sessionCount} sessions)
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all"
              style={{ width: `${Math.max(5, Math.min(100, (fsDelta + 5) * 10))}%` }}
            />
          </div>
        </div>

        {/* Modification bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Stuttering Modification</span>
            <span className="text-muted-foreground">
              avg {modDelta >= 0 ? "+" : ""}{modDelta.toFixed(1)} confidence ({mod.sessionCount} sessions)
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{ width: `${Math.max(5, Math.min(100, (modDelta + 5) * 10))}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground border-t pt-3">
          Your sessions are weighted <span className="font-medium">{fsPercent}/{modPercent}</span> toward{" "}
          {fsPercent >= 50 ? "fluency shaping" : "modification"} techniques.
        </p>
      </CardContent>
    </Card>
  );
}

/* ─── Main Page ─── */

type ProgressData = Awaited<ReturnType<typeof getProgressData>>;
type AIAnalytics = Awaited<ReturnType<typeof getAIConversationAnalytics>>;
type FearedWordsData = Awaited<ReturnType<typeof getFearedWordsAnalytics>>;
type AnxietyData = Awaited<ReturnType<typeof getAnxietyTrend>>;

export default function ProgressPage() {
  const [outcomes, setOutcomes] = useState<TechniqueOutcomeSummary | null>(null);
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PlanTier>("free");
  const [aiAnalytics, setAiAnalytics] = useState<AIAnalytics | null>(null);
  const [fearedWordsData, setFearedWordsData] = useState<FearedWordsData | null>(null);
  const [anxietyData, setAnxietyData] = useState<AnxietyData | null>(null);

  const isPremium = plan !== "free";

  useEffect(() => {
    Promise.all([
      getProgressData(),
      getUserOutcomeSummary(),
      checkAISimUsage(),
    ])
      .then(([progressData, outcomesData, usage]) => {
        setData(progressData);
        setOutcomes(outcomesData);
        setPlan(usage.plan);

        // Load premium analytics if user has a paid plan
        if (usage.plan !== "free") {
          Promise.all([
            getAIConversationAnalytics(),
            getFearedWordsAnalytics(),
            getAnxietyTrend(),
          ])
            .then(([ai, fw, anxiety]) => {
              setAiAnalytics(ai);
              setFearedWordsData(fw);
              setAnxietyData(anxiety);
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;
  const heatmapData = useMemo(
    () => buildHeatmapFromCounts(data?.dailyCounts ?? {}),
    [data?.dailyCounts]
  );

  // Build fluency trend chart data from real sessions
  const fluencyTrendData = useMemo(() => {
    if (!data?.fluencyTrend || data.fluencyTrend.length === 0) return [];
    return data.fluencyTrend.map((entry) => ({
      day: entry.date,
      score: entry.aiScore ?? (entry.score ? entry.score * 10 : 0),
    }));
  }, [data?.fluencyTrend]);

  // Compute average fluency from trend
  const avgFluency = useMemo(() => {
    if (fluencyTrendData.length === 0) return null;
    const sum = fluencyTrendData.reduce((s, d) => s + d.score, 0);
    return Math.round(sum / fluencyTrendData.length);
  }, [fluencyTrendData]);

  const practiceMinutes = stats ? Math.round(stats.totalPracticeSeconds / 60) : 0;
  const hasData = stats && stats.totalExercisesCompleted > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          Progress
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your improvement with objective data and insights
        </p>
      </div>

      {/* Monthly Assessment CTA */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  Monthly Clinical Assessment
                  <Badge variant="outline" className="text-[10px]">
                    <Crown className="h-2.5 w-2.5 mr-0.5" />
                    PRO
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Read a standardized passage aloud. Get your %SS score, severity rating, and shareable report.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/progress/report">
                <Badge variant="outline" className="cursor-pointer">
                  View Reports
                </Badge>
              </Link>
              <Link href="/progress/assess">
                <Badge className="cursor-pointer bg-primary text-primary-foreground">
                  Take Assessment
                </Badge>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Clinical Audit CTA */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Activity className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  Weekly Clinical Audit
                  <Badge variant="outline" className="text-[10px]">
                    <Crown className="h-2.5 w-2.5 mr-0.5" />
                    PRO
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Record a 2-min narrative. Get SSI-4 grade %SS scoring, disfluency breakdown, and week-over-week trends.
                </p>
              </div>
            </div>
            <Link href="/progress/weekly-audit">
              <Badge className="cursor-pointer bg-amber-500 text-white hover:bg-amber-600">
                Take Audit
              </Badge>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: Flame,
            label: "Current Streak",
            value: loading ? "..." : `${stats?.currentStreak ?? 0} day${(stats?.currentStreak ?? 0) !== 1 ? "s" : ""}`,
            color: "text-orange-500",
          },
          {
            icon: Target,
            label: "Sessions Done",
            value: loading ? "..." : `${stats?.totalExercisesCompleted ?? 0}`,
            color: "text-blue-500",
          },
          {
            icon: Clock,
            label: "Practice Time",
            value: loading ? "..." : practiceMinutes > 0 ? `${practiceMinutes} min` : "0 min",
            color: "text-green-500",
          },
          {
            icon: TrendingUp,
            label: "Fluency Score",
            value: loading ? "..." : avgFluency !== null ? `${avgFluency}` : "--",
            color: "text-purple-500",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5 pb-4">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Before/After Transformation */}
      <BeforeAfterPrompt />

      {/* Personalization Insight */}
      <PersonalizationCard outcomes={outcomes} />

      {/* Fluency Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Fluency Score Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fluencyTrendData.length > 0 ? (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fluencyTrendData}>
                    <defs>
                      <linearGradient id="fluencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      className="fill-muted-foreground"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      className="fill-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#fluencyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Higher scores indicate better fluency. Based on AI analysis of your sessions.
              </p>
            </>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Complete practice sessions to see your fluency trend
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Practice Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Practice Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-flow-col grid-rows-7 gap-[3px] min-w-[700px]">
              {heatmapData.map((day, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.value)}`}
                  title={`${day.date.toLocaleDateString()} — ${day.value} exercise${day.value !== 1 ? "s" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-[3px]">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
              <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
              <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentSessions && data.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {data.recentSessions.slice(0, 10).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {session.exerciseType?.includes("ai-conversation")
                        ? "AI Conversation"
                        : session.exerciseType?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Practice Session"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.exerciseType?.includes(":")
                        ? session.exerciseType.split(":")[1]?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                        : ""}{" "}
                      {session.durationSeconds ? `— ${formatDuration(session.durationSeconds)}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    {(session.aiFluencyScore || session.selfRatedFluency) && (
                      <Badge variant="secondary">
                        {session.aiFluencyScore
                          ? `${Math.round(session.aiFluencyScore)}%`
                          : `${session.selfRatedFluency}/10`}
                      </Badge>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {session.startedAt ? timeAgo(session.startedAt) : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No sessions yet. Start practicing to track your progress!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Premium Analytics Section ─── */}
      {isPremium ? (
        <>
          {/* Section Header */}
          <div className="flex items-center gap-2 pt-4">
            <Crown className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold">Premium Analytics</h2>
          </div>

          {/* AI Conversation Analytics */}
          {aiAnalytics && aiAnalytics.totalConversations > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI Conversation Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold">{aiAnalytics.totalConversations}</p>
                    <p className="text-[10px] text-muted-foreground">Conversations</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className={`text-2xl font-bold ${
                      (aiAnalytics.avgFluency ?? 0) >= 80
                        ? "text-[#00E676]"
                        : (aiAnalytics.avgFluency ?? 0) >= 60
                          ? "text-[#FFB347]"
                          : "text-[#FF5252]"
                    }`}>
                      {aiAnalytics.avgFluency ?? "--"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Avg Fluency</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold">{aiAnalytics.totalAIMinutes}</p>
                    <p className="text-[10px] text-muted-foreground">Minutes</p>
                  </div>
                </div>

                {/* Fluency trend from AI conversations */}
                {aiAnalytics.recentTrend.length > 2 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">AI Conversation Fluency Trend</p>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={aiAnalytics.recentTrend}>
                          <defs>
                            <linearGradient id="aiTrendGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#00E676"
                            strokeWidth={2}
                            fill="url(#aiTrendGrad)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Scenario breakdown */}
                {aiAnalytics.scenarioBreakdown.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Performance by Scenario</p>
                    <div className="space-y-2">
                      {aiAnalytics.scenarioBreakdown.map((s) => (
                        <div
                          key={s.name}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm capitalize">
                              {s.name.replace(/-/g, " ")}
                            </span>
                            <Badge variant="secondary" className="text-[9px]">
                              {s.count}x
                            </Badge>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              s.avgScore >= 80
                                ? "text-[#00E676] border-[#00E676]/30"
                                : s.avgScore >= 60
                                  ? "text-[#FFB347] border-[#FFB347]/30"
                                  : "text-[#FF5252] border-[#FF5252]/30"
                            }`}
                          >
                            {s.avgScore}% avg
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technique frequency */}
                {aiAnalytics.techniqueFrequency.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Most Used Techniques
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {aiAnalytics.techniqueFrequency.slice(0, 6).map((t) => (
                        <div
                          key={t.name}
                          className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                        >
                          <span className="text-xs capitalize">
                            {t.name.replace(/_/g, " ")}
                          </span>
                          <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-600">
                            {t.count}x
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Feared Words Progress */}
          {fearedWordsData && fearedWordsData.total > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Feared Words Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mastery stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold">{fearedWordsData.total}</p>
                    <p className="text-[10px] text-muted-foreground">Total Words</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-[#00E676]">
                      {fearedWordsData.mastered}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Mastered</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold">{fearedWordsData.totalPracticeReps}</p>
                    <p className="text-[10px] text-muted-foreground">Total Reps</p>
                  </div>
                </div>

                {/* Mastery progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Mastery Progress</span>
                    <span className="font-bold text-[#00E676]">
                      {fearedWordsData.masteryPercent}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#00E676] transition-all"
                      style={{ width: `${fearedWordsData.masteryPercent}%` }}
                    />
                  </div>
                </div>

                {/* By difficulty */}
                <div className="flex gap-3">
                  {(["easy", "medium", "hard"] as const).map((diff) => (
                    <div
                      key={diff}
                      className="flex-1 text-center p-2 rounded-lg border"
                    >
                      <p className="text-sm font-bold">
                        {fearedWordsData.byDifficulty[diff]}
                      </p>
                      <p className="text-[9px] text-muted-foreground capitalize">
                        {diff}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Top words needing practice */}
                {fearedWordsData.words.filter((w) => !w.mastered).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Words to Practice</p>
                    <div className="flex flex-wrap gap-1.5">
                      {fearedWordsData.words
                        .filter((w) => !w.mastered)
                        .slice(0, 12)
                        .map((w) => (
                          <Badge
                            key={w.word}
                            variant="outline"
                            className={`text-xs ${
                              w.difficulty === "hard"
                                ? "border-red-500/30 text-red-400"
                                : w.difficulty === "medium"
                                  ? "border-amber-500/30 text-amber-400"
                                  : "border-green-500/30 text-green-400"
                            }`}
                          >
                            {w.word}
                            {w.practiceCount > 0 && (
                              <span className="ml-1 text-muted-foreground">
                                ({w.practiceCount}x)
                              </span>
                            )}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Anxiety Reduction Trend */}
          {anxietyData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Anxiety Reduction Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold">{anxietyData.totalSituations}</p>
                    <p className="text-[10px] text-muted-foreground">Situations Logged</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-center gap-1">
                      {anxietyData.avgAnxietyReduction > 0 ? (
                        <TrendingDown className="h-4 w-4 text-[#00E676]" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-[#FFB347]" />
                      )}
                      <p className={`text-2xl font-bold ${
                        anxietyData.avgAnxietyReduction > 0 ? "text-[#00E676]" : ""
                      }`}>
                        {anxietyData.avgAnxietyReduction > 0 ? "-" : ""}
                        {Math.abs(anxietyData.avgAnxietyReduction)}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Avg Anxiety Drop</p>
                  </div>
                </div>

                {/* Anxiety trend chart */}
                {anxietyData.trend.length > 2 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Anxiety Before vs After (lower is better)
                    </p>
                    <div className="h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={anxietyData.trend}>
                          <defs>
                            <linearGradient id="anxBeforeGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF5252" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#FF5252" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="anxAfterGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00E676" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                          <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          <Area type="monotone" dataKey="before" stroke="#FF5252" strokeWidth={2} fill="url(#anxBeforeGrad)" name="Before" />
                          <Area type="monotone" dataKey="after" stroke="#00E676" strokeWidth={2} fill="url(#anxAfterGrad)" name="After" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#FF5252]" /> Before
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#00E676]" /> After
                      </span>
                    </div>
                  </div>
                )}

                {/* By situation type */}
                {anxietyData.byType.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">By Situation Type</p>
                    <div className="space-y-2">
                      {anxietyData.byType.map((t) => (
                        <div
                          key={t.type}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
                        >
                          <span className="text-sm capitalize">
                            {t.type.replace(/_/g, " ")}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[9px]">
                              {t.count}x
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                t.avgReduction > 0
                                  ? "text-[#00E676] border-[#00E676]/30"
                                  : ""
                              }`}
                            >
                              {t.avgReduction > 0 ? "-" : ""}
                              {Math.abs(t.avgReduction)} avg
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Premium Upsell for Free Users */
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-primary/5">
          <CardContent className="py-6">
            <div className="text-center space-y-3">
              <Crown className="h-8 w-8 text-amber-500 mx-auto" />
              <h3 className="font-bold text-lg">Unlock Premium Analytics</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Get AI conversation insights, feared words mastery tracking,
                anxiety reduction trends, and technique effectiveness analysis.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "AI Fluency Trends",
                  "Scenario Breakdown",
                  "Feared Words Mastery",
                  "Anxiety Tracking",
                  "Technique Analysis",
                ].map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {feature}
                  </Badge>
                ))}
              </div>
              <Link href="/ai-practice">
                <Badge className="cursor-pointer bg-primary text-primary-foreground mt-2">
                  Upgrade to Premium
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
