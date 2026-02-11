/**
 * AudioEngine - Core Web Audio API manager for StutterLab's Audio Lab
 *
 * Manages the audio graph for DAF (Delayed Auditory Feedback),
 * FAF (Frequency Altered Feedback), Choral Speaking, and Metronome.
 *
 * Audio Graph:
 * Mic → SourceGain → DelayNode (DAF) → DAF Gain ─→ MasterGain → Destination
 *                                                 ↗
 *                            Metronome Osc → Gain
 *                            Choral TTS (Web Speech API — separate output)
 */

export interface AudioEngineState {
  isActive: boolean;
  daf: { enabled: boolean; delayMs: number };
  faf: { enabled: boolean; semitones: number };
  choral: { enabled: boolean; rate: number; text: string };
  metronome: { enabled: boolean; bpm: number };
  inputLevel: number;
  error: string | null;
}

export const DEFAULT_STATE: AudioEngineState = {
  isActive: false,
  daf: { enabled: false, delayMs: 70 },
  faf: { enabled: false, semitones: -3 },
  choral: { enabled: false, rate: 1.0, text: "" },
  metronome: { enabled: false, bpm: 80 },
  inputLevel: 0,
  error: null,
};

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private dafDelayNode: DelayNode | null = null;
  private dafGainNode: GainNode | null = null;
  private sourceGainNode: GainNode | null = null;
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

    // Check mic permission first
    try {
      const permissionResult = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      if (permissionResult.state === "denied") {
        this.updateState({ error: "Microphone permission denied. Please allow microphone access in your browser settings." });
        return;
      }
    } catch {
      // permissions.query may not support "microphone" in all browsers — continue to getUserMedia
    }

    try {
      this.audioContext = new AudioContext();
      // Ensure AudioContext is running (browsers suspend until user gesture)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      if (this.audioContext.state !== "running") {
        this.updateState({ error: "Audio context failed to start. Please try again." });
        await this.audioContext.close();
        this.audioContext = null;
        return;
      }
    } catch (e) {
      this.updateState({ error: `Failed to create audio context: ${e}` });
      return;
    }

    // Get microphone input
    try {
      const constraints: MediaStreamConstraints = {
        audio: deviceId
          ? { deviceId: { exact: deviceId }, echoCancellation: false, noiseSuppression: false, autoGainControl: false }
          : { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      };
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      this.updateState({ error: "Microphone access denied. Please allow microphone access and try again." });
      await this.audioContext.close();
      this.audioContext = null;
      return;
    }

    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);

    // Create analyser for input level metering (tapped from source, not in the output chain)
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.3;
    this.sourceNode.connect(this.analyserNode);

    // Master gain before output
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.audioContext.destination);

    // Source gain — controls dry signal before delay
    this.sourceGainNode = this.audioContext.createGain();
    this.sourceGainNode.gain.value = 1.0;

    // DAF delay chain
    this.dafDelayNode = this.audioContext.createDelay(1.0); // max 1 second
    this.dafGainNode = this.audioContext.createGain();

    // Connect the DAF chain: source → sourceGain → delay → dafGain → masterGain
    this.sourceNode.connect(this.sourceGainNode);
    this.sourceGainNode.connect(this.dafDelayNode);
    this.dafDelayNode.connect(this.dafGainNode);
    this.dafGainNode.connect(this.masterGain);

    // Apply DAF settings
    if (this.state.daf.enabled) {
      this.dafDelayNode.delayTime.value = this.state.daf.delayMs / 1000;
      this.dafGainNode.gain.value = 1.0;
    } else {
      this.dafDelayNode.delayTime.value = 0;
      this.dafGainNode.gain.value = 0.0;
    }

    // Metronome setup
    this.metronomeGain = this.audioContext.createGain();
    this.metronomeGain.gain.value = 0;
    this.metronomeGain.connect(this.masterGain);

    // Start metronome if enabled
    if (this.state.metronome.enabled) {
      this.startMetronome();
    }

    // Start choral if enabled
    if (this.state.choral.enabled && this.state.choral.text) {
      this.startChoral();
    }

    // Start level monitoring
    this.startLevelMonitoring();

    this.updateState({ isActive: true, error: null });
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
    this.sourceGainNode = null;
    this.masterGain = null;
    this.metronomeGain = null;

    this.updateState({ ...DEFAULT_STATE });
  }

  // ==================== DAF ====================

  setDAFEnabled(enabled: boolean): void {
    this.updateState({ daf: { ...this.state.daf, enabled } });
    if (!this.dafGainNode || !this.dafDelayNode || !this.audioContext) return;

    if (enabled) {
      this.dafDelayNode.delayTime.setTargetAtTime(
        this.state.daf.delayMs / 1000,
        this.audioContext.currentTime,
        0.01
      );
      this.dafGainNode.gain.setTargetAtTime(1.0, this.audioContext.currentTime, 0.01);
    } else {
      this.dafDelayNode.delayTime.setTargetAtTime(0, this.audioContext.currentTime, 0.01);
      this.dafGainNode.gain.setTargetAtTime(0.0, this.audioContext.currentTime, 0.01);
    }
  }

  setDAFDelay(delayMs: number): void {
    const clamped = Math.max(0, Math.min(500, delayMs));
    this.updateState({ daf: { ...this.state.daf, delayMs: clamped } });
    if (!this.dafDelayNode || !this.audioContext || !this.state.daf.enabled) return;

    this.dafDelayNode.delayTime.setTargetAtTime(
      clamped / 1000,
      this.audioContext.currentTime,
      0.01
    );
  }

  // ==================== FAF ====================

  setFAFEnabled(enabled: boolean): void {
    // FAF pitch shifting requires an AudioWorklet (not yet implemented).
    // Store the setting so it's ready when the worklet is added.
    this.updateState({ faf: { ...this.state.faf, enabled } });
  }

  setFAFSemitones(semitones: number): void {
    const clamped = Math.max(-24, Math.min(24, semitones));
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
    if (!this.audioContext || !this.masterGain) return;

    const intervalMs = 60000 / this.state.metronome.bpm;

    this.playMetronomeTick();
    this.metronomeBeatInterval = setInterval(() => {
      this.playMetronomeTick();
    }, intervalMs);
  }

  private playMetronomeTick(): void {
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const tickGain = this.audioContext.createGain();

    osc.type = "sine";
    osc.frequency.value = 800;
    tickGain.gain.value = 0.3;
    tickGain.gain.setTargetAtTime(0, this.audioContext.currentTime + 0.05, 0.01);

    osc.connect(tickGain);
    tickGain.connect(this.masterGain);

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

    const bufferLength = this.analyserNode.fftSize;
    const dataArray = new Float32Array(bufferLength);

    const updateLevel = () => {
      if (!this.analyserNode) return;

      // Use time domain data for responsive input level metering
      this.analyserNode.getFloatTimeDomainData(dataArray);

      // Calculate RMS (root mean square) for accurate volume level
      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        sumSquares += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sumSquares / bufferLength);

      // Convert to a 0-1 range with some amplification for visibility
      // Typical speech RMS is ~0.01-0.1, so multiply to fill the meter
      const normalizedLevel = Math.min(1, rms * 5);

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

  getMediaStream(): MediaStream | null {
    return this.stream;
  }

  static async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "audioinput");
  }
}
