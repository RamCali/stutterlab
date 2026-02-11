"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Send,
  Phone,
  PhoneOff,
  Brain,
  Loader2,
  Sparkles,
  Clock,
  Square,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { VoiceConversation, type VoiceState, type TurnMetrics } from "@/lib/audio/VoiceConversation";
import { VoiceOrb } from "@/components/ai-conversations/voice-orb";
import { VoiceModeToggle } from "@/components/ai-conversations/voice-mode-toggle";
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

  // Text mode state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  // Voice mode state
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceTurns, setVoiceTurns] = useState<TurnMetrics[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [earnedXp, setEarnedXp] = useState<number | undefined>();
  const voiceConvRef = useRef<VoiceConversation | null>(null);
  const [voiceAnalyserNode, setVoiceAnalyserNode] = useState<AnalyserNode | null>(null);

  // Stress mode state
  const [stressMode, setStressMode] = useState(false);
  const [stressLevel, setStressLevel] = useState<StressLevel>(1);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const stressEngineRef = useRef<StressEngine | null>(null);

  // Usage gate
  const [usage, setUsage] = useState<{ canStart: boolean; plan: PlanTier } | null>(null);
  useEffect(() => {
    checkAISimUsage().then(setUsage).catch(() => {});
  }, []);
  const isPro = usage?.canStart ?? false;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      voiceConvRef.current?.stop();
      stressEngineRef.current?.stop();
    };
  }, []);

  // ==================== TEXT MODE ====================

  async function startConversation() {
    setStarted(true);
    setLoading(true);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    try {
      const res = await fetch("/api/ai-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, messages: [], userMessage: "Hi, let's start." }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages([
          { role: "user", content: "Hi, let's start." },
          { role: "assistant", content: data.message },
        ]);
      } else if (data.error) {
        setMessages([
          { role: "assistant", content: `[System] ${data.error}` },
        ]);
      }
    } catch {
      setMessages([
        { role: "assistant", content: "[System] Could not connect to AI. Check your ANTHROPIC_API_KEY in .env" },
      ]);
    }
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, messages: newMessages }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages([...newMessages, { role: "assistant", content: data.message }]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "[System] Failed to get response. Try again." },
      ]);
    }
    setLoading(false);
  }

  // ==================== VOICE MODE ====================

  async function startVoiceConversation() {
    setStarted(true);
    setVoiceTurns([]);
    setVoiceTranscript("");
    setShowReport(false);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

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
    }, undefined, stressMode ? stressLevel : undefined);

    voiceConvRef.current = voiceConv;
    await voiceConv.start();
  }

  async function endConversation() {
    if (timerRef.current) clearInterval(timerRef.current);

    if (isVoiceMode && voiceConvRef.current) {
      const turns = voiceConvRef.current.stop();
      setVoiceTurns(turns);
      voiceConvRef.current = null;
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
    }

    // Text mode: also save if there were messages
    if (messages.length > 1) {
      saveAIConversation({
        scenarioType: scenario,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        turns: [],
        durationSeconds: elapsedSeconds,
        stressLevel: stressMode ? stressLevel : undefined,
      }).catch((err) => console.error("Failed to save AI conversation:", err));
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
          {!started && (
            <VoiceModeToggle
              isVoiceMode={isVoiceMode}
              onToggle={setIsVoiceMode}
              isPremium={isPro}
            />
          )}
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
              {isVoiceMode
                ? "Speak naturally with the AI using your voice. Real-time fluency tracking included."
                : isPhoneSim
                  ? "The AI will simulate a phone call. Practice speaking naturally and using your techniques."
                  : "Have a natural conversation with the AI. Every session is unique and adapts to you."}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by Claude
              </Badge>
              {isVoiceMode && (
                <Badge variant="outline" className="text-xs bg-primary/5">
                  Voice Mode
                </Badge>
              )}
            </div>
            {/* Stress Simulator Toggle (premium + voice mode only) */}
            {isVoiceMode && isPro && (
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
            <Button
              className="mt-6"
              size="lg"
              onClick={isVoiceMode ? startVoiceConversation : startConversation}
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
          </div>
        ) : isVoiceMode ? (
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

            {/* Live Coach Overlay */}
            <LiveCoachOverlay
              analyserNode={voiceAnalyserNode}
              enabled={voiceState === "listening" || voiceState === "speaking"}
            />

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

            {/* Technique reminder */}
            <Card className="border-0 bg-primary/5 max-w-sm">
              <CardContent className="py-2 px-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Breathe, gentle onset, speak at your pace
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Text mode UI (original) */
          <>
            {/* Technique Reminder */}
            <div className="mx-auto max-w-lg">
              <Card className="border-0 bg-primary/5">
                <CardContent className="py-2 px-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Remember: breathe, gentle onset, speak at your pace
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chat Messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area (text mode only) */}
      {started && !isVoiceMode && (
        <div className="border-t p-4 bg-background">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Input
              placeholder="Type your response..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
