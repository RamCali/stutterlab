"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mic,
  Square,
  Users,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  ChevronRight,
  Volume2,
  Crown,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { getExerciseById } from "@/lib/exercises/exercise-data";
import { CoachingPanel } from "@/components/coaching/coaching-panel";
import { completeExercise } from "@/lib/actions/exercises";
import { useRouter } from "next/navigation";
import { useDeepgramSTT } from "@/hooks/useDeepgramSTT";

const READING_PASSAGES = [
  {
    title: "The Rainbow Passage",
    sections: [
      "When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow. The rainbow is a division of white light into many beautiful colors.",
      "These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon.",
      "There is, according to legend, a boiling pot of gold at one end. People look, but no one ever finds it.",
    ],
  },
  {
    title: "A Morning Walk",
    sections: [
      "The morning air was crisp and clean as I stepped outside. Dew glistened on the grass, and birds sang in the trees overhead.",
      "I walked along the familiar path through the neighborhood, greeting a few early risers along the way. A woman jogged past with her dog, and I waved hello.",
      "By the time I returned home, the sun had fully risen and the day felt full of possibility. There's something about a morning walk that sets the right tone.",
    ],
  },
  {
    title: "The Bookshop",
    sections: [
      "The old bookshop on the corner had been there for as long as anyone could remember. Its wooden shelves were packed with stories from every era and genre imaginable.",
      "Stepping inside was like entering another world. The smell of aged paper filled the air, and soft music played from a speaker behind the counter.",
      "The owner, a kind woman with silver hair, always had a recommendation ready. She believed that every person had a perfect book waiting for them somewhere on those shelves.",
    ],
  },
];

interface AIFeedback {
  feedback: string;
  question?: string;
}

type Phase = "instructions" | "reading" | "ai-feedback" | "complete";

