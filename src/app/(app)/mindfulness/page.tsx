"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Wind,
  Brain,
  Shield,
  Clock,
  Sparkles,
  Volume2,
  Play,
  Pause,
  X,
} from "lucide-react";

/* ─── Breathing Exercise Modal ─── */
function BreathingExercise({
  pattern,
  onClose,
}: {
  pattern: { name: string; inhale: number; hold: number; exhale: number; holdAfter: number };
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "holdAfter">("inhale");
  const [timeLeft, setTimeLeft] = useState(pattern.inhale);
  const [cycles, setCycles] = useState(0);
  const [running, setRunning] = useState(true);
  const totalCycles = 4;

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === "inhale") {
            if (pattern.hold > 0) {
              setPhase("hold");
              return pattern.hold;
            }
            setPhase("exhale");
            return pattern.exhale;
          }
          if (phase === "hold") {
            setPhase("exhale");
            return pattern.exhale;
          }
          if (phase === "exhale") {
            if (pattern.holdAfter > 0) {
              setPhase("holdAfter");
              return pattern.holdAfter;
            }
            setCycles((c) => c + 1);
            setPhase("inhale");
            return pattern.inhale;
          }
          if (phase === "holdAfter") {
            setCycles((c) => c + 1);
            setPhase("inhale");
            return pattern.inhale;
          }
          return prev;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, running, pattern]);

  useEffect(() => {
    if (cycles >= totalCycles) {
      setRunning(false);
    }
  }, [cycles]);

  const phaseLabels = {
    inhale: "Breathe In",
    hold: "Hold",
    exhale: "Breathe Out",
    holdAfter: "Hold",
  };

  const phaseColors = {
    inhale: "text-sky-400",
    hold: "text-amber-400",
    exhale: "text-emerald-400",
    holdAfter: "text-amber-400",
  };

  const scale = phase === "inhale" ? 1.3 : phase === "exhale" ? 0.8 : 1.0;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">{pattern.name}</p>

        {cycles >= totalCycles ? (
          <div className="space-y-4">
            <div className="h-48 w-48 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Heart className="h-16 w-16 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold">Great job!</h2>
            <p className="text-muted-foreground">
              {totalCycles} cycles complete. You should feel calmer now.
            </p>
            <Button onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            {/* Breathing Circle */}
            <div
              className="h-48 w-48 mx-auto rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-[2000ms] ease-in-out"
              style={{ transform: `scale(${scale})` }}
            >
              <div className="text-center">
                <p className={`text-4xl font-bold ${phaseColors[phase]}`}>
                  {timeLeft}
                </p>
                <p className={`text-sm font-medium ${phaseColors[phase]}`}>
                  {phaseLabels[phase]}
                </p>
              </div>
            </div>

            <p className="mt-6 text-muted-foreground text-sm">
              Cycle {cycles + 1} of {totalCycles}
            </p>

            <div className="flex gap-1 justify-center mt-3">
              {Array.from({ length: totalCycles }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full ${
                    i < cycles
                      ? "bg-primary"
                      : i === cycles
                      ? "bg-primary/50"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={() => setRunning(!running)}
            >
              {running ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {running ? "Pause" : "Resume"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Section Data ─── */
const sections = [
  {
    title: "Breathing Exercises",
    icon: Wind,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    items: [
      {
        title: "4-7-8 Breathing",
        description: "Inhale 4s, hold 7s, exhale 8s. Activates the parasympathetic nervous system.",
        duration: "3 min",
        isPremium: false,
        pattern: { name: "4-7-8 Breathing", inhale: 4, hold: 7, exhale: 8, holdAfter: 0 },
      },
      {
        title: "Diaphragmatic Breathing",
        description: "Deep belly breathing to support speech airflow and reduce tension.",
        duration: "5 min",
        isPremium: false,
        pattern: { name: "Diaphragmatic Breathing", inhale: 4, hold: 0, exhale: 6, holdAfter: 0 },
      },
      {
        title: "Box Breathing",
        description: "Equal inhale, hold, exhale, hold. Used by Navy SEALs for calm under pressure.",
        duration: "4 min",
        isPremium: false,
        pattern: { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4, holdAfter: 4 },
      },
    ],
  },
  {
    title: "Pre-Speaking Toolkit",
    icon: Shield,
    color: "text-green-500",
    bg: "bg-green-500/10",
    items: [
      {
        title: "2-Minute Calm Down",
        description: "Quick breathing + grounding routine before important speaking moments.",
        duration: "2 min",
        isPremium: false,
        pattern: { name: "2-Minute Calm Down", inhale: 3, hold: 2, exhale: 5, holdAfter: 0 },
      },
      {
        title: "Pre-Presentation Routine",
        description: "Guided warm-up for your speech muscles and mind before a talk.",
        duration: "5 min",
        isPremium: true,
        pattern: { name: "Pre-Presentation", inhale: 4, hold: 4, exhale: 6, holdAfter: 0 },
      },
      {
        title: "Phone Call Prep",
        description: "Quick anxiety-reduction technique before making a phone call.",
        duration: "2 min",
        isPremium: true,
        pattern: { name: "Phone Call Prep", inhale: 3, hold: 3, exhale: 4, holdAfter: 0 },
      },
    ],
  },
  {
    title: "Guided Meditation",
    icon: Volume2,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    items: [
      {
        title: "Speaking Confidence",
        description: "Guided visualization for building confidence in your voice and speech.",
        duration: "10 min",
        isPremium: true,
        pattern: null,
      },
      {
        title: "Body Scan for Speech",
        description: "Progressive muscle relaxation focused on jaw, tongue, throat, and diaphragm.",
        duration: "12 min",
        isPremium: true,
        pattern: null,
      },
      {
        title: "Self-Acceptance",
        description: "Acceptance and commitment therapy guided meditation for stuttering acceptance.",
        duration: "8 min",
        isPremium: true,
        pattern: null,
      },
    ],
  },
  {
    title: "CBT Exercises",
    icon: Brain,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    items: [
      {
        title: "Thought Record",
        description: "Identify and challenge anxious thoughts about speaking situations.",
        duration: "10 min",
        isPremium: true,
        pattern: null,
      },
      {
        title: "Cognitive Distortions",
        description: "Learn to recognize common thinking errors that increase speech anxiety.",
        duration: "15 min",
        isPremium: true,
        pattern: null,
      },
      {
        title: "Anxiety Ladder",
        description: "Build a hierarchy of feared speaking situations and work through them gradually.",
        duration: "20 min",
        isPremium: true,
        pattern: null,
      },
    ],
  },
];

export default function MindfulnessPage() {
  const [activeExercise, setActiveExercise] = useState<{
    name: string;
    inhale: number;
    hold: number;
    exhale: number;
    holdAfter: number;
  } | null>(null);

  return (
    <>
      {activeExercise && (
        <BreathingExercise
          pattern={activeExercise}
          onClose={() => setActiveExercise(null)}
        />
      )}

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Mindfulness & CBT
          </h1>
          <p className="text-muted-foreground mt-1">
            Address speaking anxiety with breathing exercises, guided meditation,
            and cognitive behavioral therapy tools
          </p>
        </div>

        {/* Quick Access: Pre-Speaking Toolkit */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold flex items-center gap-2">
                  Pre-Speaking Toolkit
                  <Badge variant="secondary" className="text-[10px]">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Quick Access
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  About to make a phone call or give a presentation? Use the 2-minute
                  calm-down routine to prepare.
                </p>
              </div>
              <Button
                onClick={() =>
                  setActiveExercise({
                    name: "2-Minute Calm Down",
                    inhale: 3,
                    hold: 2,
                    exhale: 5,
                    holdAfter: 0,
                  })
                }
              >
                Start 2-Min Routine
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded ${section.bg}`}>
                  <section.icon className={`h-4 w-4 ${section.color}`} />
                </div>
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {section.items.map((item) => (
                  <Card key={item.title} className="hover:border-primary/50 transition-colors">
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm">{item.title}</h3>
                        {item.isPremium && (
                          <Badge variant="outline" className="text-[10px]">Pro</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.duration}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (item.pattern) {
                              setActiveExercise(item.pattern);
                            }
                          }}
                          disabled={!item.pattern}
                        >
                          {item.pattern ? "Start" : "Coming Soon"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
