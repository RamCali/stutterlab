"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  SpeechCoach,
  type CoachingConfig,
  type CoachingSnapshot,
  type CoachNudge,
} from "@/lib/audio/SpeechCoach";

export interface UseSpeechCoachOptions {
  analyserNode: AnalyserNode | null;
  enabled: boolean;
  config?: Partial<CoachingConfig>;
}

export function useSpeechCoach(options: UseSpeechCoachOptions) {
  const coachRef = useRef<SpeechCoach | null>(null);
  const [snapshot, setSnapshot] = useState<CoachingSnapshot | null>(null);
  const [activeNudge, setActiveNudge] = useState<CoachNudge | null>(null);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNudge = useCallback((nudge: CoachNudge) => {
    setActiveNudge(nudge);
    // Clear any existing dismiss timer
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    // Auto-dismiss after 4 seconds
    nudgeTimerRef.current = setTimeout(() => setActiveNudge(null), 4000);
  }, []);

  useEffect(() => {
    if (!options.enabled || !options.analyserNode) {
      // Clean up if disabled
      if (coachRef.current) {
        coachRef.current.stop();
        coachRef.current = null;
        setSnapshot(null);
        setActiveNudge(null);
      }
      return;
    }

    const coach = new SpeechCoach(
      options.analyserNode,
      options.config ?? {},
      {
        onSnapshot: setSnapshot,
        onNudge: handleNudge,
        onTechniqueDetected: () => {
          // Included in snapshot — no separate handling needed
        },
      }
    );

    coachRef.current = coach;
    coach.start();

    return () => {
      coach.stop();
      coachRef.current = null;
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.enabled, options.analyserNode]);

  // Sync config changes to running coach
  useEffect(() => {
    if (coachRef.current && options.config) {
      coachRef.current.updateConfig(options.config);
    }
  }, [options.config]);

  return { snapshot, activeNudge, coach: coachRef };
}
