"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Brain,
  Clock,
  BarChart3,
} from "lucide-react";

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
    // Simulate some practice data for recent weeks
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

export default function ProgressPage() {
  const heatmapData = useMemo(() => generateHeatmapData(), []);

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

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: Flame, label: "Current Streak", value: "3 days", color: "text-orange-500" },
          { icon: Trophy, label: "Total XP", value: "240", color: "text-yellow-500" },
          { icon: Target, label: "Exercises Done", value: "12", color: "text-blue-500" },
          { icon: Clock, label: "Practice Time", value: "48 min", color: "text-green-500" },
          { icon: TrendingUp, label: "Fluency Score", value: "72", color: "text-purple-500" },
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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fingerprint">Stutter Fingerprint</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Fluency Trend Chart — Recharts */}
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
        </TabsContent>

        <TabsContent value="fingerprint" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Your Stutter Fingerprint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/20">
                <div className="text-center max-w-sm">
                  <Brain className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">AI Analysis Required</p>
                  <p className="text-sm mt-1">
                    Complete exercises with recording enabled to generate your
                    personal Stutter Fingerprint -- a visual map of your unique
                    disfluency patterns.
                  </p>
                  <Badge className="mt-3" variant="outline">Pro Feature</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  { title: "First Steps", description: "Complete your first exercise", emoji: "🎯", unlocked: true },
                  { title: "Dedicated", description: "7-day practice streak", emoji: "🔥", unlocked: false },
                  { title: "Consistent", description: "30-day practice streak", emoji: "⭐", unlocked: false },
                  { title: "Audio Explorer", description: "Try all Audio Lab tools", emoji: "🎧", unlocked: false },
                  { title: "Brave Caller", description: "Complete a phone call sim", emoji: "📞", unlocked: false },
                  { title: "Social Butterfly", description: "Join a practice room", emoji: "🦋", unlocked: false },
                  { title: "Journaler", description: "Record 7 voice journals", emoji: "📝", unlocked: false },
                  { title: "Century", description: "Complete 100 exercises", emoji: "💯", unlocked: false },
                ].map((achievement) => (
                  <div
                    key={achievement.title}
                    className={`text-center p-4 rounded-lg border ${
                      achievement.unlocked
                        ? "bg-yellow-500/5 border-yellow-500/30"
                        : "bg-muted/30 opacity-50"
                    }`}
                  >
                    <span className="text-2xl">{achievement.emoji}</span>
                    <p className="font-medium text-sm mt-2">{achievement.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Early Insights
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      insight: "You practice most consistently in the morning",
                      detail: "80% of your sessions happen before noon",
                    },
                    {
                      insight: "Phrases are your sweet spot",
                      detail: "Your fluency scores are highest during phrase-level exercises",
                    },
                    {
                      insight: "DAF helps your fluency by ~15%",
                      detail: "Sessions with DAF enabled show measurably higher fluency scores",
                    },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <p className="text-sm font-medium">{item.insight}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Insights become more accurate as you practice more. Keep going!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
