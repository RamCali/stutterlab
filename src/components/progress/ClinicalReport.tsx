"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Share2,
  Copy,
  Check,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  Activity,
  Clock,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendChart } from "./trend-chart";
import { generateReportPDF } from "./ReportPDFGenerator";

// ─── Types ───────────────────────────────────────────────────

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

interface ClinicalReportProps {
  report: ReportData;
  previousReport?: ReportData | null;
  history: { month: string; percentSS: number; fluencyScore: number }[];
}

// ─── SSI-4 Scoring Logic ─────────────────────────────────────

/** Frequency task score: %SS → SSI-4 frequency points (reading + conversation averaged) */
export function getFrequencyScore(percentSS: number): number {
  // SSI-4 Table 3: reading/conversation frequency
  if (percentSS < 1) return 2;
  if (percentSS < 2) return 3;
  if (percentSS < 3) return 4;
  if (percentSS < 4) return 5;
  if (percentSS < 5) return 6;
  if (percentSS < 7) return 7;
  if (percentSS < 9) return 8;
  if (percentSS < 12) return 9;
  if (percentSS < 14) return 10;
  if (percentSS < 17) return 11;
  if (percentSS < 20) return 12;
  if (percentSS < 25) return 14;
  return 16; // 25%+
}

/** Estimated duration score from disfluency types */
export function getDurationScore(disfluencyBreakdown?: Record<string, number>): number {
  if (!disfluencyBreakdown || Object.keys(disfluencyBreakdown).length === 0) return 4;

  const total = Object.values(disfluencyBreakdown).reduce((s, v) => s + v, 0);
  if (total === 0) return 4;

  // Blocks and prolongations tend to be longer
  const blockCount = (disfluencyBreakdown["blocks"] || 0) + (disfluencyBreakdown["block"] || 0);
  const prolongCount = (disfluencyBreakdown["prolongations"] || 0) + (disfluencyBreakdown["prolongation"] || 0);
  const longRatio = (blockCount + prolongCount) / total;

  // Estimate average duration: more blocks/prolongations = longer events
  if (longRatio > 0.5) return 10;   // ~4-9 seconds avg
  if (longRatio > 0.3) return 8;    // ~2-3 seconds avg
  if (longRatio > 0.15) return 6;   // ~1-2 seconds avg
  return 4;                          // <1 second avg (mostly repetitions)
}

/** Physical concomitant score (estimated from vocal effort if available) */
export function getPhysicalScore(analysisJson?: Record<string, unknown> | null): number {
  const vocalEffort = (analysisJson?.vocal_effort ?? analysisJson?.vocalEffort) as number | undefined;
  if (typeof vocalEffort === "number") {
    if (vocalEffort > 0.7) return 10;
    if (vocalEffort > 0.5) return 6;
    if (vocalEffort > 0.3) return 3;
    return 1;
  }
  return 3; // Default moderate estimate
}

export function getSeverityFromSSI4(total: number): {
  label: string;
  color: string;
  bg: string;
  description: string;
} {
  if (total <= 10) return { label: "Very Mild", color: "text-[#00E676]", bg: "bg-[#00E676]/10", description: "Minimal impact on communication" };
  if (total <= 17) return { label: "Mild", color: "text-[#00E676]", bg: "bg-[#00E676]/10", description: "Occasional disruption to speech flow" };
  if (total <= 24) return { label: "Mild-Moderate", color: "text-[#FFB347]", bg: "bg-[#FFB347]/10", description: "Noticeable disfluencies with some avoidance" };
  if (total <= 31) return { label: "Moderate", color: "text-[#FF8C00]", bg: "bg-[#FF8C00]/10", description: "Consistent disfluencies affecting communication" };
  if (total <= 36) return { label: "Severe", color: "text-[#FF5252]", bg: "bg-[#FF5252]/10", description: "Significant communication difficulty" };
  return { label: "Very Severe", color: "text-[#FF5252]", bg: "bg-[#FF5252]/10", description: "Pervasive disruption across speaking contexts" };
}

