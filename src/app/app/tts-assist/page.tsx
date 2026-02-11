"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Volume2,
  Square,
  Play,
  Crown,
  Clipboard,
  Plus,
  Trash2,
  Settings2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";

interface QuickPhrase {
  id: string;
  text: string;
  label: string;
}

const DEFAULT_PHRASES: QuickPhrase[] = [
  { id: "intro", text: "Hi everyone, thanks for joining.", label: "Meeting intro" },
  { id: "question", text: "I have a question about that.", label: "Ask question" },
  { id: "agree", text: "I agree with that point.", label: "Agree" },
  { id: "clarify", text: "Could you clarify what you mean?", label: "Clarify" },
  { id: "thanks", text: "Thank you, that's all from me.", label: "Wrap up" },
];

const PHRASES_STORAGE_KEY = "stutterlab-tts-phrases";

function loadPhrases(): QuickPhrase[] {
  if (typeof window === "undefined") return DEFAULT_PHRASES;
  try {
    const saved = localStorage.getItem(PHRASES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return DEFAULT_PHRASES;
}

function savePhrases(phrases: QuickPhrase[]) {
  try {
    localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify(phrases));
  } catch {
    // ignore
  }
}

export default function TTSAssistPage() {
  const [text, setText] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [phrases, setPhrases] = useState<QuickPhrase[]>(DEFAULT_PHRASES);
  const [newPhraseText, setNewPhraseText] = useState("");
  const [newPhraseLabel, setNewPhraseLabel] = useState("");
  const [showAddPhrase, setShowAddPhrase] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load saved phrases on mount
  useState(() => {
    setPhrases(loadPhrases());
  });

  const speak = useCallback((textToSpeak: string) => {
    if (!("speechSynthesis" in window) || !textToSpeak.trim()) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak.trim());
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [rate, pitch, volume]);

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function addPhrase() {
    if (!newPhraseText.trim()) return;
    const newPhrase: QuickPhrase = {
      id: `custom-${Date.now()}`,
      text: newPhraseText.trim(),
      label: newPhraseLabel.trim() || newPhraseText.trim().slice(0, 20),
    };
    const updated = [...phrases, newPhrase];
    setPhrases(updated);
    savePhrases(updated);
    setNewPhraseText("");
    setNewPhraseLabel("");
    setShowAddPhrase(false);
  }

  function removePhrase(id: string) {
    const updated = phrases.filter((p) => p.id !== id);
    setPhrases(updated);
    savePhrases(updated);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium mb-3">
          <Crown className="h-3 w-3" />
          Premium
        </div>
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          TTS Assist Mode
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Type what you want to say — the AI speaks it for you in meetings and presentations
        </p>
      </div>

      {/* Info card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">
            This is an <span className="font-semibold text-foreground">accessibility tool</span>, not a replacement for practice.
            Use it for high-stakes moments while you build confidence with the training program.
          </p>
        </CardContent>
      </Card>

      {/* Main text input */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type what you want to say..."
            className="text-base min-h-[120px] resize-none"
            rows={4}
          />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="lg"
              disabled={!text.trim() || speaking}
              onClick={() => speak(text)}
            >
              <Play className="h-4 w-4 mr-2" />
              Speak
            </Button>
            {speaking && (
              <Button
                variant="destructive"
                size="lg"
                onClick={stopSpeaking}
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
          </div>
          {speaking && (
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-xs text-primary font-medium">Speaking...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Phrases */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Quick Phrases</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setShowAddPhrase(!showAddPhrase)}
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>

          {showAddPhrase && (
            <div className="mb-3 p-3 rounded-lg bg-muted/30 space-y-2">
              <input
                type="text"
                value={newPhraseLabel}
                onChange={(e) => setNewPhraseLabel(e.target.value)}
                placeholder="Label (e.g., 'Meeting intro')"
                className="w-full text-xs p-2 rounded border bg-background"
              />
              <input
                type="text"
                value={newPhraseText}
                onChange={(e) => setNewPhraseText(e.target.value)}
                placeholder="What to say..."
                className="w-full text-xs p-2 rounded border bg-background"
              />
              <div className="flex gap-2">
                <Button size="sm" className="text-xs" onClick={addPhrase} disabled={!newPhraseText.trim()}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowAddPhrase(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {phrases.map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => speak(phrase.text)}
                className="group relative flex items-center gap-2 p-2.5 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all text-left"
              >
                <Volume2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{phrase.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{phrase.text}</p>
                </div>
                {phrase.id.startsWith("custom-") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhrase(phrase.id);
                    }}
                    className="absolute top-1 right-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </button>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Voice Settings</span>
            </div>
            {showSettings ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {showSettings && (
            <div className="mt-3 space-y-3">
              <div>
                <Label className="text-xs">Speed: {rate.toFixed(1)}x</Label>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full mt-1 accent-primary"
                />
              </div>
              <div>
                <Label className="text-xs">Pitch: {pitch.toFixed(1)}</Label>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full mt-1 accent-primary"
                />
              </div>
              <div>
                <Label className="text-xs">Volume: {Math.round(volume * 100)}%</Label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full mt-1 accent-primary"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clipboard paste hint */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2">
            <Clipboard className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Tip:</span> Paste your slide notes or meeting agenda into the text field. Tap &quot;Speak&quot; when it&apos;s your turn.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Uses your browser&apos;s built-in speech synthesis. Audio plays through your default speaker — share it via screen share audio in Zoom/Teams.
      </p>
    </div>
  );
}
