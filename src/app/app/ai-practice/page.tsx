"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Phone,
  Briefcase,
  Coffee,
  GraduationCap,
  ShoppingCart,
  Users,
  MapPin,
  Headphones,
  MessageSquare,
  Sparkles,
  Star,
  Lock,
  Crown,
  Zap,
} from "lucide-react";
import { getPrioritizedScenarioIds } from "@/lib/onboarding/feared-situations";
import { checkAISimUsage } from "@/lib/auth/premium";
import type { PlanTier } from "@/lib/auth/premium";

const scenarios = [
  {
    id: "phone-call",
    title: "Phone Call",
    description: "Practice making and receiving phone calls. The AI will call you and you respond naturally.",
    icon: Phone,
    color: "text-red-500",
    bg: "bg-red-500/10",
    difficulty: "Hard",
    isPhoneSimulator: true,
  },
  {
    id: "job-interview",
    title: "Job Interview",
    description: "Practice answering common interview questions. The AI adapts to your field and experience level.",
    icon: Briefcase,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    difficulty: "Hard",
    isPhoneSimulator: false,
  },
  {
    id: "ordering-food",
    title: "Ordering Food",
    description: "Practice ordering at a restaurant or coffee shop. Start simple and increase complexity.",
    icon: Coffee,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    difficulty: "Medium",
    isPhoneSimulator: false,
  },
  {
    id: "class-presentation",
    title: "Class Presentation",
    description: "Practice giving a presentation. The AI provides an audience with questions.",
    icon: GraduationCap,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    difficulty: "Hard",
    isPhoneSimulator: false,
  },
  {
    id: "small-talk",
    title: "Small Talk",
    description: "Practice casual conversation at a party or social gathering. Natural, flowing dialogue.",
    icon: Users,
    color: "text-green-500",
    bg: "bg-green-500/10",
    difficulty: "Easy",
    isPhoneSimulator: false,
  },
  {
    id: "shopping",
    title: "Shopping / Returns",
    description: "Practice asking for help in a store, returning items, or making complaints.",
    icon: ShoppingCart,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    difficulty: "Medium",
    isPhoneSimulator: false,
  },
  {
    id: "asking-directions",
    title: "Asking for Directions",
    description: "Practice asking strangers for directions and following up with clarifying questions.",
    icon: MapPin,
    color: "text-yellow-600",
    bg: "bg-yellow-500/10",
    difficulty: "Easy",
    isPhoneSimulator: false,
  },
  {
    id: "customer-service",
    title: "Customer Service Call",
    description: "Practice calling customer service to resolve an issue. The AI simulates wait times and transfers.",
    icon: Headphones,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    difficulty: "Hard",
    isPhoneSimulator: true,
  },
  {
    id: "meeting-intro",
    title: "Meeting Introduction",
    description: "Practice introducing yourself in a professional meeting or conference.",
    icon: MessageSquare,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    difficulty: "Medium",
    isPhoneSimulator: false,
  },
];

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-500/10 text-green-600",
  Medium: "bg-yellow-500/10 text-yellow-700",
  Hard: "bg-red-500/10 text-red-600",
};

export default function AIPracticePage() {
  const [usage, setUsage] = useState<{
    used: number;
    limit: number;
    canStart: boolean;
    plan: PlanTier;
  } | null>(null);

  useEffect(() => {
    checkAISimUsage().then(setUsage).catch(() => {});
  }, []);

  const sortedScenarios = useMemo(() => {
    const prioritized = getPrioritizedScenarioIds();
    if (prioritized.length === 0) return scenarios;

    const prioritySet = new Set(prioritized);
    const top = scenarios.filter((s) => prioritySet.has(s.id));
    const rest = scenarios.filter((s) => !prioritySet.has(s.id));

    // Sort top by priority order
    top.sort((a, b) => prioritized.indexOf(a.id) - prioritized.indexOf(b.id));

    return [...top, ...rest];
  }, []);

  const prioritizedIds = useMemo(() => new Set(getPrioritizedScenarioIds()), []);

  const isLocked = usage !== null && !usage.canStart;
  const needsUpgrade = usage !== null && (usage.plan === "free" || usage.plan === "core");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          AI Situation Simulators
        </h1>
        <p className="text-muted-foreground mt-1">
          Practice real-world speaking scenarios with an AI partner that adapts
          to your fluency level. Not scripted -- every conversation is unique.
        </p>
      </div>

      {/* Usage Status Banner */}
      {usage && (
        <UsageBanner
          plan={usage.plan}
          used={usage.used}
          limit={usage.limit}
          canStart={usage.canStart}
        />
      )}

      {/* Phone Call Simulator Banner */}
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/10">
              <Phone className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2">
                Phone Call Simulator
                <Badge variant="secondary" className="text-[10px]">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                The most realistic phone practice available. The AI &ldquo;calls&rdquo; you
                with a ring sound -- pick up and have a natural conversation.
                Designed specifically for phone anxiety.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios Grid */}
      {prioritizedIds.size > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Star className="h-3 w-3 text-amber-500" />
          Scenarios marked with a star are prioritized based on your profile
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedScenarios.map((scenario) => {
          const card = (
            <Card className={`transition-colors h-full ${
              isLocked ? "opacity-60" : "hover:border-primary/50 cursor-pointer"
            } ${prioritizedIds.has(scenario.id) ? "border-amber-500/30" : ""}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${scenario.bg} shrink-0`}>
                    <scenario.icon className={`h-5 w-5 ${scenario.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{scenario.title}</h3>
                      {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                      {prioritizedIds.has(scenario.id) && (
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                      {scenario.isPhoneSimulator && (
                        <Badge variant="outline" className="text-[10px]">
                          Phone Sim
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {scenario.description}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`mt-3 text-[10px] ${difficultyColors[scenario.difficulty]}`}
                    >
                      {scenario.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          if (isLocked) {
            return <div key={scenario.id}>{card}</div>;
          }

          return (
            <Link key={scenario.id} href={`/ai-practice/${scenario.id}`}>
              {card}
            </Link>
          );
        })}
      </div>

    </div>
  );
}

function UsageBanner({
  plan,
  used,
  limit,
  canStart,
}: {
  plan: PlanTier;
  used: number;
  limit: number;
  canStart: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade(targetPlan: PlanTier) {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  // Free/Core users: no access at all
  if (plan === "free" || plan === "core") {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI Simulations require Pro or Elite</p>
                <p className="text-xs text-muted-foreground">
                  Pro: 1 session/week. Elite: unlimited sessions.
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => handleUpgrade("pro")} disabled={loading}>
              <Crown className="h-4 w-4 mr-1" />
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Elite/SLP: unlimited
  if (limit === Infinity) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          <Zap className="h-3 w-3 mr-1" />
          Unlimited Simulations
        </Badge>
      </div>
    );
  }

  // Pro: show usage
  const remaining = Math.max(0, limit - used);

  if (!canStart) {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Lock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">Weekly limit reached</p>
                <p className="text-xs text-muted-foreground">
                  You&apos;ve used your {limit} simulation{limit !== 1 ? "s" : ""} this week. Resets Monday.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => handleUpgrade("elite")} disabled={loading}>
              <Zap className="h-4 w-4 mr-1" />
              Go Elite
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="text-xs">
        <Brain className="h-3 w-3 mr-1" />
        {remaining} of {limit} simulation{limit !== 1 ? "s" : ""} remaining this week
      </Badge>
    </div>
  );
}