// ─── Technique Recommendations ───────────────────────────────

export function getRecommendations(
  disfluencyBreakdown?: Record<string, number>,
  percentSS?: number | null,
): { technique: string; reason: string; priority: "high" | "medium" | "low" }[] {
  const recs: { technique: string; reason: string; priority: "high" | "medium" | "low" }[] = [];
  if (!disfluencyBreakdown) return recs;

  const total = Object.values(disfluencyBreakdown).reduce((s, v) => s + v, 0);
  if (total === 0) return recs;

  const blockCount = (disfluencyBreakdown["blocks"] || 0) + (disfluencyBreakdown["block"] || 0);
  const prolongCount = (disfluencyBreakdown["prolongations"] || 0) + (disfluencyBreakdown["prolongation"] || 0);
  const repetitionCount = (disfluencyBreakdown["repetitions"] || 0) + (disfluencyBreakdown["repetition"] || 0)
    + (disfluencyBreakdown["sound_repetitions"] || 0) + (disfluencyBreakdown["word_repetitions"] || 0)
    + (disfluencyBreakdown["syllable_repetitions"] || 0);
  const interjectionCount = (disfluencyBreakdown["interjections"] || 0) + (disfluencyBreakdown["interjection"] || 0)
    + (disfluencyBreakdown["fillers"] || 0);

  if (blockCount / total > 0.2) {
    recs.push({
      technique: "Cancellation & Pull-out",
      reason: `${Math.round((blockCount / total) * 100)}% of disfluencies are blocks — these techniques help release and manage blocking moments.`,
      priority: "high",
    });
  }

  if (prolongCount / total > 0.2) {
    recs.push({
      technique: "Gentle Onset",
      reason: `${Math.round((prolongCount / total) * 100)}% are prolongations — starting words with soft airflow prevents tension buildup.`,
      priority: "high",
    });
  }

  if (repetitionCount / total > 0.3) {
    recs.push({
      technique: "Pacing & Rate Control",
      reason: `${Math.round((repetitionCount / total) * 100)}% are repetitions — slower, deliberate rate reduces cycling on sounds.`,
      priority: "high",
    });
  }

  if (interjectionCount / total > 0.2) {
    recs.push({
      technique: "Pausing Strategy",
      reason: `${Math.round((interjectionCount / total) * 100)}% are interjections/fillers — replacing with deliberate pauses improves fluency.`,
      priority: "medium",
    });
  }

  // General recommendations based on severity
  if ((percentSS ?? 0) > 5) {
    recs.push({
      technique: "Prolonged Speech",
      reason: "Stretching vowels and maintaining continuous airflow significantly reduces disfluency frequency.",
      priority: "medium",
    });
  }

  if (recs.length === 0) {
    recs.push({
      technique: "Maintenance Practice",
      reason: "Continue daily practice to maintain gains. Focus on generalization to new speaking situations.",
      priority: "low",
    });
  }

  return recs;
}

// ─── Chart Colors ────────────────────────────────────────────

const CHART_COLORS = ["#3B82F6", "#FF5252", "#FFB347", "#00E676", "#A78BFA", "#F472B6", "#34D399", "#FBBF24"];

const DISFLUENCY_LABELS: Record<string, string> = {
  blocks: "Blocks",
  block: "Blocks",
  prolongations: "Prolongations",
  prolongation: "Prolongations",
  repetitions: "Repetitions",
  repetition: "Repetitions",
  sound_repetitions: "Sound Repetitions",
  syllable_repetitions: "Syllable Repetitions",
  word_repetitions: "Word Repetitions",
  interjections: "Interjections",
  interjection: "Interjections",
  fillers: "Fillers",
  revisions: "Revisions",
  revision: "Revisions",
};

// ─── Component ───────────────────────────────────────────────

