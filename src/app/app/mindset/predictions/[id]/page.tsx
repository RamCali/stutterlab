"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, FlaskConical } from "lucide-react";
import { getPredictionById, completePrediction } from "@/lib/cbt/store";
import type { Prediction } from "@/lib/cbt/store";

export default function PredictionOutcomePage() {
  const params = useParams();
  const router = useRouter();
  const predictionId = params.id as string;

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [actualOutcome, setActualOutcome] = useState("");
  const [anxietyAfter, setAnxietyAfter] = useState(5);

  useEffect(() => {
    const p = getPredictionById(predictionId);
    if (p) {
      setPrediction(p);
    }
  }, [predictionId]);

  function handleComplete() {
    if (!prediction) return;
    completePrediction(predictionId, actualOutcome, anxietyAfter);
    router.push("/app/mindset");
  }

  if (!prediction) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">Prediction not found.</p>
      </div>
    );
  }

  if (prediction.completed) {
    return (
      <div className="p-6 max-w-lg mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/app/mindset")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Mindset
        </Button>

        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold">Experiment Complete</h2>
        </div>

        <Card>
          <CardContent className="pt-4 pb-3 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Situation</p>
              <p className="text-sm font-medium">{prediction.situation}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Your prediction</p>
              <p className="text-sm italic">
                &ldquo;{prediction.prediction}&rdquo;
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                What actually happened
              </p>
              <p className="text-sm">{prediction.actualOutcome}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Anxiety before</p>
                <p className="text-lg font-bold">
                  {prediction.anxietyBefore}/10
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Anxiety after</p>
                <p className="text-lg font-bold text-emerald-600">
                  {prediction.anxietyAfter}/10
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/app/mindset")}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Mindset
      </Button>

      <div className="text-center">
        <FlaskConical className="h-10 w-10 text-blue-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold">Record the Outcome</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          How did reality compare to your prediction?
        </p>
      </div>

      {/* Original Prediction */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground mb-1">
            Your prediction:
          </p>
          <p className="text-sm font-medium">{prediction.situation}</p>
          <p className="text-sm italic mt-1">
            &ldquo;{prediction.prediction}&rdquo;
          </p>
          <div className="flex gap-3 mt-2">
            <Badge
              variant="secondary"
              className="text-[10px] bg-blue-500/10 text-blue-600"
            >
              Confidence: {prediction.confidenceLevel}/10
            </Badge>
            <Badge
              variant="secondary"
              className="text-[10px] bg-amber-500/10 text-amber-600"
            >
              Anxiety: {prediction.anxietyBefore}/10
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Outcome */}
      <div>
        <label className="text-sm font-medium">
          What actually happened?
        </label>
        <textarea
          value={actualOutcome}
          onChange={(e) => setActualOutcome(e.target.value)}
          placeholder="Describe what really happened..."
          className="w-full mt-1.5 h-28 rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          autoFocus
        />
      </div>

      {/* Anxiety After */}
      <div>
        <label className="text-sm font-medium">
          Anxiety level now ({anxietyAfter}/10)
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={anxietyAfter}
          onChange={(e) => setAnxietyAfter(parseInt(e.target.value))}
          className="w-full mt-1.5 accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Calm</span>
          <span>Very anxious</span>
        </div>
      </div>

      {/* Insight */}
      {actualOutcome.trim() && (
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs font-medium text-emerald-600 mb-1">
              What this tells you:
            </p>
            <p className="text-sm">
              You predicted this with {prediction.confidenceLevel}/10 confidence
              and felt {prediction.anxietyBefore}/10 anxiety beforehand.{" "}
              {anxietyAfter < prediction.anxietyBefore
                ? `Your anxiety dropped to ${anxietyAfter}/10 — the reality was less scary than the anticipation.`
                : "Notice how the experience compared to what you expected."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleComplete}
        disabled={!actualOutcome.trim()}
      >
        <CheckCircle2 className="h-5 w-5 mr-2" />
        Complete Experiment
      </Button>
    </div>
  );
}
