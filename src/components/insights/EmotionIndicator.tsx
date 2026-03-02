"use client";

import { Shield, AlertTriangle, Frown, CheckCircle2 } from "lucide-react";
import type { EmotionalState } from "@/lib/analysis/types";

interface EmotionIndicatorProps {
  state: EmotionalState;
  confidence: number;
}

const EMOTION_CONFIG: Record<
  EmotionalState,
  { icon: typeof Shield; color: string; label: string; bg: string }
> = {
  calm: {
    icon: Shield,
    color: "text-blue-400",
    label: "Calm",
    bg: "bg-blue-500/10",
  },
  anxious: {
    icon: AlertTriangle,
    color: "text-yellow-400",
    label: "Anxious",
    bg: "bg-yellow-500/10",
  },
  frustrated: {
    icon: Frown,
    color: "text-red-400",
    label: "Frustrated",
    bg: "bg-red-500/10",
  },
  confident: {
    icon: CheckCircle2,
    color: "text-[#00E676]",
    label: "Confident",
    bg: "bg-[#00E676]/10",
  },
};

export function EmotionIndicator({ state, confidence }: EmotionIndicatorProps) {
  // Only show when confidence is reasonable
  if (confidence < 0.4) return null;

  const config = EMOTION_CONFIG[state];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bg} transition-all duration-500`}
    >
      <Icon className={`h-3 w-3 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}
