/**
 * EmotionDetector — Real-time emotional state detection from voice biomarkers
 *
 * Tracks pitch variance, pace changes, volume stability, and pause frequency
 * to classify emotional state as calm, anxious, frustrated, or confident.
 *
 * Follows the same pattern as SpeechAnalyzer — takes an AnalyserNode and
 * emits state changes via callbacks.
 */

import type { EmotionalState, EmotionSnapshot } from "@/lib/analysis/types";

export interface EmotionDetectorCallbacks {
  onStateChange: (snapshot: EmotionSnapshot) => void;
}

// ─── Detection Thresholds ───

const ANALYSIS_INTERVAL_MS = 2000; // Emit every 2 seconds
const VOLUME_WINDOW_SIZE = 10; // 10 samples for RMS variance
const PITCH_WINDOW_SIZE = 15; // 15 samples for zero-crossing rate

export class EmotionDetector {
  private analyserNode: AnalyserNode | null;
  private callbacks: EmotionDetectorCallbacks;
  private isRunning = false;

  // Audio data buffers
  private timeDomainData: Uint8Array | null = null;
  private frequencyData: Uint8Array | null = null;

  // Tracking buffers
  private rmsHistory: number[] = [];
  private zeroCrossingHistory: number[] = [];
  private silenceGapCount = 0;
  private lastSpeechTimestamp = 0;
  private speechOnsetTimestamps: number[] = [];

  // State
  private currentState: EmotionalState = "calm";
  private currentConfidence = 0;

  // Intervals
  private analysisInterval: ReturnType<typeof setInterval> | null = null;
  private trackingFrameId: number | null = null;

  constructor(
    analyserNode: AnalyserNode | null,
    callbacks: EmotionDetectorCallbacks
  ) {
    this.analyserNode = analyserNode;
    this.callbacks = callbacks;
  }

  start(): boolean {
    if (this.isRunning || !this.analyserNode) return false;

    this.isRunning = true;
    this.timeDomainData = new Uint8Array(this.analyserNode.fftSize);
    this.frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);

    // Start collecting audio data at ~30fps
    this.startTracking();

    // Emit analysis every 2 seconds
    this.analysisInterval = setInterval(() => {
      this.analyze();
    }, ANALYSIS_INTERVAL_MS);

