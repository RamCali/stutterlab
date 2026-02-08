"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Gift,
  Heart,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";

interface UserStatsData {
  streakFreezeTokens: number;
}

interface ShieldRequest {
  id: string;
  anonymousName: string;
  streak: number;
  message: string;
  timeAgo: string;
}

// Default requests — in production these would come from an API
const defaultShieldRequests: ShieldRequest[] = [
  {
    id: "1",
    anonymousName: "Calm River",
    streak: 21,
    message: "Sick today and can't practice. Don't want to lose my 21-day streak!",
    timeAgo: "1h ago",
  },
  {
    id: "2",
    anonymousName: "Bold Eagle",
    streak: 14,
    message: "Traveling for work, no headphones for Audio Lab.",
    timeAgo: "3h ago",
  },
  {
    id: "3",
    anonymousName: "Silver Fox",
    streak: 45,
    message: "Family emergency today. 45-day streak at risk.",
    timeAgo: "5h ago",
  },
];

export function StreakShields() {
  const { data: session } = useSession();
  const [available, setAvailable] = useState(0);
  const [sentShields, setSentShields] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/user/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setAvailable(data.stats.streakFreezeTokens || 0);
          }
        }
      } catch {
        // Use default 0
      }
    }
    if (session?.user) fetchStats();
  }, [session]);

  async function sendShield(requestId: string) {
    setSentShields((prev) => new Set([...prev, requestId]));
    setAvailable((prev) => Math.max(0, prev - 1));

    if (session?.user) {
      try {
        await fetch("/api/user/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "use_streak_shield" }),
        });
      } catch {
        // Optimistic UI
      }
    }
  }

  const displayed = showAll ? defaultShieldRequests : defaultShieldRequests.slice(0, 2);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Streak Shields
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Protect your streak or gift a shield to someone who needs it
        </p>
      </div>

      {/* Your shields */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-3 text-center">
            <Shield className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{available}</p>
            <p className="text-[9px] text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <Heart className="h-5 w-5 text-pink-500 mx-auto mb-1" />
            <p className="text-xl font-bold">0</p>
            <p className="text-[9px] text-muted-foreground">Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <Gift className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{sentShields.size}</p>
            <p className="text-[9px] text-muted-foreground">Gifted</p>
          </CardContent>
        </Card>
      </div>

      {/* How shields work */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <p className="text-[10px] text-muted-foreground">
            <span className="font-medium text-foreground">How it works:</span>{" "}
            You earn 1 Streak Shield for every 7-day streak. Use it to protect your own streak
            on a missed day, or gift it to a community member who needs one.
            Each shield protects a streak for 1 day.
          </p>
        </CardContent>
      </Card>

      {/* Shield requests from community */}
      <div>
        <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Community Members Need Help
        </p>
        <div className="space-y-2">
          {displayed.map((req) => {
            const isSent = sentShields.has(req.id);
            return (
              <Card key={req.id}>
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-xs">
                      {req.anonymousName.split(" ").map((w) => w[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{req.anonymousName}</span>
                        <Badge variant="secondary" className="text-[9px]">
                          {req.streak}-day streak
                        </Badge>
                        <span className="text-[9px] text-muted-foreground ml-auto">
                          {req.timeAgo}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {req.message}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={isSent ? "default" : "outline"}
                      className="text-[10px] h-7 px-2.5 flex-shrink-0"
                      disabled={isSent || available === 0}
                      onClick={() => sendShield(req.id)}
                    >
                      {isSent ? (
                        <>
                          <Check className="h-3 w-3 mr-0.5" />
                          Sent
                        </>
                      ) : (
                        <>
                          <Shield className="h-3 w-3 mr-0.5" />
                          Gift
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {defaultShieldRequests.length > 2 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 mx-auto mt-2 text-xs text-primary hover:underline"
          >
            {showAll ? (
              <>Show less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Show all requests <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/** Compact widget showing shield count */
export function StreakShieldCompact() {
  const { data: session } = useSession();
  const [available, setAvailable] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/user/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) setAvailable(data.stats.streakFreezeTokens || 0);
        }
      } catch { /* */ }
    }
    if (session?.user) fetchStats();
  }, [session]);

  return (
    <Card className="hover:border-blue-500/50 transition-colors">
      <CardContent className="py-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <Shield className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">{available} Streak Shields</p>
            <p className="text-[10px] text-muted-foreground">
              Protect your streak or gift to someone
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
