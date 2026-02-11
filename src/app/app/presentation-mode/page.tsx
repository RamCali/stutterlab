"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Presentation,
  Phone,
  Users,
  Mic,
  MicOff,
  Volume2,
  Settings2,
  Headphones,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Save,
  Crown,
  Zap,
} from "lucide-react";
import { AudioEngine } from "@/lib/audio/AudioEngine";

interface Preset {
  id: string;
  name: string;
  icon: string;
  dafEnabled: boolean;
  dafDelay: number;
  fafEnabled: boolean;
  fafSemitones: number;
  metronomeEnabled: boolean;
  metronomeBPM: number;
}

const DEFAULT_PRESETS: Preset[] = [
  {
    id: "presentation",
    name: "Presentation",
    icon: "presentation",
    dafEnabled: true,
    dafDelay: 60,
    fafEnabled: false,
    fafSemitones: -3,
    metronomeEnabled: false,
    metronomeBPM: 80,
  },
  {
    id: "phone-call",
    name: "Phone Call",
    icon: "phone",
    dafEnabled: true,
    dafDelay: 80,
    fafEnabled: false,
    fafSemitones: -4,
    metronomeEnabled: false,
    metronomeBPM: 80,
  },
  {
    id: "meeting",
    name: "Meeting",
    icon: "users",
    dafEnabled: true,
    dafDelay: 50,
    fafEnabled: false,
    fafSemitones: -2,
    metronomeEnabled: true,
    metronomeBPM: 70,
  },
];

const STORAGE_KEY = "stutterlab-presentation-presets";

function loadPresets(): Preset[] {
  if (typeof window === "undefined") return DEFAULT_PRESETS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return DEFAULT_PRESETS;
}

function savePresets(presets: Preset[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // ignore
  }
}

function PresetIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "presentation":
      return <Presentation className="h-5 w-5" />;
    case "phone":
      return <Phone className="h-5 w-5" />;
    case "users":
      return <Users className="h-5 w-5" />;
    default:
      return <Zap className="h-5 w-5" />;
  }
}

