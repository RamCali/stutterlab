"use client";

import { useMemo, useState, useRef, useEffect } from "react";
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
  CheckCircle2,
  Keyboard,
  Send,
  Shuffle,
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
import { scoreSession } from "@/lib/analysis/session-scorer";
import { getSessionComparison } from "@/lib/actions/analytics";
import type { SessionScorecard, SessionComparison } from "@/lib/analysis/types";
import { CohortInsightBadge } from "@/components/insights/CohortInsightBadge";
import { trackProductEvent } from "@/lib/analytics/client";
import {
  trackFirstActionStarted,
  trackFunnelEventOnce,
} from "@/lib/analytics/funnel-events";
import { classifyDisfluencies, estimateSyllables } from "@/lib/audio/speech-metrics";
import {
  getCompletedScenarioSteps,
  getScenarioTask,
} from "@/lib/ai-practice/scenarios";
import {
  PHONE_PRACTICE_SCENARIOS,
  getPhonePracticeScenario,
} from "@/lib/phone-practice/scenarios";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type TextCallState = "ready" | "ringing" | "active" | "ended";

const scenarioTitles: Record<string, string> = {
  "phone-call": "Phone Call",
  "job-interview": "Job Interview",
  "ordering-food": "Fast Food Order",
  "class-presentation": "Class Presentation",
  "small-talk": "Small Talk",
  "shopping": "Shopping / Returns",
  "asking-directions": "Asking for Directions",
  "customer-service": "Bank Customer Service",
  florist: "Calling a Florist",
  "meeting-intro": "Meeting Introduction",
};

