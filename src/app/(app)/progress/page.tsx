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
  Flame,
  Target,
  Calendar,
  TrendingUp,
  Clock,
  BarChart3,
  FileText,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { BeforeAfterPrompt } from "@/components/progress/before-after-card";
import { getUserOutcomeSummary, type TechniqueOutcomeSummary } from "@/lib/actions/user-progress";

/* ─── Sample fluency trend data ─── */
const fluencyTrendData = [
  { day: "Mon", score: 62 },
  { day: "Tue", score: 58 },
  { day: "Wed", score: 65 },
  { day: "Thu", score: 70 },
  { day: "Fri", score: 68 },
  { day: "Sat", score: 74 },
  { day: "Sun", score: 72 },
];

/* ─── Generate heatmap data ─── */
function generateHeatmapData() {
  const days: { date: Date; value: number }[] = [];
  const now = new Date();
  for (let i = 52 * 7 - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    let value = 0;
    if (i < 30) {
      value = Math.random() > 0.4 ? Math.floor(Math.random() * 8) + 1 : 0;
    } else if (i < 60) {
      value = Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : 0;
    }
    days.push({ date, value });
  }
  return days;
}

function getHeatmapColor(value: number): string {
  if (value === 0) return "bg-muted";
  if (value <= 2) return "bg-green-200 dark:bg-green-900";
  if (value <= 4) return "bg-green-400 dark:bg-green-700";
  return "bg-green-600 dark:bg-green-500";
}

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

export default function ProgressPage() {
  const heatmapData = useMemo(() => generateHeatmapData(), []);
  const [outcomes, setOutcomes] = useState<TechniqueOutcomeSummary | null>(null);

  useEffect(() => {
    getUserOutcomeSummary().then(setOutcomes).catch(() => {});
  }, []);

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

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: "Current Streak", value: "0 days", color: "text-orange-500" },
          { icon: Target, label: "Sessions Done", value: "0", color: "text-blue-500" },
          { icon: Clock, label: "Practice Time", value: "0 min", color: "text-green-500" },
          { icon: TrendingUp, label: "Fluency Score", value: "--", color: "text-purple-500" },
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
                  title={`${day.date.toLocaleDateString()} — ${day.value} exercises`}
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
          <div className="space-y-3">
            {[
              { type: "Reading Exercise", level: "Phrases", duration: "4:32", score: 74, date: "Today" },
              { type: "AI Conversation", level: "Phone Call", duration: "6:15", score: 68, date: "Today" },
              { type: "Reading Exercise", level: "Sentences", duration: "5:10", score: 71, date: "Yesterday" },
            ].map((session, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="text-sm font-medium">{session.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.level} — {session.duration}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">{session.score}%</Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {session.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
