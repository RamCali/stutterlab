"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Flame,
  Clock,
  TrendingUp,
  Trophy,
  Heart,
  Sparkles,
} from "lucide-react";

interface PulseStats {
  activePractitioners: number;
  totalHoursPracticed: number;
  percentFeelBetter: number;
  realWorldVictories: number;
  streaksOver7: number;
  longestStreakThisWeek: number;
  weekLabel: string;
}

const DEFAULT_STATS: PulseStats = {
  activePractitioners: 0,
  totalHoursPracticed: 0,
  percentFeelBetter: 0,
  realWorldVictories: 0,
  streaksOver7: 0,
  longestStreakThisWeek: 0,
  weekLabel: "This Week",
};

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) return;
    const duration = 1200;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {typeof target === "number" && target % 1 !== 0
        ? count.toFixed(1)
        : count.toLocaleString()}
      {suffix}
    </span>
  );
}

function usePulseStats(): PulseStats {
  const [stats, setStats] = useState<PulseStats>(DEFAULT_STATS);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/community/pulse");
        if (res.ok) {
          const data = await res.json();
          setStats({
            activePractitioners: data.activePractitioners || 0,
            totalHoursPracticed: data.totalHoursPracticed || 0,
            percentFeelBetter: data.percentFeelBetter || 0,
            realWorldVictories: data.realWorldVictories || 0,
            streaksOver7: data.streaksOver7 || 0,
            longestStreakThisWeek: data.longestStreakThisWeek || 0,
            weekLabel: data.weekLabel || "This Week",
          });
        }
      } catch {
        // Keep defaults
      }
    }
    fetchStats();
  }, []);

  return stats;
}

/** Compact version for dashboard sidebar/widget */
export function CommunityPulseCompact() {
  const stats = usePulseStats();

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold">Community Pulse</p>
          <Badge variant="secondary" className="text-[9px] ml-auto">
            LIVE
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-primary">
              <AnimatedCounter target={stats.activePractitioners} />
            </p>
            <p className="text-[9px] text-muted-foreground">Practicing</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#00E676]">
              <AnimatedCounter target={stats.percentFeelBetter} suffix="%" />
            </p>
            <p className="text-[9px] text-muted-foreground">Feel Better</p>
          </div>
          <div>
            <p className="text-lg font-bold text-orange-500">
              <AnimatedCounter target={stats.realWorldVictories} />
            </p>
            <p className="text-[9px] text-muted-foreground">Victories</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Full Community Pulse board for dedicated section */
export function CommunityPulseFull() {
  const stats = usePulseStats();

  const statCards = [
    {
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      value: stats.activePractitioners,
      suffix: "",
      label: "People Practiced This Week",
      detail: "You're never alone in this journey",
    },
    {
      icon: TrendingUp,
      color: "text-[#00E676]",
      bg: "bg-[#00E676]/10",
      value: stats.percentFeelBetter,
      suffix: "%",
      label: "Reported Feeling Better",
      detail: "Based on self-rated fluency improvements",
    },
    {
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      value: stats.totalHoursPracticed,
      suffix: "",
      label: "Total Hours Practiced",
      detail: "Collective practice time this week",
    },
    {
      icon: Trophy,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      value: stats.realWorldVictories,
      suffix: "",
      label: "Real-World Victories",
      detail: "Phone calls, meetings, conversations — real life",
    },
    {
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      value: stats.streaksOver7,
      suffix: "",
      label: "On 7+ Day Streaks",
      detail: "Building habits that last",
    },
    {
      icon: Heart,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      value: stats.longestStreakThisWeek,
      suffix: " days",
      label: "Longest Active Streak",
      detail: "Someone is showing incredible dedication",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Weekly Community Pulse
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.weekLabel} — Anonymous, aggregate stats from our community
        </p>
      </div>

      {/* Hero stat */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/15">
        <CardContent className="py-6 text-center">
          <p className="text-5xl font-bold text-primary">
            <AnimatedCounter target={stats.activePractitioners} />
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            people practiced this week
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Every session rewires neural pathways. Together, we&apos;re stronger.
          </p>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.slice(1).map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-2`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-[10px] font-medium mt-0.5">{stat.label}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Encouragement */}
      <Card className="bg-muted/30">
        <CardContent className="py-4 text-center">
          <p className="text-sm italic text-muted-foreground">
            &ldquo;70 million people worldwide stutter. You&apos;re part of a community that&apos;s choosing to grow every single day.&rdquo;
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
