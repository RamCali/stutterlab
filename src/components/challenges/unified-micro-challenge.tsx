"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Loader2 } from "lucide-react";
import {
  submitMicroChallengeAttempt,
  getTodayMicroChallengeAttempt,
  type MicroChallengeOutcome,
} from "@/lib/actions/micro-challenge-attempts";

interface UnifiedMicroChallengeProps {
  challengeId: string;
  challengeTitle: string;
  technique?: string;
  tips?: string[];
}

export function UnifiedMicroChallenge({
  challengeId,
  challengeTitle,
  technique,
  tips,
}: UnifiedMicroChallengeProps) {
  const [predicted, setPredicted] = useState(5);
  const [actual, setActual] = useState(5);
  const [outcome, setOutcome] = useState<MicroChallengeOutcome>("completed");
  const [reflection, setReflection] = useState("");
  const [recording, setRecording] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    getTodayMicroChallengeAttempt()
      .then((a) => {
        if (a) setDone(true);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleRecording() {
    if (recording && mediaRef.current) {
      mediaRef.current.stop();
      setRecording(false);
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (dataUrl.length < 500_000) setVoiceNoteUrl(dataUrl);
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    mediaRef.current = recorder;
    recorder.start();
    setRecording(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitMicroChallengeAttempt({
        challengeId,
        challengeTitle,
        technique,
        predictedAnxiety: predicted,
        actualAnxiety: actual,
        outcome,
        reflection: reflection.trim() || undefined,
        voiceNoteUrl: voiceNoteUrl ?? undefined,
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="py-6 text-center text-sm">
          Today&apos;s challenge logged. Anxiety ratings saved for your progress chart.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Real-world challenge</CardTitle>
        <p className="text-sm text-muted-foreground">{challengeTitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {tips && tips.length > 0 && (
          <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
            {tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}

        <div>
          <Label>Anxiety before (1–10): {predicted}</Label>
          <input
            type="range"
            min={1}
            max={10}
            value={predicted}
            onChange={(e) => setPredicted(Number(e.target.value))}
            className="w-full mt-1"
          />
        </div>

        <div>
          <Label>Outcome</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(
              [
                ["completed", "Did it"],
                ["partial", "Partial"],
                ["avoided", "Avoided"],
              ] as const
            ).map(([id, label]) => (
              <Button
                key={id}
                size="sm"
                variant={outcome === id ? "default" : "outline"}
                onClick={() => setOutcome(id)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {outcome !== "avoided" && (
          <div>
            <Label>Anxiety after (1–10): {actual}</Label>
            <input
              type="range"
              min={1}
              max={10}
              value={actual}
              onChange={(e) => setActual(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>
        )}

        <div>
          <Label>Reflection (optional)</Label>
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={2}
            className="mt-1"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleRecording}
          className="gap-2"
        >
          {recording ? (
            <MicOff className="h-4 w-4 text-red-500" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {recording
            ? "Stop voice note"
            : voiceNoteUrl
              ? "Voice note attached"
              : "Add voice note (optional)"}
        </Button>

        <Button className="w-full" disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Saving…" : "Log challenge"}
        </Button>
      </CardContent>
    </Card>
  );
}
