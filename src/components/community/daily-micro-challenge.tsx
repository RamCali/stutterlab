"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Clock,
  Phone,
  ShoppingCart,
  MessageCircle,
  BookOpen,
  Mic,
  HelpCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface MicroChallenge {
  id: string;
  title: string;
  description: string;
  icon: typeof Phone;
  color: string;
  bg: string;
  xp: number;
  technique: string;
  difficulty: "easy" | "medium" | "hard";
}

const challengePool: MicroChallenge[] = [
  {
    id: "phone-call",
    title: "Make a Phone Call",
    description: "Call someone instead of texting. Use gentle onset on the first word.",
    icon: Phone,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    xp: 75,
    technique: "Gentle Onset",
    difficulty: "medium",
  },
  {
    id: "order-food",
    title: "Order at a Counter",
    description: "Order food or coffee in person. Practice light articulatory contact on plosives.",
    icon: ShoppingCart,
    color: "text-green-500",
    bg: "bg-green-500/10",
    xp: 50,
    technique: "Light Contact",
    difficulty: "easy",
  },
  {
    id: "start-conversation",
    title: "Start a Conversation",
    description: "Initiate a conversation with someone new. Pause between phrases.",
    icon: MessageCircle,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    xp: 75,
    technique: "Pacing",
    difficulty: "medium",
  },
  {
    id: "read-aloud",
    title: "Read 5 Minutes Aloud",
    description: "Read a book or article aloud with prolonged speech. Focus on stretching vowels.",
    icon: BookOpen,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    xp: 50,
    technique: "Prolonged Speech",
    difficulty: "easy",
  },
  {
    id: "voice-message",
    title: "Send a Voice Message",
    description: "Record and send a voice message instead of typing. Use pausing between thoughts.",
    icon: Mic,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    xp: 50,
    technique: "Pausing",
    difficulty: "easy",
  },
  {
    id: "ask-question",
    title: "Ask a Question in Public",
    description: "Ask a question in a meeting, class, or store. Use preparatory set before feared words.",
    icon: HelpCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    xp: 100,
    technique: "Preparatory Set",
    difficulty: "hard",
  },
];

function getTodaysChallenge(): MicroChallenge {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return challengePool[dayOfYear % challengePool.length];
}

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

/** Full Daily Micro-Challenge card */
export function DailyMicroChallenge() {
  const { data: session } = useSession();
  const challenge = getTodaysChallenge();
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  useEffect(() => {
    // Check DB first, fall back to localStorage
    async function checkCompletion() {
      if (session?.user) {
        try {
          const res = await fetch("/api/community/micro-challenge");
          if (res.ok) {
            const data = await res.json();
            if (data.completed) {
              setCompleted(true);
              return;
            }
          }
        } catch {
          // Fall through to localStorage
        }
      }
      const today = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem("stutterlab_micro_challenge");
      if (saved === today) setCompleted(true);
    }
    checkCompletion();

    const timer = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 60000);
    return () => clearInterval(timer);
  }, [session]);

  async function complete() {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("stutterlab_micro_challenge", today);
    setCompleted(true);

    if (session?.user) {
      try {
        await fetch("/api/community/micro-challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            challengeTitle: challenge.title,
            technique: challenge.technique,
          }),
        });
      } catch {
        // localStorage already saved as backup
      }
    }
  }

  const difficultyColors = {
    easy: "bg-[#00E676]/10 text-[#00E676]",
    medium: "bg-[#FFB347]/10 text-[#FFB347]",
    hard: "bg-[#FF5252]/10 text-[#FF5252]",
  };

  return (
    <Card className={completed ? "border-[#00E676]/50 bg-[#00E676]/5" : "border-primary/20"}>
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold">Daily Micro-Challenge</p>
          <Badge variant="secondary" className="text-[9px] ml-auto flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {timeLeft} left
          </Badge>
        </div>

        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg ${challenge.bg} flex-shrink-0`}>
            <challenge.icon className={`h-5 w-5 ${challenge.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-medium text-sm">{challenge.title}</h3>
              <Badge className={`text-[9px] ${difficultyColors[challenge.difficulty]}`}>
                {challenge.difficulty}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{challenge.description}</p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">
                Technique: <span className="font-medium text-foreground">{challenge.technique}</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                <Sparkles className="h-2.5 w-2.5 inline text-amber-500" /> +{challenge.xp} XP
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3">
          {completed ? (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#00E676]/10">
              <CheckCircle2 className="h-4 w-4 text-[#00E676]" />
              <p className="text-xs font-medium text-[#00E676]">
                Completed! +{challenge.xp} XP earned. Come back tomorrow for a new challenge.
              </p>
            </div>
          ) : (
            <Button className="w-full" onClick={complete}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              I Did This!
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Compact for dashboard */
export function DailyMicroChallengeCompact() {
  const { data: session } = useSession();
  const challenge = getTodaysChallenge();
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  useEffect(() => {
    async function checkCompletion() {
      if (session?.user) {
        try {
          const res = await fetch("/api/community/micro-challenge");
          if (res.ok) {
            const data = await res.json();
            if (data.completed) { setCompleted(true); return; }
          }
        } catch { /* fall through */ }
      }
      const today = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem("stutterlab_micro_challenge");
      if (saved === today) setCompleted(true);
    }
    checkCompletion();

    const timer = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 60000);
    return () => clearInterval(timer);
  }, [session]);

  if (completed) {
    return (
      <Card className="border-[#00E676]/30 bg-[#00E676]/5">
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#00E676]" />
            <div className="flex-1">
              <p className="text-xs font-medium text-[#00E676]">Daily Challenge Complete!</p>
              <p className="text-[10px] text-muted-foreground">
                +{challenge.xp} XP — New challenge tomorrow
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="py-3">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${challenge.bg} flex-shrink-0`}>
            <challenge.icon className={`h-4 w-4 ${challenge.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">{challenge.title}</p>
            <p className="text-[10px] text-muted-foreground">
              +{challenge.xp} XP — {timeLeft} left
            </p>
          </div>
          <Badge variant="outline" className="text-[9px]">
            <Zap className="h-2.5 w-2.5 mr-0.5" />
            Daily
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