    return true;
  }

  stop(): EmotionSnapshot {
    this.isRunning = false;

    if (this.trackingFrameId) {
      cancelAnimationFrame(this.trackingFrameId);
      this.trackingFrameId = null;
    }
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    return this.getCurrentSnapshot();
  }

  getCurrentSnapshot(): EmotionSnapshot {
    return {
      state: this.currentState,
      confidence: this.currentConfidence,
      indicators: this.getIndicators(),
      pitchVariance: this.computePitchVariance(),
      paceChange: this.computePaceChange(),
      volumeStability: this.computeVolumeStability(),
      pauseFrequency: this.silenceGapCount,
      timestamp: Date.now(),
    };
  }

  getCurrentState(): EmotionalState {
    return this.currentState;
  }

  getConfidence(): number {
    return this.currentConfidence;
  }

  // ─── Audio Tracking (~30fps) ───

  private startTracking(): void {
    const track = () => {
      if (!this.isRunning || !this.analyserNode || !this.timeDomainData) return;

      // Get time-domain data for RMS and zero-crossing
      this.analyserNode.getByteTimeDomainData(this.timeDomainData as Uint8Array<ArrayBuffer>);

      // Compute RMS (volume level)
      let sum = 0;
      let zeroCrossings = 0;
      let prevSample = 0;

      for (let i = 0; i < this.timeDomainData.length; i++) {
        const sample = (this.timeDomainData[i] - 128) / 128;
        sum += sample * sample;

        // Count zero crossings (rough pitch proxy)
        if (i > 0 && sample * prevSample < 0) {
          zeroCrossings++;
        }
        prevSample = sample;
      }

      const rms = Math.sqrt(sum / this.timeDomainData.length);
      this.rmsHistory.push(rms);
      if (this.rmsHistory.length > 60) this.rmsHistory.shift(); // ~2 seconds at 30fps

      // Zero-crossing rate (proportional to fundamental frequency)
      const zcr = zeroCrossings / this.timeDomainData.length;
      this.zeroCrossingHistory.push(zcr);
      if (this.zeroCrossingHistory.length > 60) this.zeroCrossingHistory.shift();

      // Track speech/silence transitions
      const now = Date.now();
      const isSpeaking = rms > 0.02;
      if (isSpeaking) {
        if (now - this.lastSpeechTimestamp > 800) {
          // Silence gap detected (>800ms)
          this.silenceGapCount++;
          this.speechOnsetTimestamps.push(now);
          if (this.speechOnsetTimestamps.length > 20) {
            this.speechOnsetTimestamps.shift();
          }
        }
        this.lastSpeechTimestamp = now;
      }

      this.trackingFrameId = requestAnimationFrame(track);
    };

    this.trackingFrameId = requestAnimationFrame(track);
  }

  // ─── Analysis (every 2 seconds) ───

  private analyze(): void {
    if (!this.isRunning) return;

    const pitchVariance = this.computePitchVariance();
    const paceChange = this.computePaceChange();
    const volumeStability = this.computeVolumeStability();

    // Classify emotional state
    const { state, confidence } = this.classify(
      pitchVariance,
      paceChange,
      volumeStability
    );

    this.currentState = state;
    this.currentConfidence = confidence;

    this.callbacks.onStateChange({
      state,
      confidence,
      indicators: this.getIndicators(),
      pitchVariance,
      paceChange,
      volumeStability,
      pauseFrequency: this.silenceGapCount,
      timestamp: Date.now(),
    });
  }

  // ─── Metrics Computation ───

  /** Pitch variance: standard deviation of zero-crossing rate */
  private computePitchVariance(): number {
    if (this.zeroCrossingHistory.length < 5) return 0;

    const recent = this.zeroCrossingHistory.slice(-PITCH_WINDOW_SIZE);
    const mean = recent.reduce((s, v) => s + v, 0) / recent.length;
    const variance =
      recent.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / recent.length;

    return Math.sqrt(variance);
  }

  /** Pace change: ratio of recent speech onset intervals to older ones */
  private computePaceChange(): number {
    if (this.speechOnsetTimestamps.length < 4) return 1.0;

    const timestamps = this.speechOnsetTimestamps;
    const mid = Math.floor(timestamps.length / 2);

    // Compute average interval for recent half vs older half
    const olderIntervals: number[] = [];
    for (let i = 1; i < mid; i++) {
      olderIntervals.push(timestamps[i] - timestamps[i - 1]);
    }
    const recentIntervals: number[] = [];
    for (let i = mid + 1; i < timestamps.length; i++) {
      recentIntervals.push(timestamps[i] - timestamps[i - 1]);
    }

    if (olderIntervals.length === 0 || recentIntervals.length === 0) return 1.0;

    const olderAvg =
      olderIntervals.reduce((s, v) => s + v, 0) / olderIntervals.length;
    const recentAvg =
      recentIntervals.reduce((s, v) => s + v, 0) / recentIntervals.length;

    if (olderAvg === 0) return 1.0;

    // Ratio > 1 = slowing down, < 1 = speeding up
    return recentAvg / olderAvg;
  }

  /** Volume stability: 1 - normalized variance of RMS values (higher = more stable) */
  private computeVolumeStability(): number {
    if (this.rmsHistory.length < VOLUME_WINDOW_SIZE) return 0.5;

    const recent = this.rmsHistory.slice(-VOLUME_WINDOW_SIZE * 3);
    const mean = recent.reduce((s, v) => s + v, 0) / recent.length;
    if (mean === 0) return 0.5;

    const variance =
      recent.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / recent.length;
    const cv = Math.sqrt(variance) / mean; // Coefficient of variation

    // Map to 0-1 stability (lower CV = higher stability)
    return Math.max(0, Math.min(1, 1 - cv));
  }

  // ─── Classification ───

  private classify(
    pitchVariance: number,
    paceChange: number,
    volumeStability: number
  ): { state: EmotionalState; confidence: number } {
    // Score each state
    const scores: Record<EmotionalState, number> = {
      calm: 0,
      anxious: 0,
      frustrated: 0,
      confident: 0,
    };

    // High pitch variance → anxious or frustrated
    if (pitchVariance > 0.06) {
      scores.anxious += 0.3;
      scores.frustrated += 0.2;
    } else if (pitchVariance > 0.04) {
      scores.anxious += 0.2;
    } else {
      scores.calm += 0.2;
      scores.confident += 0.1;
    }

    // Pace speeding up → anxious (rushing)
    if (paceChange < 0.7) {
      scores.anxious += 0.3;
    } else if (paceChange > 1.3) {
      // Slowing down significantly → could be calm deliberation or blocking
      scores.calm += 0.1;
    } else {
      // Steady pace
      scores.confident += 0.2;
      scores.calm += 0.1;
    }

    // Low volume stability → frustrated or anxious
    if (volumeStability < 0.3) {
      scores.frustrated += 0.3;
      scores.anxious += 0.1;
    } else if (volumeStability > 0.7) {
      scores.confident += 0.3;
      scores.calm += 0.2;
    } else {
      scores.calm += 0.1;
    }

    // Frequent pauses + high pitch variance → frustrated
    if (this.silenceGapCount > 5 && pitchVariance > 0.04) {
      scores.frustrated += 0.2;
    }

    // Find the highest scoring state
    let maxState: EmotionalState = "calm";
    let maxScore = 0;
    for (const [state, score] of Object.entries(scores) as [EmotionalState, number][]) {
      if (score > maxScore) {
        maxScore = score;
        maxState = state;
      }
    }

    // Confidence based on margin between top and second
    const sortedScores = Object.values(scores).sort((a, b) => b - a);
    const margin = sortedScores[0] - (sortedScores[1] ?? 0);
    const confidence = Math.min(1, margin * 2 + 0.3);

    return { state: maxState, confidence: Math.round(confidence * 100) / 100 };
  }

  // ─── Helpers ───

  private getIndicators(): string[] {
    const indicators: string[] = [];
    const pitchVar = this.computePitchVariance();
    const paceChg = this.computePaceChange();
    const volStab = this.computeVolumeStability();

    if (pitchVar > 0.06) indicators.push("High pitch variability");
    if (paceChg < 0.7) indicators.push("Accelerating pace");
    if (paceChg > 1.4) indicators.push("Decelerating pace");
    if (volStab < 0.3) indicators.push("Unstable volume");
    if (volStab > 0.7) indicators.push("Stable, confident volume");
    if (this.silenceGapCount > 5) indicators.push("Frequent pauses");

    return indicators;
  }
}