export function ClinicalReport({
  report,
  previousReport,
  history,
}: ClinicalReportProps) {
  const [copied, setCopied] = useState(false);

  const analysis = report.analysisJson as {
    disfluency_breakdown?: Record<string, number>;
    technique_usage?: Record<string, number>;
    vocal_effort?: number;
  } | null;

  const prevAnalysis = previousReport?.analysisJson as {
    disfluency_breakdown?: Record<string, number>;
  } | null;

  const recommendations = report.recommendationsJson as {
    recommendations?: string[];
    encouragement?: string;
  } | null;

  const monthLabel = report.month
    ? new Date(report.month).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Assessment";

  // ── SSI-4 Calculation ──
  const freqScore = report.percentSS != null ? getFrequencyScore(report.percentSS) : 0;
  // Double frequency score to account for both reading and conversation tasks
  const freqTotal = freqScore * 2;
  const durScore = getDurationScore(analysis?.disfluency_breakdown);
  const physScore = getPhysicalScore(report.analysisJson);
  const ssi4Total = freqTotal + durScore + physScore;
  const ssi4Severity = getSeverityFromSSI4(ssi4Total);

  // ── Disfluency chart data ──
  const disfluencyData = analysis?.disfluency_breakdown
    ? Object.entries(analysis.disfluency_breakdown)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name: DISFLUENCY_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
          count: value,
        }))
        .sort((a, b) => b.count - a.count)
    : [];

  // ── Month-over-month deltas ──
  const delta = previousReport
    ? {
        percentSS:
          report.percentSS != null && previousReport.percentSS != null
            ? report.percentSS - previousReport.percentSS
            : null,
        fluencyScore:
          report.fluencyScore != null && previousReport.fluencyScore != null
            ? report.fluencyScore - previousReport.fluencyScore
            : null,
        speakingRate:
          report.speakingRate != null && previousReport.speakingRate != null
            ? report.speakingRate - previousReport.speakingRate
            : null,
      }
    : null;

  // ── Technique recommendations ──
  const techniqueRecs = getRecommendations(analysis?.disfluency_breakdown, report.percentSS);

  async function copyShareLink() {
    if (!report.shareToken) return;
    const url = `${window.location.origin}/report/${report.shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Clinical Report — {monthLabel}
            </CardTitle>
            <div className="flex gap-2">
              {report.shareToken && (
                <Button variant="outline" size="sm" onClick={copyShareLink}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Share2 className="h-3.5 w-3.5 mr-1" />}
                  {copied ? "Copied!" : "Share"}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  generateReportPDF({
                    monthLabel,
                    percentSS: report.percentSS,
                    severityRating: report.severityRating,
                    fluencyScore: report.fluencyScore,
                    totalSyllables: report.totalSyllables,
                    stutteredSyllables: report.stutteredSyllables,
                    speakingRate: report.speakingRate,
                    disfluencyBreakdown: analysis?.disfluency_breakdown,
                    recommendations: recommendations?.recommendations,
                    encouragement: recommendations?.encouragement,
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
      </Card>

      {/* ─── SSI-4 Severity Matrix ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            SSI-4 Severity Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold">{freqTotal}</p>
              <p className="text-[10px] text-muted-foreground">Frequency</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {report.percentSS != null ? `${report.percentSS.toFixed(1)}% SS` : "—"}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold">{durScore}</p>
              <p className="text-[10px] text-muted-foreground">Duration</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">Est. from types</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold">{physScore}</p>
              <p className="text-[10px] text-muted-foreground">Physical</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">Concomitants</p>
            </div>
          </div>

          {/* Total score & severity */}
          <div className={`p-4 rounded-lg ${ssi4Severity.bg} border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">SSI-4 Total Score</p>
                <p className="text-3xl font-bold">{ssi4Total}</p>
              </div>
              <div className="text-right">
                <Badge className={`text-sm ${ssi4Severity.color} ${ssi4Severity.bg}`}>
                  {ssi4Severity.label}
                </Badge>
                <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">
                  {ssi4Severity.description}
                </p>
              </div>
            </div>
          </div>

          {/* Visual severity scale */}
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">SSI-4 Severity Scale (Total Score)</p>
            <div className="flex h-3 rounded-full overflow-hidden">
              <div className="bg-[#00E676]/60 flex-[17]" title="Very Mild/Mild: 0-17" />
              <div className="bg-[#FFB347] flex-[14]" title="Mild-Moderate/Moderate: 18-31" />
              <div className="bg-[#FF5252] flex-[15]" title="Severe/Very Severe: 32-46+" />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>0</span>
              <span>10</span>
              <span>17</span>
              <span>24</span>
              <span>31</span>
              <span>36</span>
              <span>46+</span>
            </div>
            {/* Position marker */}
            <div className="relative h-2">
              <div
                className="absolute top-0 w-0 h-0 border-l-4 border-r-4 border-t-[6px] border-l-transparent border-r-transparent border-t-foreground"
                style={{
                  left: `${Math.min(100, (ssi4Total / 46) * 100)}%`,
                  transform: "translateX(-50%)",
                }}
              />
            </div>
          </div>

          <p className="text-[9px] text-muted-foreground italic">
            Based on the SSI-4 (Stuttering Severity Instrument, 4th Ed.). Duration and physical concomitant scores
            are estimated from disfluency type analysis. For a formal SSI-4 administration, consult a certified SLP.
          </p>
        </CardContent>
      </Card>

      {/* ─── Month-over-Month Comparison ─── */}
      {delta && previousReport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Month-over-Month Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {/* %SS delta */}
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1">
                  {delta.percentSS != null ? (
                    delta.percentSS < 0 ? (
                      <TrendingDown className="h-4 w-4 text-[#00E676]" />
                    ) : delta.percentSS > 0 ? (
                      <TrendingUp className="h-4 w-4 text-[#FF5252]" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )
                  ) : null}
                  <p className={`text-xl font-bold ${
                    delta.percentSS != null
                      ? delta.percentSS < 0
                        ? "text-[#00E676]"
                        : delta.percentSS > 0
                          ? "text-[#FF5252]"
                          : ""
                      : ""
                  }`}>
                    {delta.percentSS != null
                      ? `${delta.percentSS > 0 ? "+" : ""}${delta.percentSS.toFixed(1)}%`
                      : "—"}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground">%SS Change</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {previousReport.percentSS?.toFixed(1)}% <ArrowRight className="h-2 w-2 inline" /> {report.percentSS?.toFixed(1)}%
                </p>
              </div>

              {/* Fluency delta */}
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1">
                  {delta.fluencyScore != null ? (
                    delta.fluencyScore > 0 ? (
                      <TrendingUp className="h-4 w-4 text-[#00E676]" />
                    ) : delta.fluencyScore < 0 ? (
                      <TrendingDown className="h-4 w-4 text-[#FF5252]" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )
                  ) : null}
                  <p className={`text-xl font-bold ${
                    delta.fluencyScore != null
                      ? delta.fluencyScore > 0
                        ? "text-[#00E676]"
                        : delta.fluencyScore < 0
                          ? "text-[#FF5252]"
                          : ""
                      : ""
                  }`}>
                    {delta.fluencyScore != null
                      ? `${delta.fluencyScore > 0 ? "+" : ""}${delta.fluencyScore}`
                      : "—"}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground">Fluency Score</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {previousReport.fluencyScore} <ArrowRight className="h-2 w-2 inline" /> {report.fluencyScore}
                </p>
              </div>

              {/* Speaking rate delta */}
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1">
                  {delta.speakingRate != null ? (
                    Math.abs(delta.speakingRate) < 5 ? (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-500" />
                    )
                  ) : null}
                  <p className="text-xl font-bold">
                    {delta.speakingRate != null
                      ? `${delta.speakingRate > 0 ? "+" : ""}${Math.round(delta.speakingRate)}`
                      : "—"}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground">syl/min Change</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {previousReport.speakingRate != null ? Math.round(previousReport.speakingRate) : "—"}{" "}
                  <ArrowRight className="h-2 w-2 inline" />{" "}
                  {report.speakingRate != null ? Math.round(report.speakingRate) : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Disfluency Breakdown Charts ─── */}
      {disfluencyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Disfluency Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bar chart */}
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disfluencyData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {disfluencyData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            {disfluencyData.length > 1 && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={disfluencyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="name"
                    >
                      {disfluencyData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      formatter={(value) => <span className="text-[10px]">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Comparison with previous month */}
            {prevAnalysis?.disfluency_breakdown && (
              <div className="pt-2 border-t">
                <p className="text-[10px] text-muted-foreground mb-2">vs. Previous Assessment</p>
                <div className="space-y-1.5">
                  {disfluencyData.map((d) => {
                    const prevCount = Object.entries(prevAnalysis.disfluency_breakdown!)
                      .find(([key]) => (DISFLUENCY_LABELS[key] || key) === d.name)?.[1] ?? 0;
                    const change = d.count - prevCount;
                    return (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <span className="w-28 truncate text-muted-foreground">{d.name}</span>
                        <span className="font-mono">{prevCount}</span>
                        <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                        <span className="font-mono">{d.count}</span>
                        <Badge
                          variant="secondary"
                          className={`text-[9px] ${
                            change < 0
                              ? "text-[#00E676] bg-[#00E676]/10"
                              : change > 0
                                ? "text-[#FF5252] bg-[#FF5252]/10"
                                : ""
                          }`}
                        >
                          {change === 0 ? "—" : change > 0 ? `+${change}` : `${change}`}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Technique Recommendations ─── */}
      {techniqueRecs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Recommended Techniques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {techniqueRecs.map((rec, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    rec.priority === "high"
                      ? "border-[#FF5252]/30 bg-[#FF5252]/5"
                      : rec.priority === "medium"
                        ? "border-[#FFB347]/30 bg-[#FFB347]/5"
                        : "border-border bg-muted/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{rec.technique}</p>
                    <Badge
                      variant="secondary"
                      className={`text-[9px] ${
                        rec.priority === "high"
                          ? "text-[#FF5252] bg-[#FF5252]/10"
                          : rec.priority === "medium"
                            ? "text-[#FFB347] bg-[#FFB347]/10"
                            : "text-muted-foreground"
                      }`}
                    >
                      {rec.priority} priority
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{rec.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── AI Recommendations ─── */}
      {recommendations?.recommendations && recommendations.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Clinical Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.recommendations.map((rec, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-0.5 flex-shrink-0">&#x2022;</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
            {recommendations.encouragement && (
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm italic">{recommendations.encouragement}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Progress Trend ─── */}
      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-[10px] text-muted-foreground mb-2">%SS (lower is better)</p>
              <TrendChart data={history} metric="percentSS" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-2">Fluency Score (higher is better)</p>
              <TrendChart data={history} metric="fluencyScore" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Key Metrics Summary ─── */}
      <Card className="bg-muted/20">
        <CardContent className="py-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold">
                {report.percentSS != null ? `${report.percentSS.toFixed(1)}%` : "—"}
              </p>
              <p className="text-[9px] text-muted-foreground">%SS</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{report.fluencyScore ?? "—"}</p>
              <p className="text-[9px] text-muted-foreground">Fluency</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {report.speakingRate != null ? Math.round(report.speakingRate) : "—"}
              </p>
              <p className="text-[9px] text-muted-foreground">syl/min</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{report.totalSyllables ?? "—"}</p>
              <p className="text-[9px] text-muted-foreground">Syllables</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
