"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Mic,
  Square,
  Headphones,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  AudioWaveform,
  ArrowRight,
} from "lucide-react";
import { useDafAudio } from "@/hooks/useDafAudio";
import { getExerciseById } from "@/lib/exercises/exercise-data";
import { CoachingPanel } from "@/components/coaching/coaching-panel";
import { completeExercise } from "@/lib/actions/exercises";
import { useRouter } from "next/navigation";

const PASSAGES = [
  {
    title: "The Rainbow Passage",
    text: "When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow. The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon.",
  },
  {
    title: "A Summer Day",
    text: "The ocean waves rolled gently onto the shore as the sun began to set. A cool breeze carried the scent of salt and seaweed. Children played near the water's edge while their parents watched from colorful beach chairs. It was the perfect end to a long summer day.",
  },
  {
    title: "The Practice Path",
    text: "Speaking is a skill that improves with practice. Every time you use your techniques — gentle onset, light contact, or pacing — you build new neural pathways. The key is consistency, not perfection. Some days will feel easier than others, and that is completely normal.",
  },
];

type Phase = "instructions" | "daf-reading" | "daf-rating" | "raw-reading" | "raw-rating" | "reflect" | "complete";

export default function DafReadingPage() {
  const router = useRouter();
  const exercise = getExerciseById("daf-reading")!;

  const [phase, setPhase] = useState<Phase>("instructions");
  const [passageIndex] = useState(() => Math.floor(Math.random() * PASSAGES.length));
  const [dafDelay, setDafDelay] = useState(70);
  const [dafRating, setDafRating] = useState(0);
  const [rawRating, setRawRating] = useState(0);
  const [dafDuration, setDafDuration] = useState(0);
  const [rawDuration, setRawDuration] = useState(0);
  const [reflection, setReflection] = useState("");
  const [xpEarned, setXpEarned] = useState(0);
  const [saving, setSaving] = useState(false);

  const [sessionStart] = useState(() => Date.now());
  const audio = useDafAudio({ delayMs: dafDelay });

  const passage = PASSAGES[passageIndex];

  async function startDafReading() {
    audio.setDafEnabled(true);
    audio.setDelayMs(dafDelay);
    await audio.start();
  }

  function stopDafReading() {
    setDafDuration(audio.elapsedSeconds);
    audio.stop();
    setPhase("daf-rating");
  }

  async function startRawReading() {
    audio.setDafEnabled(false);
    await audio.start();
  }

  function stopRawReading() {
    setRawDuration(audio.elapsedSeconds);
    audio.stop();
    setPhase("raw-rating");
  }

  async function handleComplete() {
    if (saving) return;
    setSaving(true);
    const durationSeconds = Math.round((Date.now() - sessionStart) / 1000);
    try {
      const result = await completeExercise({
        exerciseId: "daf-reading",
        exerciseType: "daf_reading",
        durationSeconds,
        selfRatedFluency: Math.round((dafRating + rawRating) / 2),
      });
      setXpEarned(result.xp);
      setPhase("complete");
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setSaving(false);
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Completion screen
  if (phase === "complete") {
    return (
      <div className="p-6 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Exercise Complete!</h2>
          <p className="text-muted-foreground">DAF-Assisted Reading</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="font-semibold text-amber-500">+{xpEarned} XP</span>
        </div>
        <Button onClick={() => router.push("/app/exercises")} className="mt-4">
          Back to Exercises
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-background">
        <div className="flex items-center justify-between">
          <Link href="/app/exercises">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-violet-500/10">
              <Headphones className="h-4 w-4 text-violet-500" />
            </div>
            <span className="font-medium text-sm">DAF-Assisted Reading</span>
            <Badge variant="outline" className="text-xs">PRO</Badge>
          </div>
          <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
            Beginner
          </Badge>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          {["DAF On", "Rate", "DAF Off", "Rate", "Reflect"].map((label, i) => {
            const phaseMap: Phase[] = ["daf-reading", "daf-rating", "raw-reading", "raw-rating", "reflect"];
            const currentPhaseIdx = phaseMap.indexOf(phase);
            const isActive = i === currentPhaseIdx;
            const isDone = i < currentPhaseIdx;
            return (
              <div key={i} className="flex items-center gap-1">
                <div
                  className={`h-6 px-2 rounded-full text-xs flex items-center ${
                    isActive
                      ? "bg-violet-500 text-white"
                      : isDone
                      ? "bg-violet-500/20 text-violet-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                  {label}
                </div>
                {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {/* Instructions phase */}
        {phase === "instructions" && (
          <div className="flex-1 flex flex-col">
            <Card className="mb-4">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">How this works</p>
                </div>
                <ol className="space-y-1.5 ml-6">
                  {exercise.instructions.map((step, i) => (
                    <li key={i} className="text-xs text-muted-foreground list-decimal">
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <CoachingPanel tips={exercise.coachingTips} rubric={exercise.feedbackRubric} />

            {/* DAF delay slider */}
            <Card className="mt-4 mb-4">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">DAF Delay</span>
                  <Badge variant="outline" className="text-xs font-mono">{dafDelay}ms</Badge>
                </div>
                <input
                  type="range"
                  min={50}
                  max={150}
                  step={10}
                  value={dafDelay}
                  onChange={(e) => setDafDelay(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>50ms (subtle)</span>
                  <span>150ms (strong)</span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-auto">
              <Button className="w-full" onClick={() => setPhase("daf-reading")}>
                <Headphones className="h-4 w-4 mr-2" />
                Start Phase 1: Read with DAF
              </Button>
            </div>
          </div>
        )}

        {/* DAF Reading phase */}
        {phase === "daf-reading" && (
          <div className="flex-1 flex flex-col">
            <Badge className="self-center mb-4 bg-violet-500">Phase 1: DAF ON — {dafDelay}ms delay</Badge>

            <Card className="mb-4 flex-1">
              <CardContent className="pt-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">{passage.title}</h3>
                <p className="text-lg leading-relaxed">{passage.text}</p>
              </CardContent>
            </Card>

            {/* Waveform + Record */}
            <div className="border-t pt-4">
              <div className="flex items-end justify-center gap-[2px] h-16 mb-3">
                {audio.bars.map((height, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      audio.isActive ? "bg-violet-500" : "bg-muted"
                    }`}
                    style={{ height: `${Math.max(height, 3)}%` }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-6">
                <span className="text-sm font-mono text-muted-foreground w-12 text-right">
                  {formatTime(audio.elapsedSeconds)}
                </span>
                {audio.isActive ? (
                  <Button size="lg" variant="destructive" className="rounded-full h-14 w-14" onClick={stopDafReading}>
                    <Square className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button size="lg" className="rounded-full h-14 w-14 bg-violet-500 hover:bg-violet-600" onClick={startDafReading}>
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
                <span className="text-xs text-muted-foreground w-12">
                  {audio.isActive ? (
                    <span className="text-violet-500 animate-pulse flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-violet-500" />
                      REC
                    </span>
                  ) : "Ready"}
                </span>
              </div>

              {audio.micError && <p className="text-center text-sm text-red-400 mt-2">{audio.micError}</p>}

              {audio.isActive && (
                <p className="text-center text-xs text-violet-500 mt-2 flex items-center justify-center gap-1">
                  <AudioWaveform className="h-3 w-3" />
                  DAF Active — {dafDelay}ms delay
                </p>
              )}
            </div>
          </div>
        )}

        {/* DAF Rating phase */}
        {phase === "daf-rating" && (
          <RatingPhase
            label="With DAF"
            duration={dafDuration}
            rating={dafRating}
            setRating={setDafRating}
            onNext={() => setPhase("raw-reading")}
            accentColor="violet"
          />
        )}

        {/* Raw Reading phase */}
        {phase === "raw-reading" && (
          <div className="flex-1 flex flex-col">
            <Badge className="self-center mb-4 bg-amber-500">Phase 2: DAF OFF — Raw Reading</Badge>

            <Card className="mb-4 flex-1">
              <CardContent className="pt-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">{passage.title}</h3>
                <p className="text-lg leading-relaxed">{passage.text}</p>
              </CardContent>
            </Card>

            {/* Waveform + Record */}
            <div className="border-t pt-4">
              <div className="flex items-end justify-center gap-[2px] h-16 mb-3">
                {audio.bars.map((height, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      audio.isActive ? "bg-amber-500" : "bg-muted"
                    }`}
                    style={{ height: `${Math.max(height, 3)}%` }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-6">
                <span className="text-sm font-mono text-muted-foreground w-12 text-right">
                  {formatTime(audio.elapsedSeconds)}
                </span>
                {audio.isActive ? (
                  <Button size="lg" variant="destructive" className="rounded-full h-14 w-14" onClick={stopRawReading}>
                    <Square className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button size="lg" className="rounded-full h-14 w-14 bg-amber-500 hover:bg-amber-600" onClick={startRawReading}>
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
                <span className="text-xs text-muted-foreground w-12">
                  {audio.isActive ? (
                    <span className="text-amber-500 animate-pulse flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      REC
                    </span>
                  ) : "Ready"}
                </span>
              </div>

              {audio.micError && <p className="text-center text-sm text-red-400 mt-2">{audio.micError}</p>}
            </div>
          </div>
        )}

        {/* Raw Rating phase */}
        {phase === "raw-rating" && (
          <RatingPhase
            label="Without DAF"
            duration={rawDuration}
            rating={rawRating}
            setRating={setRawRating}
            onNext={() => setPhase("reflect")}
            accentColor="amber"
          />
        )}

        {/* Reflect phase */}
        {phase === "reflect" && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-center">Compare & Reflect</h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <AudioWaveform className="h-5 w-5 text-violet-500 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">With DAF</p>
                  <p className="text-2xl font-bold text-violet-500">{dafRating}/5</p>
                  <p className="text-xs text-muted-foreground">{formatTime(dafDuration)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <Mic className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Without DAF</p>
                  <p className="text-2xl font-bold text-amber-500">{rawRating}/5</p>
                  <p className="text-xs text-muted-foreground">{formatTime(rawDuration)}</p>
                </CardContent>
              </Card>
            </div>

            {dafRating > rawRating && (
              <p className="text-sm text-center text-violet-400 mb-4">
                DAF helped! You rated your fluency higher with delayed feedback.
              </p>
            )}
            {rawRating > dafRating && (
              <p className="text-sm text-center text-amber-400 mb-4">
                Interesting — you felt more fluent without DAF. Your natural speech is strong!
              </p>
            )}
            {dafRating === rawRating && dafRating > 0 && (
              <p className="text-sm text-center text-muted-foreground mb-4">
                Same rating both ways — great awareness of your own fluency.
              </p>
            )}

            <Card className="mb-4">
              <CardContent className="pt-4">
                <p className="text-sm font-medium mb-2">What did you notice?</p>
                <Textarea
                  placeholder="Did DAF change your pace? Did you feel less tension? What surprised you?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </CardContent>
            </Card>

            <div className="mt-auto">
              <Button className="w-full" onClick={handleComplete} disabled={saving}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Complete Exercise"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RatingPhase({
  label,
  duration,
  rating,
  setRating,
  onNext,
  accentColor,
}: {
  label: string;
  duration: number;
  rating: number;
  setRating: (r: number) => void;
  onNext: () => void;
  accentColor: string;
}) {
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <h2 className="text-lg font-bold mb-2">How fluent did that feel?</h2>
      <p className="text-sm text-muted-foreground mb-1">{label} — {formatTime(duration)}</p>
      <div className="flex gap-3 my-6">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className={`h-12 w-12 rounded-full text-lg font-bold border-2 transition-all ${
              rating === n
                ? `bg-${accentColor}-500 border-${accentColor}-500 text-white scale-110`
                : `border-${accentColor}-500/30 text-${accentColor}-500 hover:border-${accentColor}-500`
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between w-full max-w-xs text-xs text-muted-foreground mb-6">
        <span>Very disfluent</span>
        <span>Very fluent</span>
      </div>
      <Button onClick={onNext} disabled={rating === 0}>
        Continue
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
