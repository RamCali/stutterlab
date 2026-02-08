"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Mic,
  RotateCcw,
  Users,
  Heart,
  Crown,
  CheckCircle2,
} from "lucide-react";

export interface EchoClip {
  id: string;
  author: string;
  authorRole: "slp" | "influencer" | "community";
  technique: string;
  title: string;
  transcript: string;
  durationSeconds: number;
  audioUrl: string | null; // null = demo mode with TTS
  shadowCount: number;
  heartCount: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  xpReward: number;
}

interface EchoClipCardProps {
  clip: EchoClip;
  onShadow: (clip: EchoClip) => void;
  completed?: boolean;
}

export function EchoClipCard({ clip, onShadow, completed }: EchoClipCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hearted, setHearted] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const authorColors: Record<string, string> = {
    slp: "text-blue-500 bg-blue-500/10",
    influencer: "text-purple-500 bg-purple-500/10",
    community: "text-green-500 bg-green-500/10",
  };

  const difficultyColors: Record<string, string> = {
    beginner: "bg-[#00E676]/10 text-[#00E676]",
    intermediate: "bg-[#FFB347]/10 text-[#FFB347]",
    advanced: "bg-[#FF5252]/10 text-[#FF5252]",
  };

  function playClip() {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Use Web Speech API for demo (in production: play audioUrl)
    const utterance = new SpeechSynthesisUtterance(clip.transcript);
    utterance.rate = 0.8; // Slightly slow to model good technique
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlaying(false);
    synthRef.current = utterance;
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <Card className={`transition-colors ${completed ? "border-[#00E676]/30 bg-[#00E676]/5" : "hover:border-primary/30"}`}>
      <CardContent className="py-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${authorColors[clip.authorRole]}`}>
            {clip.author.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium">{clip.author}</span>
              {clip.authorRole === "slp" && (
                <Badge variant="outline" className="text-[8px] px-1 py-0">
                  <Crown className="h-2 w-2 mr-0.5" />
                  SLP
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{clip.technique}</span>
          </div>
          <Badge className={`text-[9px] ${difficultyColors[clip.difficulty]}`}>
            {clip.difficulty}
          </Badge>
        </div>

        {/* Title + Transcript */}
        <h3 className="text-sm font-medium mb-1">{clip.title}</h3>
        <div className="p-3 rounded-lg bg-muted/30 mb-3">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            &ldquo;{clip.transcript}&rdquo;
          </p>
        </div>

        {/* Waveform placeholder + Play button */}
        <div className="flex items-center gap-3 mb-3">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full h-10 w-10 p-0 flex-shrink-0"
            onClick={playClip}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          {/* Fake waveform visualization */}
          <div className="flex-1 flex items-center gap-[2px] h-8">
            {Array.from({ length: 40 }).map((_, i) => {
              const height = Math.random() * 100;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-colors ${
                    isPlaying ? "bg-primary" : "bg-muted-foreground/20"
                  }`}
                  style={{ height: `${Math.max(15, height)}%` }}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {clip.durationSeconds}s
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {completed ? (
            <Button variant="outline" className="flex-1 text-[#00E676]" disabled>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Shadowed!
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => onShadow(clip)}>
              <Mic className="h-4 w-4 mr-1" />
              Shadow This Echo
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className={`text-xs ${hearted ? "text-pink-500" : ""}`}
            onClick={() => setHearted(!hearted)}
          >
            <Heart className={`h-3.5 w-3.5 mr-1 ${hearted ? "fill-current" : ""}`} />
            {clip.heartCount + (hearted ? 1 : 0)}
          </Button>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Users className="h-3 w-3" />
            {clip.shadowCount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
