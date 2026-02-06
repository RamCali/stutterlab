"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AudioEngine, DEFAULT_STATE, type AudioEngineState } from "@/lib/audio/AudioEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AudioWaveform,
  Mic,
  MicOff,
  Timer,
  Music,
  Users,
  Radio,
  Play,
  Square,
  Volume2,
} from "lucide-react";

export default function AudioLabPage() {
  const engineRef = useRef<AudioEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const [state, setState] = useState<AudioEngineState>(DEFAULT_STATE);
  const [inputLevel, setInputLevel] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [choralText, setChoralText] = useState(
    "The quick brown fox jumps over the lazy dog. She sells seashells by the seashore. Peter Piper picked a peck of pickled peppers."
  );

  // Load available audio devices
  useEffect(() => {
    AudioEngine.getAudioDevices().then((devs) => {
      setDevices(devs);
      if (devs.length > 0 && !selectedDevice) {
        setSelectedDevice(devs[0].deviceId);
      }
    });
  }, [selectedDevice]);

  // Draw waveform visualization
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const analyser = engine.getAnalyserNode();
    if (!analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "hsl(var(--card))";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, []);

  const handleToggleEngine = async () => {
    if (state.isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      await engineRef.current?.stop();
      engineRef.current = null;
      setState(DEFAULT_STATE);
      setInputLevel(0);
    } else {
      setIsLoading(true);
      try {
        const engine = new AudioEngine();
        engine.setOnStateChange(setState);
        engine.setOnLevelUpdate(setInputLevel);
        engineRef.current = engine;
        await engine.start(selectedDevice || undefined);
        drawWaveform();
      } catch (err) {
        console.error("Failed to start audio engine:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      engineRef.current?.stop();
    };
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AudioWaveform className="h-6 w-6 text-primary" />
            Audio Lab
          </h1>
          <p className="text-muted-foreground mt-1">
            Combine DAF, FAF, Choral Speaking, and Metronome for your practice
          </p>
        </div>
        <Button
          onClick={handleToggleEngine}
          disabled={isLoading}
          size="lg"
          variant={state.isActive ? "destructive" : "default"}
        >
          {isLoading ? (
            "Starting..."
          ) : state.isActive ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Audio Lab
            </>
          )}
        </Button>
      </div>

      {/* Microphone Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {state.isActive ? (
                <Mic className="h-5 w-5 text-green-500" />
              ) : (
                <MicOff className="h-5 w-5 text-muted-foreground" />
              )}
              <Label>Microphone</Label>
            </div>
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Input level meter */}
            <div className="flex items-center gap-2 flex-1 min-w-[150px]">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-75 rounded-full"
                  style={{ width: `${inputLevel * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waveform Visualization */}
      <Card>
        <CardContent className="pt-6">
          <canvas
            ref={canvasRef}
            width={800}
            height={120}
            className="w-full h-[120px] rounded-lg border bg-card"
          />
        </CardContent>
      </Card>

      {/* Audio Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DAF Control */}
        <Card className={state.daf.enabled ? "border-blue-500/50" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base">
                  DAF
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    Delayed Auditory Feedback
                  </span>
                </CardTitle>
              </div>
              <Switch
                checked={state.daf.enabled}
                onCheckedChange={(checked) =>
                  engineRef.current?.setDAFEnabled(checked)
                }
                disabled={!state.isActive}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Hear your voice with a slight delay. Naturally slows speech and reduces stuttering by 60-80%.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Delay</Label>
                <Badge variant="outline">{state.daf.delayMs}ms</Badge>
              </div>
              <Slider
                value={[state.daf.delayMs]}
                onValueChange={([value]) =>
                  engineRef.current?.setDAFDelay(value)
                }
                min={0}
                max={500}
                step={5}
                disabled={!state.isActive || !state.daf.enabled}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0ms</span>
                <span>Optimal: 50-70ms</span>
                <span>500ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAF Control */}
        <Card className={state.faf.enabled ? "border-purple-500/50" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-base">
                  FAF
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    Frequency Altered Feedback
                  </span>
                </CardTitle>
              </div>
              <Switch
                checked={state.faf.enabled}
                onCheckedChange={(checked) =>
                  engineRef.current?.setFAFEnabled(checked)
                }
                disabled={!state.isActive}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Shifts the pitch of your voice feedback. Combined with DAF, reduces stuttering by up to 80%.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Pitch Shift</Label>
                <Badge variant="outline">
                  {state.faf.semitones > 0 ? "+" : ""}
                  {state.faf.semitones} semitones
                </Badge>
              </div>
              <Slider
                value={[state.faf.semitones]}
                onValueChange={([value]) =>
                  engineRef.current?.setFAFSemitones(value)
                }
                min={-12}
                max={12}
                step={1}
                disabled={!state.isActive || !state.faf.enabled}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>-12 (lower)</span>
                <span>0 (no shift)</span>
                <span>+12 (higher)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Choral Speaking */}
        <Card className={state.choral.enabled ? "border-green-500/50" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <CardTitle className="text-base">
                  Choral Speaking
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    Speak in unison with AI
                  </span>
                </CardTitle>
              </div>
              <Switch
                checked={state.choral.enabled}
                onCheckedChange={(checked) => {
                  engineRef.current?.setChoralText(choralText);
                  engineRef.current?.setChoralEnabled(checked);
                }}
                disabled={!state.isActive}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              An AI voice reads the text aloud while you speak along. The choral effect naturally eliminates stuttering for most people.
            </p>
            <Textarea
              placeholder="Enter text to read together..."
              value={choralText}
              onChange={(e) => setChoralText(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Speaking Rate</Label>
                <Badge variant="outline">{state.choral.rate}x</Badge>
              </div>
              <Slider
                value={[state.choral.rate]}
                onValueChange={([value]) =>
                  engineRef.current?.setChoralRate(value)
                }
                min={0.5}
                max={2.0}
                step={0.1}
                disabled={!state.isActive || !state.choral.enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Metronome */}
        <Card className={state.metronome.enabled ? "border-orange-500/50" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-base">
                  Metronome
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    Paced speech timing
                  </span>
                </CardTitle>
              </div>
              <Switch
                checked={state.metronome.enabled}
                onCheckedChange={(checked) =>
                  engineRef.current?.setMetronomeEnabled(checked)
                }
                disabled={!state.isActive}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A steady beat to pace your speech. Helps establish rhythm and timing control for more fluent speaking.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">BPM</Label>
                <Badge variant="outline">{state.metronome.bpm} BPM</Badge>
              </div>
              <Slider
                value={[state.metronome.bpm]}
                onValueChange={([value]) =>
                  engineRef.current?.setMetronomeBPM(value)
                }
                min={40}
                max={200}
                step={5}
                disabled={!state.isActive || !state.metronome.enabled}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>40 (slow)</span>
                <span>Typical: 60-100</span>
                <span>200 (fast)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Tools Summary */}
      {state.isActive && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Active tools:</span>
              {state.daf.enabled && (
                <Badge className="bg-blue-500">DAF ({state.daf.delayMs}ms)</Badge>
              )}
              {state.faf.enabled && (
                <Badge className="bg-purple-500">
                  FAF ({state.faf.semitones > 0 ? "+" : ""}
                  {state.faf.semitones}st)
                </Badge>
              )}
              {state.choral.enabled && (
                <Badge className="bg-green-500">Choral ({state.choral.rate}x)</Badge>
              )}
              {state.metronome.enabled && (
                <Badge className="bg-orange-500">
                  Metronome ({state.metronome.bpm} BPM)
                </Badge>
              )}
              {!state.daf.enabled &&
                !state.faf.enabled &&
                !state.choral.enabled &&
                !state.metronome.enabled && (
                  <span className="text-sm text-muted-foreground">
                    Enable a tool above to begin
                  </span>
                )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
