"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Activity } from "lucide-react";
import { useSpeechCoach } from "@/hooks/useSpeechCoach";
import type { CoachingConfig } from "@/lib/audio/SpeechCoach";
import { SpeedGauge } from "./SpeedGauge";
import { EffortMeter } from "./EffortMeter";
import { TechniqueIndicators } from "./TechniqueIndicators";
import { CoachNudge } from "./CoachNudge";

interface LiveCoachOverlayProps {
  analyserNode: AnalyserNode | null;
  enabled: boolean;
  config?: Partial<CoachingConfig>;
}

export function LiveCoachOverlay({
  analyserNode,
  enabled,
  config,
}: LiveCoachOverlayProps) {
  const { snapshot, activeNudge } = useSpeechCoach({
    analyserNode,
    enabled,
    config,
  });
  const [collapsed, setCollapsed] = useState(false);

  if (!enabled || !snapshot) return null;

  if (collapsed) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCollapsed(false)}
        className="fixed bottom-20 right-4 z-50 rounded-full h-10 w-10 p-0 shadow-lg border-primary/30 bg-background/90 backdrop-blur-sm md:bottom-4"
      >
        <Activity className="h-4 w-4 text-primary" />
      </Button>
    );
  }

  return (
    <div
      className="fixed bottom-20 right-4 z-50 w-64
                 md:bottom-4 md:right-4"
    >
      <Card className="shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-3 space-y-2.5">
          {/* Header */}
          <div className="flex justify-between items-center">
            <Badge
              variant="outline"
              className="text-[9px] gap-1 border-primary/30"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Live Coach
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => setCollapsed(true)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Speed Gauge */}
          <SpeedGauge
            currentSPM={snapshot.currentSPM}
            target={snapshot.targetSPM}
            zone={snapshot.spmZone}
          />

          {/* Effort Meter */}
          <EffortMeter
            effort={snapshot.vocalEffort}
            zone={snapshot.effortZone}
          />

          {/* Technique Indicators */}
          <TechniqueIndicators
            detections={snapshot.detectedTechniques}
            counts={snapshot.sessionTechniqueCounts}
          />

          {/* Coach Nudge */}
          {activeNudge && <CoachNudge nudge={activeNudge} />}
        </CardContent>
      </Card>
    </div>
  );
}
