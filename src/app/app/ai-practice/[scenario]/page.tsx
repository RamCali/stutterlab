"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Phone,
  PhoneOff,
  Brain,
  Sparkles,
  Clock,
  Square,
  Shield,
  Hand,
  MicOff,
} from "lucide-react";
import Link from "next/link";
import { VoiceConversation, type VoiceState, type TurnMetrics, type TurnMode } from "@/lib/audio/VoiceConversation";
import { useElevenLabsConversation } from "@/hooks/useElevenLabsConversation";
import { VoiceOrb } from "@/components/ai-conversations/voice-orb";
import { PerformanceReport } from "@/components/ai-conversations/performance-report";
import { LiveCoachOverlay } from "@/components/coaching/LiveCoachOverlay";
import { checkAISimUsage } from "@/lib/auth/premium";
import type { PlanTier } from "@/lib/auth/premium";
import { saveAIConversation } from "@/lib/actions/exercises";
import { StressEngine, type StressLevel } from "@/lib/audio/StressEngine";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const scenarioTitles: Record<string, string> = {
  "phone-call": "Phone Call",
  "job-interview": "Job Interview",
  "ordering-food": "Ordering Food",
  "class-presentation": "Class Presentation",
  "small-talk": "Small Talk",
  "shopping": "Shopping / Returns",
  "asking-directions": "Asking for Directions",
  "customer-service": "Customer Service Call",
  "meeting-intro": "Meeting Introduction",
};

