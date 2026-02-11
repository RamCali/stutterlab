"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Plus,
  Star,
  ClipboardCheck,
  Rocket,
} from "lucide-react";
import {
  FEARED_SITUATIONS,
  SPEECH_CHALLENGES,
  CONFIDENCE_SITUATIONS,
  AVOIDANCE_BEHAVIORS,
  STUTTERING_TYPES,
  saveOnboardingData,
  type OnboardingData,
} from "@/lib/onboarding/feared-situations";
import { addFearedWord } from "@/lib/feared-words/store";
import {
  calculateScores,
  getProfileDescription,
  type AssessmentScores,
} from "@/lib/onboarding/scoring";
import { PHASE_LABELS } from "@/lib/curriculum/daily-plans";

const SUGGESTED_WORDS = [
  "specifically",
  "presentation",
  "schedule",
  "telephone",
  "restaurant",
  "comfortable",
  "necessary",
  "particularly",
];

const TOTAL_STEPS = 8;

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);

  // Step 0: Name
  const [name, setName] = useState("");

  // Step 1: Severity dimensions + Stuttering Types
  const [stutterFrequency, setStutterFrequency] = useState("");
  const [stutterDuration, setStutterDuration] = useState("");
  const [stutterImpact, setStutterImpact] = useState("");
  const [stutteringTypes, setStutteringTypes] = useState<Set<string>>(new Set());

  // Step 2: Confidence Ratings
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, number>>({});

  // Step 3: Feared Situations
  const [selectedFears, setSelectedFears] = useState<Set<string>>(new Set());

  // Step 4: Feared Words
  const [fearedWordInputs, setFearedWordInputs] = useState<string[]>([]);
  const [currentWordInput, setCurrentWordInput] = useState("");

  // Step 5: Avoidance + Frequency
  const [avoidanceBehaviors, setAvoidanceBehaviors] = useState<Set<string>>(new Set());
  const [speakingFrequency, setSpeakingFrequency] = useState("");

  // Step 6: Goals
  const [selectedChallenges, setSelectedChallenges] = useState<Set<string>>(new Set());
  const [goalText, setGoalText] = useState("");

  // Step 7: Results
  const [scores, setScores] = useState<AssessmentScores | null>(null);

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setConfidence(situationId: string, rating: number) {
    setConfidenceRatings((prev) => ({ ...prev, [situationId]: rating }));
  }

  function addWord() {
    const word = currentWordInput.trim().toLowerCase();
    if (word && !fearedWordInputs.includes(word)) {
      setFearedWordInputs((prev) => [...prev, word]);
      setCurrentWordInput("");
    }
  }

  function removeWord(word: string) {
    setFearedWordInputs((prev) => prev.filter((w) => w !== word));
  }

  function toggleSuggested(word: string) {
    if (fearedWordInputs.includes(word)) removeWord(word);
    else setFearedWordInputs((prev) => [...prev, word]);
  }

  function buildScoringInput() {
    return {
      stutterFrequency,
      stutterDuration,
      stutterImpact,
      confidenceRatings,
      avoidanceBehaviors: Array.from(avoidanceBehaviors),
      stutteringTypes: Array.from(stutteringTypes),
      speakingFrequency,
      fearedSituations: Array.from(selectedFears),
    };
  }

  function goToResults() {
    const result = calculateScores(buildScoringInput());
    setScores(result);
    setStep(7);
  }

  async function handleFinish() {
    const computed = scores || calculateScores(buildScoringInput());

    const data: OnboardingData = {
      completed: true,
      name: name.trim(),
      fearedSituations: Array.from(selectedFears),
      severity: computed.severityLabel,
      speechChallenges: Array.from(selectedChallenges),
      northStarGoal: goalText.trim(),
      confidenceRatings,
      avoidanceBehaviors: Array.from(avoidanceBehaviors),
      stutteringTypes: Array.from(stutteringTypes),
      speakingFrequency,
      stutterFrequency,
      stutterDuration,
      stutterImpact,
      severityScore: computed.severityScore,
      confidenceScore: computed.confidenceScore,
    };
    saveOnboardingData(data);

    for (const word of fearedWordInputs) {
      addFearedWord(word);
    }

    try {
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          severity: computed.severityLabel,
          fearedSituations: Array.from(selectedFears),
          speechChallenges: Array.from(selectedChallenges),
          northStarGoal: goalText.trim(),
          fearedWords: fearedWordInputs,
          confidenceRatings,
          avoidanceBehaviors: Array.from(avoidanceBehaviors),
          stutteringTypes: Array.from(stutteringTypes),
          speakingFrequency,
          stutterFrequency,
          stutterDuration,
          stutterImpact,
          severityScore: computed.severityScore,
          confidenceScore: computed.confidenceScore,
          assessmentProfile: computed.profile,
          recommendedEmphasis: computed.recommendedEmphasis,
        }),
      });
    } catch {
      // localStorage fallback is sufficient
    }

    onComplete();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/50" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome + Name */}
        {step === 0 && (
          <div className="text-center space-y-6">
            <div>
              <ClipboardCheck className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold">Speech Assessment</h1>
              <p className="text-muted-foreground mt-2">
                Answer a few questions so we can build your personalized 90-day fluency program.
              </p>
            </div>

            <div className="text-left max-w-xs mx-auto">
              <label className="text-sm font-medium">What should we call you?</label>
              <Input
                placeholder="Your first name"
                className="mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) setStep(1);
                }}
                autoFocus
              />
            </div>

            <Button
              size="lg"
              onClick={() => setStep(1)}
              disabled={!name.trim()}
              className="mt-4"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 1: Severity Dimensions + Stuttering Types */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                Tell us about your stutter{name ? `, ${name}` : ""}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                These questions help us calibrate your program accurately.
              </p>
            </div>

            {/* Q1: Frequency */}
            <div>
              <label className="text-sm font-medium">
                In a typical conversation, how often do you stutter?
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {[
                  { id: "rarely", label: "A few times", desc: "Across a long conversation" },
                  { id: "sometimes", label: "Several times", desc: "In most conversations" },
                  { id: "often", label: "Frequently", desc: "On many words or sentences" },
                  { id: "very-often", label: "Very often", desc: "On most words or sentences" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setStutterFrequency(opt.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      stutterFrequency === opt.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Q2: Duration */}
            <div>
              <label className="text-sm font-medium">
                When you stutter, how long does it usually last?
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {[
                  { id: "brief", label: "Brief", desc: "Quick repetitions, under 1 second" },
                  { id: "moderate", label: "Noticeable", desc: "Pauses or repetitions, 1-2 seconds" },
                  { id: "long", label: "Prolonged", desc: "Blocks lasting 2-5 seconds" },
                  { id: "very-long", label: "Extended", desc: "5+ seconds, very hard to push through" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setStutterDuration(opt.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      stutterDuration === opt.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: Impact */}
            <div>
              <label className="text-sm font-medium">
                How much does stuttering affect your daily life?
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {[
                  { id: "minimal", label: "A little", desc: "Annoying but doesn't stop me" },
                  { id: "some", label: "Moderate", desc: "I sometimes avoid situations" },
                  { id: "significant", label: "A lot", desc: "Regularly limits my opportunities" },
                  { id: "severe", label: "Severely", desc: "Dominates my daily decisions" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setStutterImpact(opt.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      stutterImpact === opt.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Stuttering Types */}
            <div>
              <label className="text-sm font-medium">
                What types of disfluency do you experience?
              </label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">Select all that apply.</p>
              <div className="grid grid-cols-1 gap-2">
                {STUTTERING_TYPES.map((type) => {
                  const isSelected = stutteringTypes.has(type.id);
                  return (
                    <button
                      key={type.id}
                      onClick={() => toggleSet(setStutteringTypes, type.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xl">{type.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!stutterFrequency || !stutterDuration || !stutterImpact}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            {(!stutterFrequency || !stutterDuration || !stutterImpact) && (
              <p className="text-xs text-muted-foreground text-center">
                Please answer all three questions above to continue.
              </p>
            )}
          </div>
        )}

        {/* Step 2: Confidence Rating */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Rate your confidence</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                How confident do you feel speaking in these situations? (1 = very anxious, 5 = confident)
              </p>
            </div>

            <div className="space-y-3">
              {CONFIDENCE_SITUATIONS.map((situation) => {
                const rating = confidenceRatings[situation.id] || 0;
                return (
                  <div
                    key={situation.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <span className="text-lg">{situation.emoji}</span>
                    <span className="text-sm font-medium flex-1 min-w-0">
                      {situation.label}
                    </span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setConfidence(situation.id, n)}
                          className={`h-8 w-8 rounded-full text-xs font-semibold transition-all ${
                            rating === n
                              ? "bg-primary text-primary-foreground scale-110"
                              : rating > 0 && n <= rating
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={Object.keys(confidenceRatings).length < 3}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            {Object.keys(confidenceRatings).length < 3 && (
              <p className="text-xs text-muted-foreground text-center">
                Please rate at least 3 situations to continue.
              </p>
            )}
          </div>
        )}

        {/* Step 3: Feared Situations */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                What situations feel hardest{name ? `, ${name}` : ""}?
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Select all that apply. We&apos;ll prioritize practice for these.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEARED_SITUATIONS.map((situation) => {
                const isSelected = selectedFears.has(situation.id);
                return (
                  <Card
                    key={situation.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : ""
                    }`}
                    onClick={() => toggleSet(setSelectedFears, situation.id)}
                  >
                    <CardContent className="p-3 flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{situation.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{situation.label}</p>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {situation.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                {selectedFears.size > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedFears.size} selected
                  </Badge>
                )}
                <Button onClick={() => setStep(4)}>
                  {selectedFears.size === 0 ? "Skip" : "Continue"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Feared Words */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Any words that trip you up?</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Type words you find difficult. We&apos;ll create personalized practice for each one.
              </p>
            </div>

            <div className="flex gap-2 max-w-sm mx-auto">
              <Input
                placeholder="Type a word..."
                value={currentWordInput}
                onChange={(e) => setCurrentWordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWord()}
                autoFocus
              />
              <Button size="sm" onClick={addWord} disabled={!currentWordInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {fearedWordInputs.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {fearedWordInputs.map((word) => (
                  <Badge key={word} variant="secondary" className="text-sm py-1.5 px-3 gap-1.5">
                    {word}
                    <button
                      onClick={() => removeWord(word)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Common difficult words — tap to add:
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {SUGGESTED_WORDS.map((word) => {
                  const isAdded = fearedWordInputs.includes(word);
                  return (
                    <button
                      key={word}
                      onClick={() => toggleSuggested(word)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        isAdded
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "border-muted-foreground/20 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {isAdded && <Check className="h-3 w-3 inline mr-1" />}
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                {fearedWordInputs.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {fearedWordInputs.length} word{fearedWordInputs.length !== 1 ? "s" : ""}
                  </Badge>
                )}
                <Button onClick={() => setStep(5)}>
                  {fearedWordInputs.length === 0 ? "Skip" : "Continue"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Avoidance Behaviors + Speaking Frequency */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                How does stuttering affect your daily life?
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                This helps us understand your avoidance patterns.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Do any of these sound like you?</label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">Select all that apply.</p>
              <div className="space-y-2">
                {AVOIDANCE_BEHAVIORS.map((behavior) => {
                  const isSelected = avoidanceBehaviors.has(behavior.id);
                  return (
                    <button
                      key={behavior.id}
                      onClick={() => toggleSet(setAvoidanceBehaviors, behavior.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <span className="text-lg">{behavior.emoji}</span>
                      <span className="text-sm flex-1">{behavior.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">How often do you speak with others?</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {[
                  { id: "rarely", label: "Rarely", desc: "I mostly avoid it" },
                  { id: "sometimes", label: "Sometimes", desc: "A few times a day" },
                  { id: "often", label: "Often", desc: "Throughout the day" },
                  { id: "daily", label: "Constantly", desc: "Speaking is my job" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSpeakingFrequency(opt.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      speakingFrequency === opt.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(4)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={() => setStep(6)}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Speech Goals / North Star */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center">
              <Star className="h-10 w-10 text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold">
                What&apos;s your speech goal{name ? `, ${name}` : ""}?
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                This becomes your North Star. We&apos;ll remind you why you&apos;re here.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">How is stuttering holding you back?</p>
              <div className="grid grid-cols-2 gap-2">
                {SPEECH_CHALLENGES.map((challenge) => {
                  const isSelected = selectedChallenges.has(challenge.id);
                  return (
                    <button
                      key={challenge.id}
                      onClick={() => toggleSet(setSelectedChallenges, challenge.id)}
                      className={`text-left p-3 rounded-lg border transition-all text-sm ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{challenge.emoji}</span>
                        <span className="flex-1">{challenge.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Your #1 speech goal</p>
              <Textarea
                placeholder="e.g., Give my best man speech confidently in October"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                rows={2}
                className="resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Be specific — we&apos;ll show this on your dashboard as motivation.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(5)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={goToResults}>
                See My Results
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 7: Results Screen */}
        {step === 7 && scores && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Your Speech Assessment</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Here&apos;s your personalized profile, {name}.
              </p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 rounded-xl border bg-card">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-muted/30"
                    />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeDasharray={`${(scores.severityScore / 100) * 264} 264`}
                      strokeLinecap="round"
                      className="text-amber-500"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold">{scores.severityScore}</span>
                </div>
                <p className="text-xs font-medium text-muted-foreground mt-2">Severity Score</p>
              </div>

              <div className="text-center p-5 rounded-xl border bg-card">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-muted/30"
                    />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeDasharray={`${(scores.confidenceScore / 100) * 264} 264`}
                      strokeLinecap="round"
                      className="text-primary"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold">{scores.confidenceScore}</span>
                </div>
                <p className="text-xs font-medium text-muted-foreground mt-2">Confidence Score</p>
              </div>
            </div>

            {/* Profile Description */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-5 pb-4">
                <p className="text-sm leading-relaxed">
                  {getProfileDescription(scores.profile)}
                </p>
              </CardContent>
            </Card>

            {/* 90-Day Roadmap Preview */}
            <div>
              <h3 className="text-lg font-bold mb-3">Your 90-Day Fluency Roadmap</h3>
              <div className="space-y-2">
                {[
                  { phase: 1, weeks: "1-2", focus: "DAF Demo + AI Chat + First Challenge" },
                  { phase: 2, weeks: "3-4", focus: "Light Contact + FAF + Deeper Practice" },
                  { phase: 3, weeks: "5-7", focus: "Modification Techniques + CBT" },
                  { phase: 4, weeks: "8-10", focus: "Real Conversations + Phone Sims" },
                  { phase: 5, weeks: "11-13", focus: "Self-Directed + Graduation" },
                ].map((item) => (
                  <div
                    key={item.phase}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      item.phase === 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {item.phase}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {PHASE_LABELS[item.phase]}{" "}
                        <span className="text-muted-foreground font-normal">
                          (Weeks {item.weeks})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">{item.focus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* North Star */}
            {goalText.trim() && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
                <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Your North Star</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    &ldquo;{goalText.trim()}&rdquo;
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(6)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button size="lg" onClick={handleFinish}>
                <Rocket className="h-4 w-4 mr-2" />
                Begin Your Program
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
