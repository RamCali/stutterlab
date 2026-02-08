"use client";

import type { CoachNudge as CoachNudgeType } from "@/lib/audio/SpeechCoach";
import { Wind, Gauge, HeartPulse, ThumbsUp, Timer, Sparkles } from "lucide-react";

interface CoachNudgeProps {
  nudge: CoachNudgeType;
}

const NUDGE_ICONS = {
  slow_down: Gauge,
  breathe: Wind,
  relax_tension: HeartPulse,
  good_technique: ThumbsUp,
  good_pacing: Timer,
  keep_going: Sparkles,
};

const SEVERITY_STYLES = {
  positive: "border-l-emerald-500 bg-emerald-500/10 text-emerald-300",
  warning: "border-l-orange-500 bg-orange-500/10 text-orange-300",
  urgent: "border-l-red-500 bg-red-500/10 text-red-300",
};

export function CoachNudge({ nudge }: CoachNudgeProps) {
  const Icon = NUDGE_ICONS[nudge.type];
  const styles = SEVERITY_STYLES[nudge.severity];

  return (
    <div
      className={`border-l-2 rounded-r-md px-2 py-1.5 flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300 ${styles}`}
    >
      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="text-[11px] font-medium">{nudge.message}</span>
    </div>
  );
}
