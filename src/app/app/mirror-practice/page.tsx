"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  ChevronRight,
  Camera,
  CameraOff,
} from "lucide-react";
import { getExerciseById } from "@/lib/exercises/exercise-data";
import { CoachingPanel } from "@/components/coaching/coaching-panel";
import { completeExercise } from "@/lib/actions/exercises";
import { useRouter } from "next/navigation";

const MIRROR_PROMPTS = [
  { title: "Introduce Yourself", prompt: "Say your name, where you're from, and one thing you enjoy.", duration: 60 },
  { title: "Describe Your Day", prompt: "Talk about what you did today or plan to do.", duration: 90 },
  { title: "Tell a Story", prompt: "Share a short story about something memorable.", duration: 90 },
  { title: "Order at a Restaurant", prompt: "Pretend you're ordering food — describe what you want.", duration: 60 },
  { title: "Explain Your Job", prompt: "Tell your reflection what you do for work or school.", duration: 90 },
  { title: "Give a Compliment", prompt: "Say something kind to yourself out loud.", duration: 45 },
  { title: "Phone Call Practice", prompt: "Pretend you're calling to make an appointment.", duration: 90 },
  { title: "Describe a Person", prompt: "Describe someone you admire — their qualities and why.", duration: 90 },
];

interface PromptRating {
  eyeContact: number;
  tension: number;
  confidence: number;
}

type Phase = "instructions" | "camera-setup" | "speaking" | "rating" | "summary" | "complete";

