"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AudioWaveform,
  Mic,
  MicOff,
  Clock3,
  Gauge,
  Music,
  Volume2,
  Crown,
  AlertTriangle,
  Headphones,
} from "lucide-react";
import { AudioEngine } from "@/lib/audio/AudioEngine";
import { LiveCoachOverlay } from "@/components/coaching/LiveCoachOverlay";

export default function AudioLabPage() {
  const engineRef = useRef<AudioEngine | null>(null);
  const [running, setRunning] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // DAF
  const [dafEnabled, setDafEnabled] = useState(false);
  const [dafDelay, setDafDelay] = useState(70);

  // FAF
  const [fafEnabled, setFafEnabled] = useState(false);
  const [fafSemitones, setFafSemitones] = useState(-4);

  // Metronome
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [metronomeBPM, setMetronomeBPM] = useState(80);

  // Choral
  const [choralEnabled, setChoralEnabled] = useState(false);
  const [choralText, setChoralText] = useState(
    "The rainbow is a division of white light into many beautiful colors."
  );
  const [choralRate, setChoralRate] = useState(0.8);

  const levelCb = useCallback((level: number) => setInputLevel(level), []);

  async function toggleAudio() {
    if (running) {
      await engineRef.current?.stop();
      engineRef.current = null;
      setRunning(false);
      setInputLevel(0);
      setError(null);
      return;
    }

    setError(null);
    const engine = new AudioEngine();
    engineRef.current = engine;

    // Listen for engine errors
    engine.setOnStateChange((state) => {
      if (state.error) {
        setError(state.error);
        setRunning(false);
        engineRef.current = null;
      }
    });

    // Store settings in engine state BEFORE start (engine reads from state during init)
    engine.setDAFEnabled(dafEnabled);
    engine.setDAFDelay(dafDelay);
    engine.setFAFEnabled(fafEnabled);
    engine.setFAFSemitones(fafSemitones);
    engine.setMetronomeEnabled(metronomeEnabled);
    engine.setMetronomeBPM(metronomeBPM);
    engine.setChoralEnabled(choralEnabled);
    if (choralEnabled) {
      engine.setChoralText(choralText);
      engine.setChoralRate(choralRate);
    }

    engine.setOnLevelUpdate(levelCb);

    try {
      await engine.start();
      // Check if engine actually started (it may have set an error instead)
      if (engine.getState().isActive) {
        setRunning(true);
      }
    } catch (e) {
      setError(`Failed to start audio: ${e instanceof Error ? e.message : e}`);
      engineRef.current = null;
    }
  }

  // Sync settings to engine in real time
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.setDAFEnabled(dafEnabled);
    e.setDAFDelay(dafDelay);
  }, [dafEnabled, dafDelay]);

  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.setFAFEnabled(fafEnabled);
    e.setFAFSemitones(fafSemitones);
  }, [fafEnabled, fafSemitones]);

  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.setMetronomeEnabled(metronomeEnabled);
    e.setMetronomeBPM(metronomeBPM);
  }, [metronomeEnabled, metronomeBPM]);

  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.setChoralEnabled(choralEnabled);
    if (choralEnabled) {
      e.setChoralText(choralText);
      e.setChoralRate(choralRate);
    }
  }, [choralEnabled, choralText, choralRate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AudioWaveform className="h-6 w-6 text-primary" />
            Audio Lab
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time audio training tools powered by Web Audio API
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Crown className="h-3 w-3 mr-1" />
          PRO
        </Badge>
      </div>

      {/* Error Banner */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Headphones Reminder */}
      {!running && !error && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-amber-500">
              <Headphones className="h-4 w-4 shrink-0" />
              <p className="text-sm">
                <span className="font-medium">Headphones required.</span>{" "}
                DAF and FAF need headphones to work — without them you&apos;ll get audio feedback.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mic toggle + Level Meter */}
      <Card className={running ? "border-primary/50 bg-primary/5" : ""}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                variant={running ? "destructive" : "default"}
                className="rounded-full h-14 w-14"
                onClick={toggleAudio}
              >
                {running ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
              <div>
                <p className="font-medium">
                  {running ? "Audio Lab Active" : "Start Audio Lab"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {running
                    ? "Speak into your microphone. Use headphones for best results."
                    : "Tap to enable microphone and start audio processing."}
                </p>
              </div>
            </div>
            {running && (
              <Badge variant="secondary" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </div>

          {/* Level Meter */}
          {running && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Volume2 className="h-3 w-3" />
                Input Level
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-75"
                  style={{ width: `${Math.min(inputLevel * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DAF */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-blue-500" />
                DAF (Delayed Feedback)
              </span>
              <Switch checked={dafEnabled} onCheckedChange={setDafEnabled} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Hear your voice with a slight delay. Reduces stuttering 60-80% for most people.
            </p>
            <div>
              <Label className="text-xs">Delay: {dafDelay}ms</Label>
              <input
                type="range"
                min={20}
                max={300}
                step={10}
                value={dafDelay}
                onChange={(e) => setDafDelay(Number(e.target.value))}
                className="w-full mt-1 accent-primary"
                disabled={!dafEnabled}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>20ms</span>
                <span>300ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAF */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-purple-500" />
                FAF (Frequency Shift)
              </span>
              <Switch checked={fafEnabled} onCheckedChange={setFafEnabled} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Shifts the pitch of your voice. Combined with DAF, can reduce stuttering up to 80%.
            </p>
            <div>
              <Label className="text-xs">
                Pitch: {fafSemitones > 0 ? "+" : ""}{fafSemitones} semitones
              </Label>
              <input
                type="range"
                min={-12}
                max={12}
                step={1}
                value={fafSemitones}
                onChange={(e) => setFafSemitones(Number(e.target.value))}
                className="w-full mt-1 accent-primary"
                disabled={!fafEnabled}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>-12</span>
                <span>0</span>
                <span>+12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metronome */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Music className="h-4 w-4 text-green-500" />
                Metronome
              </span>
              <Switch
                checked={metronomeEnabled}
                onCheckedChange={setMetronomeEnabled}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Paced speaking with a steady beat. Helps establish smooth speech rhythm.
            </p>
            <div>
              <Label className="text-xs">Tempo: {metronomeBPM} BPM</Label>
              <input
                type="range"
                min={40}
                max={160}
                step={5}
                value={metronomeBPM}
                onChange={(e) => setMetronomeBPM(Number(e.target.value))}
                className="w-full mt-1 accent-primary"
                disabled={!metronomeEnabled}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>40</span>
                <span>100</span>
                <span>160</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Choral */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AudioWaveform className="h-4 w-4 text-cyan-500" />
                Choral Speaking
              </span>
              <Switch
                checked={choralEnabled}
                onCheckedChange={setChoralEnabled}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              An AI voice reads along with you in unison. Choral effect eliminates stuttering for most people.
            </p>
            <div className="space-y-2">
              <div>
                <Label className="text-xs">Rate: {choralRate}x</Label>
                <input
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  value={choralRate}
                  onChange={(e) => setChoralRate(Number(e.target.value))}
                  className="w-full mt-1 accent-primary"
                  disabled={!choralEnabled}
                />
              </div>
              <textarea
                className="w-full text-xs p-2 rounded border bg-muted/50 resize-none"
                rows={2}
                value={choralText}
                onChange={(e) => setChoralText(e.target.value)}
                placeholder="Text for choral reading..."
                disabled={!choralEnabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Use headphones to prevent feedback. Audio is processed entirely in your browser — nothing is recorded or sent to any server.
      </p>

      {/* Live Coach Overlay */}
      <LiveCoachOverlay
        analyserNode={engineRef.current?.getAnalyserNode() ?? null}
        enabled={running}
      />
    </div>
  );
}
