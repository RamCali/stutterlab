/**
 * DeepgramStreamingClient — Real-time speech-to-text via Deepgram WebSocket
 *
 * Replaces the browser's Web Speech API with Deepgram Nova-2 for
 * cross-browser, higher-accuracy transcription tuned for stuttering.
 *
 * Flow:
 * 1. Fetch temp API key from /api/deepgram-session
 * 2. Open WebSocket to wss://api.deepgram.com/v1/listen
 * 3. Capture mic → ScriptProcessorNode → PCM Int16 → WebSocket
 * 4. Receive JSON transcript results → fire callbacks
 */

export interface DeepgramTranscriptEvent {
  text: string;
  isFinal: boolean;
  confidence: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export interface DeepgramClientCallbacks {
  onTranscript: (event: DeepgramTranscriptEvent) => void;
  onUtteranceEnd?: () => void;
  onError?: (error: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface DeepgramClientConfig {
  language?: string;
  model?: string;
  interimResults?: boolean;
  smartFormat?: boolean;
  punctuate?: boolean;
  utteranceEndMs?: number;
  endpointing?: number;
  sampleRate?: number;
}

const DEFAULT_CONFIG: Required<DeepgramClientConfig> = {
  language: "en-US",
  model: "nova-2",
  interimResults: true,
  smartFormat: true,
  punctuate: true,
  utteranceEndMs: 1500, // Stuttering-friendly: longer silence tolerance
  endpointing: 500,
  sampleRate: 16000,
};

export class DeepgramStreamingClient {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private mediaStream: MediaStream | null = null;
  private callbacks: DeepgramClientCallbacks;
  private config: Required<DeepgramClientConfig>;
  private active = false;
  private reconnectAttempts = 0;
  private maxReconnects = 3;
  private finalTranscript = "";

  constructor(
    callbacks: DeepgramClientCallbacks,
    config?: DeepgramClientConfig
  ) {
    this.callbacks = callbacks;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async start(): Promise<boolean> {
    if (this.active) return true;

    try {
      // 1. Get temp API key
      const keyRes = await fetch("/api/deepgram-session", { method: "POST" });
      if (!keyRes.ok) {
        const data = await keyRes.json().catch(() => ({}));
        this.callbacks.onError?.(
          data.error || "Failed to initialize speech service"
        );
        return false;
      }
      const { apiKey } = await keyRes.json();

      // 2. Get mic stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: this.config.sampleRate,
        },
      });

      // 3. Open WebSocket
      const params = new URLSearchParams({
        model: this.config.model,
        language: this.config.language,
        smart_format: String(this.config.smartFormat),
        punctuate: String(this.config.punctuate),
        interim_results: String(this.config.interimResults),
        utterance_end_ms: String(this.config.utteranceEndMs),
        endpointing: String(this.config.endpointing),
        encoding: "linear16",
        sample_rate: String(this.config.sampleRate),
        channels: "1",
      });

      this.ws = new WebSocket(
        `wss://api.deepgram.com/v1/listen?${params.toString()}`,
        ["token", apiKey]
      );

      await this.waitForOpen();
      this.active = true;
      this.reconnectAttempts = 0;
      this.finalTranscript = "";

      // 4. Set up audio pipeline
      this.setupAudioPipeline();

      // 5. Wire up message handling
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onclose = (event) => this.handleClose(event);
      this.ws.onerror = () => {
        // onclose will fire after this with details
      };

      this.callbacks.onOpen?.();
      return true;
    } catch (error) {
      const msg =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone access denied — please allow mic access and try again"
          : "Failed to start speech recognition";
      this.callbacks.onError?.(msg);
      this.cleanup();
      return false;
    }
  }

  stop(): void {
    this.active = false;

    // Send CloseStream message to Deepgram
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: "CloseStream" }));
      } catch {
        // WebSocket may already be closing
      }
    }

    this.cleanup();
    this.callbacks.onClose?.();
  }

  isActive(): boolean {
    return this.active;
  }

  getStream(): MediaStream | null {
    return this.mediaStream;
  }

  getFinalTranscript(): string {
    return this.finalTranscript.trim();
  }

  private waitForOpen(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws) return reject(new Error("No WebSocket"));

      const timeout = setTimeout(() => {
        reject(new Error("WebSocket connection timeout"));
      }, 10000);

      this.ws.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };

      this.ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("WebSocket connection failed"));
      };
    });
  }

  private setupAudioPipeline(): void {
    if (!this.mediaStream) return;

    this.audioContext = new AudioContext({
      sampleRate: this.config.sampleRate,
    });

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);

    // ScriptProcessorNode to convert Float32 → Int16 PCM
    // bufferSize 4096 at 16kHz = 256ms chunks
    this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.scriptProcessor.onaudioprocess = (event) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      const inputData = event.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(inputData.length);

      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      this.ws.send(pcm16.buffer);
    };

    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "Results") {
        const alt = data.channel?.alternatives?.[0];
        if (!alt) return;

        const transcript = alt.transcript || "";
        if (!transcript) return;

        const isFinal = data.is_final === true;

        if (isFinal) {
          this.finalTranscript += transcript + " ";
        }

        this.callbacks.onTranscript({
          text: transcript,
          isFinal,
          confidence: alt.confidence || 0,
          words: alt.words,
        });
      } else if (data.type === "UtteranceEnd") {
        this.callbacks.onUtteranceEnd?.();
      }
    } catch {
      // Ignore malformed messages
    }
  }

  private handleClose(event: CloseEvent): void {
    if (!this.active) return;

    // Normal close
    if (event.code === 1000) {
      this.active = false;
      this.callbacks.onClose?.();
      return;
    }

    // Unexpected close — try to reconnect
    if (this.reconnectAttempts < this.maxReconnects) {
      this.reconnectAttempts++;
      const delay = 500 * Math.pow(2, this.reconnectAttempts - 1);

      setTimeout(async () => {
        if (!this.active) return;
        // Keep the existing media stream, just reconnect WebSocket
        const stream = this.mediaStream;
        this.cleanupWebSocket();

        try {
          const keyRes = await fetch("/api/deepgram-session", {
            method: "POST",
          });
          if (!keyRes.ok) throw new Error("Key fetch failed");
          const { apiKey } = await keyRes.json();

          const params = new URLSearchParams({
            model: this.config.model,
            language: this.config.language,
            smart_format: String(this.config.smartFormat),
            punctuate: String(this.config.punctuate),
            interim_results: String(this.config.interimResults),
            utterance_end_ms: String(this.config.utteranceEndMs),
            endpointing: String(this.config.endpointing),
            encoding: "linear16",
            sample_rate: String(this.config.sampleRate),
            channels: "1",
          });

          this.ws = new WebSocket(
            `wss://api.deepgram.com/v1/listen?${params.toString()}`,
            ["token", apiKey]
          );

          await this.waitForOpen();
          this.mediaStream = stream;
          this.setupAudioPipeline();
          this.ws.onmessage = (e) => this.handleMessage(e);
          this.ws.onclose = (e) => this.handleClose(e);
        } catch {
          this.callbacks.onError?.("Connection lost — please try again");
          this.active = false;
          this.cleanup();
        }
      }, delay);
    } else {
      this.callbacks.onError?.("Connection lost — please try again");
      this.active = false;
      this.cleanup();
    }
  }

  private cleanupWebSocket(): void {
    if (this.ws) {
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close();
      }
      this.ws = null;
    }

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private cleanup(): void {
    this.cleanupWebSocket();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
  }

  static isSupported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.mediaDevices !== "undefined" &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof WebSocket !== "undefined"
    );
  }
}
