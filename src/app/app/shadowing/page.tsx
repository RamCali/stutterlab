"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AudioWaveform,
  Filter,
  Flame,
  Mic,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { EchoClipCard, type EchoClip } from "@/components/shadowing/echo-clip-card";
import { ShadowingRecorder } from "@/components/shadowing/shadowing-recorder";
import {
  ShadowingScoreCard,
  ShadowingStoryCard,
  type ShadowingScore,
} from "@/components/shadowing/shadowing-score-card";

// ─── Sample Echo Clips ───────────────────────────────────────
const sampleClips: EchoClip[] = [
  {
    id: "echo-1",
    author: "Dr. Sarah Chen",
    authorRole: "slp",
    technique: "Gentle Onset",
    title: "Morning greeting flow",
    transcript: "Good morning everyone. I hope you all had a wonderful evening and are ready for a great day.",
    durationSeconds: 8,
    audioUrl: null,
    shadowCount: 342,
    heartCount: 89,
    difficulty: "beginner",
    xpReward: 15,
  },
  {
    id: "echo-2",
    author: "FluencyJay",
    authorRole: "influencer",
    technique: "Prolonged Speech",
    title: "Ordering coffee with ease",
    transcript: "Hi, can I please get a large iced latte with oat milk and an extra shot of espresso?",
    durationSeconds: 7,
    audioUrl: null,
    shadowCount: 518,
    heartCount: 156,
    difficulty: "beginner",
    xpReward: 15,
  },
  {
    id: "echo-3",
    author: "Dr. Sarah Chen",
    authorRole: "slp",
    technique: "Light Contact",
    title: "Phone call confidence",
    transcript: "Hello, this is Alex calling to confirm my appointment tomorrow at three o'clock. Could you verify that for me?",
    durationSeconds: 9,
    audioUrl: null,
    shadowCount: 287,
    heartCount: 72,
    difficulty: "intermediate",
    xpReward: 25,
  },
  {
    id: "echo-4",
    author: "SpeakEasy",
    authorRole: "community",
    technique: "Pacing & Pausing",
    title: "Meeting introduction",
    transcript: "My name is Jordan, and I lead the product design team. I'm excited to share our progress this quarter.",
    durationSeconds: 8,
    audioUrl: null,
    shadowCount: 194,
    heartCount: 63,
    difficulty: "intermediate",
    xpReward: 25,
  },
  {
    id: "echo-5",
    author: "Dr. Mark Rivera",
    authorRole: "slp",
    technique: "Cancellation",
    title: "Handling a tough word",
    transcript: "I'd like to specifically recommend the comprehensive evaluation report for the quarterly review.",
    durationSeconds: 8,
    audioUrl: null,
    shadowCount: 156,
    heartCount: 48,
    difficulty: "advanced",
    xpReward: 40,
  },
  {
    id: "echo-6",
    author: "FlowState",
    authorRole: "influencer",
    technique: "Prolonged Speech",
    title: "Returning an item",
    transcript: "Excuse me, I purchased this jacket last week but it doesn't fit. Could I exchange it for a different size?",
    durationSeconds: 9,
    audioUrl: null,
    shadowCount: 231,
    heartCount: 91,
    difficulty: "beginner",
    xpReward: 15,
  },
];

type View = "feed" | "recording" | "score";
type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

