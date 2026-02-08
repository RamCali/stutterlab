"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck,
  Flame,
  Clock,
  Heart,
  Shield,
} from "lucide-react";

interface BuddyInfo {
  id: string;
  buddyName: string;
  myName: string;
  sharedStreak: number;
  createdAt: string;
  lastActiveAt: string;
}

/** Full Accountability Buddy panel */
export function AccountabilityBuddy() {
  const { data: session } = useSession();
  const [buddy, setBuddy] = useState<BuddyInfo | null>(null);
  const [cheered, setCheered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBuddy() {
      try {
        const res = await fetch("/api/community/buddy");
        if (res.ok) {
          const data = await res.json();
          if (data.buddy) setBuddy(data.buddy);
        }
      } catch {
        // No buddy
      }
    }
    if (session?.user) fetchBuddy();
  }, [session]);

  async function pairUp() {
    setLoading(true);
    try {
      const res = await fetch("/api/community/buddy", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.buddy) setBuddy(data.buddy);
      }
    } catch {
      // Failed
    } finally {
      setLoading(false);
    }
  }

  function cheerBuddy() {
    setCheered(true);
    setTimeout(() => setCheered(false), 3000);
  }

  function timeAgo(dateStr: string): string {
    const ms = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  if (!buddy) {
    return (
      <Card className="border-dashed border-2 border-primary/20">
        <CardContent className="py-6 text-center">
          <UserCheck className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-sm mb-1">Accountability Buddy</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
            Get paired with an anonymous practice partner. See each other&apos;s streaks
            and cheer each other on — without revealing identities.
          </p>
          <Button onClick={pairUp} disabled={loading || !session?.user}>
            <UserCheck className="h-4 w-4 mr-1" />
            {loading ? "Finding..." : !session?.user ? "Sign in to find a buddy" : "Find a Buddy"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <UserCheck className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold">Your Accountability Buddy</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">
                {buddy.buddyName.split(" ").map((w) => w[0]).join("")}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#00E676] border-2 border-background" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{buddy.buddyName}</p>
              <Badge variant="secondary" className="text-[9px]">Paired</Badge>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Flame className="h-3 w-3 text-orange-500" />
                {buddy.sharedStreak} day streak
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeAgo(buddy.lastActiveAt)}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant={cheered ? "default" : "outline"}
              className="text-xs"
              onClick={cheerBuddy}
            >
              {cheered ? (
                <>
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  Sent!
                </>
              ) : (
                <>
                  <Heart className="h-3 w-3 mr-1" />
                  Cheer
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Streak shield offer */}
        <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Shield className="h-3 w-3 text-blue-500" />
            Send a Streak Shield to protect their streak
          </span>
          <Button size="sm" variant="ghost" className="text-[10px] h-6 px-2">
            Gift
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Compact buddy widget for dashboard */
export function AccountabilityBuddyCompact() {
  const { data: session } = useSession();
  const [buddy, setBuddy] = useState<BuddyInfo | null>(null);

  useEffect(() => {
    async function fetchBuddy() {
      try {
        const res = await fetch("/api/community/buddy");
        if (res.ok) {
          const data = await res.json();
          if (data.buddy) setBuddy(data.buddy);
        }
      } catch { /* no buddy */ }
    }
    if (session?.user) fetchBuddy();
  }, [session]);

  if (!buddy) {
    return (
      <Card className="cursor-pointer hover:border-primary/50 transition-colors"
        onClick={async () => {
          if (!session?.user) return;
          try {
            const res = await fetch("/api/community/buddy", { method: "POST" });
            if (res.ok) {
              const data = await res.json();
              if (data.buddy) setBuddy(data.buddy);
            }
          } catch { /* */ }
        }}
      >
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">Find an Accountability Buddy</p>
              <p className="text-[10px] text-muted-foreground">
                Anonymous partner to keep you on track
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
              {buddy.buddyName.split(" ").map((w) => w[0]).join("")}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#00E676] border-2 border-background" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">{buddy.buddyName}</p>
            <p className="text-[10px] text-muted-foreground">
              <Flame className="h-2.5 w-2.5 inline text-orange-500" /> {buddy.sharedStreak} day streak
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
