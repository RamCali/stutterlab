"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Lightbulb,
} from "lucide-react";
import type { TechniqueHistory, TechniqueMasteryData } from "@/lib/analysis/types";

const TECHNIQUE_LABELS: Record<string, string> = {
  gentle_onset: "Gentle Onset",
  pacing: "Pacing",
  rate_compliance: "Rate Compliance",
  prolonged_speech: "Prolonged Speech",
  cancellation: "Cancellation",
  pull_out: "Pull-Out",
};

function getMasteryColor(level: string): string {
  if (level === "advanced") return "text-[#00E676] border-[#00E676]/30";
  if (level === "intermediate") return "text-amber-400 border-amber-400/30";
  return "text-muted-foreground border-muted-foreground/30";
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "improving")
    return <TrendingUp className="h-3 w-3 text-[#00E676]" />;
  if (trend === "declining")
    return <TrendingDown className="h-3 w-3 text-[#FF5252]" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

function TechniqueRow({ data }: { data: TechniqueMasteryData }) {
  const label = TECHNIQUE_LABELS[data.technique] || data.technique;
  const progressPercent = Math.min(
    100,
    data.totalDetections >= 20
      ? data.highConfidenceRate * 100
      : (data.totalDetections / 20) * 100
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <Badge
            variant="outline"
            className={`text-sm ${getMasteryColor(data.masteryLevel)}`}
          >
            {data.masteryLevel}
          </Badge>
          <TrendIcon trend={data.trend} />
        </div>
        <span className="text-sm text-muted-foreground">
          {data.totalDetections} uses
        </span>
      </div>
      <Progress value={progressPercent} className="h-1.5" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {Math.round(data.highConfidenceRate * 100)}% high confidence
        </span>
        <span>
          {data.sessionsUsed} session{data.sessionsUsed !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

interface TechniqueMasteryProps {
  data: TechniqueHistory;
}

export function TechniqueMastery({ data }: TechniqueMasteryProps) {
  const hasPractice = data.techniques.some((t) => t.totalDetections > 0);

  if (!hasPractice) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Technique Mastery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Use techniques during AI conversations to track your mastery.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Technique Mastery
          </CardTitle>
          <Badge variant="secondary" className="text-sm">
            {data.overallMasteryScore}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Per-technique progress */}
        <div className="space-y-4">
          {data.techniques
            .filter((t) => t.totalDetections > 0)
            .sort((a, b) => b.totalDetections - a.totalDetections)
            .map((t) => (
              <TechniqueRow key={t.technique} data={t} />
            ))}
        </div>

        {/* Unpracticed techniques */}
        {data.techniques.some((t) => t.totalDetections === 0) && (
          <div>
            <p className="text-sm text-muted-foreground mb-1.5">
              Not yet practiced:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.techniques
                .filter((t) => t.totalDetections === 0)
                .map((t) => (
                  <Badge
                    key={t.technique}
                    variant="outline"
                    className="text-sm text-muted-foreground"
                  >
                    {TECHNIQUE_LABELS[t.technique] || t.technique}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Recommendations
            </p>
            {data.recommendations.map((rec, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed p-2 rounded-lg bg-primary/5"
              >
                {rec}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
