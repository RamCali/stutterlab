/**
 * VoiceConversation - Orchestrates voice-to-voice AI conversation sessions
 *
 * State machine: IDLE → LISTENING → PROCESSING → SPEAKING → LISTENING → ...
 *
 * Flow:
 * 1. User speaks → Web Speech API transcribes
 * 2. Transcript → /api/ai-conversation → AI response text
 * 3. AI response → /api/tts → audio blob → play through speaker
 * 4. Audio ends → resume listening
 */

export type VoiceState = "idle" | "listening" | "processing" | "speaking";

export interface TurnMetrics {
  turnIndex: number;
  role: "user" | "assistant";
  text: string;
  disfluencyCount: number;
  speakingRate: number;
  timestamp: number;
  techniquesUsed?: string[];
  vocalEffort?: number;
  spmZone?: "slow" | "target" | "fast";
}

export interface SpeechQualityMetrics {
  currentSPM: number;
  vocalEffort: number;
  recentDisfluencies: number;
  detectedTechniques: string[];
}

interface VoiceConversationCallbacks {
  onStateChange: (state: VoiceState) => void;
  onUserTranscript: (text: string, isFinal: boolean) => void;
  onAssistantMessage: (text: string) => void;
  onTurnComplete: (turn: TurnMetrics) => void;
  onError: (error: string) => void;
}

export class VoiceConversation {
  private state: VoiceState = "idle";
  private recognition: SpeechRecognition | null = null;
  private audioContext: AudioContext | null = null;
  private callbacks: VoiceConversationCallbacks;
  private scenario: string;
  private conversationHistory: { role: "user" | "assistant"; content: string }[] = [];
  private turnIndex = 0;
  private currentTranscript = "";
  private turnStartTime = 0;
  private silenceTimeout: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;

  // Track all turns for performance report
  private allTurns: TurnMetrics[] = [];

  private metricsProvider?: () => SpeechQualityMetrics | null;

  private stressLevel?: number;

  constructor(
    scenario: string,
    callbacks: VoiceConversationCallbacks,
    metricsProvider?: () => SpeechQualityMetrics | null,
    stressLevel?: number
  ) {
    this.scenario = scenario;
    this.callbacks = callbacks;
    this.metricsProvider = metricsProvider;
    this.stressLevel = stressLevel;
  }

  async start(): Promise<boolean> {
    const SpeechRecognitionAPI =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      this.callbacks.onError("Speech recognition not supported in this browser");
      return false;
    }

    this.audioContext = new AudioContext();
    this.isRunning = true;
    this.conversationHistory = [];
    this.allTurns = [];
    this.turnIndex = 0;

    // Start with the AI greeting
    this.setState("processing");
    await this.getAIResponse("Hi, let's start.");
    this.conversationHistory.push({ role: "user", content: "Hi, let's start." });

