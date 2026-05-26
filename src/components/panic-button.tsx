"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wind, CheckCircle2 } from "lucide-react";
import { BreathingExercise } from "@/components/breathing-exercise";
import { getOnboardingData } from "@/lib/onboarding/feared-situations";
import { QUICK_CALM_TECHNIQUES } from "@/lib/quick-calm/techniques";
import { saveMomentLog } from "@/lib/actions/moment-log";

const BOX_BREATHING = {
  name: "Box Breathing",
  inhale: 4,
  hold: 4,
  exhale: 4,
  holdAfter: 4,
};

type Step = "menu" | "technique" | "breathing" | "log";

export function PanicButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("menu");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [severity, setSeverity] = useState(3);
  const [context, setContext] = useState("");
  const [notes, setNotes] = useState("");
  const [helped, setHelped] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const userName = getOnboardingData()?.name;

  const selected =
    QUICK_CALM_TECHNIQUES.find((t) => t.id === selectedId) ??
    QUICK_CALM_TECHNIQUES[0];

  function reset() {
    setStep("menu");
    setSelectedId(null);
    setSeverity(3);
    setContext("");
    setNotes("");
    setHelped(null);
    setSaved(false);
  }

  function handleOpen() {
    reset();
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  async function submitLog() {
    setSaving(true);
    try {
      await saveMomentLog({
        technique: selected.id,
        severity,
        context: context.trim() || undefined,
        notes: notes.trim() || undefined,
        helped: helped ?? undefined,
      });
      setSaved(true);
      setTimeout(handleClose, 1200);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 h-14 w-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Quick Calm"
      >
        <Wind className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 animate-ping" />
      </button>

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-center text-lg font-semibold">
            Quick Calm
          </DialogTitle>

          {step === "menu" && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground text-center">
                Pick a technique or breathe first — then log what happened.
              </p>
              <div className="grid gap-2">
                {QUICK_CALM_TECHNIQUES.map((t) => (
                  <Button
                    key={t.id}
                    variant="outline"
                    className="h-auto py-3 justify-start text-left"
                    onClick={() => {
                      setSelectedId(t.id);
                      setStep(t.id === "box_breathing" ? "breathing" : "technique");
                    }}
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" className="w-full" onClick={() => setStep("log")}>
                Log this moment (skip techniques)
              </Button>
            </div>
          )}

          {step === "technique" && (
            <div className="space-y-4 py-2">
              <p className="font-medium text-center">{selected.name}</p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                {selected.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setStep("log")}>
                  Done — log moment
                </Button>
                <Button variant="outline" onClick={() => setStep("menu")}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {step === "breathing" && (
            <div className="py-2">
              <BreathingExercise
                pattern={BOX_BREATHING}
                totalCycles={2}
                userName={userName || undefined}
                onComplete={() => setStep("log")}
              />
              <Button variant="ghost" className="w-full mt-2" onClick={() => setStep("menu")}>
                Back
              </Button>
            </div>
          )}

          {step === "log" && (
            <div className="space-y-4 py-2">
              {saved ? (
                <div className="flex flex-col items-center gap-2 py-6 text-emerald-500">
                  <CheckCircle2 className="h-10 w-10" />
                  <p className="font-medium">Logged — you showed up.</p>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Technique used</Label>
                    <select
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={selectedId ?? selected.id}
                      onChange={(e) => setSelectedId(e.target.value)}
                    >
                      {QUICK_CALM_TECHNIQUES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>How intense? ({severity}/5)</Label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={severity}
                      onChange={(e) => setSeverity(Number(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>
                  <div>
                    <Label>Context (optional)</Label>
                    <input
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder="e.g. work meeting, phone call"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Notes (optional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="What helped or didn't?"
                    />
                  </div>
                  <div>
                    <Label>Did something help?</Label>
                    <div className="flex gap-2 mt-2">
                      {([true, false] as const).map((v) => (
                        <Button
                          key={String(v)}
                          type="button"
                          size="sm"
                          variant={helped === v ? "default" : "outline"}
                          onClick={() => setHelped(v)}
                        >
                          {v ? "Yes" : "Not really"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" disabled={saving} onClick={submitLog}>
                    {saving ? "Saving…" : "Save moment log"}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setStep("menu")}>
                    Back
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
