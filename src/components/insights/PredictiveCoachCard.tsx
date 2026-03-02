"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, ArrowRight } from "lucide-react";
import type { CoachingInsight } from "@/lib/analysis/types";

interface PredictiveCoachCardProps {
  data: CoachingInsight;
}

function ConfidenceDot({ level }: { level: string }) {
  const color =
    level === "high"
      ? "bg-[#00E676]"
      : level === "medium"
        ? "bg-amber-400"
        : "bg-muted-foreground";
  return <span className={`w-1.5 h-1.5 rounded-full ${color}`} />;
}

export function PredictiveCoachCard({ data }: PredictiveCoachCardProps) {
  if (data.predictions.length === 0 && data.warmupSuggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Coach&apos;s Note
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Motivational note */}
        <p className="text-sm font-medium">{data.motivationalNote}</p>

        {/* Predictions */}
        {data.predictions.slice(0, 2).map((pred, i) => (
          <div
            key={i}
            className="p-2.5 rounded-lg bg-background/50 border border-amber-500/10 space-y-1.5"
          >
            <div className="flex items-start gap-2">
              <ConfidenceDot level={pred.confidence} />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {pred.description}
              </p>
            </div>
            <div className="flex items-center gap-1.5 ml-3.5">
              <ArrowRight className="h-2.5 w-2.5 text-primary" />
              <p className="text-sm font-medium text-primary">
                {pred.suggestion}
              </p>
            </div>
          </div>
        ))}

        {/* Warmup suggestions */}
        {data.warmupSuggestions.length > 0 && (
          <div className="flex items-start gap-2">
            <Target className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {data.warmupSuggestions.map((s, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-sm bg-primary/5"
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming challenges */}
        {data.upcomingChallenges.length > 0 && (
          <div className="pt-1">
            {data.upcomingChallenges.map((c, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                {c}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
