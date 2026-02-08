"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Star,
  Gauge,
  Music,
  Hand,
  Timer,
  Share2,
  RotateCcw,
  Check,
  AudioWaveform,
  Sparkles,
} from "lucide-react";
import type { EchoClip } from "./echo-clip-card";

export interface ShadowingScore {
  overallScore: number; // 0-100
  rhythmMatch: number; // 0-100
  techniqueAccuracy: number; // 0-100
  paceMatch: number; // 0-100
  stars: number; // 1-3
  feedback: string;
  techniqueNotes: string;
  xpEarned: number;
}

interface ShadowingScoreCardProps {
  clip: EchoClip;
  score: ShadowingScore;
  onRetry: () => void;
  onShare: () => void;
  onNext: () => void;
}

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-16 w-16">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/30"
          />
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          {value}
        </span>
      </div>
      <span className="text-[9px] text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export function ShadowingScoreCard({ clip, score, onRetry, onShare, onNext }: ShadowingScoreCardProps) {
  const [shared, setShared] = useState(false);

  const starLabels = ["", "Good Start!", "Great Job!", "Perfect Echo!"];

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardContent className="py-0 px-0">
        {/* Hero score section */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 px-6 py-6 text-center">
          {/* Stars */}
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`h-8 w-8 transition-all duration-500 ${
                  s <= score.stars
                    ? "text-amber-400 fill-amber-400 scale-100"
                    : "text-muted/30 scale-75"
                }`}
                style={{ transitionDelay: `${s * 200}ms` }}
              />
            ))}
          </div>
          <p className="text-sm font-semibold text-primary mb-1">
            {starLabels[score.stars]}
          </p>
          <p className="text-4xl font-bold">{score.overallScore}</p>
          <p className="text-xs text-muted-foreground">Overall Score</p>

          {/* XP earned */}
          <Badge className="mt-2 bg-amber-500/10 text-amber-500">
            <Sparkles className="h-3 w-3 mr-1" />
            +{score.xpEarned} XP
          </Badge>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Score breakdown */}
          <div className="flex justify-around">
            <ScoreRing value={score.rhythmMatch} label="Rhythm" color="hsl(var(--primary))" />
            <ScoreRing value={score.techniqueAccuracy} label="Technique" color="#00E676" />
            <ScoreRing value={score.paceMatch} label="Pace" color="#FFB347" />
          </div>

          {/* Feedback */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs font-medium mb-1">Coach Feedback</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {score.feedback}
            </p>
          </div>

          {/* Technique notes */}
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs font-medium mb-1">Technique: {clip.technique}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {score.techniqueNotes}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onRetry}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Try Again
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onShare();
                setShared(true);
                setTimeout(() => setShared(false), 2000);
              }}
            >
              {shared ? <Check className="h-4 w-4 mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
              {shared ? "Shared!" : "Share"}
            </Button>
            <Button className="flex-1" onClick={onNext}>
              Next Echo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Shareable story card — designed for Instagram/TikTok screenshots */
export function ShadowingStoryCard({
  clip,
  score,
}: {
  clip: EchoClip;
  score: ShadowingScore;
}) {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 overflow-hidden max-w-sm mx-auto">
      <CardContent className="relative py-8 px-6 text-center">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-6 right-6 w-32 h-32 rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute bottom-6 left-6 w-24 h-24 rounded-full bg-[#00E676]/30 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center justify-center gap-2 mb-6">
          <div className="h-6 w-6 rounded-lg bg-blue-500 flex items-center justify-center">
            <AudioWaveform className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs font-bold">StutterLab</span>
        </div>

        {/* Stars */}
        <div className="relative flex justify-center gap-1 mb-2">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`h-10 w-10 ${
                s <= score.stars
                  ? "text-amber-400 fill-amber-400"
                  : "text-white/10"
              }`}
            />
          ))}
        </div>

        {/* Score */}
        <p className="relative text-5xl font-bold mb-1">{score.overallScore}</p>
        <p className="relative text-xs text-white/50 mb-4">SHADOWING SCORE</p>

        {/* Technique */}
        <div className="relative p-3 rounded-lg bg-white/5 mb-4">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
            Technique
          </p>
          <p className="text-sm font-medium">{clip.technique}</p>
        </div>

        {/* Sub-scores */}
        <div className="relative flex justify-around mb-6">
          {[
            { label: "Rhythm", value: score.rhythmMatch },
            { label: "Technique", value: score.techniqueAccuracy },
            { label: "Pace", value: score.paceMatch },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[9px] text-white/40">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="relative text-[10px] text-white/30">
          stutterlab.com — Evidence-based speech practice
        </p>
      </CardContent>
    </Card>
  );
}