export default function PresentationModePage() {
  const engineRef = useRef<AudioEngine | null>(null);
  const [running, setRunning] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  // Presets
  const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS);
  const [activePresetId, setActivePresetId] = useState<string>("presentation");
  const [showSettings, setShowSettings] = useState(false);

  // Current settings (from active preset)
  const activePreset = presets.find((p) => p.id === activePresetId) ?? presets[0];
  const [dafEnabled, setDafEnabled] = useState(activePreset.dafEnabled);
  const [dafDelay, setDafDelay] = useState(activePreset.dafDelay);
  const [fafEnabled, setFafEnabled] = useState(activePreset.fafEnabled);
  const [fafSemitones, setFafSemitones] = useState(activePreset.fafSemitones);
  const [metronomeEnabled, setMetronomeEnabled] = useState(activePreset.metronomeEnabled);
  const [metronomeBPM, setMetronomeBPM] = useState(activePreset.metronomeBPM);

  // Load saved presets on mount
  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  // Sync settings when preset changes
  function selectPreset(presetId: string) {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(presetId);
    setDafEnabled(preset.dafEnabled);
    setDafDelay(preset.dafDelay);
    setFafEnabled(preset.fafEnabled);
    setFafSemitones(preset.fafSemitones);
    setMetronomeEnabled(preset.metronomeEnabled);
    setMetronomeBPM(preset.metronomeBPM);
  }

  // Save current settings to preset
  function saveCurrentToPreset() {
    const updated = presets.map((p) =>
      p.id === activePresetId
        ? { ...p, dafEnabled, dafDelay, fafEnabled, fafSemitones, metronomeEnabled, metronomeBPM }
        : p
    );
    setPresets(updated);
    savePresets(updated);
  }

  const levelCb = useCallback((level: number) => setInputLevel(level), []);

  // Sync engine settings in real time
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

  // Cleanup
  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function toggleAudio() {
    if (running) {
      await engineRef.current?.stop();
      engineRef.current = null;
      setRunning(false);
      setInputLevel(0);
      setError(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedSeconds(0);
      return;
    }

    setError(null);
    const engine = new AudioEngine();
    engineRef.current = engine;

    engine.setOnStateChange((state) => {
      if (state.error) {
        setError(state.error);
        setRunning(false);
        engineRef.current = null;
      }
    });

    engine.setDAFEnabled(dafEnabled);
    engine.setDAFDelay(dafDelay);
    engine.setFAFEnabled(fafEnabled);
    engine.setFAFSemitones(fafSemitones);
    engine.setMetronomeEnabled(metronomeEnabled);
    engine.setMetronomeBPM(metronomeBPM);
    engine.setOnLevelUpdate(levelCb);

    try {
      await engine.start();
      if (engine.getState().isActive) {
        setRunning(true);
        setElapsedSeconds(0);
        timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
      }
    } catch (e) {
      setError(`Failed to start: ${e instanceof Error ? e.message : e}`);
      engineRef.current = null;
    }
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium mb-3">
          <Crown className="h-3 w-3" />
          Premium
        </div>
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Presentation Mode
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          1-tap DAF/AAF for presentations, calls, and meetings
        </p>
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
                Use earbuds or headphones to prevent audio feedback loops.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preset Selection */}
      {!running && (
        <div className="flex gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => selectPreset(preset.id)}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                activePresetId === preset.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <PresetIcon icon={preset.icon} />
              <span className="text-xs font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Big Start/Stop Button */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={toggleAudio}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            running
              ? "bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500/30"
              : "bg-primary/20 border-2 border-primary text-primary hover:bg-primary/30"
          }`}
        >
          {running ? (
            <MicOff className="h-12 w-12" />
          ) : (
            <Mic className="h-12 w-12" />
          )}
          {running && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
              TAP TO STOP
            </span>
          )}
        </button>

        {running ? (
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="animate-pulse">
              LIVE — {formatTime(elapsedSeconds)}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {activePreset.name} preset active
            </p>
            {/* Compact Level Meter */}
            <div className="w-48 mx-auto">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                <Volume2 className="h-3 w-3" />
                Input
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-75"
                  style={{ width: `${Math.min(inputLevel * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Tap to start with <span className="font-medium text-foreground">{activePreset.name}</span> preset
          </p>
        )}
      </div>

      {/* Active Settings Summary */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Active Settings
            </span>
            <div className="flex items-center gap-2">
              {!running && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={saveCurrentToPreset}
                >
                  <Save className="h-3 w-3" />
                  Save
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings2 className="h-3 w-3" />
                {showSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={dafEnabled ? "default" : "outline"} className="text-xs">
              DAF {dafEnabled ? `${dafDelay}ms` : "Off"}
            </Badge>
            <Badge variant={fafEnabled ? "default" : "outline"} className="text-xs">
              FAF {fafEnabled ? `${fafSemitones > 0 ? "+" : ""}${fafSemitones}st` : "Off"}
            </Badge>
            <Badge variant={metronomeEnabled ? "default" : "outline"} className="text-xs">
              Metronome {metronomeEnabled ? `${metronomeBPM} BPM` : "Off"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Expandable Settings */}
      {showSettings && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            {/* DAF */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">DAF (Delayed Feedback)</Label>
                <button
                  onClick={() => setDafEnabled(!dafEnabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    dafEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      dafEnabled ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              {dafEnabled && (
                <div>
                  <Label className="text-xs text-muted-foreground">Delay: {dafDelay}ms</Label>
                  <input
                    type="range"
                    min={20}
                    max={300}
                    step={10}
                    value={dafDelay}
                    onChange={(e) => setDafDelay(Number(e.target.value))}
                    className="w-full mt-1 accent-primary"
                  />
                </div>
              )}
            </div>

            {/* FAF */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">FAF (Frequency Shift)</Label>
                <button
                  onClick={() => setFafEnabled(!fafEnabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    fafEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      fafEnabled ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              {fafEnabled && (
                <div>
                  <Label className="text-xs text-muted-foreground">
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
                  />
                </div>
              )}
            </div>

            {/* Metronome */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Metronome</Label>
                <button
                  onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    metronomeEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      metronomeEnabled ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              {metronomeEnabled && (
                <div>
                  <Label className="text-xs text-muted-foreground">Tempo: {metronomeBPM} BPM</Label>
                  <input
                    type="range"
                    min={40}
                    max={160}
                    step={5}
                    value={metronomeBPM}
                    onChange={(e) => setMetronomeBPM(Number(e.target.value))}
                    className="w-full mt-1 accent-primary"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Audio is processed locally in your browser — nothing is recorded or sent to any server.
      </p>
    </div>
  );
}