const GOODBYE_PATTERN =
  /\b(goodbye|bye|see you|thank you|thanks|that'?s all|have a good|take care)\b/i;

export default function AIConversationPage() {
  const params = useParams();
  const router = useRouter();
  const scenario = params.scenario as string;
  const title = scenarioTitles[scenario] || "AI Conversation";
  const scenarioTask = getScenarioTask(scenario);

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
  const [sessionScorecard, setSessionScorecard] = useState<SessionScorecard | undefined>();
  const [sessionComparison, setSessionComparison] = useState<SessionComparison | undefined>();
  const voiceConvRef = useRef<VoiceConversation | null>(null);
  const [voiceAnalyserNode, setVoiceAnalyserNode] = useState<AnalyserNode | null>(null);
  const [usingElevenLabs, setUsingElevenLabs] = useState(false);
  const [completionHint, setCompletionHint] = useState(false);
  const [manualTranscript, setManualTranscript] = useState("");
  const [selectedPhoneScenarioId, setSelectedPhoneScenarioId] = useState(
    PHONE_PRACTICE_SCENARIOS[0].id
  );
  const selectedPhoneScenario = getPhonePracticeScenario(selectedPhoneScenarioId);
  const [textCallState, setTextCallState] = useState<TextCallState>("ready");
  const [textCallSeconds, setTextCallSeconds] = useState(0);
  const textCallTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [xaiTextTestInput, setXaiTextTestInput] = useState("");
  const [xaiTextTestMessages, setXaiTextTestMessages] = useState<Message[]>([]);
  const [xaiTextTestError, setXaiTextTestError] = useState("");
  const [xaiTextTestLoading, setXaiTextTestLoading] = useState(false);
  const [xaiTextFeedbackLoading, setXaiTextFeedbackLoading] = useState(false);
  const [xaiTextFeedback, setXaiTextFeedback] = useState("");
  const [xaiTextSaveStatus, setXaiTextSaveStatus] = useState("");
  const [xaiTextSaveError, setXaiTextSaveError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCallLoading, setPhoneCallLoading] = useState(false);
  const [phoneCallStatus, setPhoneCallStatus] = useState("");
  const [phoneCallError, setPhoneCallError] = useState("");
  const completedStepIds = useMemo(() => {
    if (!scenarioTask) return new Set<string>();
    const userTexts = messages
      .filter((message) => message.role === "user")
      .map((message) => message.content);
    if (voiceTranscript) userTexts.push(voiceTranscript);
    return getCompletedScenarioSteps(scenarioTask, userTexts);
  }, [messages, scenarioTask, voiceTranscript]);
  const taskProgress =
    scenarioTask && scenarioTask.steps.length > 0
      ? Math.round((completedStepIds.size / scenarioTask.steps.length) * 100)
      : 0;
  const textCallUserText = useMemo(
    () =>
      xaiTextTestMessages
        .filter((message) => message.role === "user")
        .map((message) => message.content)
        .join(" "),
    [xaiTextTestMessages]
  );
  const textCallDisfluencyMetrics = useMemo(
    () => classifyDisfluencies(textCallUserText),
    [textCallUserText]
  );
  const textCallSyllables = useMemo(
    () => estimateSyllables(textCallUserText),
    [textCallUserText]
  );
  const textCallDisfluencyRate =
    textCallSyllables > 0
      ? Math.round((textCallDisfluencyMetrics.stutterLike / textCallSyllables) * 100)
      : 0;

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
      if (GOODBYE_PATTERN.test(text)) setCompletionHint(true);
    },
    onTurnComplete: (turn) => {
      setVoiceTurns((prev) => [...prev, turn]);
      if (turn.role === "user") {
        setMessages((prev) => [...prev, { role: "user", content: turn.text }]);
        if (GOODBYE_PATTERN.test(turn.text)) setCompletionHint(true);
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
      if (textCallTimerRef.current) clearInterval(textCallTimerRef.current);
      voiceConvRef.current?.stop();
      stressEngineRef.current?.stop();
    };
  }, []);

  async function startVoiceConversation() {
    setStarted(true);
    setVoiceTurns([]);
    setVoiceTranscript("");
    setShowReport(false);
    setCompletionHint(false);
    setManualTranscript("");
    trackProductEvent("voice_session_started", {
      scenario,
      stressMode,
      blockAwareMode,
      turnMode,
    });
    trackFirstActionStarted("ai", { scenario });

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

    // Primary path: Deepgram STT preserves stuttering-like repetitions better
    // than cleaner transcription providers in the UCLASS benchmark.
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
        if (GOODBYE_PATTERN.test(text)) setCompletionHint(true);
      },
      onTurnComplete: (turn) => {
        setVoiceTurns((prev) => [...prev, turn]);
        if (turn.role === "user") {
          setMessages((prev) => [...prev, { role: "user", content: turn.text }]);
          if (GOODBYE_PATTERN.test(turn.text)) setCompletionHint(true);
          setVoiceTranscript("");
        }
      },
      onError: (err) => {
        console.error("Voice error:", err);
        trackProductEvent("voice_session_failed", {
          scenario,
          provider: "deepgram_anthropic_tts",
          phase: "conversation",
        });
      },
    }, undefined, stressMode ? stressLevel : undefined, {
      silenceTimeoutMs: blockAwareMode ? 5000 : 2000,
      turnMode,
    });

    voiceConvRef.current = voiceConv;
    const legacyStarted = await voiceConv.start();
    if (legacyStarted) {
      trackProductEvent("voice_provider_started", {
        scenario,
        provider: "deepgram_anthropic_tts",
      });
      return;
    }

    trackProductEvent("voice_provider_fallback", {
      scenario,
      from: "deepgram_anthropic_tts",
      to: "elevenlabs",
    });

    const elevenLabsSuccess = await elevenLabs.start();
    if (elevenLabsSuccess) {
      setUsingElevenLabs(true);
      trackProductEvent("voice_provider_started", {
        scenario,
        provider: "elevenlabs",
      });
    } else {
      trackProductEvent("voice_session_failed", {
        scenario,
        provider: "deepgram_anthropic_tts",
      });
    }
  }

  async function runXaiTextTest() {
    const message = xaiTextTestInput.trim();
    if (!message || xaiTextTestLoading || textCallState !== "active") return;

    setXaiTextTestLoading(true);
    setXaiTextTestError("");

    try {
      const res = await fetch("/api/xai-phone-practice/text-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          messages: xaiTextTestMessages,
          scenarioId: selectedPhoneScenarioId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "xAI text test failed");
      }

      const assistantMessage = data.message || "";
      setXaiTextTestMessages((current) => [
        ...current,
        { role: "user", content: message },
        { role: "assistant", content: assistantMessage },
      ]);
      setXaiTextTestInput("");
    } catch (error) {
      setXaiTextTestError(
        error instanceof Error ? error.message : "xAI text test failed"
      );
    } finally {
      setXaiTextTestLoading(false);
    }
  }

  function startTextPhoneCall() {
    if (textCallTimerRef.current) clearInterval(textCallTimerRef.current);
    setTextCallState("ringing");
    setTextCallSeconds(0);
    setXaiTextFeedback("");
    setXaiTextSaveStatus("");
    setXaiTextSaveError("");
    setXaiTextTestError("");
    setXaiTextTestInput("");
    setXaiTextTestMessages([]);

    setTimeout(() => {
      setTextCallState("active");
      setXaiTextTestMessages([
        {
          role: "assistant",
          content: selectedPhoneScenario.openingLine,
        },
      ]);
      textCallTimerRef.current = setInterval(() => {
        setTextCallSeconds((seconds) => seconds + 1);
      }, 1000);
    }, 900);
  }

  function resetTextPhoneCall(nextScenarioId = selectedPhoneScenarioId) {
    if (textCallTimerRef.current) clearInterval(textCallTimerRef.current);
    textCallTimerRef.current = null;
    setSelectedPhoneScenarioId(nextScenarioId);
    setTextCallState("ready");
    setTextCallSeconds(0);
    setXaiTextTestInput("");
    setXaiTextTestMessages([]);
    setXaiTextTestError("");
    setXaiTextFeedback("");
    setXaiTextSaveStatus("");
    setXaiTextSaveError("");
  }

  function tryDifferentTextCall() {
    const currentIndex = PHONE_PRACTICE_SCENARIOS.findIndex(
      (phoneScenario) => phoneScenario.id === selectedPhoneScenarioId
    );
    const nextScenario =
      PHONE_PRACTICE_SCENARIOS[(currentIndex + 1) % PHONE_PRACTICE_SCENARIOS.length];
    resetTextPhoneCall(nextScenario.id);
  }

  async function endTextPhoneCall() {
    if (textCallTimerRef.current) clearInterval(textCallTimerRef.current);
    textCallTimerRef.current = null;
    setTextCallState("ended");
    setXaiTextFeedbackLoading(true);
    setXaiTextTestError("");

    try {
      const res = await fetch("/api/xai-phone-practice/text-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            "End call. Step out of character and give concise feedback on this practice call.",
          messages: xaiTextTestMessages,
          scenarioId: selectedPhoneScenarioId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not create call feedback.");
      }

      setXaiTextFeedback(data.message || "");
      await saveTextPhonePractice(data.message || "");
    } catch (error) {
      const fallbackFeedback =
        "You completed the main call flow. Next time, try asking one extra follow-up question before ending.";
      setXaiTextFeedback(fallbackFeedback);
      await saveTextPhonePractice(fallbackFeedback);
      setXaiTextTestError(
        error instanceof Error ? error.message : "Could not create call feedback."
      );
    } finally {
      setXaiTextFeedbackLoading(false);
    }
  }

  async function saveTextPhonePractice(feedback: string) {
    if (xaiTextTestMessages.filter((message) => message.role === "user").length === 0) {
      return;
    }

    setXaiTextSaveStatus("");
    setXaiTextSaveError("");

    const turns = xaiTextTestMessages.map((message, index) => ({
      role: message.role,
      text: message.content,
      disfluencyCount:
        message.role === "user" ? classifyDisfluencies(message.content).total : 0,
      speakingRate: 0,
      techniquesUsed: [],
      turnIndex: index,
      timestamp: Date.now(),
    }));

    try {
      const result = await saveAIConversation({
        scenarioType: `text-phone:${selectedPhoneScenario.id}`,
        messages: xaiTextTestMessages,
        turns,
        durationSeconds: Math.max(1, textCallSeconds),
        sessionScorecard: {
          type: "text-phone-practice",
          scenario: selectedPhoneScenario.title,
          feedback,
          metrics: {
            userTurns: turns.filter((turn) => turn.role === "user").length,
            visibleDisfluencies: textCallDisfluencyMetrics.total,
            visibleStutterLikeMoments: textCallDisfluencyMetrics.stutterLike,
            approximateStutterLikeRate: textCallDisfluencyRate,
            syllables: textCallSyllables,
            scoringMode: "typed_transcript_estimate",
          },
        },
      });
      setXaiTextSaveStatus(`Saved practice. +${result.xp} XP`);
    } catch (error) {
      setXaiTextSaveError(
        error instanceof Error ? error.message : "Could not save this practice yet."
      );
    }
  }

  async function startRealPhonePractice() {
    const trimmedPhoneNumber = phoneNumber.trim();
    if (!trimmedPhoneNumber || phoneCallLoading) return;

    setPhoneCallLoading(true);
    setPhoneCallStatus("");
    setPhoneCallError("");

    try {
      const res = await fetch("/api/phone-practice/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: trimmedPhoneNumber,
          scenario: "phone-call",
          blockAware: true,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not start the phone call yet.");
      }

      setPhoneCallStatus(
        data.mvpContact?.fromNumber
          ? `Calling now. Pick up when your phone rings. Save ${data.mvpContact.fromNumber} as StutterLab.`
          : "Calling now. Pick up when your phone rings."
      );
    } catch (error) {
      setPhoneCallError(
        error instanceof Error ? error.message : "Could not start the phone call yet."
      );
    } finally {
      setPhoneCallLoading(false);
    }
  }

  async function completeConversation(fallbackUserText?: string) {
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

    if (turns.filter((t) => t.role === "user").length === 0 && fallbackUserText?.trim()) {
      trackProductEvent("voice_manual_summary_used", { scenario });
      turns = [
        {
          turnIndex: 0,
          role: "user",
          text: fallbackUserText.trim(),
          disfluencyCount: 0,
          speakingRate: 0,
          timestamp: Date.now(),
        },
      ];
    }

    if (turns.filter((t) => t.role === "user").length === 0 && !fallbackUserText?.trim()) {
      trackProductEvent("voice_empty_transcript", {
        scenario,
        durationSeconds: elapsedSeconds,
        provider: usingElevenLabs ? "elevenlabs" : "deepgram_anthropic_tts",
      });
    }

    setVoiceTurns(turns);
    stressEngineRef.current?.stop();
    stressEngineRef.current = null;
    setCountdownSeconds(null);

    if (turns.filter((t) => t.role === "user").length > 0) {
      trackProductEvent("ai_task_completed", {
        scenario,
        durationSeconds: elapsedSeconds,
        turnCount: turns.length,
        usedManualSummary: Boolean(fallbackUserText?.trim()),
        taskProgress,
      });
      trackProductEvent("scenario_completed", {
        scenario,
        taskProgress,
        durationSeconds: elapsedSeconds,
      });
      trackFunnelEventOnce("first_session_completed", {
        surface: "ai",
        scenario,
        durationSeconds: elapsedSeconds,
      });
      trackFunnelEventOnce("first_ai_call_completed", {
        scenario,
        durationSeconds: elapsedSeconds,
      });
      // Compute session scorecard (client-side, no DB needed)
      const scoringTurns = turns.map((t) => ({
        role: t.role as "user" | "assistant",
        text: t.text,
        disfluencyCount: t.disfluencyCount,
        speakingRate: t.speakingRate,
        techniquesUsed: t.techniquesUsed || [],
        vocalEffort: t.vocalEffort,
        spmZone: t.spmZone,
      }));
      const card = scoreSession(scoringTurns, scenario, elapsedSeconds);
      setSessionScorecard(card);

      // Fetch comparison data (non-blocking)
      getSessionComparison(scenario)
        .then((comp) => { if (comp) setSessionComparison(comp); })
        .catch(() => {});

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
        sessionScorecard: card,
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
  const isXaiTextPhonePractice = scenario === "phone-call";

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
          scorecard={sessionScorecard}
          comparison={sessionComparison}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <Link href="/app/ai-practice">
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
            <Button variant="outline" size="sm" onClick={() => completeConversation()}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete Task
            </Button>
          )}
          {started && (
            <Button variant="destructive" size="sm" onClick={() => completeConversation()}>
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
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {!started ? (
          /* Pre-start screen */
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              {isPhoneSim ? (
                <Phone className="h-10 w-10 text-primary" />
              ) : (
                <Brain className="h-10 w-10 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              {isXaiTextPhonePractice
                ? "Practice a realistic phone call in text first. Voice comes next."
                : "Speak naturally with the AI using your voice. Real-time fluency tracking included."}
            </p>
            {scenarioTask && (
              <div className="mt-4 w-full rounded-xl border border-border bg-card/60 p-4 text-left">
                <p className="text-sm font-semibold">{scenarioTask.goal}</p>
                <div className="mt-3 space-y-2">
                  {scenarioTask.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                {isXaiTextPhonePractice ? "Powered by xAI" : "Powered by Claude"}
              </Badge>
              <Badge variant="outline" className="text-xs bg-primary/5">
                {isXaiTextPhonePractice ? "Text Mode" : "Voice Mode"}
              </Badge>
            </div>
            {/* Stress Simulator Toggle (premium only) */}
            {isPro && !isXaiTextPhonePractice && (
              <div className="mt-4 w-full rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold">Stress Simulator</span>
                    <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-500">BETA</Badge>
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
            {!isXaiTextPhonePractice && (
            <div className="mt-4 w-full rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
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
                  <p className="text-xs text-muted-foreground/70">
                    {turnMode === "auto"
                      ? "Waits 5 seconds of silence (instead of 2) before responding. You can tap \"I'm not done\" for more time."
                      : "You control when your turn ends. Tap \"Done Speaking\" when you're ready for the AI to respond."}
                  </p>
                </div>
              )}
            </div>
            )}
            {/* Community Insight */}
            <div className="mt-4 w-full">
              <CohortInsightBadge
                context={{
                  page: "ai-practice",
                  scenario,
                }}
              />
            </div>
            {isXaiTextPhonePractice && (
              <Card className="mt-4 w-full border-sky-500/20 bg-sky-500/5 text-left">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Keyboard className="h-4 w-4 text-sky-500" />
                        <p className="text-sm font-semibold">Today&apos;s call</p>
                        <Badge variant="outline" className="text-xs">
                          {selectedPhoneScenario.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          xAI text
                        </Badge>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold">
                        {selectedPhoneScenario.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedPhoneScenario.userGoal}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={tryDifferentTextCall}
                      disabled={textCallState === "ringing" || xaiTextTestLoading}
                    >
                      <Shuffle className="mr-2 h-4 w-4" />
                      Try different call
                    </Button>
                  </div>

                  <div className="rounded-md border border-border bg-background/70">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">
                          {selectedPhoneScenario.businessName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {textCallState === "ready" && "Ready"}
                          {textCallState === "ringing" && "Ringing..."}
                          {textCallState === "active" &&
                            `Active call ${formatTime(textCallSeconds)}`}
                          {textCallState === "ended" &&
                            `Call ended ${formatTime(textCallSeconds)}`}
                        </p>
                      </div>
                      {textCallState === "active" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={endTextPhoneCall}
                          disabled={xaiTextFeedbackLoading}
                        >
                          <PhoneOff className="mr-2 h-4 w-4" />
                          End call
                        </Button>
                      )}
                    </div>

                    {textCallState === "ready" && (
                      <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
                        <div className="rounded-full bg-sky-500/10 p-4">
                          <Phone className="h-8 w-8 text-sky-500" />
                        </div>
                        <Button type="button" onClick={startTextPhoneCall}>
                          <Phone className="mr-2 h-4 w-4" />
                          Start text call
                        </Button>
                      </div>
                    )}

                    {textCallState === "ringing" && (
                      <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
                        <div className="h-14 w-14 animate-pulse rounded-full bg-sky-500/20" />
                        <p className="text-sm text-muted-foreground">
                          Calling {selectedPhoneScenario.businessName}...
                        </p>
                      </div>
                    )}

                    {(textCallState === "active" || textCallState === "ended") && (
                      <div className="space-y-3 p-3">
                        <div className="max-h-80 space-y-2 overflow-y-auto">
                          {xaiTextTestMessages.map((item, index) => (
                            <div
                              key={`${item.role}-${index}`}
                              className={`rounded-md p-3 text-sm ${
                                item.role === "user" ? "bg-primary/10" : "bg-muted/50"
                              }`}
                            >
                              <p className="text-xs font-medium text-muted-foreground">
                                {item.role === "user" ? "You" : selectedPhoneScenario.agentName}
                              </p>
                              <p className="mt-1">{item.content}</p>
                            </div>
                          ))}
                        </div>

                        {textCallState === "active" && (
                          <>
                            <textarea
                              value={xaiTextTestInput}
                              onChange={(event) => setXaiTextTestInput(event.target.value)}
                              placeholder="Type what you would say on the phone..."
                              className="min-h-20 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={runXaiTextTest}
                                disabled={xaiTextTestLoading || !xaiTextTestInput.trim()}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                {xaiTextTestLoading ? "Sending..." : "Send"}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => resetTextPhoneCall()}
                              >
                                Reset
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {textCallState === "ended" && (
                    <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="text-sm font-semibold">Call feedback</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {xaiTextFeedbackLoading
                          ? "Writing feedback..."
                          : xaiTextFeedback ||
                            "Call ended. Start another call when you're ready."}
                      </p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-md border border-border/60 bg-background/70 p-3">
                          <p className="text-xs text-muted-foreground">Turns</p>
                          <p className="mt-1 text-lg font-semibold">
                            {
                              xaiTextTestMessages.filter(
                                (message) => message.role === "user"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="rounded-md border border-border/60 bg-background/70 p-3">
                          <p className="text-xs text-muted-foreground">
                            Visible stutter-like moments
                          </p>
                          <p className="mt-1 text-lg font-semibold">
                            {textCallDisfluencyMetrics.stutterLike}
                          </p>
                        </div>
                        <div className="rounded-md border border-border/60 bg-background/70 p-3">
                          <p className="text-xs text-muted-foreground">
                            Approx. rate
                          </p>
                          <p className="mt-1 text-lg font-semibold">
                            {textCallDisfluencyRate}%
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Estimate only, based on typed transcript patterns like
                        sound or syllable repetitions. Real phone audio will need
                        a separate speech analysis pass.
                      </p>
                      {xaiTextSaveStatus && (
                        <p className="mt-2 text-sm text-emerald-500">
                          {xaiTextSaveStatus}
                        </p>
                      )}
                      {xaiTextSaveError && (
                        <p className="mt-2 text-sm text-destructive">
                          {xaiTextSaveError}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            resetTextPhoneCall();
                            setTimeout(startTextPhoneCall, 0);
                          }}
                        >
                          Practice same call
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={tryDifferentTextCall}
                        >
                          Try different call
                        </Button>
                      </div>
                    </div>
                  )}

                  {xaiTextTestError && (
                    <p className="text-sm text-destructive">{xaiTextTestError}</p>
                  )}
                </CardContent>
              </Card>
            )}
            {isXaiTextPhonePractice && (
              <Card className="mt-4 w-full border-emerald-500/20 bg-emerald-500/5 text-left">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Phone className="h-4 w-4 text-emerald-500" />
                    <p className="text-sm font-semibold">Real phone call practice</p>
                    <Badge variant="outline" className="text-xs">
                      Next
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use your MVP phone number for real practice calls. Delivery
                    and caller labeling are best effort, so save the number as
                    StutterLab when you receive it.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      placeholder="+14155552671"
                      inputMode="tel"
                      className="min-h-10 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      type="button"
                      onClick={startRealPhonePractice}
                      disabled={phoneCallLoading || !phoneNumber.trim()}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      {phoneCallLoading ? "Calling..." : "Call me"}
                    </Button>
                  </div>
                  {phoneCallStatus && (
                    <p className="text-sm text-emerald-500">{phoneCallStatus}</p>
                  )}
                  {phoneCallError && (
                    <p className="text-sm text-muted-foreground">{phoneCallError}</p>
                  )}
                </CardContent>
              </Card>
            )}
            {!isXaiTextPhonePractice && (
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
            )}
            {!isPro && !isXaiTextPhonePractice && (
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

            {scenarioTask && (
              <Card className="w-full max-w-sm border-primary/20 bg-primary/5">
                <CardContent className="py-3 px-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Task progress</span>
                    <span className="text-muted-foreground">{taskProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${taskProgress}%` }}
                    />
                  </div>
                  <div className="space-y-1">
                    {scenarioTask.steps.map((step) => {
                      const done = completedStepIds.has(step.id);
                      return (
                        <div
                          key={step.id}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2
                            className={`h-3.5 w-3.5 ${
                              done ? "text-emerald-500" : "text-muted-foreground/40"
                            }`}
                          />
                          <span className={done ? "text-foreground" : ""}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
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

            {(completionHint || taskProgress === 100) && (
              <Card className="border-emerald-500/20 bg-emerald-500/5 max-w-sm">
                <CardContent className="py-3 px-4 text-center space-y-2">
                  <p className="text-sm font-medium">Sounds like the task is done.</p>
                  <Button size="sm" onClick={() => completeConversation()} className="w-full">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Complete and Continue
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="border-amber-500/20 bg-amber-500/5 max-w-sm w-full">
              <CardContent className="py-3 px-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-medium">AI misheard you?</p>
                </div>
                <textarea
                  value={manualTranscript}
                  onChange={(event) => setManualTranscript(event.target.value)}
                  placeholder="Type a quick summary of what you said, then complete."
                  className="min-h-16 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => completeConversation(manualTranscript)}
                  disabled={!manualTranscript.trim()}
                >
                  Complete With Typed Summary
                </Button>
              </CardContent>
            </Card>

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