export default function MirrorPracticePage() {
  const router = useRouter();
  const exercise = getExerciseById("mirror-practice")!;

  const [phase, setPhase] = useState<Phase>("instructions");
  const [promptIndex, setPromptIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [ratings, setRatings] = useState<PromptRating[]>([]);
  const [currentRating, setCurrentRating] = useState<PromptRating>({ eyeContact: 0, tension: 0, confidence: 0 });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [saving, setSaving] = useState(false);
  const [promptsToComplete] = useState(3);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef(0);

  // Initialize session start time on mount
  useEffect(() => {
    sessionStartRef.current = Date.now();
  }, []);

  const currentPrompt = MIRROR_PROMPTS[promptIndex];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPhase("speaking");
      startTimer();
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") {
        setCameraError("Camera access denied. Please allow camera permission in your browser settings.");
      } else if (name === "NotFoundError") {
        setCameraError("No camera found. Please connect a camera and try again.");
      } else {
        setCameraError("Could not access camera. Please check your browser settings.");
      }
    }
  }

  function startTimer() {
    setTimeLeft(currentPrompt.duration);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function finishPrompt() {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("rating");
  }

  function submitRating() {
    const newRatings = [...ratings, currentRating];
    setRatings(newRatings);
    setCurrentRating({ eyeContact: 0, tension: 0, confidence: 0 });

    if (newRatings.length >= promptsToComplete) {
      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setPhase("summary");
    } else {
      setPromptIndex((i) => (i + 1) % MIRROR_PROMPTS.length);
      setPhase("speaking");
      startTimer();
    }
  }

  async function handleComplete() {
    if (saving) return;
    setSaving(true);
    const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
    try {
      const avgConfidence = Math.round(ratings.reduce((s, r) => s + r.confidence, 0) / ratings.length);
      const result = await completeExercise({
        exerciseId: "mirror-practice",
        exerciseType: "mirror_practice",
        durationSeconds,
        selfRatedFluency: avgConfidence,
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
          <p className="text-muted-foreground">Mirror Practice</p>
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
            <div className="p-1.5 rounded-md bg-emerald-500/10">
              <Eye className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="font-medium text-sm">Mirror Practice</span>
          </div>
          <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">
            Intermediate
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {/* Instructions */}
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

            <div className="mt-auto">
              <Button className="w-full" onClick={() => { setPhase("camera-setup"); startCamera(); }}>
                <Camera className="h-4 w-4 mr-2" />
                Open Camera & Start
              </Button>
            </div>
          </div>
        )}

        {/* Camera setup (error state) */}
        {phase === "camera-setup" && cameraError && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <CameraOff className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-red-400 text-center">{cameraError}</p>
            <Button variant="outline" onClick={startCamera}>Try Again</Button>
          </div>
        )}

        {/* Speaking phase */}
        {phase === "speaking" && (
          <div className="flex-1 flex flex-col">
            {/* Camera mirror */}
            <div className="relative rounded-xl overflow-hidden mb-4 bg-black aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              {/* Timer overlay */}
              <div className="absolute top-3 right-3">
                <Badge
                  variant="secondary"
                  className={`font-mono text-sm ${timeLeft <= 10 ? "bg-red-500/80 text-white" : "bg-black/60 text-white"}`}
                >
                  {formatTime(timeLeft)}
                </Badge>
              </div>
              {/* Prompt counter */}
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-black/60 text-white text-xs">
                  {ratings.length + 1}/{promptsToComplete}
                </Badge>
              </div>
            </div>

            {/* Prompt card */}
            <Card className="mb-4">
              <CardContent className="pt-4">
                <h3 className="font-bold text-lg mb-1">{currentPrompt.title}</h3>
                <p className="text-sm text-muted-foreground">{currentPrompt.prompt}</p>
              </CardContent>
            </Card>

            <div className="mt-auto">
              <Button
                className="w-full"
                onClick={finishPrompt}
              >
                {timeLeft === 0 ? "Time's up — Rate yourself" : "Done speaking — Rate yourself"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Rating phase */}
        {phase === "rating" && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-center">Rate this prompt</h2>
            <p className="text-sm text-center text-muted-foreground mb-6">{currentPrompt.title}</p>

            <div className="space-y-6 mb-6">
              <RatingRow
                label="Eye Contact"
                description="Did you maintain eye contact with your reflection?"
                value={currentRating.eyeContact}
                onChange={(v) => setCurrentRating((r) => ({ ...r, eyeContact: v }))}
              />
              <RatingRow
                label="Tension"
                description="How relaxed was your face? (5 = very relaxed)"
                value={currentRating.tension}
                onChange={(v) => setCurrentRating((r) => ({ ...r, tension: v }))}
              />
              <RatingRow
                label="Confidence"
                description="How confident did you feel speaking?"
                value={currentRating.confidence}
                onChange={(v) => setCurrentRating((r) => ({ ...r, confidence: v }))}
              />
            </div>

            <div className="mt-auto">
              <Button
                className="w-full"
                onClick={submitRating}
                disabled={currentRating.eyeContact === 0 || currentRating.tension === 0 || currentRating.confidence === 0}
              >
                {ratings.length + 1 >= promptsToComplete ? "See Summary" : "Next Prompt"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Summary phase */}
        {phase === "summary" && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-center">Session Summary</h2>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-xs text-muted-foreground">Eye Contact</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {(ratings.reduce((s, r) => s + r.eyeContact, 0) / ratings.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">/5</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-xs text-muted-foreground">Relaxation</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {(ratings.reduce((s, r) => s + r.tension, 0) / ratings.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">/5</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {(ratings.reduce((s, r) => s + r.confidence, 0) / ratings.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">/5</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-4">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  {ratings.reduce((s, r) => s + r.confidence, 0) / ratings.length >= 4
                    ? "Excellent confidence! You're building a strong habit of speaking naturally to yourself."
                    : ratings.reduce((s, r) => s + r.confidence, 0) / ratings.length >= 3
                    ? "Good progress! Keep practicing — mirror work builds confidence over time."
                    : "This is great practice. The more you do it, the more natural it will feel. Keep going!"}
                </p>
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

function RatingRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-10 w-10 rounded-full text-sm font-bold border-2 transition-all ${
              value === n
                ? "bg-emerald-500 border-emerald-500 text-white scale-110"
                : "border-emerald-500/30 text-emerald-500 hover:border-emerald-500"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
