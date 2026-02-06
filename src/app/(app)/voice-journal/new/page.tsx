"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mic,
  Square,
  Play,
  Pause,
  Save,
  Clock,
  Smile,
  Meh,
  Frown,
  Zap,
  Heart,
  Loader2,
  Check,
} from "lucide-react";

type EmotionalTag = "confident" | "anxious" | "frustrated" | "proud" | "neutral" | "hopeful" | "discouraged";

const emotions: { tag: EmotionalTag; label: string; icon: React.ElementType; color: string }[] = [
  { tag: "confident", label: "Confident", icon: Zap, color: "bg-green-500/10 text-green-600 border-green-500/30" },
  { tag: "proud", label: "Proud", icon: Heart, color: "bg-pink-500/10 text-pink-600 border-pink-500/30" },
  { tag: "hopeful", label: "Hopeful", icon: Smile, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" },
  { tag: "neutral", label: "Neutral", icon: Meh, color: "bg-gray-500/10 text-gray-600 border-gray-500/30" },
  { tag: "anxious", label: "Anxious", icon: Frown, color: "bg-orange-500/10 text-orange-600 border-orange-500/30" },
  { tag: "frustrated", label: "Frustrated", icon: Frown, color: "bg-red-500/10 text-red-600 border-red-500/30" },
  { tag: "discouraged", label: "Discouraged", icon: Frown, color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
];

export default function NewJournalEntry() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [emotionalTag, setEmotionalTag] = useState<EmotionalTag>("neutral");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Simulated waveform bars
  const [bars, setBars] = useState<number[]>(Array(40).fill(5));

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (recording) {
      const interval = setInterval(() => {
        setBars(Array(40).fill(0).map(() => Math.random() * 100));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setBars(Array(40).fill(5));
    }
  }, [recording]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecorded(true);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } catch {
      alert("Could not access microphone. Please check permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  function togglePlayback() {
    if (!audioUrl) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.play();
      setPlaying(true);
    }
  }

  async function handleSave() {
    setSaving(true);
    // Will save to DB via createJournalEntry() when connected
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => router.push("/voice-journal"), 1500);
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/voice-journal">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            New Voice Journal Entry
          </h1>
          <p className="text-xs text-muted-foreground">
            Record how your speech feels today
          </p>
        </div>
      </div>

      {/* Recording Area */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center">
            {/* Waveform Visualization */}
            <div className="flex items-end gap-[2px] h-24 mb-6">
              {bars.map((height, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-100 ${
                    recording
                      ? "bg-primary"
                      : recorded
                      ? "bg-muted-foreground/30"
                      : "bg-muted"
                  }`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
              ))}
            </div>

            {/* Timer */}
            <p className="text-3xl font-mono font-bold mb-4">
              {formatTime(elapsedSeconds)}
            </p>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {!recorded ? (
                recording ? (
                  <Button
                    size="lg"
                    variant="destructive"
                    className="rounded-full h-16 w-16"
                    onClick={stopRecording}
                  >
                    <Square className="h-6 w-6" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="rounded-full h-16 w-16"
                    onClick={startRecording}
                  >
                    <Mic className="h-6 w-6" />
                  </Button>
                )
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="rounded-full h-12 w-12"
                    onClick={togglePlayback}
                  >
                    {playing ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRecorded(false);
                      setElapsedSeconds(0);
                      setAudioUrl(null);
                    }}
                  >
                    Re-record
                  </Button>
                </>
              )}
            </div>

            {recording && (
              <p className="text-xs text-red-500 mt-3 animate-pulse flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Recording...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emotional Tag */}
      {recorded && (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <h3 className="font-semibold text-sm mb-3">
              How does your speech feel today?
            </h3>
            <div className="flex flex-wrap gap-2">
              {emotions.map((e) => {
                const Icon = e.icon;
                const isSelected = emotionalTag === e.tag;
                return (
                  <Button
                    key={e.tag}
                    variant="outline"
                    size="sm"
                    className={isSelected ? e.color + " border" : ""}
                    onClick={() => setEmotionalTag(e.tag)}
                  >
                    <Icon className="h-3.5 w-3.5 mr-1" />
                    {e.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {recorded && (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <h3 className="font-semibold text-sm mb-2">
              Notes (optional)
            </h3>
            <Input
              placeholder="Any thoughts about your speech today..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      {/* Save */}
      {recorded && (
        <Button
          className="w-full"
          size="lg"
          onClick={handleSave}
          disabled={saving || saved}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved! Redirecting...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Entry
            </>
          )}
        </Button>
      )}
    </div>
  );
}
