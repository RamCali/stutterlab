"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Square,
  Volume2,
  Loader2,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { LiveCoachOverlay } from "@/components/coaching/LiveCoachOverlay";
import { useDeepgramSTT } from "@/hooks/useDeepgramSTT";

interface SpeakStepProps {
  scenario: string;
  onComplete: () => void;
}

const SCENARIO_LABELS: Record<string, { title: string; prompt: string }> = {
  "ordering-food": {
    title: "Ordering Food",
    prompt: "Practice ordering at a restaurant or coffee shop.",
  },
  "small-talk": {
    title: "Small Talk",
    prompt: "Practice casual conversation with a colleague or neighbor.",
  },
  "asking-directions": {
    title: "Asking Directions",
    prompt: "Practice asking for directions or help finding something.",
  },
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function SpeakStep({ scenario, onComplete }: SpeakStepProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [started, setStarted] = useState(false);
  const [listening, setListening] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [statusText, setStatusText] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [coachAnalyser, setCoachAnalyser] = useState<AnalyserNode | null>(null);
  const coachAudioCtxRef = useRef<AudioContext | null>(null);
  const [bars, setBars] = useState<number[]>(Array(40).fill(3));
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  const scenarioInfo = SCENARIO_LABELS[scenario] || {
    title: "Conversation",
    prompt: "Practice a real-world conversation.",
  };

  const turnCount = messages.filter((m) => m.role === "user").length;
  const canFinish = turnCount >= 3;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  /* ─── TTS: speak AI text aloud ─── */
  async function speakText(text: string) {
    setSpeaking(true);
    setStatusText("AI is speaking...");

    const wordCount = text.split(/\s+/).length;
    const maxMs = Math.max(10000, wordCount * 600);
    const safetyTimer = setTimeout(() => {
      setSpeaking(false);
      setStatusText("Your turn — tap the mic");
    }, maxMs);

    function finishSpeaking() {
      clearTimeout(safetyTimer);
      setSpeaking(false);
      setStatusText("Your turn — tap the mic");
    }

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
          finishSpeaking();
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          finishSpeaking();
          URL.revokeObjectURL(url);
        };

        try {
          await audio.play();
          return;
        } catch {
          URL.revokeObjectURL(url);
        }
      }
    } catch {
      // ElevenLabs unavailable — fall back to browser TTS
    }

    // Fallback: browser speechSynthesis with best available voice
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes("Samantha") ||
          v.name.includes("Karen") ||
          v.name.includes("Google") ||
          v.name.includes("Natural")
      );
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => finishSpeaking();
      utterance.onerror = () => finishSpeaking();
      speechSynthesis.speak(utterance);
    } else {
      finishSpeaking();
    }
  }

  /* ─── Send message to AI + speak response ─── */
  async function sendToAI(userText: string, currentMessages: Message[]) {
    const userMessage: Message = { role: "user", content: userText };
    const updatedMessages = [...currentMessages, userMessage];
    setMessages(updatedMessages);
    setAiLoading(true);
    setStatusText("AI is thinking...");
    scrollToBottom();

    try {
      const res = await fetch("/api/ai-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          messages: updatedMessages,
          voiceMode: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiText = data.message || data.response || "I didn't catch that, could you try again?";
        const aiMessage: Message = { role: "assistant", content: aiText };
        const allMessages = [...updatedMessages, aiMessage];
        setMessages(allMessages);
        setAiLoading(false);
        scrollToBottom();
        await speakText(aiText);
        return;
      }
    } catch {
      // Handle error
    }

    setAiLoading(false);
    setStatusText("Your turn — tap the mic");
  }

  /* ─── Set up mic analyser for live coaching ─── */
  async function setupCoachAnalyser() {
    if (coachAnalyser) return;
    const ctx = new AudioContext();
    coachAudioCtxRef.current = ctx;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (ctx.state === "suspended") await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      setCoachAnalyser(analyser);
    } catch {
      ctx.close();
      coachAudioCtxRef.current = null;
    }
  }

  /* ─── Deepgram STT hook ─── */
  const deepgram = useDeepgramSTT({
    onError: (msg) => {
      setStatusText(msg);
      setListening(false);
    },
  });

  /* ─── Speech recognition ─── */
  async function startListening() {
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    setSpeaking(false);

    setListening(true);
    setLiveTranscript("");
    setStatusText("Listening — speak now...");

    const success = await deepgram.start();
    if (!success) {
      setListening(false);
      setStatusText("Failed to start listening — check mic permissions");
    }
  }

  function stopListening() {
    deepgram.stop();
    setListening(false);

    const text = deepgram.finalTranscript.trim();
    setLiveTranscript("");

    if (text) {
      sendToAI(text, messagesRef.current);
    } else {
      setStatusText("Didn't catch that — tap the mic to try again");
    }
  }

  // Sync deepgram transcript to liveTranscript for display
  useEffect(() => {
    if (listening) {
      setLiveTranscript(deepgram.transcript);
    }
  }, [deepgram.transcript, listening]);

  /* ─── Start conversation (AI speaks first) ─── */
  async function startConversation() {
    setStarted(true);
    setAiLoading(true);
    setStatusText("AI is starting the conversation...");
    setupCoachAnalyser();

    try {
      const res = await fetch("/api/ai-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          messages: [],
          voiceMode: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiText = data.message || data.response || "Hi there! How can I help you today?";
        const aiMessage: Message = { role: "assistant", content: aiText };
        setMessages([aiMessage]);
        setAiLoading(false);
        scrollToBottom();
        await speakText(aiText);
        return;
      }
    } catch {
      // Fallback
    }

    const fallback: Message = {
      role: "assistant",
      content: "Hi there! How can I help you today?",
    };
    setMessages([fallback]);
    setAiLoading(false);
    await speakText(fallback.content);
  }

  /* ─── Waveform visualization ─── */
  useEffect(() => {
    if (!listening || !coachAnalyser) {
      setBars(Array(40).fill(3));
      return;
    }
    const interval = setInterval(() => {
      const data = new Float32Array(coachAnalyser.fftSize);
      coachAnalyser.getFloatTimeDomainData(data);
      const segSize = Math.floor(data.length / 40);
      const newBars = Array.from({ length: 40 }, (_, i) => {
        let peak = 0;
        for (let j = i * segSize; j < (i + 1) * segSize && j < data.length; j++) {
          peak = Math.max(peak, Math.abs(data[j]));
        }
        return Math.min(100, peak * 400);
      });
      setBars(newBars);
    }, 50);
    return () => clearInterval(interval);
  }, [listening, coachAnalyser]);

  /* ─── Cleanup ─── */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
      }
      if (coachAudioCtxRef.current) {
        coachAudioCtxRef.current.close();
      }
    };
  }, []);

  /* ─── Pre-start screen ─── */
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-8">
        <div className="p-4 rounded-full bg-primary/10 mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{scenarioInfo.title}</h2>
        <p className="text-sm text-muted-foreground mb-2 text-center max-w-sm">
          {scenarioInfo.prompt}
        </p>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">
          Use your techniques from the previous step. The AI will speak first — then tap the mic to reply with your voice.
        </p>
        <Button size="lg" onClick={startConversation}>
          <Volume2 className="h-5 w-5 mr-2" />
          Start Voice Conversation
        </Button>
      </div>
    );
  }

  const isBusy = aiLoading || speaking;

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium">{scenarioInfo.title}</p>
          <p className="text-sm text-muted-foreground">
            Turn {turnCount} — {canFinish ? "You can finish anytime" : `${3 - turnCount} more turn${3 - turnCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        {canFinish && (
          <Button size="sm" variant="outline" onClick={onComplete}>
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Done
          </Button>
        )}
      </div>

      {/* Chat transcript */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-primary/10 ml-8"
                : "bg-muted/50 mr-8"
            }`}
          >
            <span className="text-sm text-muted-foreground uppercase block mb-1">
              {msg.role === "user" ? "You" : "AI"}
            </span>
            {msg.content}
          </div>
        ))}
        {aiLoading && (
          <div className="bg-muted/50 mr-8 p-3 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {listening && liveTranscript && (
          <div className="bg-primary/10 ml-8 p-3 rounded-lg border border-primary/20">
            <span className="text-sm text-muted-foreground uppercase block mb-1">
              You (listening...)
            </span>
            <span className="text-sm italic text-muted-foreground">{liveTranscript}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Voice controls */}
      <div className="border-t pt-4 relative z-50">
        {/* Status */}
        <p className="text-center text-sm text-muted-foreground mb-3">
          {speaking && <Volume2 className="h-3 w-3 inline mr-1 animate-pulse" />}
          {statusText}
        </p>

        {/* Waveform */}
        <div className="flex items-end justify-center gap-[2px] h-12 mb-3">
          {bars.map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-75 ${
                listening ? "bg-primary" : "bg-muted"
              }`}
              style={{ height: `${Math.max(height, 3)}%` }}
            />
          ))}
        </div>

        {/* Mic button */}
        <div className="flex items-center justify-center">
          {listening ? (
            <Button
              size="lg"
              variant="destructive"
              className="rounded-full h-16 w-16"
              onClick={stopListening}
            >
              <Square className="h-6 w-6" />
            </Button>
          ) : (
            <Button
              size="lg"
              className={`rounded-full h-16 w-16 ${
                isBusy ? "opacity-50" : ""
              }`}
              onClick={startListening}
              disabled={isBusy}
            >
              {isBusy ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          )}
        </div>

        {listening && (
          <p className="text-center text-sm text-red-500 animate-pulse mt-2 flex items-center justify-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Listening...
          </p>
        )}

        {/* Turn indicator */}
        <div className="flex justify-center gap-1.5 mt-4">
          {Array(Math.max(3, turnCount)).fill(0).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full ${
                i < turnCount ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Live Coach Overlay */}
        <LiveCoachOverlay
          analyserNode={coachAnalyser}
          enabled={listening || speaking}
        />
      </div>
    </div>
  );
}
