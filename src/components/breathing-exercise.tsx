"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Play, Pause } from "lucide-react";

export interface BreathingPattern {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
}

interface BreathingExerciseProps {
  pattern: BreathingPattern;
  totalCycles?: number;
  userName?: string;
  onComplete: () => void;
}

type Phase = "inhale" | "hold" | "exhale" | "holdAfter";

// Box size and corner radius (matches rx on the background rect)
const BOX = 200;
const R = 32;
const STRAIGHT_LEN = BOX - 2 * R;
const ARC_LEN = (Math.PI * R) / 2;
const EDGE_LEN = STRAIGHT_LEN + ARC_LEN;

// Full rounded-rect perimeter as a single SVG path (for background outline)
const ROUNDED_RECT_PATH = [
  `M ${R},0`,
  `L ${BOX - R},0 A ${R},${R} 0 0,1 ${BOX},${R}`,
  `L ${BOX},${BOX - R} A ${R},${R} 0 0,1 ${BOX - R},${BOX}`,
  `L ${R},${BOX} A ${R},${R} 0 0,1 0,${BOX - R}`,
  `L 0,${R} A ${R},${R} 0 0,1 ${R},0`,
  "Z",
].join(" ");

// Compute a point on edge i at progress t (0 to 1)
function pointOnEdge(edge: number, t: number): { x: number; y: number } {
  const d = t * EDGE_LEN;
  const inArc = d > STRAIGHT_LEN;
  const u = inArc ? (d - STRAIGHT_LEN) / ARC_LEN : 0;
  const hp = Math.PI / 2;
  switch (edge) {
    case 0: return inArc
      ? { x: BOX - R + R * Math.sin(u * hp), y: R - R * Math.cos(u * hp) }
      : { x: R + d, y: 0 };
    case 1: return inArc
      ? { x: BOX - R + R * Math.cos(u * hp), y: BOX - R + R * Math.sin(u * hp) }
      : { x: BOX, y: R + d };
    case 2: return inArc
      ? { x: R - R * Math.sin(u * hp), y: BOX - R + R * Math.cos(u * hp) }
      : { x: BOX - R - d, y: BOX };
    case 3: return inArc
      ? { x: R - R * Math.cos(u * hp), y: R - R * Math.sin(u * hp) }
      : { x: 0, y: BOX - R - d };
    default: return { x: R, y: 0 };
  }
}

