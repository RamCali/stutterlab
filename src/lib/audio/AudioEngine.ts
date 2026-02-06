/**
 * AudioEngine - Core Web Audio API manager for StutterLab's Audio Lab
 *
 * Manages the audio graph for DAF (Delayed Auditory Feedback),
 * FAF (Frequency Altered Feedback), Choral Speaking, and Metronome.
 *
 * Audio Graph:
 * Mic → GainNode → [DAF DelayNode] → [FAF PitchShift] → Output
 *                                                       ↗
 *                              [Choral TTS] → GainNode
 *                              [Metronome Osc] → GainNode ↗
 */

export interface AudioEngineState {
  isActive: boolean;
  daf: { enabled: boolean; delayMs: number };
  faf: { enabled: boolean; semitones: number };
  choral: { enabled: boolean; rate: number; text: string };
  metronome: { enabled: boolean; bpm: number };
  inputLevel: number;
}

export const DEFAULT_STATE: AudioEngineState = {
  isActive: false,
  daf: { enabled: false, delayMs: 70 },
  faf: { enabled: false, semitones: -3 },
  choral: { enabled: false, rate: 1.0, text: "" },
  metronome: { enabled: false, bpm: 80 },
  inputLevel: 0,
};

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private dafDelayNode: DelayNode | null = null;
  private dafGainNode: GainNode | null = null;
  private fafGainNode: GainNode | null = null;
  private metronomeOscillator: OscillatorNode | null = null;
  private metronomeGain: GainNode | null = null;
  private metronomeBeatInterval: ReturnType<typeof setInterval> | null = null;
  private choralUtterance: SpeechSynthesisUtterance | null = null;
  private masterGain: GainNode | null = null;
  private levelAnimationFrame: number | null = null;

  private state: AudioEngineState = { ...DEFAULT_STATE };
  private onStateChange: ((state: AudioEngineState) => void) | null = null;
  private onLevelUpdate: ((level: number) => void) | null = null;

  constructor() {
    this.state = { ...DEFAULT_STATE };
  }

  setOnStateChange(callback: (state: AudioEngineState) => void) {
    this.onStateChange = callback;
  }

  setOnLevelUpdate(callback: (level: number) => void) {
    this.onLevelUpdate = callback;
  }

  getState(): AudioEngineState {
    return { ...this.state };
  }

  private updateState(partial: Partial<AudioEngineState>) {
    this.state = { ...this.state, ...partial };
    this.onStateChange?.(this.state);
  }

  // ==================== LIFECYCLE ====================

  async start(deviceId?: string): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new AudioContext({ sampleRate: 48000 });
    await this.audioContext.resume();

    // Get microphone input
    const constraints: MediaStreamConstraints = {
      audio: deviceId
        ? { deviceId: { exact: deviceId }, echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        : { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    };
    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);

    // Create analyser for input level metering
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.sourceNode.connect(this.analyserNode);

    // Master gain before output
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.audioContext.destination);

    // DAF chain
    this.dafDelayNode = this.audioContext.createDelay(1.0); // max 1 second delay
    this.dafDelayNode.delayTime.value = this.state.daf.delayMs / 1000;
    this.dafGainNode = this.audioContext.createGain();
    this.dafGainNode.gain.value = this.state.daf.enabled ? 1.0 : 0.0;

    // FAF gain (pitch shifting is done via playback rate trick or AudioWorklet)
    this.fafGainNode = this.audioContext.createGain();
    this.fafGainNode.gain.value = this.state.faf.enabled ? 1.0 : 0.0;

    // Connect DAF chain: source → delay → dafGain → masterGain
    this.sourceNode.connect(this.dafDelayNode);
    this.dafDelayNode.connect(this.dafGainNode);
    this.dafGainNode.connect(this.masterGain);

    // Metronome setup
    this.metronomeGain = this.audioContext.createGain();
    this.metronomeGain.gain.value = 0;
    this.metronomeGain.connect(this.masterGain);

    // Start level monitoring
    this.startLevelMonitoring();

    this.updateState({ isActive: true });
  }

  async stop(): Promise<void> {
    this.stopMetronome();
    this.stopChoral();

    if (this.levelAnimationFrame) {
      cancelAnimationFrame(this.levelAnimationFrame);
      this.levelAnimationFrame = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.sourceNode = null;
    this.analyserNode = null;
    this.dafDelayNode = null;
    this.dafGainNode = null;
    this.fafGainNode = null;
    this.masterGain = null;
    this.metronomeGain = null;

    this.updateState({ ...DEFAULT_STATE });
  }

  // ==================== DAF ====================

  setDAFEnabled(enabled: boolean): void {
    if (this.dafGainNode) {
      this.dafGainNode.gain.setTargetAtTime(
        enabled ? 1.0 : 0.0,
        this.audioContext!.currentTime,
        0.01
      );
    }
    this.updateState({ daf: { ...this.state.daf, enabled } });
  }

  setDAFDelay(delayMs: number): void {
    const clamped = Math.max(0, Math.min(500, delayMs));
    if (this.dafDelayNode && this.audioContext) {
      this.dafDelayNode.delayTime.setTargetAtTime(
        clamped / 1000,
        this.audioContext.currentTime,
        0.01
      );
    }
    this.updateState({ daf: { ...this.state.daf, delayMs: clamped } });
  }

  // ==================== FAF ====================

  setFAFEnabled(enabled: boolean): void {
    if (this.fafGainNode) {
      this.fafGainNode.gain.setTargetAtTime(
        enabled ? 1.0 : 0.0,
        this.audioContext!.currentTime,
        0.01
      );
    }
    this.updateState({ faf: { ...this.state.faf, enabled } });
  }

  setFAFSemitones(semitones: number): void {
    const clamped = Math.max(-24, Math.min(24, semitones));
    // FAF pitch shifting would typically use an AudioWorklet
    // For now, store the setting - full pitch shift implementation
    // requires the audio-worklets/pitch-shift-processor.js
    this.updateState({ faf: { ...this.state.faf, semitones: clamped } });
  }

  // ==================== METRONOME ====================

  setMetronomeEnabled(enabled: boolean): void {
    if (enabled) {
      this.startMetronome();
    } else {
      this.stopMetronome();
    }
    this.updateState({ metronome: { ...this.state.metronome, enabled } });
  }

  setMetronomeBPM(bpm: number): void {
    const clamped = Math.max(40, Math.min(200, bpm));
    this.updateState({ metronome: { ...this.state.metronome, bpm: clamped } });
    if (this.state.metronome.enabled) {
      this.stopMetronome();
      this.startMetronome();
    }
  }

  private startMetronome(): void {
    if (!this.audioContext || !this.metronomeGain) return;

    const intervalMs = 60000 / this.state.metronome.bpm;

    this.playMetronomeTick();
    this.metronomeBeatInterval = setInterval(() => {
      this.playMetronomeTick();
    }, intervalMs);
  }

  private playMetronomeTick(): void {
    if (!this.audioContext || !this.metronomeGain) return;

    const osc = this.audioContext.createOscillator();
    const tickGain = this.audioContext.createGain();

    osc.type = "sine";
    osc.frequency.value = 800;
    tickGain.gain.value = 0.3;
    tickGain.gain.setTargetAtTime(0, this.audioContext.currentTime + 0.05, 0.01);

    osc.connect(tickGain);
    tickGain.connect(this.masterGain!);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  private stopMetronome(): void {
    if (this.metronomeBeatInterval) {
      clearInterval(this.metronomeBeatInterval);
      this.metronomeBeatInterval = null;
    }
  }

  // ==================== CHORAL SPEAKING ====================

  setChoralEnabled(enabled: boolean): void {
    if (enabled && this.state.choral.text) {
      this.startChoral();
    } else {
      this.stopChoral();
    }
    this.updateState({ choral: { ...this.state.choral, enabled } });
  }

  setChoralText(text: string): void {
    this.updateState({ choral: { ...this.state.choral, text } });
  }

  setChoralRate(rate: number): void {
    const clamped = Math.max(0.5, Math.min(2.0, rate));
    this.updateState({ choral: { ...this.state.choral, rate: clamped } });
  }

  startChoral(): void {
    if (!("speechSynthesis" in window)) return;
    this.stopChoral();

    this.choralUtterance = new SpeechSynthesisUtterance(this.state.choral.text);
    this.choralUtterance.rate = this.state.choral.rate;
    this.choralUtterance.pitch = 1.0;
    this.choralUtterance.volume = 0.7;

    window.speechSynthesis.speak(this.choralUtterance);
  }

  private stopChoral(): void {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.choralUtterance = null;
  }

  // ==================== LEVEL MONITORING ====================

  private startLevelMonitoring(): void {
    if (!this.analyserNode) return;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

    const updateLevel = () => {
      if (!this.analyserNode) return;
      this.analyserNode.getByteFrequencyData(dataArray);

      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const normalizedLevel = Math.min(1, rms / 128);

      this.onLevelUpdate?.(normalizedLevel);
      this.levelAnimationFrame = requestAnimationFrame(updateLevel);
    };

    this.levelAnimationFrame = requestAnimationFrame(updateLevel);
  }

  // ==================== UTILITIES ====================

  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  static async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "audioinput");
  }
}