export default function ReadingToAIPage() {
  const router = useRouter();
  const exercise = getExerciseById("reading-to-ai")!;

  const [phase, setPhase] = useState<Phase>("instructions");
  const [passageIndex] = useState(() => Math.floor(Math.random() * READING_PASSAGES.length));
  const [sectionIndex, setSectionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedbacks, setFeedbacks] = useState<AIFeedback[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<AIFeedback | null>(null);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [saving, setSaving] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionStartRef = useRef(Date.now());

  const deepgram = useDeepgramSTT({
    onError: (msg) => setMicError(msg),
  });

  const passage = READING_PASSAGES[passageIndex];
  const currentSection = passage.sections[sectionIndex];
  const isLastSection = sectionIndex === passage.sections.length - 1;

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  // Sync deepgram transcript to local state
  useEffect(() => {
    if (isRecording) {
      setTranscript(deepgram.transcript);
    }
  }, [deepgram.transcript, isRecording]);

  async function startRecording() {
    setMicError(null);
    setTranscript("");

    const success = await deepgram.start();
    if (success) {
      setIsRecording(true);
    }
  }

  async function stopAndGetFeedback() {
    deepgram.stop();
    setIsRecording(false);
    setIsFetchingFeedback(true);

    try {
      const res = await fetch("/api/reading-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage: currentSection,
          transcript: (deepgram.finalTranscript || transcript).trim() || "(no transcription captured)",
          sectionIndex,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch feedback");
      const data: AIFeedback = await res.json();
      setCurrentFeedback(data);
      setFeedbacks((prev) => [...prev, data]);

      // Play TTS
      await playTTS(data.feedback + (data.question ? " " + data.question : ""));
    } catch (err) {
      console.error("Feedback error:", err);
      setCurrentFeedback({ feedback: "Great job reading that section! Keep going." });
    }

    setIsFetchingFeedback(false);
    setPhase("ai-feedback");
  }

  async function playTTS(text: string) {
    setIsPlayingTTS(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setIsPlayingTTS(false);
          URL.revokeObjectURL(url);
        };
        audio.play();
        return;
      }
    } catch {}

    // Fallback to browser TTS
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.onend = () => setIsPlayingTTS(false);
      speechSynthesis.speak(utterance);
    } else {
      setIsPlayingTTS(false);
    }
  }

  function nextSection() {
    if (isLastSection) {
      handleComplete();
    } else {
      setSectionIndex((i) => i + 1);
      setTranscript("");
      setCurrentFeedback(null);
      setPhase("reading");
    }
  }

  async function handleComplete() {
    if (saving) return;
    setSaving(true);
    const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
    try {
      const result = await completeExercise({
        exerciseId: "reading-to-ai",
        exerciseType: "reading_to_ai",
        durationSeconds,
      });
      setXpEarned(result.xp);
      setPhase("complete");
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setSaving(false);
  }

  // Completion screen
  if (phase === "complete") {
    return (
      <div className="p-6 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Exercise Complete!</h2>
          <p className="text-muted-foreground">Reading to AI Listener</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="font-semibold text-amber-500">+{xpEarned} XP</span>
        </div>

        {/* Show all feedbacks */}
        {feedbacks.length > 0 && (
          <Card className="w-full">
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-2">AI Listener Feedback</p>
              <div className="space-y-2">
                {feedbacks.map((fb, i) => (
                  <div key={i} className="text-xs text-muted-foreground border-l-2 border-teal-500 pl-2">
                    <p>{fb.feedback}</p>
                    {fb.question && <p className="italic mt-1">{fb.question}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
            <div className="p-1.5 rounded-md bg-teal-500/10">
              <Users className="h-4 w-4 text-teal-500" />
            </div>
            <span className="font-medium text-sm">Reading to AI</span>
            <Badge variant="outline" className="text-xs">
              <Crown className="h-2.5 w-2.5 mr-0.5" />
              PRO
            </Badge>
          </div>
          <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">
            Intermediate
          </Badge>
        </div>
      </div>

      {/* Section progress */}
      {phase !== "instructions" && (
        <div className="px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            {passage.sections.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < sectionIndex ? "bg-teal-500" :
                  i === sectionIndex ? "bg-teal-500/60" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Section {sectionIndex + 1} of {passage.sections.length} — {passage.title}
          </p>
        </div>
      )}

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

            <Card className="mt-4 mb-4">
              <CardContent className="pt-4">
                <p className="text-sm font-medium mb-1">{passage.title}</p>
                <p className="text-xs text-muted-foreground">
                  {passage.sections.length} sections — The AI will react after each one.
                </p>
              </CardContent>
            </Card>

            <div className="mt-auto">
              <Button className="w-full" onClick={() => setPhase("reading")}>
                <Users className="h-4 w-4 mr-2" />
                Start Reading to AI
              </Button>
            </div>
          </div>
        )}

        {/* Reading phase */}
        {phase === "reading" && (
          <div className="flex-1 flex flex-col">
            {/* AI listener indicator */}
            <div className="flex items-center gap-2 mb-4 justify-center">
              <div className={`h-2 w-2 rounded-full ${isRecording ? "bg-teal-500 animate-pulse" : "bg-muted"}`} />
              <span className="text-xs text-muted-foreground">
                {isRecording ? "AI is listening..." : "Tap to start reading"}
              </span>
            </div>

            {/* Passage text */}
            <Card className="mb-4 flex-1">
              <CardContent className="pt-4">
                <p className="text-lg leading-relaxed">{currentSection}</p>
              </CardContent>
            </Card>

            {/* Live transcript */}
            {transcript && (
              <Card className="mb-4 border-teal-500/20">
                <CardContent className="pt-3 pb-2">
                  <p className="text-xs text-muted-foreground mb-1">What the AI heard:</p>
                  <p className="text-sm text-teal-400">{transcript}</p>
                </CardContent>
              </Card>
            )}

            {/* Record controls */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-center gap-6">
                {isRecording ? (
                  <>
                    <span className="text-xs text-teal-500 animate-pulse flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-teal-500" />
                      Listening...
                    </span>
                    <Button
                      size="lg"
                      className="rounded-full h-14 w-14 bg-teal-500 hover:bg-teal-600"
                      onClick={stopAndGetFeedback}
                    >
                      <Square className="h-5 w-5" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Done reading
                    </span>
                  </>
                ) : (
                  <Button
                    size="lg"
                    className="rounded-full h-14 w-14 bg-teal-500 hover:bg-teal-600"
                    onClick={startRecording}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {micError && <p className="text-center text-sm text-red-400 mt-2">{micError}</p>}
            </div>
          </div>
        )}

        {/* AI Feedback phase */}
        {phase === "ai-feedback" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            {isFetchingFeedback ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
                <p className="text-sm text-muted-foreground">AI is thinking about your reading...</p>
              </div>
            ) : currentFeedback ? (
              <div className="w-full max-w-md space-y-4">
                <Card className="border-teal-500/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageCircle className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium text-teal-500">AI Listener</p>
                    </div>
                    <p className="text-sm">{currentFeedback.feedback}</p>
                    {currentFeedback.question && (
                      <p className="text-sm italic text-muted-foreground mt-2">{currentFeedback.question}</p>
                    )}
                  </CardContent>
                </Card>

                {isPlayingTTS && (
                  <div className="flex items-center justify-center gap-2 text-xs text-teal-500">
                    <Volume2 className="h-3 w-3 animate-pulse" />
                    Speaking...
                  </div>
                )}

                <Button className="w-full" onClick={nextSection}>
                  {isLastSection ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Complete Exercise
                    </>
                  ) : (
                    <>
                      Next Section
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
