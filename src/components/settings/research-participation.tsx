"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, FlaskConical, Loader2 } from "lucide-react";
import {
  getResearchConsent,
  setResearchConsent,
} from "@/lib/actions/research";

export function ResearchParticipationSettings() {
  const [consented, setConsented] = useState(false);
  const [consentedAt, setConsentedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getResearchConsent()
      .then((state) => {
        setConsented(state.consented);
        setConsentedAt(state.consentedAt);
      })
      .catch(() => setError("Could not load research settings."))
      .finally(() => setLoading(false));
  }, []);

  async function handleConsentChange(checked: boolean) {
    setSaving(true);
    setError(null);
    try {
      const state = await setResearchConsent(checked);
      setConsented(state.consented);
      setConsentedAt(state.consentedAt);
    } catch {
      setError("Could not update consent.");
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    if (!consented) return;
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/user/research-export", {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? "Export failed",
        );
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "stutterlab-research-export.csv";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading research settings…
      </p>
    );
  }

  return (
    <div
      id="research-consent"
      className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4"
    >
      <div className="flex items-start gap-3">
        <FlaskConical className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 space-y-1">
          <Label htmlFor="research-consent" className="text-sm font-medium">
            Research participation (optional)
          </Label>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Allow StutterLab to use your de-identified practice outcomes (OASES
            check-ins, behavioral experiments, session summaries) to improve the
            program and support future clinical studies. Use the export button
            below while signed in — do not bookmark the API URL. Not a
            substitute for IRB enrollment in a formal trial.
          </p>
        </div>
        <Switch
          id="research-consent"
          checked={consented}
          disabled={saving}
          onCheckedChange={(checked) => void handleConsentChange(checked)}
        />
      </div>

      {consented && consentedAt && (
        <p className="text-xs text-muted-foreground">
          Consented {new Date(consentedAt).toLocaleDateString()}
        </p>
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={!consented || exporting}
        onClick={() => void handleExport()}
      >
        {exporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Export research CSV
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
