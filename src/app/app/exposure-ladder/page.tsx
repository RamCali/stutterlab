"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Mountain,
  Lock,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingDown,
  Trophy,
  X,
} from "lucide-react";
import {
  EXPOSURE_LADDER,
  getExposureLadderState,
  saveExposureAttempt,
  getAttemptsForRung,
  type ExposureRung,
  type ExposureAttempt,
  type ExposureLadderState,
} from "@/lib/exposure/exposure-ladder";

const CATEGORY_COLORS: Record<string, string> = {
  solo: "text-blue-400 bg-blue-500/10",
  familiar: "text-green-400 bg-green-500/10",
  stranger: "text-amber-400 bg-amber-500/10",
  phone: "text-purple-400 bg-purple-500/10",
  group: "text-orange-400 bg-orange-500/10",
  "high-stakes": "text-red-400 bg-red-500/10",
};

export default function ExposureLadderPage() {
  const [state, setState] = useState<ExposureLadderState>({ attempts: [], unlockedLevel: 1 });
  const [expandedRung, setExpandedRung] = useState<string | null>(null);
  const [loggingRung, setLoggingRung] = useState<string | null>(null);

  // Form state for reflection logging
  const [predictedAnxiety, setPredictedAnxiety] = useState(5);
  const [actualAnxiety, setActualAnxiety] = useState(5);
  const [confidenceAfter, setConfidenceAfter] = useState(5);
  const [usedAvoidance, setUsedAvoidance] = useState(false);
  const [techniqueUsed, setTechniqueUsed] = useState("");
  const [reflection, setReflection] = useState("");
  const [outcome, setOutcome] = useState<"completed" | "partial" | "skipped">("completed");

  useEffect(() => {
    setState(getExposureLadderState());
  }, []);

  function startLogging(rungId: string) {
    const rung = EXPOSURE_LADDER.find((r) => r.id === rungId);
    setLoggingRung(rungId);
    setPredictedAnxiety(5);
    setActualAnxiety(5);
    setConfidenceAfter(5);
    setUsedAvoidance(false);
    setTechniqueUsed(rung?.suggestedTechniques[0] ?? "");
    setReflection("");
    setOutcome("completed");
  }

  function submitReflection() {
    if (!loggingRung) return;
    const attempt: ExposureAttempt = {
      rungId: loggingRung,
      date: new Date().toISOString(),
      predictedAnxiety,
      actualAnxiety,
      confidenceAfter,
      usedAvoidance,
      techniqueUsed,
      reflection,
      outcome,
    };
    const newState = saveExposureAttempt(attempt);
    setState(newState);
    setLoggingRung(null);
  }

  const completedRungs = new Set(
    state.attempts
      .filter((a) => a.outcome === "completed")
      .map((a) => a.rungId)
  );

  const highestCompleted = EXPOSURE_LADDER.reduce((max, rung) => {
    return completedRungs.has(rung.id) && rung.level > max ? rung.level : max;
  }, 0);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Mountain className="h-6 w-6 text-primary" />
          Exposure Ladder
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gradually face speaking situations from easy to challenging
        </p>
      </div>

      {/* Progress Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Your Progress</p>
              <p className="text-xs text-muted-foreground">
                {completedRungs.size} of 10 levels attempted
              </p>
            </div>
            <div className="flex items-center gap-1">
              {EXPOSURE_LADDER.map((rung) => (
                <div
                  key={rung.id}
                  className={`h-3 w-3 rounded-sm ${
                    completedRungs.has(rung.id)
                      ? "bg-primary"
                      : rung.level <= state.unlockedLevel
                        ? "bg-muted"
                        : "bg-muted/30"
                  }`}
                />
              ))}
            </div>
          </div>
          {state.attempts.length >= 3 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-primary">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>
                Avg predicted anxiety: {(state.attempts.reduce((s, a) => s + a.predictedAnxiety, 0) / state.attempts.length).toFixed(1)}
                {" "}→ Actual: {(state.attempts.reduce((s, a) => s + a.actualAnxiety, 0) / state.attempts.length).toFixed(1)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reflection Form Modal */}
      {loggingRung && (
        <ReflectionForm
          rung={EXPOSURE_LADDER.find((r) => r.id === loggingRung)!}
          predictedAnxiety={predictedAnxiety}
          setPredictedAnxiety={setPredictedAnxiety}
          actualAnxiety={actualAnxiety}
          setActualAnxiety={setActualAnxiety}
          confidenceAfter={confidenceAfter}
          setConfidenceAfter={setConfidenceAfter}
          usedAvoidance={usedAvoidance}
          setUsedAvoidance={setUsedAvoidance}
          techniqueUsed={techniqueUsed}
          setTechniqueUsed={setTechniqueUsed}
          reflection={reflection}
          setReflection={setReflection}
          outcome={outcome}
          setOutcome={setOutcome}
          onSubmit={submitReflection}
          onCancel={() => setLoggingRung(null)}
        />
      )}

      {/* Ladder Rungs */}
      <div className="space-y-2">
        {EXPOSURE_LADDER.map((rung) => {
          const isUnlocked = rung.level <= state.unlockedLevel;
          const isCompleted = completedRungs.has(rung.id);
          const isExpanded = expandedRung === rung.id;
          const attempts = getAttemptsForRung(rung.id);
          const isCurrent = rung.level === state.unlockedLevel && !isCompleted;

          return (
            <Card
              key={rung.id}
              className={`transition-all ${
                isCurrent ? "border-primary/40 bg-primary/5" : ""
              } ${!isUnlocked ? "opacity-50" : ""}`}
            >
              <CardContent className="pt-4 pb-3">
                <button
                  onClick={() => isUnlocked && setExpandedRung(isExpanded ? null : rung.id)}
                  className="w-full flex items-center gap-3"
                  disabled={!isUnlocked}
                >
                  {/* Level indicator */}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isUnlocked
                        ? "bg-muted text-foreground"
                        : "bg-muted/30 text-muted-foreground/50"
                  }`}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : isUnlocked ? (
                      rung.level
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{rung.title}</p>
                      <Badge className={`text-[10px] px-1.5 ${CATEGORY_COLORS[rung.category]}`}>
                        {rung.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{rung.description}</p>
                  </div>

                  {isUnlocked && (
                    isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )
                  )}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                    {/* Missions */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Missions
                      </p>
                      <div className="space-y-1">
                        {rung.missions.map((mission, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ArrowRight className="h-3 w-3 flex-shrink-0" />
                            {mission}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggested techniques */}
                    <div className="flex flex-wrap gap-1">
                      {rung.suggestedTechniques.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-[10px]">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Past attempts */}
                    {attempts.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          Past Attempts ({attempts.length})
                        </p>
                        <div className="space-y-1">
                          {attempts.slice(-3).map((a, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                a.outcome === "completed" ? "bg-green-500/10 text-green-400" :
                                a.outcome === "partial" ? "bg-amber-500/10 text-amber-400" :
                                "bg-red-500/10 text-red-400"
                              }`}>
                                {a.outcome}
                              </span>
                              <span className="text-muted-foreground">
                                Predicted: {a.predictedAnxiety} → Actual: {a.actualAnxiety}
                              </span>
                              <span className="text-muted-foreground/50">
                                {new Date(a.date).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Log attempt button */}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => startLogging(rung.id)}
                    >
                      <Trophy className="h-3.5 w-3.5 mr-1.5" />
                      Log an Attempt
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Research shows predicted anxiety is usually higher than actual anxiety.
        Tracking this gap builds confidence over time.
      </p>
    </div>
  );
}

