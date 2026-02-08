"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Trophy,
  Clock,
  Target,
  Phone,
  BookOpen,
  Mic,
  Brain,
  CheckCircle2,
  Crown,
} from "lucide-react";

const weeklyChallenges = [
  {
    id: "1",
    title: "Phone Call Hero",
    description: "Complete 3 phone call simulations this week",
    icon: Phone,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    xp: 150,
    progress: 1,
    total: 3,
    isPremium: false,
  },
  {
    id: "2",
    title: "Daily Dedication",
    description: "Practice every day for 7 days straight",
    icon: Target,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    xp: 200,
    progress: 3,
    total: 7,
    isPremium: false,
  },
  {
    id: "3",
    title: "Reading Marathon",
    description: "Complete 10 reading exercises at sentence level or higher",
    icon: BookOpen,
    color: "text-green-500",
    bg: "bg-green-500/10",
    xp: 100,
    progress: 4,
    total: 10,
    isPremium: false,
  },
  {
    id: "4",
    title: "Mindful Speaker",
    description: "Do 5 breathing exercises before speaking situations",
    icon: Brain,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    xp: 120,
    progress: 2,
    total: 5,
    isPremium: true,
  },
  {
    id: "5",
    title: "Voice Journaler",
    description: "Record 4 voice journal entries this week",
    icon: Mic,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    xp: 100,
    progress: 0,
    total: 4,
    isPremium: true,
  },
];

const achievements = [
  { title: "First Steps", emoji: "🎯", description: "Complete your first exercise", unlocked: true },
  { title: "Dedicated", emoji: "🔥", description: "7-day practice streak", unlocked: false },
  { title: "Consistent", emoji: "⭐", description: "30-day practice streak", unlocked: false },
  { title: "Audio Explorer", emoji: "🎧", description: "Try all Audio Lab tools", unlocked: false },
  { title: "Brave Caller", emoji: "📞", description: "Complete a phone call sim", unlocked: true },
  { title: "Journaler", emoji: "📝", description: "Record 7 voice journals", unlocked: false },
  { title: "Century", emoji: "💯", description: "Complete 100 exercises", unlocked: false },
  { title: "Social Butterfly", emoji: "🦋", description: "Join a practice room", unlocked: false },
];

export default function ChallengesPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Challenges
        </h1>
        <p className="text-muted-foreground mt-1">
          Weekly challenges and achievements to keep you motivated
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">240</p>
            <p className="text-[10px] text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">2/8</p>
            <p className="text-[10px] text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Challenges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">This Week&apos;s Challenges</h2>
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            5 days left
          </Badge>
        </div>
        <div className="space-y-3">
          {weeklyChallenges.map((challenge) => {
            const pct = Math.round((challenge.progress / challenge.total) * 100);
            const complete = challenge.progress >= challenge.total;

            return (
              <Card key={challenge.id} className={complete ? "opacity-60" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${challenge.bg} flex-shrink-0`}>
                      <challenge.icon className={`h-5 w-5 ${challenge.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{challenge.title}</h3>
                        {challenge.isPremium && (
                          <Badge variant="outline" className="text-[10px]">
                            <Crown className="h-2.5 w-2.5 mr-0.5" />
                            PRO
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {challenge.progress}/{challenge.total}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                      +{challenge.xp} XP
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map((a) => (
            <Card key={a.title} className={a.unlocked ? "" : "opacity-40"}>
              <CardContent className="pt-4 pb-3 text-center">
                <span className="text-2xl">{a.emoji}</span>
                <p className="font-medium text-xs mt-1">{a.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
