export type StressLevel = 1 | 2 | 3;

export interface StressConfig {
  level: StressLevel;
  ambientVolume: number;
  interruptionFrequency: number; // avg seconds between interruptions
  showCountdown: boolean;
  countdownSeconds: number;
}

const STRESS_CONFIGS: Record<StressLevel, StressConfig> = {
  1: {
    level: 1,
    ambientVolume: 0.08,
    interruptionFrequency: 45,
    showCountdown: false,
    countdownSeconds: 0,
  },
  2: {
    level: 2,
    ambientVolume: 0.15,
    interruptionFrequency: 25,
    showCountdown: true,
    countdownSeconds: 15,
  },
  3: {
    level: 3,
    ambientVolume: 0.25,
    interruptionFrequency: 12,
    showCountdown: true,
    countdownSeconds: 10,
  },
};

interface StressCallbacks {
  onRequestInterruption?: () => void;
  onCountdownTick?: (secondsLeft: number) => void;
}

export class StressEngine {
  private config: StressConfig;
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private interruptionTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private countdownRemaining: number = 0;
  private callbacks: StressCallbacks = {};
  private isRunning: boolean = false;

  constructor(level: StressLevel) {
    this.config = { ...STRESS_CONFIGS[level] };
  }

  setCallbacks(callbacks: StressCallbacks): void {
    this.callbacks = callbacks;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    // Create audio context
    this.audioContext = new AudioContext();
    const sampleRate = this.audioContext.sampleRate;

    // Generate brown noise buffer (2 seconds, looped)
    const bufferLength = sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferLength, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Brown noise algorithm: integrate white noise
    let lastOut = 0;
    for (let i = 0; i < bufferLength; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      channelData[i] = lastOut;
    }

    // Normalize the brown noise buffer
    let maxAbs = 0;
    for (let i = 0; i < bufferLength; i++) {
      const abs = Math.abs(channelData[i]);
      if (abs > maxAbs) maxAbs = abs;
    }
    if (maxAbs > 0) {
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] /= maxAbs;
      }
    }

    // Create source node (looped)
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = buffer;
    this.sourceNode.loop = true;

    // Bandpass filter — frequency varies by stress level
    const filterFrequencies: Record<StressLevel, number> = {
      1: 300,
      2: 600,
      3: 1200,
    };
    this.filterNode = this.audioContext.createBiquadFilter();
    this.filterNode.type = "bandpass";
    this.filterNode.frequency.value = filterFrequencies[this.config.level];
    this.filterNode.Q.value = 1;

    // Gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.config.ambientVolume;

    // Connect the audio graph: source -> filter -> gain -> destination
    this.sourceNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // Start playback
    this.sourceNode.start();

    // Schedule the first interruption at 50% of the configured interval
    this.scheduleInterruption(true);

    // Start countdown timer if applicable
    if (this.config.showCountdown && this.config.countdownSeconds > 0) {
      this.countdownRemaining = this.config.countdownSeconds;
      this.countdownTimer = setInterval(() => {
        this.countdownRemaining--;
        this.callbacks.onCountdownTick?.(this.countdownRemaining);
        if (this.countdownRemaining <= 0) {
          if (this.countdownTimer !== null) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
          }
        }
      }, 1000);
    }
  }

  stop(): void {
    this.isRunning = false;

    // Stop audio source
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
      } catch {
        // Already stopped
      }
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    // Disconnect filter
    if (this.filterNode) {
      this.filterNode.disconnect();
      this.filterNode = null;
    }

    // Disconnect gain
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    // Clear interruption timer
    if (this.interruptionTimer !== null) {
      clearTimeout(this.interruptionTimer);
      this.interruptionTimer = null;
    }

    // Clear countdown timer
    if (this.countdownTimer !== null) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  resetCountdown(): void {
    if (!this.config.showCountdown || this.config.countdownSeconds <= 0) return;

    this.countdownRemaining = this.config.countdownSeconds;

    // Clear existing countdown timer and restart
    if (this.countdownTimer !== null) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    if (this.isRunning) {
      this.countdownTimer = setInterval(() => {
        this.countdownRemaining--;
        this.callbacks.onCountdownTick?.(this.countdownRemaining);
        if (this.countdownRemaining <= 0) {
          if (this.countdownTimer !== null) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
          }
        }
      }, 1000);
    }
  }

  getConfig(): StressConfig {
    return { ...this.config };
  }

  private scheduleInterruption(isFirst: boolean): void {
    if (!this.isRunning) return;

    const baseInterval = this.config.interruptionFrequency;
    // First interruption comes after 50% of the configured interval
    const interval = isFirst ? baseInterval * 0.5 : baseInterval;
    // Add jitter: +/- 5 seconds random
    const jitter = (Math.random() * 10 - 5);
    const delaySeconds = Math.max(2, interval + jitter);

    this.interruptionTimer = setTimeout(() => {
      if (!this.isRunning) return;
      this.callbacks.onRequestInterruption?.();
      // Schedule the next interruption (not the first)
      this.scheduleInterruption(false);
    }, delaySeconds * 1000);
  }
}