interface ReflectionFormProps {
  rung: ExposureRung;
  predictedAnxiety: number;
  setPredictedAnxiety: (v: number) => void;
  actualAnxiety: number;
  setActualAnxiety: (v: number) => void;
  confidenceAfter: number;
  setConfidenceAfter: (v: number) => void;
  usedAvoidance: boolean;
  setUsedAvoidance: (v: boolean) => void;
  techniqueUsed: string;
  setTechniqueUsed: (v: string) => void;
  reflection: string;
  setReflection: (v: string) => void;
  outcome: "completed" | "partial" | "skipped";
  setOutcome: (v: "completed" | "partial" | "skipped") => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function ReflectionForm({
  rung,
  predictedAnxiety,
  setPredictedAnxiety,
  actualAnxiety,
  setActualAnxiety,
  confidenceAfter,
  setConfidenceAfter,
  usedAvoidance,
  setUsedAvoidance,
  techniqueUsed,
  setTechniqueUsed,
  reflection,
  setReflection,
  outcome,
  setOutcome,
  onSubmit,
  onCancel,
}: ReflectionFormProps) {
  return (
    <Card className="border-primary/30 bg-card">
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Log Attempt: {rung.title}</h3>
          <button onClick={onCancel} className="p-1 rounded hover:bg-muted">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Outcome */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">How did it go?</label>
          <div className="flex gap-2 mt-1">
            {(["completed", "partial", "skipped"] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOutcome(o)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  outcome === o
                    ? o === "completed" ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : o === "partial" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {o === "completed" ? "Did it!" : o === "partial" ? "Partially" : "Skipped"}
              </button>
            ))}
          </div>
        </div>

        {/* Anxiety ratings */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground">Predicted Anxiety</label>
            <input
              type="range"
              min={1}
              max={10}
              value={predictedAnxiety}
              onChange={(e) => setPredictedAnxiety(Number(e.target.value))}
              className="w-full mt-1 accent-primary"
            />
            <p className="text-center text-xs font-bold">{predictedAnxiety}/10</p>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground">Actual Anxiety</label>
            <input
              type="range"
              min={1}
              max={10}
              value={actualAnxiety}
              onChange={(e) => setActualAnxiety(Number(e.target.value))}
              className="w-full mt-1 accent-primary"
            />
            <p className="text-center text-xs font-bold">{actualAnxiety}/10</p>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground">Confidence After</label>
            <input
              type="range"
              min={1}
              max={10}
              value={confidenceAfter}
              onChange={(e) => setConfidenceAfter(Number(e.target.value))}
              className="w-full mt-1 accent-primary"
            />
            <p className="text-center text-xs font-bold">{confidenceAfter}/10</p>
          </div>
        </div>

        {/* Prediction vs Reality callout */}
        {predictedAnxiety > actualAnxiety && (
          <div className="p-2 rounded-md bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-green-400">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              Your actual anxiety was lower than predicted — this is normal! The gap shrinks with practice.
            </p>
          </div>
        )}

        {/* Technique */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Technique used</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {rung.suggestedTechniques.map((tech) => (
              <button
                key={tech}
                onClick={() => setTechniqueUsed(tech)}
                className={`px-2 py-1 rounded-md text-xs transition-colors ${
                  techniqueUsed === tech
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Avoidance check */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUsedAvoidance(!usedAvoidance)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              usedAvoidance ? "bg-amber-500" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                usedAvoidance ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-xs text-muted-foreground">
            I used avoidance (word substitution, silence, etc.)
          </span>
        </div>

        {/* Reflection */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Reflection</label>
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What happened? What did you learn? What would you do differently?"
            className="mt-1 text-xs"
            rows={3}
          />
        </div>

        <Button onClick={onSubmit} className="w-full">
          Save Reflection
        </Button>
      </CardContent>
    </Card>
  );
}
