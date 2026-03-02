"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
} from "lucide-react";
import type { SessionScorecard as ScorecardType } from "@/lib/analysis/types";

function getGradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-[#00E676]";
  if (grade.startsWith("B")) return "text-blue-400";
  if (grade.startsWith("C")) return "text-amber-400";
  return "text-[#FF5252]";
}

function getGradeBg(grade: string): string {
  if (grade.startsWith("A")) return "bg-[#00E676]/10 border-[#00E676]/30";
  if (grade.startsWith("B")) return "bg-blue-500/10 border-blue-500/30";
  if (grade.startsWith("C")) return "bg-amber-500/10 border-amber-500/30";
  return "bg-[#FF5252]/10 border-[#FF5252]/30";
}

function TrendBadge({
  trend,
  change,
}: {
  trend: string | null;
  change?: number;
}) {
  if (!trend || trend === "stable") return null;

  return (
    <span
      className={`flex items-center gap-0.5 text-[10px] ${
        trend === "improving" ? "text-[#00E676]" : "text-[#FF5252]"
      }`}
    >
      {trend === "improving" ? (
        <TrendingUp className="h-2.5 w-2.5" />
      ) : (
        <TrendingDown className="h-2.5 w-2.5" />
      )}
      {change != null && `${change > 0 ? "+" : ""}${change}`}
    </span>
  );
}

interface SessionScorecardProps {
  scorecard: ScorecardType;
}

export function SessionScorecard({ scorecard }: SessionScorecardProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          Session Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall grade */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div
            className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center ${getGradeBg(
              scorecard.overall.grade
            )}`}
          >
            <span
              className={`text-3xl font-bold ${getGradeColor(
                scorecard.overall.grade
              )}`}
            >
              {scorecard.overall.grade}
            </span>
            <span className="text-[10px] text-muted-foreground">Overall</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {scorecard.overall.score}/100
            </p>
            <p className="text-xs">Weighted score across 5 dimensions</p>
          </div>
        </div>

        {/* Dimension breakdown */}
        <div className="space-y-3">
          {scorecard.dimensions.map((dim) => {
            const comparison = scorecard.comparisonToAverage?.find(
              (c) => c.dimension === dim.name
            );
            return (
              <div key={dim.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{dim.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 ${getGradeBg(dim.grade)}`}
                    >
                      <span className={getGradeColor(dim.grade)}>
                        {dim.grade}
                      </span>
                    </Badge>
                    <TrendBadge
                      trend={dim.trend}
                      change={comparison?.delta}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {dim.score}
                  </span>
                </div>
                <Progress value={dim.score} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground">{dim.notes}</p>
              </div>
            );
          })}
        </div>

        {/* vs. Previous Session */}
        {scorecard.comparisonToPrevious && (
          <div className="pt-2 border-t">
            <p className="text-[10px] text-muted-foreground mb-2">
              vs. Previous Session
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {scorecard.comparisonToPrevious.map((c) => (
                <div
                  key={c.dimension}
                  className="text-center p-1.5 rounded-lg bg-muted/20"
                >
                  <span
                    className={`text-xs font-bold ${
                      c.change > 0
                        ? "text-[#00E676]"
                        : c.change < 0
                          ? "text-[#FF5252]"
                          : "text-muted-foreground"
                    }`}
                  >
                    {c.change > 0 ? "+" : ""}
                    {c.change}
                  </span>
                  <p className="text-[8px] text-muted-foreground truncate">
                    {c.dimension}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