    return true;
  }

  stop(): TurnMetrics[] {
    this.isRunning = false;
    this.setState("idle");

    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }

    if (this.recognition) {
      this.recognition.onend = null;
      this.recognition.abort();
      this.recognition = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    return this.allTurns;
  }

  getHistory() {
    return [...this.conversationHistory];
  }

  getAllTurns() {
    return [...this.allTurns];
  }

  private setState(newState: VoiceState) {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  private startListening() {
    if (!this.isRunning) return;

    const SpeechRecognitionAPI =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    this.recognition = new (SpeechRecognitionAPI as new () => SpeechRecognition)();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";

    this.currentTranscript = "";
    this.turnStartTime = Date.now();
    this.setState("listening");

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Reset silence timer on any speech
      if (this.silenceTimeout) clearTimeout(this.silenceTimeout);

      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.currentTranscript += finalTranscript;
        this.callbacks.onUserTranscript(this.currentTranscript, false);
      } else if (interimTranscript) {
        this.callbacks.onUserTranscript(
          this.currentTranscript + interimTranscript,
          false
        );
      }

      // Set silence timeout: if user stops speaking for 2s, consider turn complete
      this.silenceTimeout = setTimeout(() => {
        if (this.currentTranscript.trim() && this.isRunning) {
          this.finishUserTurn();
        }
      }, 2000);
    };

    this.recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        // Restart if no speech detected
        if (this.isRunning && this.state === "listening") {
          try {
            this.recognition?.start();
          } catch {
            // Already started
          }
        }
        return;
      }
      if (event.error !== "aborted") {
        this.callbacks.onError(`Speech recognition error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      if (this.isRunning && this.state === "listening") {
        try {
          this.recognition?.start();
        } catch {
          // Already started
        }
      }
    };

    this.recognition.start();
  }

  private async finishUserTurn() {
    if (!this.currentTranscript.trim()) return;

    // Stop listening
    if (this.recognition) {
      this.recognition.onend = null;
      this.recognition.abort();
      this.recognition = null;
    }

    const userText = this.currentTranscript.trim();
    this.callbacks.onUserTranscript(userText, true);

    // Record user turn
    const disfluencyCount = this.countDisfluencies(userText);
    const elapsed = (Date.now() - this.turnStartTime) / 60000;
    const syllables = this.estimateSyllables(userText);
    const speakingRate = elapsed > 0.01 ? Math.round(syllables / elapsed) : 0;

    const userTurn: TurnMetrics = {
      turnIndex: this.turnIndex++,
      role: "user",
      text: userText,
      disfluencyCount,
      speakingRate,
      timestamp: Date.now(),
    };
    this.allTurns.push(userTurn);
    this.callbacks.onTurnComplete(userTurn);

    this.conversationHistory.push({ role: "user", content: userText });

    // Get AI response
    this.setState("processing");
    await this.getAIResponse(userText);
  }

  private async getAIResponse(userMessage: string) {
    try {
      const speechMetrics = this.metricsProvider?.() ?? undefined;

      const res = await fetch("/api/ai-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: this.scenario,
          messages: this.conversationHistory,
          userMessage: this.conversationHistory.length === 0 ? userMessage : undefined,
          voiceMode: true,
          speechMetrics,
          stressLevel: this.stressLevel,
        }),
      });

      const data = await res.json();
      if (!data.message) {
        this.callbacks.onError("No response from AI");
        return;
      }

      const aiText = data.message;
      this.conversationHistory.push({ role: "assistant", content: aiText });
      this.callbacks.onAssistantMessage(aiText);

      // Record assistant turn
      const aiTurn: TurnMetrics = {
        turnIndex: this.turnIndex++,
        role: "assistant",
        text: aiText,
        disfluencyCount: 0,
        speakingRate: 0,
        timestamp: Date.now(),
      };
      this.allTurns.push(aiTurn);

      // Convert to speech
      await this.speakResponse(aiText);
    } catch {
      this.callbacks.onError("Failed to get AI response");
      if (this.isRunning) this.startListening();
    }
  }

  private async speakResponse(text: string) {
    if (!this.isRunning) return;
    this.setState("speaking");

    try {
      // Try ElevenLabs TTS first
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const audioBlob = await res.blob();
        await this.playAudioBlob(audioBlob);
      } else {
        // Fallback to Web Speech API
        await this.speakWithWebSpeech(text);
      }
    } catch {
      // Fallback to Web Speech API
      await this.speakWithWebSpeech(text);
    }

    // Resume listening after speech ends
    if (this.isRunning) {
      this.startListening();
    }
  }

  private playAudioBlob(blob: Blob): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(URL.createObjectURL(blob));
      audio.onended = () => {
        URL.revokeObjectURL(audio.src);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        resolve();
      };
      audio.play();
    });
  }

  private speakWithWebSpeech(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  private countDisfluencies(text: string): number {
    let count = 0;
    const lower = text.toLowerCase();
    const fillers = ["um", "uh", "er", "ah", "like", "you know", "i mean"];
    for (const filler of fillers) {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      const matches = lower.match(regex);
      if (matches) count += matches.length;
    }
    // Word repetitions
    const repMatches = text.match(/\b(\w+)\s+\1\b/gi);
    if (repMatches) count += repMatches.length;
    return count;
  }

  private estimateSyllables(text: string): number {
    const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
    let total = 0;
    for (const word of words) {
      if (word.length <= 2) { total += 1; continue; }
      const vowelGroups = word.match(/[aeiouy]+/g);
      let count = vowelGroups ? vowelGroups.length : 1;
      if (word.endsWith("e") && count > 1) count--;
      total += Math.max(1, count);
    }
    return total;
  }
}
