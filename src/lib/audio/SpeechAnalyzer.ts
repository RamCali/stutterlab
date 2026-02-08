/**
 * SpeechAnalyzer - Real-time speech analysis for the AI Speech Mirror
 *
 * Uses Web Speech API for transcription and AudioEngine's AnalyserNode
 * for vocal effort monitoring. Runs entirely client-side.
 *
 * Emits:
 * - onTranscript(text, isFinal) — live transcription updates
 * - onMetrics({ rate, effort, fluencyScore }) — every ~2 seconds
 * - onDisfluency({ type, word, timestamp }) — per detected disfluency
 */

export interface SpeechMetrics {
  speakingRate: number; // syllables per minute
  vocalEffort: number; // 0-1 normalized RMS
  fluencyScore: number; // 0-100
  totalSyllables: number;
  totalDisfluencies: number;
}

export interface Disfluency {
  type: "repetition" | "prolongation" | "interjection" | "block";
  word: string;
  timestamp: number;
}

export interface TranscriptSegment {
  text: string;
  isFinal: boolean;
  timestamp: number;
  disfluencies: Disfluency[];
}

interface SpeechAnalyzerCallbacks {
  onTranscript?: (segment: TranscriptSegment) => void;
  onMetrics?: (metrics: SpeechMetrics) => void;
  onDisfluency?: (disfluency: Disfluency) => void;
}

// Common filler words / interjections
const INTERJECTIONS = new Set([
  "um", "uh", "er", "ah", "like", "you know", "i mean", "so", "well",
  "basically", "actually", "literally",
]);

// Regex for word repetitions (e.g., "I I I", "the the")
const REPETITION_REGEX = /\b(\w+)\s+\1\b/gi;

// Regex for sound prolongations (e.g., "ssssay", "mmmmom")
const PROLONGATION_REGEX = /\b(\w)\1{2,}\w*/gi;

export class SpeechAnalyzer {
  private recognition: SpeechRecognition | null = null;
  private analyserNode: AnalyserNode | null = null;
  private callbacks: SpeechAnalyzerCallbacks = {};
  private metricsInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  // Tracking state
  private finalTranscripts: string[] = [];
  private allDisfluencies: Disfluency[] = [];
  private startTime = 0;
  private lastSpeechTimestamp = 0;
  private silenceGaps: number[] = []; // durations of silence gaps > 800ms

  // Syllable counting for rate
  private syllableTimestamps: number[] = [];

  constructor(analyserNode: AnalyserNode | null, callbacks: SpeechAnalyzerCallbacks) {
    this.analyserNode = analyserNode;
    this.callbacks = callbacks;
  }

  start(): boolean {
    const SpeechRecognitionAPI =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return false;

    this.recognition = new (SpeechRecognitionAPI as new () => SpeechRecognition)();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;

    this.startTime = Date.now();
    this.lastSpeechTimestamp = this.startTime;
    this.finalTranscripts = [];
    this.allDisfluencies = [];
    this.silenceGaps = [];
    this.syllableTimestamps = [];

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const now = Date.now();

      // Track silence gaps
      const gap = now - this.lastSpeechTimestamp;
      if (gap > 800) {
        this.silenceGaps.push(gap);
      }
      this.lastSpeechTimestamp = now;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        const isFinal = result.isFinal;

        const disfluencies = this.detectDisfluencies(transcript, now);

        if (isFinal) {
          this.finalTranscripts.push(transcript);
          this.allDisfluencies.push(...disfluencies);

          // Count syllables for rate tracking
          const syllableCount = this.estimateSyllables(transcript);
          for (let s = 0; s < syllableCount; s++) {
            this.syllableTimestamps.push(now);
          }
        }

        this.callbacks.onTranscript?.({
          text: transcript,
          isFinal,
          timestamp: now,
          disfluencies,
        });

        for (const d of disfluencies) {
          this.callbacks.onDisfluency?.(d);
        }
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      console.warn("SpeechRecognition error:", event.error);
    };

