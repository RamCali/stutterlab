"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Placeholder data for the GitHub-style heatmap
const heatmapData = Array.from({ length: 52 * 7 }, (_, i) => ({
  date: new Date(Date.now() - (52 * 7 - i) * 86400000),
  value: 0,
}));

export default function ProgressPage() {
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
          { icon: Flame, label: "Current Streak", value: "0 days", color: "text-orange-500" },
          { icon: Trophy, label: "Total XP", value: "0", color: "text-yellow-500" },
          { icon: Target, label: "Exercises Done", value: "0", color: "text-blue-500" },
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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fingerprint">Stutter Fingerprint</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
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
                      className={`w-3 h-3 rounded-sm ${
                        day.value === 0
                          ? "bg-muted"
                          : day.value < 3
                          ? "bg-green-200"
                          : day.value < 6
                          ? "bg-green-400"
                          : "bg-green-600"
                      }`}
                      title={day.date.toLocaleDateString()}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-[3px]">
                  <div className="w-3 h-3 rounded-sm bg-muted" />
                  <div className="w-3 h-3 rounded-sm bg-green-200" />
                  <div className="w-3 h-3 rounded-sm bg-green-400" />
                  <div className="w-3 h-3 rounded-sm bg-green-600" />
                </div>
                <span>More</span>
              </div>
            </CardContent>
          </Card>

          {/* Fluency Trend Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Fluency Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/20">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Complete your first exercise to see your fluency trend</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sessions yet. Start practicing to see your history here.</p>
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
                  { title: "First Steps", description: "Complete your first exercise", emoji: "🎯", unlocked: false },
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
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Not enough data yet</p>
                <p className="text-sm mt-1">
                  Practice for at least a week to unlock personalized insights
                  about your speaking patterns and optimal practice times.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
