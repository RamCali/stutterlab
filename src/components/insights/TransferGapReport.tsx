"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  GitCompareArrows,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { TransferReport, TransferGap, BridgingExercise } from "@/lib/analysis/types";

function getSeverityColor(severity: string): string {
  if (severity === "severe") return "text-[#FF5252] border-[#FF5252]/30 bg-[#FF5252]/10";
  if (severity === "moderate") return "text-orange-400 border-orange-400/30 bg-orange-500/10";
  return "text-yellow-400 border-yellow-400/30 bg-yellow-500/10";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-[#00E676]";
  if (score >= 60) return "text-amber-400";
  return "text-[#FF5252]";
}

function GapBridge({ gap }: { gap: TransferGap }) {
  return (
    <div className="p-3 rounded-lg border bg-muted/5 space-y-2">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={`text-[9px] ${getSeverityColor(gap.severity)}`}
        >
          {gap.severity}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          {gap.dataPoints} data points
        </span>
      </div>

      {/* Visual bridge */}
      <div className="flex items-center gap-2">
        <div className="flex-1 text-center p-2 rounded-lg bg-muted/20">
          <p className={`text-lg font-bold ${getScoreColor(gap.fromScore)}`}>
            {gap.fromScore}
          </p>
          <p className="text-[10px] text-muted-foreground">{gap.from}</p>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-[10px] font-bold text-[#FF5252]">
            -{gap.fluencyDrop}
          </span>
        </div>

        <div className="flex-1 text-center p-2 rounded-lg bg-muted/20">
          <p className={`text-lg font-bold ${getScoreColor(gap.toScore)}`}>
            {gap.toScore}
          </p>
          <p className="text-[10px] text-muted-foreground">{gap.to}</p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">{gap.suggestedBridge}</p>
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: BridgingExercise }) {
  return (
    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{exercise.title}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
          {exercise.description}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="secondary" className="text-[9px]">
            {exercise.difficulty}
          </Badge>
          <span className="text-[9px] text-muted-foreground">
            ~{exercise.estimatedMinutes} min
          </span>
        </div>
      </div>
      {exercise.href && (
        <Link href={exercise.href}>
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      )}
    </div>
  );
}

interface TransferGapReportProps {
  data: TransferReport;
}

export function TransferGapReport({ data }: TransferGapReportProps) {
  if (data.gaps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitCompareArrows className="h-4 w-4 text-primary" />
            Transfer Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 space-y-2">
            <p className="text-2xl font-bold text-[#00E676]">
              {data.overallTransferScore}/100
            </p>
            <p className="text-sm text-muted-foreground">
              Great transfer! Your practice skills carry over well to other
              contexts.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <GitCompareArrows className="h-4 w-4 text-primary" />
            Transfer Gap Analysis
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-xs ${getScoreColor(data.overallTransferScore)}`}
          >
            Transfer: {data.overallTransferScore}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gaps */}
        <div className="space-y-3">
          {data.gaps.map((gap) => (
            <GapBridge key={gap.id} gap={gap} />
          ))}
        </div>

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Recommendations
            </p>
            {data.recommendations.map((rec, i) => (
              <p
                key={i}
                className="text-xs leading-relaxed p-2 rounded-lg bg-muted/10"
              >
                {rec}
              </p>
            ))}
          </div>
        )}

        {/* Bridging Exercises */}
        {data.bridgingExercises.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium">Bridging Exercises</p>
            {data.bridgingExercises.slice(0, 3).map((ex, i) => (
              <ExerciseCard key={i} exercise={ex} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
