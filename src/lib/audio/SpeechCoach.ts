/**
 * SpeechCoach - Real-time speech coaching intelligence
 *
 * Wraps SpeechAnalyzer and adds:
 * - Technique detection (gentle onset, pacing, rate compliance, etc.)
 * - Coaching nudges with rate limiting
 * - Haptic feedback (mobile)
 * - Coaching snapshots emitted every 500ms for UI consumption
 */

import {
  SpeechAnalyzer,
  type SpeechMetrics,
  type Disfluency,
  type TranscriptSegment,
} from "./SpeechAnalyzer";
import { CoachAudioCues, type AudioCueConfig } from "./CoachAudioCues";

// ======================== TYPES ========================

export type TechniqueType =
  | "gentle_onset"
  | "pacing"
  | "rate_compliance"
  | "prolonged_speech"
  | "cancellation"
  | "pull_out";

export type NudgeType =
  | "slow_down"
  | "breathe"
  | "relax_tension"
  | "good_technique"
  | "good_pacing"
  | "keep_going";

export type NudgeSeverity = "positive" | "warning" | "urgent";

export interface CoachingConfig {
  targetSPM: { min: number; max: number };
  effortThreshold: number;
  nudgeIntervalMs: number;
  enableHaptic: boolean;
  enableVisual: boolean;
  enableAudioCues: boolean;
  audioCueVolume: number;
  activeTechniques: TechniqueType[];
}

export interface TechniqueDetection {
  technique: TechniqueType;
  confidence: "low" | "medium" | "high";
  timestamp: number;
  evidence: string;
}

export interface CoachNudge {
  type: NudgeType;
  message: string;
  severity: NudgeSeverity;
  timestamp: number;
  haptic: boolean;
}

export interface CoachingSnapshot {
  currentSPM: number;
  targetSPM: { min: number; max: number };
  spmZone: "slow" | "target" | "fast";
  vocalEffort: number;
  effortZone: "relaxed" | "moderate" | "tense";
  activeNudge: CoachNudge | null;
  detectedTechniques: TechniqueDetection[];
  sessionTechniqueCounts: Record<TechniqueType, number>;
  metrics: SpeechMetrics;
  totalNudgesGiven: number;
}

export interface SpeechCoachCallbacks {
  onSnapshot: (snapshot: CoachingSnapshot) => void;
  onNudge: (nudge: CoachNudge) => void;
  onTechniqueDetected: (detection: TechniqueDetection) => void;
}

// ======================== CONSTANTS ========================

const DEFAULT_CONFIG: CoachingConfig = {
  targetSPM: { min: 140, max: 200 },
  effortThreshold: 0.7,
  nudgeIntervalMs: 10000,
  enableHaptic: true,
  enableVisual: true,
  enableAudioCues: true,
  audioCueVolume: 0.15,
  activeTechniques: [
    "gentle_onset",
    "pacing",
    "rate_compliance",
    "prolonged_speech",
    "cancellation",
    "pull_out",
  ],
};

const TECHNIQUE_PRAISE: Record<TechniqueType, string> = {
  gentle_onset: "Nice gentle onset!",
  pacing: "Good pacing — keep it up!",
  rate_compliance: "Great speaking rate!",
  prolonged_speech: "Smooth prolongation!",
  cancellation: "Good cancellation technique!",
  pull_out: "Nice pull-out!",
};

const EMPTY_METRICS: SpeechMetrics = {
  speakingRate: 0,
  vocalEffort: 0,
  fluencyScore: 100,
  totalSyllables: 0,
  totalDisfluencies: 0,
};

// ======================== CLASS ========================

export class SpeechCoach {
  private analyzer: SpeechAnalyzer | null = null;
  private analyserNode: AnalyserNode | null;
  private config: CoachingConfig;
  private callbacks: SpeechCoachCallbacks;
  private audioCues: CoachAudioCues;

  // State
  private isRunning = false;
  private latestMetrics: SpeechMetrics = { ...EMPTY_METRICS };
  private activeNudge: CoachNudge | null = null;

  // Nudge rate limiting
  private lastNudgeTime = 0;
  private totalNudgesGiven = 0;

  // Technique detection
  private techniqueCounts: Record<TechniqueType, number> = {
    gentle_onset: 0,
    pacing: 0,
    rate_compliance: 0,
    prolonged_speech: 0,
    cancellation: 0,
    pull_out: 0,
  };
  private recentDetections: TechniqueDetection[] = [];

  // Amplitude envelope tracking for gentle onset
  private amplitudeBuffer: number[] = [];
  private amplitudeFrameId: number | null = null;
  private timeDomainData: Uint8Array | null = null;

  // Rate compliance tracking
  private consecutiveOnTargetChecks = 0;

  // Pacing detection
  private lastSilenceGapCount = 0;

