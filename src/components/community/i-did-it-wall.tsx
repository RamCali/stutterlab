"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PartyPopper,
  Phone,
  Users,
  ShoppingCart,
  HelpCircle,
  Presentation,
  MessageCircle,
  HandHeart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const victoryTypes = [
  { id: "phone_call", label: "Made a Phone Call", icon: Phone, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "meeting", label: "Spoke in Meeting", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "order", label: "Ordered Food/Coffee", icon: ShoppingCart, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "asked_help", label: "Asked for Help", icon: HelpCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "presentation", label: "Gave a Presentation", icon: Presentation, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "conversation", label: "Started Conversation", icon: MessageCircle, color: "text-cyan-500", bg: "bg-cyan-500/10" },
];

interface Victory {
  id: string;
  victoryType: string;
  anonymousName: string;
  celebrateCount: number;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function IDidItWall() {
  const { data: session } = useSession();
  const [showPicker, setShowPicker] = useState(false);
  const [justPosted, setJustPosted] = useState<string | null>(null);
  const [celebrated, setCelebrated] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [victories, setVictories] = useState<Victory[]>([]);
  const [totalWeekly, setTotalWeekly] = useState(0);

  const fetchVictories = useCallback(async () => {
    try {
      const res = await fetch("/api/community/victories");
      if (res.ok) {
        const data = await res.json();
        setVictories(data.victories || []);
        setTotalWeekly(data.victories?.length || 0);
      }
    } catch {
      // Keep existing state
    }
  }, []);

  useEffect(() => {
    fetchVictories();
  }, [fetchVictories]);

  async function postVictory(typeId: string) {
    setJustPosted(typeId);
    setShowPicker(false);

    if (session?.user) {
      try {
        await fetch("/api/community/victories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ victoryType: typeId }),
        });
        fetchVictories();
      } catch {
        // Still show confirmation even if save fails
      }
    }

    setTimeout(() => setJustPosted(null), 3000);
  }

  async function celebrate(victoryId: string) {
    setCelebrated((prev) => {
      const next = new Set(prev);
      if (next.has(victoryId)) next.delete(victoryId);
      else next.add(victoryId);
      return next;
    });

    if (session?.user) {
      try {
        await fetch("/api/community/victories/celebrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ victoryId }),
        });
      } catch {
        // Optimistic UI — no rollback needed
      }
    }
  }

  const displayed = showAll ? victories : victories.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-primary" />
            I Did It!
          </h2>
          <p className="text-xs text-muted-foreground">
            Celebrate real-world speaking victories
          </p>
        </div>
        <Button onClick={() => setShowPicker(!showPicker)}>
          <PartyPopper className="h-4 w-4 mr-1" />
          I Did It!
        </Button>
      </div>

      {/* Victory type picker */}
      {showPicker && (
        <Card className="border-primary/30">
          <CardContent className="py-4">
            <p className="text-sm font-medium mb-3">What did you do?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {victoryTypes.map((vt) => (
                <button
                  key={vt.id}
                  onClick={() => postVictory(vt.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border hover:border-primary/50 transition-colors text-left ${vt.bg}`}
                >
                  <vt.icon className={`h-4 w-4 ${vt.color} flex-shrink-0`} />
                  <span className="text-xs font-medium">{vt.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Just posted confirmation */}
      {justPosted && (() => {
        const vt = victoryTypes.find((v) => v.id === justPosted);
        return (
          <Card className="border-[#00E676]/50 bg-[#00E676]/5 animate-in fade-in duration-300">
            <CardContent className="py-3 text-center">
              <p className="text-sm font-medium">
                You did it! {vt?.label} — that took courage.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                The community is celebrating with you.
              </p>
            </CardContent>
          </Card>
        );
      })()}

      {/* Victory feed */}
      <div className="space-y-2">
        {displayed.map((victory) => {
          const vt = victoryTypes.find((v) => v.id === victory.victoryType);
          if (!vt) return null;
          const isCelebrated = celebrated.has(victory.id);

          return (
            <Card key={victory.id} className="hover:border-primary/20 transition-colors">
              <CardContent className="py-2.5">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${vt.bg} flex-shrink-0`}>
                    <vt.icon className={`h-3.5 w-3.5 ${vt.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">
                      {victory.anonymousName} {vt.label.toLowerCase()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {timeAgo(victory.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => celebrate(victory.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] transition-colors ${
                      isCelebrated
                        ? "bg-pink-500/10 text-pink-500"
                        : "bg-muted/50 text-muted-foreground hover:bg-pink-500/10 hover:text-pink-500"
                    }`}
                  >
                    <HandHeart className="h-3 w-3" />
                    {victory.celebrateCount + (isCelebrated ? 1 : 0)}
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {victories.length === 0 && (
          <Card className="bg-muted/30">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-foreground">
                No victories yet. Be the first to share one!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {victories.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 mx-auto text-xs text-primary hover:underline"
        >
          {showAll ? (
            <>
              Show less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Show all victories <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}

      {/* Weekly victory count */}
      <Card className="bg-muted/30">
        <CardContent className="py-3 text-center">
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{totalWeekly} real-world victories</span>{" "}
            shared this week. Every one of them took courage.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/** Compact I Did It button for dashboard */
export function IDidItButton() {
  const { data: session } = useSession();
  const [showPicker, setShowPicker] = useState(false);
  const [justPosted, setJustPosted] = useState<string | null>(null);

  async function postVictory(typeId: string) {
    setJustPosted(typeId);
    setShowPicker(false);

    if (session?.user) {
      try {
        await fetch("/api/community/victories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ victoryType: typeId }),
        });
      } catch {
        // Silent fail
      }
    }

    setTimeout(() => setJustPosted(null), 3000);
  }

  if (justPosted) {
    const vt = victoryTypes.find((v) => v.id === justPosted);
    return (
      <Card className="border-[#00E676]/50 bg-[#00E676]/5">
        <CardContent className="py-3 text-center">
          <PartyPopper className="h-5 w-5 text-[#00E676] mx-auto mb-1" />
          <p className="text-xs font-medium">{vt?.label}!</p>
          <p className="text-[10px] text-muted-foreground">That took courage.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <Card
        className="cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setShowPicker(!showPicker)}
      >
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00E676]/10">
              <PartyPopper className="h-5 w-5 text-[#00E676]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">I Did It!</p>
              <p className="text-xs text-muted-foreground">
                Celebrate a real-world speaking victory
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPicker && (
        <div className="grid grid-cols-2 gap-2">
          {victoryTypes.map((vt) => (
            <button
              key={vt.id}
              onClick={() => postVictory(vt.id)}
              className={`flex items-center gap-2 p-2.5 rounded-lg border hover:border-primary/50 transition-colors text-left ${vt.bg}`}
            >
              <vt.icon className={`h-3.5 w-3.5 ${vt.color} flex-shrink-0`} />
              <span className="text-[10px] font-medium">{vt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
