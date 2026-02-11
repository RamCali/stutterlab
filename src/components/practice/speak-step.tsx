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
  const [transcript, setTranscript] = useState("");
  const [statusText, setStatusText] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [coachAnalyser, setCoachAnalyser] = useState<AnalyserNode | null>(null);
  const coachAudioCtxRef = useRef<AudioContext | null>(null);

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
          setSpeaking(false);
          setStatusText("Your turn — tap the mic");
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setSpeaking(false);
          setStatusText("Your turn — tap the mic");
          URL.revokeObjectURL(url);
        };

        await audio.play();
        return;
      }
    } catch {
      // ElevenLabs unavailable — fall back to browser TTS
    }

    // Fallback: browser speechSynthesis with best available voice
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      // Pick a natural-sounding voice if available
      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes("Samantha") ||   // macOS high-quality
          v.name.includes("Karen") ||       // macOS
          v.name.includes("Google") ||      // Chrome
          v.name.includes("Natural")        // Edge
      );
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        setSpeaking(false);
        setStatusText("Your turn — tap the mic");
      };
      utterance.onerror = () => {
        setSpeaking(false);
        setStatusText("Your turn — tap the mic");
      };
      speechSynthesis.speak(utterance);
    } else {
      setSpeaking(false);
      setStatusText("Your turn — tap the mic");
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      coachAudioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      setCoachAnalyser(analyser);
    } catch {
      // Continue without coaching overlay
    }
  }

  /* ─── Speech recognition ─── */
  function startListening() {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setStatusText("Speech recognition not supported — please use Chrome");
      return;
    }

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    setSpeaking(false);

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    let finalTranscript = "";
    let hadError = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript || interim);
    };

    recognition.onend = () => {
      setListening(false);
      const text = finalTranscript.trim();
      setTranscript("");

      if (text) {
        sendToAI(text, messages);
      } else if (!hadError) {
        setStatusText("Didn't catch that — tap the mic to try again");
      }
    };

    recognition.onerror = (event) => {
      hadError = true;
      setListening(false);
      setTranscript("");

      const errorMap: Record<string, string> = {
        "not-allowed": "Mic blocked — click the lock icon in the address bar to allow microphone",
        "no-speech": "No speech detected — tap the mic and speak clearly",
        "network": "Network error — check your connection",
        "audio-capture": "No microphone found — connect a mic and try again",
        "service-not-allowed": "Speech service unavailable — please use Chrome",
        "aborted": "Listening stopped",
      };

      const errorCode = (event as ErrorEvent & { error?: string }).error || "";
      const msg = errorMap[errorCode] || `Mic error (${errorCode}) — tap to try again`;
      setStatusText(msg);
    };

    recognition.start();
    setListening(true);
    setTranscript("");
    setStatusText("Listening — speak now...");
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }

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

  /* ─── Cleanup ─── */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* */ }
      }
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
        <p className="text-xs text-muted-foreground mb-6 text-center max-w-xs">
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
          <p className="text-xs text-muted-foreground">
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
            <span className="text-[10px] text-muted-foreground uppercase block mb-1">
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
        {listening && transcript && (
          <div className="bg-primary/10 ml-8 p-3 rounded-lg border border-primary/20">
            <span className="text-[10px] text-muted-foreground uppercase block mb-1">
              You (listening...)
            </span>
            <span className="text-sm italic text-muted-foreground">{transcript}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Voice controls */}
      <div className="border-t pt-4">
        {/* Status */}
        <p className="text-center text-xs text-muted-foreground mb-3">
          {speaking && <Volume2 className="h-3 w-3 inline mr-1 animate-pulse" />}
          {statusText}
        </p>

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
          <p className="text-center text-xs text-red-500 animate-pulse mt-2 flex items-center justify-center gap-1">
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