// Generate SVG path data by sampling many points along the edge (polyline approximation).
// This guarantees visible curves — no reliance on SVG arc commands.
function edgePathData(edge: number, s: number): string | null {
  if (s <= 0) return null;
  const STEPS = 32;
  const p0 = pointOnEdge(edge, 0);
  let d = `M ${p0.x.toFixed(2)},${p0.y.toFixed(2)}`;
  for (let i = 1; i <= STEPS; i++) {
    const t = (i / STEPS) * s;
    const p = pointOnEdge(edge, t);
    d += ` L ${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }
  return d;
}

function getEdgeProgress(phase: Phase, progress: number) {
  const phases: Phase[] = ["inhale", "hold", "exhale", "holdAfter"];
  const idx = phases.indexOf(phase);
  return phases.map((_, i) => (i < idx ? 1 : i === idx ? progress : 0));
}

export function BreathingExercise({
  pattern,
  totalCycles = 4,
  userName,
  onComplete,
}: BreathingExerciseProps) {
  const [phase, setPhase] = useState<Phase>("inhale");
  const [timeLeft, setTimeLeft] = useState(pattern.inhale);
  const [cycles, setCycles] = useState(0);
  const [running, setRunning] = useState(true);
  const [progress, setProgress] = useState(0);

  const animRef = useRef<number | null>(null);
  const phaseStartRef = useRef(Date.now());
  const phaseDurRef = useRef(pattern.inhale * 1000);

  const isBox = pattern.hold > 0 || pattern.holdAfter > 0;

  function getPhaseDur(p: Phase) {
    const map = { inhale: pattern.inhale, hold: pattern.hold, exhale: pattern.exhale, holdAfter: pattern.holdAfter };
    return map[p];
  }

  function advancePhase(p: Phase): { next: Phase; dur: number; incCycle: boolean } {
    if (p === "inhale" && pattern.hold > 0) return { next: "hold", dur: pattern.hold, incCycle: false };
    if (p === "inhale") return { next: "exhale", dur: pattern.exhale, incCycle: false };
    if (p === "hold") return { next: "exhale", dur: pattern.exhale, incCycle: false };
    if (p === "exhale" && pattern.holdAfter > 0) return { next: "holdAfter", dur: pattern.holdAfter, incCycle: false };
    if (p === "exhale") return { next: "inhale", dur: pattern.inhale, incCycle: true };
    return { next: "inhale", dur: pattern.inhale, incCycle: true };
  }

  // Smooth animation for dot
  useEffect(() => {
    if (!running || !isBox) return;
    function animate() {
      const elapsed = Date.now() - phaseStartRef.current;
      setProgress(Math.min(elapsed / phaseDurRef.current, 1));
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [running, phase, isBox]);

  // Phase timer (1s ticks)
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const { next, dur, incCycle } = advancePhase(phase);
          if (incCycle) setCycles((c) => c + 1);
          setPhase(next);
          phaseStartRef.current = Date.now();
          phaseDurRef.current = dur * 1000;
          setProgress(0);
          return dur;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, running, pattern]);

  useEffect(() => {
    if (cycles >= totalCycles) setRunning(false);
  }, [cycles, totalCycles]);

  const phaseLabels: Record<Phase, string> = {
    inhale: "Breathe In",
    hold: "Hold",
    exhale: "Breathe Out",
    holdAfter: "Hold",
  };

  const phaseColorMap: Record<Phase, { text: string; rgb: string }> = {
    inhale:    { text: "text-sky-400",     rgb: "56, 189, 248" },
    hold:      { text: "text-amber-400",   rgb: "251, 191, 36" },
    exhale:    { text: "text-emerald-400", rgb: "52, 211, 153" },
    holdAfter: { text: "text-amber-400",   rgb: "251, 191, 36" },
  };

  // Completion
  if (cycles >= totalCycles) {
    return (
      <div className="text-center space-y-4">
        <div className="h-48 w-48 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Heart className="h-16 w-16 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold">Great job{userName ? `, ${userName}` : ""}!</h2>
        <p className="text-muted-foreground">
          {totalCycles} cycles complete. You should feel calmer now.
        </p>
        <Button onClick={onComplete}>Done</Button>
      </div>
    );
  }

  // Non-box breathing (diaphragmatic): expanding circle
  if (!isBox) {
    const scale = phase === "inhale" ? 1.3 : phase === "exhale" ? 0.8 : 1.0;
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2 relative z-10">{pattern.name}</p>
        <div className="flex items-center justify-center h-64 w-64 mx-auto">
          <div
            className="h-48 w-48 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-[2000ms] ease-in-out"
            style={{ transform: `scale(${scale})` }}
          >
            <div className="text-center">
              <p className={`text-4xl font-bold ${phaseColorMap[phase].text}`}>{timeLeft}</p>
              <p className={`text-sm font-medium ${phaseColorMap[phase].text}`}>{phaseLabels[phase]}</p>
            </div>
          </div>
        </div>
        <p className="mt-6 text-muted-foreground text-sm">Cycle {cycles + 1} of {totalCycles}</p>
        <div className="flex gap-1 justify-center mt-3">
          {Array.from({ length: totalCycles }).map((_, i) => (
            <div key={i} className={`h-2 w-8 rounded-full ${i < cycles ? "bg-primary" : i === cycles ? "bg-primary/50" : "bg-muted"}`} />
          ))}
        </div>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => setRunning(!running)}>
          {running ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
          {running ? "Pause" : "Resume"}
        </Button>
      </div>
    );
  }

  // ─── Box Breathing Animation ───
  const edgePhases: Phase[] = ["inhale", "hold", "exhale", "holdAfter"];
  const phaseIdx = edgePhases.indexOf(phase);
  const dot = pointOnEdge(phaseIdx, progress);
  const segs = getEdgeProgress(phase, progress);
  const c = phaseColorMap[phase];

  const labels = [
    { text: "Breathe In",  x: BOX / 2, y: -14, p: "inhale" as Phase },
    { text: "Hold",         x: BOX + 16, y: BOX / 2, p: "hold" as Phase, rot: true },
    { text: "Breathe Out", x: BOX / 2, y: BOX + 22, p: "exhale" as Phase },
    { text: "Hold",         x: -16, y: BOX / 2, p: "holdAfter" as Phase, rot: true },
  ];

  const M = 44; // margin for labels

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-4">{pattern.name}</p>

      <div className="flex items-center justify-center mx-auto" style={{ width: BOX + M * 2, height: BOX + M * 2 }}>
        <svg width={BOX + M * 2} height={BOX + M * 2} viewBox={`${-M} ${-M} ${BOX + M * 2} ${BOX + M * 2}`}>
          {/* Background rounded rect */}
          <path d={ROUNDED_RECT_PATH} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-muted-foreground/20" />

          {/* Colored edge progress (explicit arc geometry per edge) */}
          {edgePhases.map((ep, i) => {
            const pathData = edgePathData(i, segs[i]);
            if (!pathData) return null;
            const rgb = phaseColorMap[ep].rgb;
            return (
              <path
                key={i}
                d={pathData}
                fill="none"
                stroke={`rgb(${rgb})`}
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}

          {/* Corner dots (at phase transition points on the rounded path) */}
          {edgePhases.map((_, i) => {
            const pt = pointOnEdge(i, 0);
            return <circle key={i} cx={pt.x} cy={pt.y} r={3.5} className="fill-muted-foreground/25" />;
          })}

          {/* Edge labels */}
          {labels.map((l, i) => {
            const isActive = l.p === phase;
            const rgb = phaseColorMap[l.p].rgb;
            return (
              <text
                key={i}
                x={l.x} y={l.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isActive ? `rgb(${rgb})` : undefined}
                className={isActive ? undefined : "fill-muted-foreground/35"}
                fontSize={12}
                fontWeight={isActive ? 600 : 400}
                transform={l.rot ? `rotate(90, ${l.x}, ${l.y})` : undefined}
              >
                {l.text}
              </text>
            );
          })}

          {/* Animated traveling dot with glow */}
          <circle cx={dot.x} cy={dot.y} r={18} fill={`rgb(${c.rgb})`} opacity={0.1} />
          <circle cx={dot.x} cy={dot.y} r={9} fill={`rgb(${c.rgb})`} opacity={0.85}>
            <animate attributeName="r" values="9;11;9" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* Center countdown */}
          <text x={BOX / 2} y={BOX / 2 - 14} textAnchor="middle" dominantBaseline="middle" fill={`rgb(${c.rgb})`} fontSize={48} fontWeight={700}>
            {timeLeft}
          </text>
          <text x={BOX / 2} y={BOX / 2 + 20} textAnchor="middle" dominantBaseline="middle" fill={`rgb(${c.rgb})`} fontSize={13} fontWeight={500}>
            {phaseLabels[phase]}
          </text>
        </svg>
      </div>

      <p className="mt-2 text-muted-foreground text-sm">
        Cycle {cycles + 1} of {totalCycles}
      </p>

      <div className="flex gap-1 justify-center mt-3">
        {Array.from({ length: totalCycles }).map((_, i) => (
          <div key={i} className={`h-2 w-8 rounded-full ${i < cycles ? "bg-primary" : i === cycles ? "bg-primary/50" : "bg-muted"}`} />
        ))}
      </div>

      <Button variant="ghost" size="sm" className="mt-4" onClick={() => setRunning(!running)}>
        {running ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
        {running ? "Pause" : "Resume"}
      </Button>
    </div>
  );
}