export default function ShadowingPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<View>("feed");
  const [activeClip, setActiveClip] = useState<EchoClip | null>(null);
  const [score, setScore] = useState<ShadowingScore | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [earnedXP, setEarnedXP] = useState(0);
  const [filter, setFilter] = useState<DifficultyFilter>("all");
  const [scoring, setScoring] = useState(false);

  // Load completed clips and XP from DB on mount
  useEffect(() => {
    async function loadScores() {
      try {
        const res = await fetch("/api/shadowing/scores");
        if (res.ok) {
          const data = await res.json();
          if (data.scores?.length) {
            const ids = new Set<string>(data.scores.map((s: { clipId: string }) => s.clipId));
            setCompletedIds(ids);
            const xp = data.scores.reduce((sum: number, s: { xpEarned: number }) => sum + (s.xpEarned || 0), 0);
            setEarnedXP(xp);
          }
        }
      } catch {
        // Use local state only
      }
    }
    if (session?.user) loadScores();
  }, [session]);

  const filtered = filter === "all"
    ? sampleClips
    : sampleClips.filter((c) => c.difficulty === filter);

  function handleShadow(clip: EchoClip) {
    setActiveClip(clip);
    setScore(null);
    setView("recording");
  }

  async function handleSubmit(recording: Blob) {
    if (!activeClip) return;
    setScoring(true);

    try {
      const formData = new FormData();
      formData.append("audio", recording, "shadow.webm");
      formData.append("clipId", activeClip.id);
      formData.append("technique", activeClip.technique);
      formData.append("transcript", activeClip.transcript);
      formData.append("durationSeconds", String(activeClip.durationSeconds));

      const res = await fetch("/api/score-shadowing", {
        method: "POST",
        body: formData,
      });

      let finalScore: ShadowingScore;
      if (res.ok) {
        const data = await res.json();
        finalScore = data.score;
      } else {
        finalScore = generateDemoScore(activeClip);
      }
      setScore(finalScore);

      // Persist score to DB
      if (session?.user && finalScore) {
        try {
          await fetch("/api/shadowing/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clipId: activeClip.id,
              technique: activeClip.technique,
              ...finalScore,
            }),
          });
          setEarnedXP((prev) => prev + (finalScore.xpEarned || 0));
        } catch {
          // Score displayed locally even if save fails
        }
      }
    } catch {
      const fallback = generateDemoScore(activeClip);
      setScore(fallback);
    } finally {
      setScoring(false);
      setView("score");
    }
  }

  function handleRetry() {
    setScore(null);
    setView("recording");
  }

  function handleNext() {
    if (activeClip) {
      setCompletedIds((prev) => new Set([...prev, activeClip.id]));
    }
    const currentIdx = sampleClips.findIndex((c) => c.id === activeClip?.id);
    const nextClip = sampleClips[(currentIdx + 1) % sampleClips.length];
    setActiveClip(nextClip);
    setScore(null);
    setView("recording");
  }

  function handleShare() {
    // Scroll to story card for screenshot
    const storyEl = document.getElementById("story-card");
    if (storyEl) {
      storyEl.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleBack() {
    if (activeClip && score) {
      setCompletedIds((prev) => new Set([...prev, activeClip.id]));
    }
    setView("feed");
    setActiveClip(null);
    setScore(null);
  }

  const totalXP = earnedXP > 0
    ? earnedXP
    : sampleClips
        .filter((c) => completedIds.has(c.id))
        .reduce((sum, c) => sum + c.xpReward, 0);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mic className="h-6 w-6 text-primary" />
          Shadowing Challenge
        </h1>
        <p className="text-muted-foreground mt-1">
          Listen to Echo clips, then shadow them. AI scores your technique.
        </p>
      </div>

      {view === "feed" && (
        <>
          {/* Stats bar */}
          <div className="flex gap-3">
            <Card className="flex-1">
              <CardContent className="py-3 text-center">
                <div className="flex items-center justify-center gap-1 text-primary">
                  <Trophy className="h-4 w-4" />
                  <span className="text-lg font-bold">{completedIds.size}</span>
                </div>
                <p className="text-[9px] text-muted-foreground">Echoes Shadowed</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="py-3 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-lg font-bold">{totalXP}</span>
                </div>
                <p className="text-[9px] text-muted-foreground">XP Earned</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="py-3 text-center">
                <div className="flex items-center justify-center gap-1 text-orange-500">
                  <Flame className="h-4 w-4" />
                  <span className="text-lg font-bold">{Math.min(completedIds.size, 3)}</span>
                </div>
                <p className="text-[9px] text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {(["all", "beginner", "intermediate", "advanced"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "ghost"}
                size="sm"
                className="text-xs capitalize"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>

          {/* Echo clips feed */}
          <div className="space-y-4">
            {filtered.map((clip) => (
              <EchoClipCard
                key={clip.id}
                clip={clip}
                onShadow={handleShadow}
                completed={completedIds.has(clip.id)}
              />
            ))}
          </div>

          {/* Community stats */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">1,728 echoes shadowed today</p>
                  <p className="text-xs text-muted-foreground">
                    Join the community and practice together
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {view === "recording" && activeClip && (
        <>
          <Button variant="ghost" size="sm" onClick={handleBack}>
            &larr; Back to Echoes
          </Button>
          <ShadowingRecorder
            clip={activeClip}
            onSubmit={handleSubmit}
            onCancel={handleBack}
          />
          {scoring && (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="animate-pulse space-y-2">
                  <AudioWaveform className="h-8 w-8 text-primary mx-auto" />
                  <p className="text-sm font-medium">Analyzing your shadow...</p>
                  <p className="text-xs text-muted-foreground">
                    Comparing rhythm, technique, and pace
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {view === "score" && activeClip && score && (
        <>
          <Button variant="ghost" size="sm" onClick={handleBack}>
            &larr; Back to Echoes
          </Button>
          <ShadowingScoreCard
            clip={activeClip}
            score={score}
            onRetry={handleRetry}
            onShare={handleShare}
            onNext={handleNext}
          />

          {/* Shareable story card */}
          <div id="story-card">
            <p className="text-xs text-muted-foreground text-center mb-2">
              Screenshot this card to share your progress!
            </p>
            <ShadowingStoryCard clip={activeClip} score={score} />
          </div>
        </>
      )}
    </div>
  );
}

/** Generate a demo score when the API is unavailable */
function generateDemoScore(clip: EchoClip): ShadowingScore {
  const base = clip.difficulty === "beginner" ? 80 : clip.difficulty === "intermediate" ? 70 : 60;
  const variance = () => Math.floor(Math.random() * 20) - 5;

  const rhythmMatch = Math.min(100, Math.max(40, base + variance()));
  const techniqueAccuracy = Math.min(100, Math.max(40, base - 5 + variance()));
  const paceMatch = Math.min(100, Math.max(40, base + 3 + variance()));
  const overallScore = Math.round((rhythmMatch + techniqueAccuracy + paceMatch) / 3);
  const stars = overallScore >= 85 ? 3 : overallScore >= 65 ? 2 : 1;

  const feedbackOptions: Record<number, string> = {
    3: "Excellent work! Your rhythm and technique are spot-on. Keep this consistency going.",
    2: "Great effort! Your pacing is good. Focus on making the technique feel more natural.",
    1: "Good start! Try listening to the echo a few more times before recording. Match the rhythm first.",
  };

  const techniqueNotes: Record<string, string> = {
    "Gentle Onset": "Focus on starting words with a soft, easy airflow rather than a hard push.",
    "Prolonged Speech": "Stretch the vowels smoothly and maintain consistent airflow throughout.",
    "Light Contact": "Barely touch your tongue/lips on consonants — think gentle, not pressed.",
    "Pacing & Pausing": "Leave natural breathing spaces between phrases. Don't rush to fill silences.",
    "Cancellation": "When you feel a block, pause completely, then restart the word with easy onset.",
  };

  return {
    overallScore,
    rhythmMatch,
    techniqueAccuracy,
    paceMatch,
    stars,
    feedback: feedbackOptions[stars],
    techniqueNotes: techniqueNotes[clip.technique] || "Keep practicing this technique for smoother speech flow.",
    xpEarned: clip.xpReward * stars,
  };
}
