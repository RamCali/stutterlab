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
  Target,
  Phone,
} from "lucide-react";
import { CommunicationsConsentForm } from "@/components/comms/communications-consent-form";
import { validateCommsConsentInput } from "@/lib/comms/consent";
import { isValidE164PhoneNumber } from "@/lib/sms/mvp";
import {
  FEARED_SITUATIONS,
  SPEECH_CHALLENGES,
  CONFIDENCE_SITUATIONS,
  AVOIDANCE_BEHAVIORS,
  FAMILY_HISTORY_OPTIONS,
  FAST_OR_UNCLEAR_SPEECH_OPTIONS,
  FLUENCY_PERSISTENCE_OPTIONS,
  PHYSICAL_BEHAVIORS,
  STUTTERING_TYPES,
  saveOnboardingData,
  type OnboardingData,
} from "@/lib/onboarding/feared-situations";
import { seedFearedWords } from "@/lib/feared-words/store";
import {
  calculateScores,
  getProfileDescription,
  type AssessmentScores,
} from "@/lib/onboarding/scoring";
import { PHASE_LABELS } from "@/lib/curriculum/daily-plans";

const SUGGESTED_WORDS = [
  "my name",
  "specifically",
  "presentation",
  "schedule",
  "telephone",
  "restaurant",
  "comfortable",
  "necessary",
  "particularly",
];

const WORD_PROMPT_CATEGORIES = [
  {
    title: "Personal words",
    prompts: "Your name, last name, company, school, city, street, email, job title",
  },
  {
    title: "High-pressure words",
    prompts: "Words you need for ordering, calls, interviews, meetings, dates, presentations",
  },
  {
    title: "Sound patterns",
    prompts: "Words starting with hard sounds like b, d, g, k, p, s, st, th, or vowels",
  },
];

const PAIN_POINTS = [
  {
    id: "starting-over",
    label: "I keep starting over",
    description: "I get motivated, practice for a bit, then fall out of rhythm.",
  },
  {
    id: "busy",
    label: "I am busy and need something realistic",
    description: "I do not have time for long sessions or complicated homework.",
  },
  {
    id: "alone",
    label: "I feel like I am doing this alone",
    description: "I want structure, accountability, and a plan that sees the real me.",
  },
  {
    id: "avoidance-cycle",
    label: "Avoidance keeps winning",
    description: "I skip calls, stay quiet, swap words, or let others speak for me.",
  },
  {
    id: "pressure-moments",
    label: "Pressure makes my speech harder",
    description: "My speech changes when people are waiting, watching, or judging.",
  },
  {
    id: "tried-before",
    label: "I have tried things before",
    description: "I know techniques, but I struggle to use them in real conversations.",
  },
];

const PRACTICE_TIMES = [
  { id: "morning", label: "Morning", desc: "Before the day starts" },
  { id: "midday", label: "Midday", desc: "Between work or school blocks" },
  { id: "evening", label: "Evening", desc: "After responsibilities settle" },
  { id: "before-event", label: "Before speaking events", desc: "Right before calls, meetings, or classes" },
];

const PRACTICE_PACES = [
  { id: "gentle", label: "Gentle ramp", desc: "Small wins first, then pressure" },
  { id: "balanced", label: "Balanced", desc: "Technique plus real-world practice" },
  { id: "challenge", label: "Challenge me", desc: "Faster exposure to hard situations" },
];

const COACHING_TONES = [
  { id: "calm", label: "Calm", desc: "Grounded and reassuring" },
  { id: "direct", label: "Direct", desc: "Clear, practical, no fluff" },
  { id: "encouraging", label: "Encouraging", desc: "Motivating and confidence-focused" },
];

const TOTAL_STEPS = 11;

interface OnboardingFlowProps {
  onComplete: (data?: OnboardingData) => void;
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
  const [wordReflection, setWordReflection] = useState("");

  // Step 5: Avoidance + Frequency
  const [selectedPainPoints, setSelectedPainPoints] = useState<Set<string>>(new Set());
  const [avoidanceBehaviors, setAvoidanceBehaviors] = useState<Set<string>>(new Set());
  const [speakingFrequency, setSpeakingFrequency] = useState("");

  // Step 6: Adult Fluency Context
  const [fluencyPersistence, setFluencyPersistence] = useState("");
  const [physicalBehaviors, setPhysicalBehaviors] = useState<Set<string>>(new Set());
  const [fastOrUnclearSpeech, setFastOrUnclearSpeech] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");

