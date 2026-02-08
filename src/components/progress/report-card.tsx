"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Share2,
  Download,
  TrendingDown,
  TrendingUp,
  Minus,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { TrendChart } from "./trend-chart";
import { generateReportPDF } from "./ReportPDFGenerator";

interface ReportData {
  id: string;
  month: Date;
  passageId: string;
  percentSS: number | null;
  severityRating: string | null;
  fluencyScore: number | null;
  totalSyllables: number | null;
  stutteredSyllables: number | null;
  speakingRate: number | null;
  analysisJson: Record<string, unknown> | null;
  recommendationsJson: Record<string, unknown> | null;
  shareToken: string | null;
}

interface ReportCardProps {
  report: ReportData;
  previousReport?: ReportData | null;
  history: { month: string; percentSS: number; fluencyScore: number }[];
}

export function ReportCard({ report, previousReport, history }: ReportCardProps) {
  const [copied, setCopied] = useState(false);

  const severityColors: Record<string, string> = {
    normal: "text-[#00E676] bg-[#00E676]/10",
    mild: "text-[#FFB347] bg-[#FFB347]/10",
    moderate: "text-[#FF8C00] bg-[#FF8C00]/10",
    severe: "text-[#FF5252] bg-[#FF5252]/10",
  };

  const percentSSTrend =
    previousReport?.percentSS != null && report.percentSS != null
      ? report.percentSS < previousReport.percentSS
        ? "improved"
        : report.percentSS > previousReport.percentSS
          ? "worsened"
          : "same"
      : null;

  const recommendations = (
    report.recommendationsJson as { recommendations?: string[]; encouragement?: string } | null
  );

  const monthLabel = report.month
    ? new Date(report.month).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Assessment";

  async function copyShareLink() {
    if (!report.shareToken) return;
    const url = `${window.location.origin}/report/${report.shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Progress Report — {monthLabel}
            </CardTitle>
            <div className="flex gap-2">
              {report.shareToken && (
                <Button variant="outline" size="sm" onClick={copyShareLink}>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5 mr-1" />
                  )}
                  {copied ? "Copied!" : "Share"}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const recs = report.recommendationsJson as {
                    recommendations?: string[];
                    encouragement?: string;
                  } | null;
                  const analysis = report.analysisJson as {
                    disfluency_breakdown?: Record<string, number>;
                    technique_usage?: Record<string, number>;
                  } | null;
                  generateReportPDF({
                    monthLabel,
                    percentSS: report.percentSS,
                    severityRating: report.severityRating,
                    fluencyScore: report.fluencyScore,
                    totalSyllables: report.totalSyllables,
                    stutteredSyllables: report.stutteredSyllables,
                    speakingRate: report.speakingRate,
                    disfluencyBreakdown: analysis?.disfluency_breakdown,
                    recommendations: recs?.recommendations,
                    encouragement: recs?.encouragement,
                    techniqueUsage: analysis?.technique_usage,
                    history: history.length > 1 ? history : undefined,
                  });
                }}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Main score */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-4 rounded-lg bg-muted/10">
              <p className="text-3xl font-bold">
                {report.percentSS != null
                  ? `${report.percentSS.toFixed(1)}%`
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">%SS Score</p>
              {percentSSTrend && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  {percentSSTrend === "improved" ? (
                    <TrendingDown className="h-3 w-3 text-[#00E676]" />
                  ) : percentSSTrend === "worsened" ? (
                    <TrendingUp className="h-3 w-3 text-[#FF5252]" />
                  ) : (
                    <Minus className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span
                    className={`text-[10px] ${
                      percentSSTrend === "improved"
                        ? "text-[#00E676]"
                        : percentSSTrend === "worsened"
                          ? "text-[#FF5252]"
                          : "text-muted-foreground"
                    }`}
                  >
                    vs last
                  </span>
                </div>
              )}
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/10">
              <Badge
                className={`text-sm ${
                  severityColors[report.severityRating || "normal"]
                }`}
              >
                {(report.severityRating || "—").charAt(0).toUpperCase() +
                  (report.severityRating || "—").slice(1)}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">Severity</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/10">
              <p className="text-2xl font-bold">{report.fluencyScore ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Fluency Score</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/10">
              <p className="text-2xl font-bold">
                {report.speakingRate != null
                  ? Math.round(report.speakingRate)
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">syl/min</p>
            </div>
          </div>

          {/* Syllable breakdown */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Total syllables: <strong>{report.totalSyllables ?? "—"}</strong>
            </span>
            <span className="text-muted-foreground">
              Stuttered:{" "}
              <strong className="text-[#FFB347]">
                {report.stutteredSyllables ?? "—"}
              </strong>
            </span>
          </div>

          {/* Severity scale */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Clinical Severity Scale (%SS)
            </p>
            <div className="flex h-3 rounded-full overflow-hidden">
              <div className="bg-[#00E676] flex-[3]" title="Normal: <3%" />
              <div className="bg-[#FFB347] flex-[2]" title="Mild: 3-5%" />
              <div className="bg-[#FF8C00] flex-[3]" title="Moderate: 5-8%" />
              <div className="bg-[#FF5252] flex-[4]" title="Severe: >8%" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0%</span>
              <span>3%</span>
              <span>5%</span>
              <span>8%</span>
              <span>12%+</span>
            </div>
            {/* Current position marker */}
            {report.percentSS != null && (
              <div className="relative h-2">
                <div
                  className="absolute top-0 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-white"
                  style={{
                    left: `${Math.min(100, (report.percentSS / 12) * 100)}%`,
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Recommendations */}
          {recommendations?.recommendations && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Recommendations
              </p>
              <ul className="space-y-1">
                {recommendations.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-0.5">&#x2022;</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Encouragement */}
          {recommendations?.encouragement && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm italic">{recommendations.encouragement}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trend chart */}
      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={history} metric="percentSS" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
