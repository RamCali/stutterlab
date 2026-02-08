"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  addThoughtRecord,
  addPrediction,
  EMOTIONS,
  type Emotion,
} from "@/lib/cbt/store";
import {
  THINKING_TRAPS,
  getTrapById,
  type ThinkingTrapId,
} from "@/lib/cbt/thinking-traps";

interface AIResponse {
  traps: string[];
  analysis: string;
  questions: string[];
  evidenceSuggestions: string[];
  balancedThought: string;
}

export default function NewThoughtPage() {
  return (
    <Suspense>
      <NewThoughtContent />
    </Suspense>
  );
}

function NewThoughtContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPredictionMode = searchParams.get("mode") === "prediction";

  // ── Thought Record State ──
  const [step, setStep] = useState(0);
  const [situation, setSituation] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<Emotion[]>([]);
  const [evidenceFor, setEvidenceFor] = useState("");
  const [evidenceAgainst, setEvidenceAgainst] = useState("");
  const [balancedThought, setBalancedThought] = useState("");
  const [detectedTraps, setDetectedTraps] = useState<ThinkingTrapId[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // ── Prediction State ──
  const [prediction, setPrediction] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState(5);
  const [anxietyBefore, setAnxietyBefore] = useState(5);

  const totalSteps = isPredictionMode ? 2 : 5;

  function toggleEmotion(name: string) {
    setSelectedEmotions((prev) => {
      const existing = prev.find((e) => e.name === name);
      if (existing) return prev.filter((e) => e.name !== name);
      return [...prev, { name, intensity: 5 }];
    });
  }

  function setEmotionIntensity(name: string, intensity: number) {
    setSelectedEmotions((prev) =>
      prev.map((e) => (e.name === name ? { ...e, intensity } : e))
    );
  }

  async function analyzeThought() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/cbt/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation,
          automaticThought,
          emotions: selectedEmotions,
        }),
      });
      const data = (await res.json()) as AIResponse;
      setDetectedTraps(data.traps as ThinkingTrapId[]);
      setAiAnalysis(data.analysis);
      setAiQuestions(data.questions);
      if (data.evidenceSuggestions?.length) {
        setEvidenceAgainst(data.evidenceSuggestions.join("\n"));
      }
      if (data.balancedThought) {
        setBalancedThought(data.balancedThought);
      }
    } catch {
      // Fallback if API fails
      setAiAnalysis(
        "Let's examine this thought together. Many thoughts feel very real in the moment but may not reflect the full picture."
      );
      setAiQuestions([
        "What evidence do you have that this thought is true?",
        "What would you tell a friend who had this same thought?",
        "Has there been a time when the opposite happened?",
      ]);
    }
    setAiLoading(false);
  }

  function handleNextStep() {
    if (isPredictionMode && step === 0) {
      // Save prediction and go to step 1 (confirmation)
      setStep(1);
      return;
    }
    if (step === 2) {
      // Moving to AI analysis step — trigger analysis
      analyzeThought();
    }
    setStep(step + 1);
  }

  function handleSave() {
    if (isPredictionMode) {
      addPrediction({
        situation,
        prediction,
        confidenceLevel,
        anxietyBefore,
      });
    } else {
      addThoughtRecord({
        situation,
        automaticThought,
        emotions: selectedEmotions,
        thinkingTraps: detectedTraps,
        evidenceFor,
        evidenceAgainst,
        balancedThought,
      });
    }
    router.push("/mindset");
  }

  function canProceed(): boolean {
    if (isPredictionMode) {
      return step === 0
        ? situation.trim().length > 0 && prediction.trim().length > 0
        : true;
    }
    switch (step) {
      case 0:
        return situation.trim().length > 0;
      case 1:
        return automaticThought.trim().length > 0;
      case 2:
        return selectedEmotions.length > 0;
      case 3:
        return !aiLoading;
      case 4:
        return true;
      default:
        return false;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              step > 0 ? setStep(step - 1) : router.push("/mindset")
            }
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {step > 0 ? "Back" : "Cancel"}
          </Button>
          <span className="text-xs text-muted-foreground">
            {isPredictionMode ? "New Prediction" : "New Thought Record"}
          </span>
          <div className="w-16" />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? "w-8 bg-primary"
                  : i < step
                  ? "w-1.5 bg-primary/50"
                  : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg mx-auto">
          {/* ══════════ PREDICTION MODE ══════════ */}
          {isPredictionMode && step === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Behavioral Experiment</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Before a challenging situation, record your prediction. Afterwards, come back and see how reality compared.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">
                  What situation are you about to face?
                </label>
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="e.g., Ordering coffee at the new cafe..."
                  className="w-full mt-1.5 h-20 rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  What do you think will happen?
                </label>
                <textarea
                  value={prediction}
                  onChange={(e) => setPrediction(e.target.value)}
                  placeholder='e.g., "I will stutter badly and the barista will get impatient..."'
                  className="w-full mt-1.5 h-20 rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  How confident are you? ({confidenceLevel}/10)
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={confidenceLevel}
                  onChange={(e) =>
                    setConfidenceLevel(parseInt(e.target.value))
                  }
                  className="w-full mt-1.5 accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Not sure</span>
                  <span>Certain</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Anxiety level right now ({anxietyBefore}/10)
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={anxietyBefore}
                  onChange={(e) =>
                    setAnxietyBefore(parseInt(e.target.value))
                  }
                  className="w-full mt-1.5 accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Calm</span>
                  <span>Very anxious</span>
                </div>
              </div>
            </div>
          )}

          {isPredictionMode && step === 1 && (
            <div className="text-center space-y-6">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold">Prediction Saved!</h2>
              <p className="text-muted-foreground text-sm">
                Go face the situation. When you&apos;re done, come back to
                record what actually happened.
              </p>
              <Card>
                <CardContent className="pt-4 pb-3 text-left">
                  <p className="text-xs text-muted-foreground">
                    Your prediction:
                  </p>
                  <p className="text-sm font-medium mt-1 italic">
                    &ldquo;{prediction}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Confidence: {confidenceLevel}/10 | Anxiety: {anxietyBefore}
                    /10
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════ THOUGHT RECORD MODE ══════════ */}

          {/* Step 0: Situation */}
          {!isPredictionMode && step === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">What happened?</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Describe the specific situation — who was there, what were you
                  doing?
                </p>
              </div>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="e.g., I was in a team meeting and my manager asked me to give a status update..."
                className="w-full h-32 rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
            </div>
          )}

          {/* Step 1: Automatic Thought */}
          {!isPredictionMode && step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  What went through your mind?
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Write the exact thought — like a screenshot of your brain in
                  that moment.
                </p>
              </div>
              <textarea
                value={automaticThought}
                onChange={(e) => setAutomaticThought(e.target.value)}
                placeholder={"e.g., \"Everyone is going to notice me stuttering and think I don't know what I'm talking about...\""}
                className="w-full h-32 rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Emotions */}
          {!isPredictionMode && step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">How did that make you feel?</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Select all emotions and rate their intensity.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {EMOTIONS.map((em) => {
                  const selected = selectedEmotions.find(
                    (e) => e.name === em.name
                  );
                  return (
                    <div key={em.name}>
                      <button
                        onClick={() => toggleEmotion(em.name)}
                        className={`w-full flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-muted hover:border-muted-foreground/30"
                        }`}
                      >
                        <span className="text-lg">{em.emoji}</span>
                        <span className="text-sm font-medium capitalize">
                          {em.name}
                        </span>
                      </button>
                      {selected && (
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={selected.intensity}
                            onChange={(e) =>
                              setEmotionIntensity(
                                em.name,
                                parseInt(e.target.value)
                              )
                            }
                            className="flex-1 accent-primary h-1"
                          />
                          <span className="text-[10px] text-muted-foreground w-6 text-right">
                            {selected.intensity}/10
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: AI Analysis */}
          {!isPredictionMode && step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  <Sparkles className="inline h-6 w-6 text-primary mr-1" />
                  Let&apos;s examine this thought
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  AI has analyzed your thought for common thinking traps.
                </p>
              </div>

              {aiLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Analyzing your thought patterns...
                  </p>
                </div>
              ) : (
                <>
                  {/* Detected Traps */}
                  {detectedTraps.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Thinking Traps Detected
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {detectedTraps.map((trapId) => {
                          const trap = getTrapById(trapId);
                          if (!trap) return null;
                          return (
                            <Badge
                              key={trapId}
                              variant="secondary"
                              className={`text-xs py-1 px-2.5 ${trap.color}`}
                            >
                              {trap.emoji} {trap.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Analysis */}
                  {aiAnalysis && (
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4 pb-3">
                        <p className="text-sm">{aiAnalysis}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Socratic Questions */}
                  {aiQuestions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Questions to Reflect On
                      </p>
                      <div className="space-y-2">
                        {aiQuestions.map((q, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-primary font-bold mt-0.5">
                              {i + 1}.
                            </span>
                            <p>{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence */}
                  <div>
                    <label className="text-sm font-medium">
                      Evidence FOR this thought
                    </label>
                    <textarea
                      value={evidenceFor}
                      onChange={(e) => setEvidenceFor(e.target.value)}
                      placeholder="What makes you think this is true?"
                      className="w-full mt-1.5 h-20 rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Evidence AGAINST this thought
                    </label>
                    <textarea
                      value={evidenceAgainst}
                      onChange={(e) => setEvidenceAgainst(e.target.value)}
                      placeholder="What evidence suggests this thought might not be fully accurate?"
                      className="w-full mt-1.5 h-20 rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Balanced Thought */}
          {!isPredictionMode && step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Balanced Thought</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Replace the automatic thought with a more balanced
                  perspective.
                </p>
              </div>

              <Card className="bg-muted/30">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Your original thought:
                  </p>
                  <p className="text-sm italic">
                    &ldquo;{automaticThought}&rdquo;
                  </p>
                </CardContent>
              </Card>

              <div>
                <label className="text-sm font-medium">
                  Your balanced thought
                </label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
                  Not falsely positive — honest and realistic.
                </p>
                <textarea
                  value={balancedThought}
                  onChange={(e) => setBalancedThought(e.target.value)}
                  placeholder={"e.g., \"Even if I stutter, my team values my contributions. One tough moment doesn't erase my expertise.\""}
                  className="w-full h-24 rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>

              {detectedTraps.length > 0 && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Thinking traps you identified:
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                    {detectedTraps.map((trapId) => {
                      const trap = getTrapById(trapId);
                      if (!trap) return null;
                      return (
                        <Badge
                          key={trapId}
                          variant="secondary"
                          className={`text-[10px] ${trap.color}`}
                        >
                          {trap.emoji} {trap.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-6 py-4">
        <div className="max-w-lg mx-auto">
          {(isPredictionMode && step === 1) ||
          (!isPredictionMode && step === totalSteps - 1) ? (
            <Button size="lg" className="w-full" onClick={handleSave}>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              {isPredictionMode ? "Save Prediction" : "Save Thought Record"}
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full"
              onClick={handleNextStep}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
