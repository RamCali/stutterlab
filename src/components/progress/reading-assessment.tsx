"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Mic,
  Square,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { READING_PASSAGES, type ReadingPassage } from "@/lib/assessment/reading-passages";

interface ReadingAssessmentProps {
  onComplete: (result: {
    passageId: string;
    transcription: string;
  }) => void;
}

type Step = "select" | "record" | "transcribing" | "done";

export function ReadingAssessment({ onComplete }: ReadingAssessmentProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedPassage, setSelectedPassage] = useState<ReadingPassage | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [bars, setBars] = useState<number[]>(Array(40).fill(3));

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const fullTranscriptRef = useRef("");
  const isRecordingRef = useRef(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function updateBars() {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const step = Math.floor(data.length / 40);
    const newBars = Array(40)
      .fill(0)
      .map((_, i) => {
        const val = data[i * step] ?? 0;
        return (val / 255) * 100;
      });
    setBars(newBars);
    animFrameRef.current = requestAnimationFrame(updateBars);
  }

  async function startAudioVisualizer() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      animFrameRef.current = requestAnimationFrame(updateBars);
    } catch {
      // Mic access denied — waveform won't show but recording still works via Speech API
    }
  }

  function stopAudioVisualizer() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = null;
    analyserRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setBars(Array(40).fill(3));
  }

  function selectPassage(passage: ReadingPassage) {
    setSelectedPassage(passage);
    setStep("record");
  }

  function startRecording() {
    const SpeechRecognitionAPI =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new (SpeechRecognitionAPI as new () => SpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    fullTranscriptRef.current = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      fullTranscriptRef.current = finalText;
      setTranscript(finalText + interimText);
    };

    recognition.onend = () => {
      // Auto-restart if still recording (use ref to avoid stale closure)
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    isRecordingRef.current = true;
    setIsRecording(true);
    setElapsedSeconds(0);

    startAudioVisualizer();

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  }

  function stopRecording() {
    isRecordingRef.current = false;
    setIsRecording(false);

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    stopAudioVisualizer();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const finalTranscript = fullTranscriptRef.current || transcript;
    if (finalTranscript.trim() && selectedPassage) {
      setStep("done");
      onComplete({
        passageId: selectedPassage.id,
        transcription: finalTranscript.trim(),
      });
    } else {
      alert("No speech was detected. Please check your microphone and try again.");
    }
  }

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (step === "select") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Select a Reading Passage
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a standardized passage to read aloud. Your reading will be analyzed to calculate your %SS score.
          </p>
        </div>

        {READING_PASSAGES.map((passage) => (
          <Card
            key={passage.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => selectPassage(passage)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{passage.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {passage.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      {passage.syllableCount} syllables
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      ~{Math.round(passage.estimatedDurationSeconds / 60)} min
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {passage.difficulty}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (step === "done") {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-[#00E676] mx-auto" />
          <h3 className="font-semibold text-lg">Recording Complete</h3>
          <p className="text-sm text-muted-foreground">
            Analyzing your speech...
          </p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            {selectedPassage?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructions */}
          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              Read the passage below aloud at your natural pace. The text will highlight as you read.
              Take your time and use your fluency techniques.
            </p>
          </div>

          {/* Passage text */}
          <div className="p-4 rounded-lg bg-muted/10 border text-base leading-relaxed">
            {selectedPassage?.text}
          </div>

          {/* Waveform visualizer */}
          <div className="flex items-end justify-center gap-[2px] h-12">
            {bars.map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-75 ${
                  isRecording ? "bg-primary" : "bg-muted"
                }`}
                style={{ height: `${Math.max(height, 3)}%` }}
              />
            ))}
          </div>

          {/* Recording controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <Button onClick={startRecording} size="lg">
                <Mic className="h-5 w-5 mr-2" />
                Start Reading
              </Button>
            ) : (
              <>
                <Badge variant="destructive" className="animate-pulse">
                  <Mic className="h-3 w-3 mr-1" />
                  Recording {formatTime(elapsedSeconds)}
                </Badge>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={stopRecording}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Done Reading
                </Button>
              </>
            )}
          </div>

          {/* Live transcript preview */}
          {transcript && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Live Transcript
              </p>
              <div className="p-3 rounded bg-muted/10 text-sm max-h-32 overflow-y-auto">
                {transcript}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
