/**
 * CoachAudioCues — Web Audio API synthesized chimes and tones
 * for real-time speech coaching feedback.
 *
 * Designed to be non-verbal (no words) to avoid triggering
 * speech anxiety. Uses pleasant tones, not jarring alarms.
 *
 * Cue types:
 * - Positive: Ascending major third chime (technique detected)
 * - Warning: Single descending tone (tension/speed warning)
 * - Breathe: Gentle sine wave fade (breathe prompt)
 * - KeepGoing: Soft "ding" (encouragement)
 */

export interface AudioCueConfig {
  enabled: boolean;
  volume: number; // 0-1
}

const DEFAULT_CUE_CONFIG: AudioCueConfig = {
  enabled: true,
  volume: 0.15, // quiet — these are subtle cues, not alerts
};

export class CoachAudioCues {
  private audioCtx: AudioContext | null = null;
  private config: AudioCueConfig;
  private lastCueTime = 0;
  private minCueInterval = 3000; // Don't play cues more than once per 3s

  constructor(config?: Partial<AudioCueConfig>) {
    this.config = { ...DEFAULT_CUE_CONFIG, ...config };
  }

  private getCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private canPlay(): boolean {
    if (!this.config.enabled) return false;
    const now = Date.now();
    if (now - this.lastCueTime < this.minCueInterval) return false;
    this.lastCueTime = now;
    return true;
  }

  updateConfig(config: Partial<AudioCueConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Positive chime: ascending major third (C5 → E5)
   * Played when a technique is detected (gentle onset, pacing, etc.)
   */
  playPositive(): void {
    if (!this.canPlay()) return;
    const ctx = this.getCtx();
    const vol = this.config.volume;

    // First tone: C5 (523 Hz)
    this.playTone(ctx, 523, 0, 0.12, vol * 0.8, "sine");
    // Second tone: E5 (659 Hz) — slightly delayed
    this.playTone(ctx, 659, 0.1, 0.15, vol, "sine");
  }

  /**
   * Warning tone: single descending note (A4 → F4)
   * Played for tension or speed warnings.
   */
  playWarning(): void {
    if (!this.canPlay()) return;
    const ctx = this.getCtx();
    const vol = this.config.volume;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.linearRampToValueAtTime(349, now + 0.2); // F4
    gain.gain.setValueAtTime(vol * 0.6, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Breathe cue: soft sine wave that slowly fades — like an exhale
   * Played when the coach suggests pausing/breathing.
   */
  playBreathe(): void {
    if (!this.canPlay()) return;
    const ctx = this.getCtx();
    const vol = this.config.volume;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(392, now); // G4
    osc.frequency.linearRampToValueAtTime(330, now + 0.6); // E4
    gain.gain.setValueAtTime(vol * 0.5, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.7);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  /**
   * Keep going: single soft ding
   * Played for general encouragement.
   */
  playKeepGoing(): void {
    if (!this.canPlay()) return;
    const ctx = this.getCtx();
    this.playTone(ctx, 587, 0, 0.15, this.config.volume * 0.5, "sine"); // D5
  }

  /**
   * Helper to play a simple tone
   */
  private playTone(
    ctx: AudioContext,
    freq: number,
    delaySeconds: number,
    duration: number,
    volume: number,
    type: OscillatorType
  ): void {
    const now = ctx.currentTime + delaySeconds;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    // Quick attack, smooth release
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  destroy(): void {
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