  // Disfluency tracking for nudges
  private recentDisfluencyTimestamps: number[] = [];

  // Cancellation detection
  private lastDisfluencyTimestamp = 0;
  private awaitingCancellation = false;

  // Snapshot & cleanup
  private snapshotInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    analyserNode: AnalyserNode | null,
    config: Partial<CoachingConfig>,
    callbacks: SpeechCoachCallbacks
  ) {
    this.analyserNode = analyserNode;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.callbacks = callbacks;
    this.audioCues = new CoachAudioCues({
      enabled: this.config.enableAudioCues,
      volume: this.config.audioCueVolume,
    });
  }

  // ==================== LIFECYCLE ====================

  start(): boolean {
    if (this.isRunning) return false;

    // Create and start the underlying SpeechAnalyzer
    this.analyzer = new SpeechAnalyzer(this.analyserNode, {
      onTranscript: (segment) => this.handleTranscript(segment),
      onMetrics: (metrics) => this.handleMetrics(metrics),
      onDisfluency: (disfluency) => this.handleDisfluency(disfluency),
    });

    const started = this.analyzer.start();
    if (!started) return false;

    this.isRunning = true;

    // Start amplitude envelope tracking (~30fps) for gentle onset
    if (this.analyserNode) {
      this.timeDomainData = new Uint8Array(this.analyserNode.fftSize);
      this.startAmplitudeTracking();
    }

    // Emit snapshots every 500ms
    this.snapshotInterval = setInterval(() => {
      this.emitSnapshot();
    }, 500);

    return true;
  }

  stop(): CoachingSnapshot {
    this.isRunning = false;

    if (this.analyzer) {
      this.latestMetrics = this.analyzer.stop();
      this.analyzer = null;
    }

    if (this.amplitudeFrameId) {
      cancelAnimationFrame(this.amplitudeFrameId);
      this.amplitudeFrameId = null;
    }

    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.snapshotInterval = null;
    }

    this.audioCues.destroy();

    return this.getCurrentSnapshot();
  }

  updateConfig(partial: Partial<CoachingConfig>): void {
    this.config = { ...this.config, ...partial };
    this.audioCues.updateConfig({
      enabled: this.config.enableAudioCues,
      volume: this.config.audioCueVolume,
    });
  }

  getCurrentSnapshot(): CoachingSnapshot {
    const spm = this.latestMetrics.speakingRate;
    const effort = this.latestMetrics.vocalEffort;

    return {
      currentSPM: spm,
      targetSPM: this.config.targetSPM,
      spmZone: this.getSPMZone(spm),
      vocalEffort: effort,
      effortZone: this.getEffortZone(effort),
      activeNudge: this.activeNudge,
      detectedTechniques: this.recentDetections.filter(
        (d) => Date.now() - d.timestamp < 10000
      ),
      sessionTechniqueCounts: { ...this.techniqueCounts },
      metrics: { ...this.latestMetrics },
      totalNudgesGiven: this.totalNudgesGiven,
    };
  }

  getAnalyzer(): SpeechAnalyzer | null {
    return this.analyzer;
  }

  // ==================== HANDLERS ====================

  private handleMetrics(metrics: SpeechMetrics): void {
    this.latestMetrics = metrics;

    // Check rate compliance
    this.checkRateCompliance(metrics.speakingRate);

    // Check for prolonged speech technique
    this.checkProlongedSpeech(metrics);

    // Evaluate nudges
    this.evaluateNudges(metrics);
  }

  private handleTranscript(segment: TranscriptSegment): void {
    if (!segment.isFinal) return;

    // Check for cancellation: if we were waiting after a disfluency,
    // and now we got clean speech, that's a cancellation
    if (this.awaitingCancellation) {
      const timeSinceDisfluency = segment.timestamp - this.lastDisfluencyTimestamp;
      if (timeSinceDisfluency > 800 && timeSinceDisfluency < 4000) {
        if (segment.disfluencies.length === 0) {
          this.recordTechnique({
            technique: "cancellation",
            confidence: "medium",
            timestamp: segment.timestamp,
            evidence: "Paused after disfluency, then re-attempted cleanly",
          });
        }
      }
      this.awaitingCancellation = false;
    }

    // Check gentle onset: analyze the amplitude buffer at speech onset
    if (this.amplitudeBuffer.length >= 6) {
      this.checkGentleOnset(segment.timestamp);
    }
  }

  private handleDisfluency(disfluency: Disfluency): void {
    this.recentDisfluencyTimestamps.push(disfluency.timestamp);

    // Clean old timestamps (keep last 30 seconds)
    const cutoff = Date.now() - 30000;
    this.recentDisfluencyTimestamps = this.recentDisfluencyTimestamps.filter(
      (t) => t > cutoff
    );

    // Set up cancellation detection
    this.lastDisfluencyTimestamp = disfluency.timestamp;
    this.awaitingCancellation = true;

    // Check for pull-out: prolongation that completes without long pause
    if (disfluency.type === "prolongation") {
      // We'll check on the next transcript if the word completed smoothly
      setTimeout(() => {
        if (!this.awaitingCancellation) {
          // Speech continued without a big pause — possible pull-out
          this.recordTechnique({
            technique: "pull_out",
            confidence: "low",
            timestamp: disfluency.timestamp,
            evidence: `Prolongation on "${disfluency.word}" resolved without blocking`,
          });
        }
      }, 1500);
    }
  }

  // ==================== TECHNIQUE DETECTION ====================

  private checkGentleOnset(timestamp: number): void {
    if (!this.config.activeTechniques.includes("gentle_onset")) return;
    if (this.amplitudeBuffer.length < 6) return;

    // Look at the last 10 amplitude samples (covering ~330ms at 30fps)
    const recent = this.amplitudeBuffer.slice(-10);

    // Find the onset: where amplitude first exceeds 0.05 (voice activity)
    let onsetIndex = -1;
    for (let i = 0; i < recent.length; i++) {
      if (recent[i] > 0.05) {
        onsetIndex = i;
        break;
      }
    }

    if (onsetIndex < 0 || onsetIndex >= recent.length - 3) return;

    // Measure the slope of the first 4 samples after onset
    const onsetSamples = recent.slice(onsetIndex, onsetIndex + 4);
    if (onsetSamples.length < 3) return;

    let totalSlope = 0;
    for (let i = 1; i < onsetSamples.length; i++) {
      totalSlope += onsetSamples[i] - onsetSamples[i - 1];
    }
    const avgSlope = totalSlope / (onsetSamples.length - 1);

    // Gentle onset: gradual rise. Hard attack: steep rise.
    if (avgSlope < 0.12 && avgSlope > 0.005) {
      this.recordTechnique({
        technique: "gentle_onset",
        confidence: avgSlope < 0.06 ? "high" : "medium",
        timestamp,
        evidence: `Gradual amplitude rise (slope: ${avgSlope.toFixed(3)})`,
      });
    }
  }

  private checkRateCompliance(spm: number): void {
    if (!this.config.activeTechniques.includes("rate_compliance")) return;
    if (spm === 0) return;

    const zone = this.getSPMZone(spm);
    if (zone === "target") {
      this.consecutiveOnTargetChecks++;
      if (this.consecutiveOnTargetChecks >= 3) {
        this.recordTechnique({
          technique: "rate_compliance",
          confidence: "high",
          timestamp: Date.now(),
          evidence: `Maintained target rate (${spm} syl/min) for 6+ seconds`,
        });
        this.consecutiveOnTargetChecks = 0; // Reset to avoid spamming
      }
    } else {
      this.consecutiveOnTargetChecks = 0;
    }
  }

  private checkProlongedSpeech(metrics: SpeechMetrics): void {
    if (!this.config.activeTechniques.includes("prolonged_speech")) return;

    // Intentional prolonged speech: slow rate + low effort (relaxed, not blocked)
    if (
      metrics.speakingRate > 0 &&
      metrics.speakingRate < 120 &&
      metrics.vocalEffort < 0.5 &&
      metrics.vocalEffort > 0.05
    ) {
      this.recordTechnique({
        technique: "prolonged_speech",
        confidence: "medium",
        timestamp: Date.now(),
        evidence: `Slow rate (${metrics.speakingRate} syl/min) with relaxed effort`,
      });
    }
  }

  private recordTechnique(detection: TechniqueDetection): void {
    // Deduplicate: don't record same technique within 5 seconds
    const recent = this.recentDetections.find(
      (d) =>
        d.technique === detection.technique &&
        Date.now() - d.timestamp < 5000
    );
    if (recent) return;

    this.recentDetections.push(detection);
    this.techniqueCounts[detection.technique]++;

    // Keep recentDetections bounded
    if (this.recentDetections.length > 50) {
      this.recentDetections = this.recentDetections.slice(-30);
    }

    this.callbacks.onTechniqueDetected(detection);

    // Play positive chime for technique detection (independent of nudge system)
    if (this.config.enableAudioCues) {
      this.audioCues.playPositive();
    }
  }

  // ==================== NUDGE LOGIC ====================

  private evaluateNudges(metrics: SpeechMetrics): void {
    const now = Date.now();
    if (now - this.lastNudgeTime < this.config.nudgeIntervalMs) return;

    // Priority 1: Tension warning
    if (metrics.vocalEffort > this.config.effortThreshold) {
      const tensionMessages = [
        "Relax your jaw and throat",
        "Ease the tension — light contact",
        "Soften your articulators",
        "Let your jaw hang loose",
      ];
      this.emitNudge({
        type: "relax_tension",
        message: tensionMessages[this.totalNudgesGiven % tensionMessages.length],
        severity: "warning",
        timestamp: now,
        haptic: true,
      });
      return;
    }

    // Priority 2: Speed warning
    if (metrics.speakingRate > this.config.targetSPM.max * 1.2) {
      const speedMessages = [
        "Slow down a little",
        "Easy pace — no rush",
        "Stretch your vowels more",
        "Pause between phrases",
      ];
      this.emitNudge({
        type: "slow_down",
        message: speedMessages[this.totalNudgesGiven % speedMessages.length],
        severity: "warning",
        timestamp: now,
        haptic: true,
      });
      return;
    }

    // Priority 3: Disfluency cluster (3+ in last 10 seconds)
    const recentCount = this.recentDisfluencyTimestamps.filter(
      (t) => now - t < 10000
    ).length;
    if (recentCount >= 3) {
      const breatheMessages = [
        "Pause and take a breath",
        "Reset — breathe, then gentle onset",
        "It's okay — pause, breathe, continue",
      ];
      this.emitNudge({
        type: "breathe",
        message: breatheMessages[this.totalNudgesGiven % breatheMessages.length],
        severity: "urgent",
        timestamp: now,
        haptic: true,
      });
      return;
    }

    // Priority 4: Positive reinforcement for technique
    const recentTechnique = this.recentDetections.find(
      (d) => now - d.timestamp < 5000
    );
    if (recentTechnique) {
      this.emitNudge({
        type: "good_technique",
        message: TECHNIQUE_PRAISE[recentTechnique.technique],
        severity: "positive",
        timestamp: now,
        haptic: false,
      });
      return;
    }

    // Priority 5: Keep going encouragement (if speaking for 30s+ with no nudges)
    if (
      metrics.totalSyllables > 50 &&
      this.totalNudgesGiven === 0 &&
      metrics.fluencyScore >= 70
    ) {
      this.emitNudge({
        type: "keep_going",
        message: "You're doing great — keep going!",
        severity: "positive",
        timestamp: now,
        haptic: false,
      });
    }
  }

  private emitNudge(nudge: CoachNudge): void {
    this.activeNudge = nudge;
    this.lastNudgeTime = nudge.timestamp;
    this.totalNudgesGiven++;

    // Haptic feedback on mobile
    if (nudge.haptic && this.config.enableHaptic && "vibrate" in navigator) {
      navigator.vibrate(200);
    }

    // Audio cues
    if (this.config.enableAudioCues) {
      if (nudge.severity === "positive") {
        this.audioCues.playPositive();
      } else if (nudge.type === "breathe") {
        this.audioCues.playBreathe();
      } else if (nudge.severity === "warning" || nudge.severity === "urgent") {
        this.audioCues.playWarning();
      } else if (nudge.type === "keep_going") {
        this.audioCues.playKeepGoing();
      }
    }

    this.callbacks.onNudge(nudge);

    // Auto-clear after 4 seconds
    setTimeout(() => {
      if (this.activeNudge?.timestamp === nudge.timestamp) {
        this.activeNudge = null;
      }
    }, 4000);
  }

  // ==================== AMPLITUDE TRACKING ====================

  private startAmplitudeTracking(): void {
    const track = () => {
      if (!this.isRunning || !this.analyserNode || !this.timeDomainData) return;

      this.analyserNode.getByteTimeDomainData(this.timeDomainData as Uint8Array<ArrayBuffer>);

      // Compute RMS from time-domain data (centered around 128)
      let sum = 0;
      for (let i = 0; i < this.timeDomainData.length; i++) {
        const sample = (this.timeDomainData[i] - 128) / 128;
        sum += sample * sample;
      }
      const rms = Math.sqrt(sum / this.timeDomainData.length);

      this.amplitudeBuffer.push(rms);
      // Keep last 30 samples (~1 second at 30fps)
      if (this.amplitudeBuffer.length > 30) {
        this.amplitudeBuffer.shift();
      }

      this.amplitudeFrameId = requestAnimationFrame(track);
    };

    this.amplitudeFrameId = requestAnimationFrame(track);
  }

  // ==================== HELPERS ====================

  private getSPMZone(spm: number): "slow" | "target" | "fast" {
    if (spm === 0) return "target"; // Not speaking yet
    if (spm < this.config.targetSPM.min) return "slow";
    if (spm > this.config.targetSPM.max) return "fast";
    return "target";
  }

  private getEffortZone(effort: number): "relaxed" | "moderate" | "tense" {
    if (effort < 0.4) return "relaxed";
    if (effort < 0.7) return "moderate";
    return "tense";
  }

  private emitSnapshot(): void {
    if (!this.isRunning) return;
    this.callbacks.onSnapshot(this.getCurrentSnapshot());
  }
}
