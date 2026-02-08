"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Users,
  Clock,
  Trophy,
  Flame,
  Mic,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  icon: typeof Target;
  color: string;
  bg: string;
  goalValue: number;
  goalUnit: string;
  currentValue: number;
  participants: number;
  endsIn: string;
  yourContribution: number;
  xpReward: number;
}

const activeChallenges: CommunityChallenge[] = [
  {
    id: "feb-2026-hours",
    title: "10,000 Hours Together",
    description: "As a community, let's log 10,000 practice hours this month",
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    goalValue: 10000,
    goalUnit: "hours",
    currentValue: 6847,
    participants: 1243,
    endsIn: "22 days",
    yourContribution: 4,
    xpReward: 500,
  },
  {
    id: "feb-2026-streaks",
    title: "1,000 Active Streaks",
    description: "Get 1,000 community members to maintain a 7+ day streak simultaneously",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    goalValue: 1000,
    goalUnit: "streakers",
    currentValue: 738,
    participants: 892,
    endsIn: "22 days",
    yourContribution: 1,
    xpReward: 300,
  },
  {
    id: "feb-2026-victories",
    title: "5,000 Real-World Victories",
    description: "Share 5,000 real-world speaking victories as a community",
    icon: Trophy,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    goalValue: 5000,
    goalUnit: "victories",
    currentValue: 2341,
    participants: 654,
    endsIn: "22 days",
    yourContribution: 3,
    xpReward: 400,
  },
];

/** Full 30-Day Community Challenges section */
export function CommunityChallenges() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          30-Day Community Challenges
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Together we achieve what no one can alone. February 2026.
        </p>
      </div>

      {activeChallenges.map((challenge) => {
        const pct = Math.min(100, Math.round((challenge.currentValue / challenge.goalValue) * 100));
        const isComplete = challenge.currentValue >= challenge.goalValue;

        return (
          <Card key={challenge.id} className={isComplete ? "border-[#00E676]/50 bg-[#00E676]/5" : ""}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg ${challenge.bg} flex-shrink-0`}>
                  <challenge.icon className={`h-5 w-5 ${challenge.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-medium text-sm">{challenge.title}</h3>
                    {isComplete && (
                      <Badge className="bg-[#00E676] text-black text-[9px]">COMPLETE</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">
                        {challenge.currentValue.toLocaleString()} / {challenge.goalValue.toLocaleString()} {challenge.goalUnit}
                      </span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isComplete ? "bg-[#00E676]" : "bg-primary"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {challenge.participants.toLocaleString()} joined
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {challenge.endsIn} left
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      +{challenge.xpReward} XP
                    </span>
                  </div>

                  {/* Your contribution */}
                  {challenge.yourContribution > 0 && (
                    <p className="text-[10px] text-primary mt-1.5">
                      Your contribution: {challenge.yourContribution} {challenge.goalUnit === "streakers" ? "(active)" : challenge.goalUnit}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/** Compact widget for dashboard — shows top community challenge */
export function CommunityChallengeCompact() {
  const top = activeChallenges[0];
  const pct = Math.min(100, Math.round((top.currentValue / top.goalValue) * 100));

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="py-3">
        <div className="flex items-center gap-3 mb-2">
          <Target className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold">Community Challenge</p>
          <Badge variant="secondary" className="text-[9px] ml-auto">
            {top.endsIn} left
          </Badge>
        </div>
        <p className="text-xs font-medium mb-1.5">{top.title}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            {pct}%
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {top.currentValue.toLocaleString()} / {top.goalValue.toLocaleString()} {top.goalUnit} — {top.participants.toLocaleString()} participants
        </p>
      </CardContent>
    </Card>
  );
}