export default function AIConversationPage() {
  const params = useParams();
  const router = useRouter();
  const scenario = params.scenario as string;
  const title = scenarioTitles[scenario] || "AI Conversation";

  // Conversation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [started, setStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceTurns, setVoiceTurns] = useState<TurnMetrics[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [earnedXp, setEarnedXp] = useState<number | undefined>();
  const voiceConvRef = useRef<VoiceConversation | null>(null);
  const [voiceAnalyserNode, setVoiceAnalyserNode] = useState<AnalyserNode | null>(null);
  const [usingElevenLabs, setUsingElevenLabs] = useState(false);

  // Stress mode state
  const [stressMode, setStressMode] = useState(false);
  const [stressLevel, setStressLevel] = useState<StressLevel>(1);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const stressEngineRef = useRef<StressEngine | null>(null);

  // Block-aware mode state
  const [blockAwareMode, setBlockAwareMode] = useState(false);
  const [turnMode, setTurnMode] = useState<TurnMode>("auto");

  // ElevenLabs Conversational AI hook
  const elevenLabs = useElevenLabsConversation({
    scenario,
    stressLevel: stressMode ? stressLevel : undefined,
    onStateChange: setVoiceState,
    onUserTranscript: (text) => setVoiceTranscript(text),
    onAssistantMessage: (text) => {
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    },
    onTurnComplete: (turn) => {
      setVoiceTurns((prev) => [...prev, turn]);
      if (turn.role === "user") {
        setMessages((prev) => [...prev, { role: "user", content: turn.text }]);
        setVoiceTranscript("");
      }
    },
    onError: (err) => console.error("ElevenLabs error:", err),
  });

  // Usage gate
  const [usage, setUsage] = useState<{ canStart: boolean; plan: PlanTier } | null>(null);
  useEffect(() => {
    checkAISimUsage().then(setUsage).catch(() => {});
  }, []);
  const isPro = usage?.canStart ?? false;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      voiceConvRef.current?.stop();
      stressEngineRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startVoiceConversation() {
    setStarted(true);
    setVoiceTurns([]);
    setVoiceTranscript("");
    setShowReport(false);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    // Start stress engine if stress mode enabled
    if (stressMode) {
      const engine = new StressEngine(stressLevel);
      engine.setCallbacks({
        onRequestInterruption: () => {
          // The AI conversation route handles stress-level-aware behavior
        },
        onCountdownTick: (seconds) => setCountdownSeconds(seconds),
      });
      engine.start();
      stressEngineRef.current = engine;
    }

    // Try ElevenLabs Conversational AI first (single WebSocket, lower latency)
    const elevenLabsSuccess = await elevenLabs.start();
    if (elevenLabsSuccess) {
      setUsingElevenLabs(true);
      return;
    }

    // Fallback to legacy pipeline (Web Speech API → Claude → ElevenLabs TTS)
    setUsingElevenLabs(false);

    // Set up mic AnalyserNode for LiveCoachOverlay
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(micStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      setVoiceAnalyserNode(analyser);
    } catch {
      // Continue without coaching overlay
    }

    const voiceConv = new VoiceConversation(scenario, {
      onStateChange: setVoiceState,
      onUserTranscript: (text) => setVoiceTranscript(text),
      onAssistantMessage: (text) => {
        setMessages((prev) => [...prev, { role: "assistant", content: text }]);
      },
      onTurnComplete: (turn) => {
        setVoiceTurns((prev) => [...prev, turn]);
        if (turn.role === "user") {
          setMessages((prev) => [...prev, { role: "user", content: turn.text }]);
          setVoiceTranscript("");
        }
      },
      onError: (err) => console.error("Voice error:", err),
    }, undefined, stressMode ? stressLevel : undefined, {
      silenceTimeoutMs: blockAwareMode ? 5000 : 2000,
      turnMode,
    });

    voiceConvRef.current = voiceConv;
    await voiceConv.start();
  }

  async function endConversation() {
    if (timerRef.current) clearInterval(timerRef.current);

    // Stop the active voice engine (ElevenLabs or legacy)
    let turns: TurnMetrics[];
    if (usingElevenLabs) {
      turns = elevenLabs.stop();
    } else if (voiceConvRef.current) {
      turns = voiceConvRef.current.stop();
      voiceConvRef.current = null;
    } else {
      turns = [];
    }

    setVoiceTurns(turns);
    stressEngineRef.current?.stop();
    stressEngineRef.current = null;
    setCountdownSeconds(null);

    if (turns.filter((t) => t.role === "user").length > 0) {
      // Persist to DB and capture XP
      saveAIConversation({
        scenarioType: scenario,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        turns: turns.map((t) => ({
          role: t.role,
          text: t.text,
          disfluencyCount: t.disfluencyCount,
          speakingRate: t.speakingRate,
          techniquesUsed: t.techniquesUsed,
          vocalEffort: t.vocalEffort,
          spmZone: t.spmZone,
        })),
        durationSeconds: elapsedSeconds,
        stressLevel: stressMode ? stressLevel : undefined,
      })
        .then((result) => setEarnedXp(result.xp))
        .catch((err) => console.error("Failed to save AI conversation:", err));
      setShowReport(true);
      return;
    }

    router.push("/app/ai-practice");
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const isPhoneSim = scenario === "phone-call" || scenario === "customer-service";

  // Show performance report
  if (showReport) {
    return (
      <div className="p-6">
        <PerformanceReport
          turns={voiceTurns}
          scenario={title}
          durationSeconds={elapsedSeconds}
          onBack={() => router.push("/app/ai-practice")}
          xpEarned={earnedXp}
          stressLevel={stressMode ? stressLevel : undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <Link href="/ai-practice">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-sm flex items-center gap-2">
              {isPhoneSim && <Phone className="h-4 w-4 text-red-500" />}
              <Brain className="h-4 w-4 text-primary" />
              {title}
            </h1>
            <p className="text-xs text-muted-foreground">
              AI Conversation Practice
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {started && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(elapsedSeconds)}
            </Badge>
          )}
          {countdownSeconds !== null && (
            <Badge variant="outline" className="text-xs border-red-500/30 text-red-400 animate-pulse">
              {countdownSeconds}s
            </Badge>
          )}
          {started && (
            <Button variant="destructive" size="sm" onClick={endConversation}>
              {isPhoneSim ? (
                <PhoneOff className="h-4 w-4 mr-1" />
              ) : (
                <Square className="h-3 w-3 mr-1" />
              )}
              End
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!started ? (
          /* Pre-start screen */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              {isPhoneSim ? (
                <Phone className="h-10 w-10 text-primary" />
              ) : (
                <Brain className="h-10 w-10 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Speak naturally with the AI using your voice. Real-time fluency tracking included.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by Claude
              </Badge>
              <Badge variant="outline" className="text-xs bg-primary/5">
                Voice Mode
              </Badge>
            </div>
            {/* Stress Simulator Toggle (premium only) */}
            {isPro && (
              <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 max-w-md w-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold">Stress Simulator</span>
                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">BETA</Badge>
                  </div>
                  <button
                    onClick={() => setStressMode(!stressMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      stressMode ? "bg-amber-500" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        stressMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {stressMode && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Adds ambient noise, interruptions, and time pressure for desensitization training.
                    </p>
                    <div className="flex gap-2">
                      {([1, 2, 3] as StressLevel[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => setStressLevel(level)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            stressLevel === level
                              ? level === 1
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : level === 2
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {level === 1 ? "Mild" : level === 2 ? "Moderate" : "Intense"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Block-Aware Pacing */}
            <div className="mt-4 p-4 rounded-xl border border-teal-500/20 bg-teal-500/5 max-w-md w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Hand className="h-4 w-4 text-teal-500" />
                  <span className="text-sm font-semibold">Block-Aware Pacing</span>
                </div>
                <button
                  onClick={() => setBlockAwareMode(!blockAwareMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    blockAwareMode ? "bg-teal-500" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      blockAwareMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              {blockAwareMode && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Extra patience for blocks and prolongations. The AI waits longer before responding.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTurnMode("auto")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        turnMode === "auto"
                          ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                          : "bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      Auto (5s pause)
                    </button>
                    <button
                      onClick={() => setTurnMode("push-to-talk")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        turnMode === "push-to-talk"
                          ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                          : "bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      Push-to-Talk
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70">
                    {turnMode === "auto"
                      ? "Waits 5 seconds of silence (instead of 2) before responding. You can tap \"I'm not done\" for more time."
                      : "You control when your turn ends. Tap \"Done Speaking\" when you're ready for the AI to respond."}
                  </p>
                </div>
              )}
            </div>
            <Button
              className="mt-6"
              size="lg"
              onClick={startVoiceConversation}
              disabled={!isPro}
            >
              {isPhoneSim ? (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Pick Up Call
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Start Conversation
                </>
              )}
            </Button>
            {!isPro && (
              <p className="text-xs text-muted-foreground mt-2">
                Premium required for voice conversations
              </p>
            )}
          </div>
        ) : (
          /* Voice mode UI */
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <VoiceOrb state={voiceState} />

            {stressMode && (
              <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Stress Level {stressLevel}
                {countdownSeconds !== null && ` — ${countdownSeconds}s`}
              </Badge>
            )}

            {/* Live Coach Overlay (legacy mode only — ElevenLabs manages its own audio) */}
            {!usingElevenLabs && (
              <LiveCoachOverlay
                analyserNode={voiceAnalyserNode}
                enabled={voiceState === "listening" || voiceState === "speaking"}
              />
            )}

            {/* Live transcript */}
            {voiceTranscript && voiceState === "listening" && (
              <div className="max-w-md text-center">
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;{voiceTranscript}&rdquo;
                </p>
              </div>
            )}

            {/* Last AI message */}
            {messages.length > 0 && voiceState !== "listening" && (
              <div className="max-w-md text-center">
                <p className="text-sm">
                  {messages[messages.length - 1].content}
                </p>
              </div>
            )}

            {/* Block-aware controls */}
            {voiceState === "listening" && blockAwareMode && (
              <div className="flex gap-3">
                {turnMode === "push-to-talk" ? (
                  <Button
                    size="lg"
                    variant="default"
                    className="bg-teal-600 hover:bg-teal-700 text-white gap-2 px-6"
                    onClick={() => {
                      if (usingElevenLabs) {
                        elevenLabs.submitTurn();
                      } else {
                        voiceConvRef.current?.submitTurn();
                      }
                    }}
                  >
                    <MicOff className="h-4 w-4" />
                    Done Speaking
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 gap-2"
                    onClick={() => {
                      if (usingElevenLabs) {
                        elevenLabs.extendSilence();
                      } else {
                        voiceConvRef.current?.extendSilence();
                      }
                    }}
                  >
                    <Hand className="h-4 w-4" />
                    I&apos;m Not Done
                  </Button>
                )}
              </div>
            )}

            {/* Block-aware indicator */}
            {blockAwareMode && voiceState === "listening" && (
              <Badge variant="outline" className="border-teal-500/30 text-teal-400 text-xs">
                <Hand className="h-3 w-3 mr-1" />
                {turnMode === "push-to-talk" ? "Push-to-Talk" : "Block-Aware (5s)"}
              </Badge>
            )}

            {/* Technique reminder */}
            <Card className="border-0 bg-primary/5 max-w-sm">
              <CardContent className="py-2 px-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Breathe, gentle onset, speak at your pace
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