    this.recognition.onend = () => {
      // Auto-restart if still running (browser stops after ~60s of silence)
      if (this.isRunning) {
        try {
          this.recognition?.start();
        } catch {
          // Already started
        }
      }
    };

    this.recognition.start();
    this.isRunning = true;

    // Emit metrics every 2 seconds
    this.metricsInterval = setInterval(() => {
      this.callbacks.onMetrics?.(this.getCurrentMetrics());
    }, 2000);

    return true;
  }

  stop(): SpeechMetrics {
    this.isRunning = false;

    if (this.recognition) {
      this.recognition.onend = null;
      this.recognition.abort();
      this.recognition = null;
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    return this.getCurrentMetrics();
  }

  getCurrentMetrics(): SpeechMetrics {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const totalSyllables = this.syllableTimestamps.length;

    // Speaking rate: syllables per minute
    const speakingRate = elapsedMinutes > 0.05
      ? Math.round(totalSyllables / elapsedMinutes)
      : 0;

    // Vocal effort from AnalyserNode
    const vocalEffort = this.measureVocalEffort();

    // Fluency score: start at 100, deduct for disfluencies
    const totalDisfluencies = this.allDisfluencies.length;
    const disfluencyPenalty = Math.min(60, totalDisfluencies * 5);
    const blockPenalty = Math.min(20, this.silenceGaps.filter(g => g > 1500).length * 8);
    const fluencyScore = Math.max(0, Math.round(100 - disfluencyPenalty - blockPenalty));

    return {
      speakingRate,
      vocalEffort,
      fluencyScore,
      totalSyllables,
      totalDisfluencies,
    };
  }

  getFullTranscript(): string {
    return this.finalTranscripts.join(" ");
  }

  getAllDisfluencies(): Disfluency[] {
    return [...this.allDisfluencies];
  }

  private detectDisfluencies(text: string, timestamp: number): Disfluency[] {
    const disfluencies: Disfluency[] = [];
    const lowerText = text.toLowerCase();

    // Check interjections
    const words = lowerText.split(/\s+/);
    for (const word of words) {
      if (INTERJECTIONS.has(word)) {
        disfluencies.push({ type: "interjection", word, timestamp });
      }
    }

    // Check two-word interjections
    for (let i = 0; i < words.length - 1; i++) {
      const twoWord = `${words[i]} ${words[i + 1]}`;
      if (INTERJECTIONS.has(twoWord)) {
        disfluencies.push({ type: "interjection", word: twoWord, timestamp });
      }
    }

    // Check repetitions
    let match: RegExpExecArray | null;
    const repRegex = new RegExp(REPETITION_REGEX.source, "gi");
    while ((match = repRegex.exec(text)) !== null) {
      disfluencies.push({ type: "repetition", word: match[0], timestamp });
    }

    // Check prolongations
    const proRegex = new RegExp(PROLONGATION_REGEX.source, "gi");
    while ((match = proRegex.exec(text)) !== null) {
      disfluencies.push({ type: "prolongation", word: match[0], timestamp });
    }

    return disfluencies;
  }

  private measureVocalEffort(): number {
    if (!this.analyserNode) return 0;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    return Math.min(1, rms / 128);
  }

  private estimateSyllables(text: string): number {
    // Vowel-cluster heuristic for English syllable estimation
    const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
    let total = 0;

    for (const word of words) {
      if (word.length <= 2) {
        total += 1;
        continue;
      }

      // Count vowel groups
      const vowelGroups = word.match(/[aeiouy]+/g);
      let count = vowelGroups ? vowelGroups.length : 1;

      // Subtract silent e
      if (word.endsWith("e") && count > 1) count--;
      // Subtract -ed endings (when not separate syllable)
      if (word.endsWith("ed") && !word.endsWith("ted") && !word.endsWith("ded") && count > 1) count--;
      // Ensure at least 1 syllable
      total += Math.max(1, count);
    }

    return total;
  }

  static isSupported(): boolean {
    return !!(
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    );
  }
}