  // Step 7: Goals
  const [selectedChallenges, setSelectedChallenges] = useState<Set<string>>(new Set());
  const [goalText, setGoalText] = useState("");

  // Step 8: Practice fit + buy-in
  const [preferredPracticeTime, setPreferredPracticeTime] = useState("");
  const [practicePace, setPracticePace] = useState("");
  const [coachingTone, setCoachingTone] = useState("");
  const [commitmentReason, setCommitmentReason] = useState("");

  // Step 9: Communications consent
  const [contactPhoneNumber, setContactPhoneNumber] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [phoneCallConsent, setPhoneCallConsent] = useState(false);
  const [commsError, setCommsError] = useState<string | null>(null);

  // Step 10: Results
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
    addWordsFromText(currentWordInput);
    setCurrentWordInput("");
  }

  function addWordsFromText(text: string) {
    const words = text
      .split(/[\n,;]+/)
      .map((word) => word.trim().toLowerCase().replace(/\s+/g, " "))
      .filter(Boolean);

    if (words.length === 0) return;
    setFearedWordInputs((prev) => Array.from(new Set([...prev, ...words])));
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
      fluencyPersistence,
      physicalBehaviors: Array.from(physicalBehaviors),
      fastOrUnclearSpeech,
      familyHistory,
    };
  }

  function goToCommsConsent() {
    addWordsFromText(currentWordInput);
    setCommsError(null);
    setStep(9);
  }

  function skipCommsConsent() {
    setContactPhoneNumber("");
    setSmsConsent(false);
    setPhoneCallConsent(false);
    setCommsError(null);
    goToResults();
  }

  function goToResults() {
    const validationError = validateCommsConsentInput({
      contactPhoneNumber,
      smsConsent,
      phoneCallConsent,
      isValidE164: isValidE164PhoneNumber,
    });
    if (validationError) {
      setCommsError(validationError);
      return;
    }

    setCommsError(null);
    const result = calculateScores(buildScoringInput());
    setScores(result);
    setStep(10);
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
      fearedWords: fearedWordInputs,
      wordReflection: wordReflection.trim(),
      painPoints: Array.from(selectedPainPoints),
      preferredPracticeTime,
      practicePace,
      coachingTone,
      commitmentReason: commitmentReason.trim(),
      confidenceRatings,
      avoidanceBehaviors: Array.from(avoidanceBehaviors),
      stutteringTypes: Array.from(stutteringTypes),
      speakingFrequency,
      stutterFrequency,
      stutterDuration,
      stutterImpact,
      severityScore: computed.severityScore,
      confidenceScore: computed.confidenceScore,
      fluencyPersistence,
      physicalBehaviors: Array.from(physicalBehaviors),
      fastOrUnclearSpeech,
      familyHistory,
      referralGuidance: computed.referralGuidance,
      contactPhoneNumber: contactPhoneNumber.trim() || undefined,
      smsConsent: smsConsent || undefined,
      phoneCallConsent: phoneCallConsent || undefined,
    };
    saveOnboardingData(data);

    seedFearedWords(fearedWordInputs);

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
          wordReflection: wordReflection.trim(),
          painPoints: Array.from(selectedPainPoints),
          preferredPracticeTime,
          practicePace,
          coachingTone,
          commitmentReason: commitmentReason.trim(),
          confidenceRatings,
          avoidanceBehaviors: Array.from(avoidanceBehaviors),
          stutteringTypes: Array.from(stutteringTypes),
          speakingFrequency,
          stutterFrequency,
          stutterDuration,
          stutterImpact,
          severityScore: computed.severityScore,
          confidenceScore: computed.confidenceScore,
          fluencyPersistence,
          physicalBehaviors: Array.from(physicalBehaviors),
          fastOrUnclearSpeech,
          familyHistory,
          referralGuidance: computed.referralGuidance,
          assessmentProfile: computed.profile,
          recommendedEmphasis: computed.recommendedEmphasis,
          contactPhoneNumber: contactPhoneNumber.trim() || null,
          smsConsent,
          phoneCallConsent,
        }),
      });

      if (smsConsent && contactPhoneNumber.trim()) {
        await fetch("/api/sms/welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: contactPhoneNumber.trim() }),
        }).catch(() => {
          // Welcome text is best-effort during onboarding
        });
      }
    } catch {
      // localStorage fallback is sufficient
    }

    onComplete(data);
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
              <p className="text-sm text-muted-foreground mt-2">
                For adults 18+. This assessment guides practice and does not diagnose a fluency disorder.
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
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
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
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
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
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Stuttering Types */}
            <div>
              <label className="text-sm font-medium">
                What types of disfluency do you experience?
              </label>
              <p className="text-sm text-muted-foreground mt-0.5 mb-2">Select all that apply.</p>
              <div className="space-y-4">
                {[
                  { category: "typical", heading: "Typical speech breaks" },
                  { category: "stutter-like", heading: "More stutter-like" },
                ].map((group) => (
                  <div key={group.category} className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {group.heading}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {STUTTERING_TYPES.filter((type) => type.category === group.category).map((type) => {
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
                              <p className="text-sm text-muted-foreground">{type.description}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Example: {type.example}
                              </p>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
              <p className="text-sm text-muted-foreground text-center">
                Please answer the required questions above to continue.
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
                          className={`h-8 w-8 rounded-full text-sm font-semibold transition-all ${
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
              <p className="text-sm text-muted-foreground text-center">
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
                        <p className="text-sm text-muted-foreground mt-0.5">
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
                  <Badge variant="secondary" className="text-sm">
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
              <h2 className="text-2xl font-bold">Which words make you scan ahead?</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Add the words you avoid, swap, rush, or tense up before. These seed your feared-word
                drills from day one.
              </p>
            </div>

            <div className="grid gap-2">
              {WORD_PROMPT_CATEGORIES.map((category) => (
                <div key={category.title} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{category.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{category.prompts}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Add words or phrases</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Name, company, presentation, coffee..."
                  value={currentWordInput}
                  onChange={(e) => setCurrentWordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWord()}
                  autoFocus
                />
                <Button size="sm" onClick={addWord} disabled={!currentWordInput.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Separate multiple entries with commas. You can include short phrases like your full name.
              </p>
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

            <div>
              <label className="text-sm font-medium">
                What usually happens when one of these words is coming up?
              </label>
              <Textarea
                placeholder="e.g., I switch words, look away, push harder, rush, or stop talking."
                value={wordReflection}
                onChange={(e) => setWordReflection(e.target.value)}
                rows={3}
                className="mt-1.5 resize-none"
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Common difficult words — tap to add:
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {SUGGESTED_WORDS.map((word) => {
                  const isAdded = fearedWordInputs.includes(word);
                  return (
                    <button
                      key={word}
                      onClick={() => toggleSuggested(word)}
                      className={`text-sm px-2.5 py-1 rounded-full border transition-all ${
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
                  <Badge variant="secondary" className="text-sm">
                    {fearedWordInputs.length} word{fearedWordInputs.length !== 1 ? "s" : ""}
                  </Badge>
                )}
                <Button
                  onClick={() => {
                    addWordsFromText(currentWordInput);
                    setCurrentWordInput("");
                    setStep(5);
                  }}
                >
                  {fearedWordInputs.length === 0 ? "Skip" : "Continue"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Pain Points + Avoidance Behaviors + Speaking Frequency */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                What feels most frustrating right now?
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Tap every struggle that feels true. We use this to personalize your plan and keep it realistic.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Which pain points sound like you?</label>
              <div className="grid grid-cols-1 gap-2 mt-1.5">
                {PAIN_POINTS.map((pain) => {
                  const isSelected = selectedPainPoints.has(pain.id);
                  return (
                    <button
                      key={pain.id}
                      onClick={() => toggleSet(setSelectedPainPoints, pain.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium flex-1">{pain.label}</p>
                        {isSelected && (
                          <Badge variant="secondary" className="text-xs">
                            That&apos;s my struggle
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {pain.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Do any of these sound like you?</label>
              <p className="text-sm text-muted-foreground mt-0.5 mb-2">Select all that apply.</p>
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
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(4)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={() => setStep(6)}
                disabled={selectedPainPoints.size === 0}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            {selectedPainPoints.size === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Choose at least one pain point so your plan can reflect what matters most.
              </p>
            )}
          </div>
        )}

        {/* Step 6: Adult Fluency Context */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">A little more context</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                These adult-only questions help us tailor practice. They are not used for diagnosis.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">
                How long have fluency difficulties been part of your life?
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {FLUENCY_PERSISTENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFluencyPersistence(opt.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      fluencyPersistence === opt.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                Do any physical behaviors happen during difficult speaking moments?
              </label>
              <p className="text-sm text-muted-foreground mt-0.5 mb-2">Select all that apply.</p>
              <div className="space-y-2">
                {PHYSICAL_BEHAVIORS.map((behavior) => {
                  const isSelected = physicalBehaviors.has(behavior.id);
                  return (
                    <button
                      key={behavior.id}
                      onClick={() => toggleSet(setPhysicalBehaviors, behavior.id)}
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
              <label className="text-sm font-medium">
                Do you ever speak faster or less clearly than you intend?
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {FAST_OR_UNCLEAR_SPEECH_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFastOrUnclearSpeech(opt.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      fastOrUnclearSpeech === opt.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                Does stuttering or cluttering run in your family?
              </label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {FAMILY_HISTORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFamilyHistory(opt.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      familyHistory === opt.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(5)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={() => setStep(7)}
                disabled={!fluencyPersistence || !fastOrUnclearSpeech || !familyHistory}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 7: Speech Goals / North Star */}
        {step === 7 && (
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
              <p className="text-sm text-muted-foreground mt-1">
                Be specific — we&apos;ll show this on your dashboard as motivation.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(6)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={() => setStep(8)}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 8: Practice Fit + Buy-In */}
        {step === 8 && (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-10 w-10 text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold">Build a plan you&apos;ll actually use</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                The best program is the one that fits your real life. These details shape your reminders,
                challenge intensity, and coaching style.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">When are you most likely to practice?</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {PRACTICE_TIMES.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPreferredPracticeTime(opt.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      preferredPracticeTime === opt.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">What pace feels right for week one?</label>
              <div className="grid grid-cols-1 gap-2 mt-1.5">
                {PRACTICE_PACES.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPracticePace(opt.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      practicePace === opt.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">How should StutterLab coach you?</label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {COACHING_TONES.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCoachingTone(opt.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      coachingTone === opt.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Why is now the right time to work on this?</p>
              <Textarea
                placeholder="e.g., I want to stop avoiding calls before my new job starts."
                value={commitmentReason}
                onChange={(e) => setCommitmentReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(7)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={goToCommsConsent}
                disabled={!preferredPracticeTime || !practicePace || !coachingTone}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 9: Communications consent */}
        {step === 9 && (
          <div className="space-y-6">
            <div className="text-center">
              <Phone className="h-10 w-10 text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold">Practice reminders &amp; calls</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Optional. Add your mobile number if you want text nudges or AI phone practice
                calls. You can change this anytime in Settings.
              </p>
            </div>

            <CommunicationsConsentForm
              phoneNumber={contactPhoneNumber}
              onPhoneNumberChange={setContactPhoneNumber}
              smsConsent={smsConsent}
              onSmsConsentChange={setSmsConsent}
              phoneCallConsent={phoneCallConsent}
              onPhoneCallConsentChange={setPhoneCallConsent}
              error={commsError}
            />

            <div className="flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(8)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={skipCommsConsent}>
                  Skip for now
                </Button>
                <Button onClick={goToResults}>
                  See My Results
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 10: Results Screen */}
        {step === 10 && scores && (
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
                <p className="text-sm font-medium text-muted-foreground mt-2">Severity Score</p>
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
                <p className="text-sm font-medium text-muted-foreground mt-2">Confidence Score</p>
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

            {scores.referralGuidance.shouldRecommendSlp && (
              <Card className="border-amber-300/60 bg-amber-50 dark:bg-amber-950/20">
                <CardContent className="pt-5 pb-4">
                  <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
                    We recommend involving a speech-language pathologist.
                  </p>
                  <p className="text-sm text-amber-900/80 dark:text-amber-100/80 mt-1">
                    StutterLab can support adult practice, but these answers suggest a licensed
                    SLP could provide helpful evaluation and guidance.
                  </p>
                  <ul className="mt-2 space-y-1">
                    {scores.referralGuidance.reasons.map((reason) => (
                      <li key={reason} className="text-xs text-amber-900/80 dark:text-amber-100/80">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

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
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
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
                      <p className="text-sm text-muted-foreground">{item.focus}</p>
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
                  <p className="text-sm text-muted-foreground mt-0.5">
                    &ldquo;{goalText.trim()}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {fearedWordInputs.length > 0 && (
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">Your first feared-word drills</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  We&apos;ll start with these in word-level exposure, then move into phrases,
                  sentences, and paragraphs.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {fearedWordInputs.slice(0, 8).map((word) => (
                    <Badge key={word} variant="secondary" className="text-xs">
                      {word}
                    </Badge>
                  ))}
                  {fearedWordInputs.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{fearedWordInputs.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(8)}>
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
