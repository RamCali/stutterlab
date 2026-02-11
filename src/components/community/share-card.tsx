"use client";

import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Download,
  Flame,
  TrendingUp,
  AudioWaveform,
  Check,
  Copy,
} from "lucide-react";

interface ShareCardData {
  streak: number;
  totalSessions: number;
  fluencyImprovement: number | null; // percentage improvement e.g. 23
  daysPracticed: number;
  favoritetechnique: string | null;
  memberSince: string; // e.g. "January 2026"
}

/**
 * Generates a shareable progress card as a canvas image.
 * Uses HTML/CSS rendered card that can be screenshotted or exported.
 */
export function ShareProgressCard({ data }: { data: ShareCardData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [shared, setShared] = useState(false);

  async function handleShare() {
    if (!cardRef.current) return;

    // Try Web Share API first (mobile), then fallback to clipboard
    try {
      // Use html2canvas dynamically if available, otherwise use share text
      if (navigator.share) {
        await navigator.share({
          title: "My StutterLab Progress",
          text: buildShareText(data),
          url: "https://stutterlab.com",
        });
        setShared(true);
      } else {
        await navigator.clipboard.writeText(buildShareText(data));
        setShared(true);
      }
    } catch {
      // User cancelled share
    }
    setTimeout(() => setShared(false), 2000);
  }

  return (
    <div className="space-y-3">
      {/* The visual card — designed to be screenshot-friendly */}
      <div ref={cardRef}>
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 overflow-hidden">
          <CardContent className="relative py-6 px-6">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-blue-500/30 blur-3xl" />
            </div>

            {/* Header */}
            <div className="relative flex items-center gap-2 mb-5">
              <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center">
                <AudioWaveform className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">StutterLab</span>
              <span className="text-[10px] text-white/50 ml-auto">
                stutterlab.com
              </span>
            </div>

            {/* Main stats */}
            <div className="relative space-y-4">
              {/* Streak */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Flame className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.streak} day streak</p>
                  <p className="text-[10px] text-white/50">
                    Consistency rewires neural pathways
                  </p>
                </div>
              </div>

              {/* Improvement */}
              {data.fluencyImprovement != null && data.fluencyImprovement > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {data.fluencyImprovement}% improvement
                    </p>
                    <p className="text-[10px] text-white/50">
                      Measurable fluency score progress
                    </p>
                  </div>
                </div>
              )}

              {/* Stats row */}
              <div className="flex gap-4 pt-2">
                <div className="flex-1 p-3 rounded-lg bg-white/5 text-center">
                  <p className="text-lg font-bold">{data.totalSessions}</p>
                  <p className="text-[9px] text-white/50">Sessions</p>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-white/5 text-center">
                  <p className="text-lg font-bold">{data.daysPracticed}</p>
                  <p className="text-[9px] text-white/50">Days Practiced</p>
                </div>
                {data.favoritetechnique && (
                  <div className="flex-1 p-3 rounded-lg bg-white/5 text-center">
                    <p className="text-xs font-bold">{data.favoritetechnique}</p>
                    <p className="text-[9px] text-white/50">Top Technique</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="relative mt-5 pt-3 border-t border-white/10">
              <p className="text-[10px] text-white/40 text-center">
                Member since {data.memberSince} — Evidence-based stuttering training
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share buttons */}
      <div className="flex gap-2">
        <Button className="flex-1" onClick={handleShare}>
          {shared ? (
            <Check className="h-4 w-4 mr-1" />
          ) : (
            <Share2 className="h-4 w-4 mr-1" />
          )}
          {shared ? "Shared!" : "Share Progress"}
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await navigator.clipboard.writeText(buildShareText(data));
            setShared(true);
            setTimeout(() => setShared(false), 2000);
          }}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Screenshot the card above or tap Share to spread the word.
        Your identity is never shared.
      </p>
    </div>
  );
}

function buildShareText(data: ShareCardData): string {
  const lines = [
    `I'm on a ${data.streak}-day streak with StutterLab!`,
  ];
  if (data.fluencyImprovement != null && data.fluencyImprovement > 0) {
    lines.push(`${data.fluencyImprovement}% fluency improvement so far.`);
  }
  lines.push(
    `${data.totalSessions} sessions completed. Evidence-based stuttering training that works.`
  );
  lines.push("");
  lines.push("stutterlab.com");
  return lines.join("\n");
}

/** Compact share prompt for dashboard */
export function ShareProgressPrompt({
  streak,
  sessions,
}: {
  streak: number;
  sessions: number;
}) {
  const [shared, setShared] = useState(false);

  if (streak < 3 && sessions < 5) return null; // Don't prompt until there's something to share

  async function handleShare() {
    const text = `I'm on a ${streak}-day streak with StutterLab! ${sessions} sessions completed. Evidence-based stuttering training. stutterlab.com`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "StutterLab Progress", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setShared(true);
    } catch {
      // cancelled
    }
    setTimeout(() => setShared(false), 2000);
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
      <CardContent className="py-3">
        <div className="flex items-center gap-3">
          <Share2 className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">Share your progress</p>
            <p className="text-[10px] text-muted-foreground">
              Inspire others on their journey
            </p>
          </div>
          <Button size="sm" variant="outline" className="text-xs" onClick={handleShare}>
            {shared ? "Shared!" : "Share"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
