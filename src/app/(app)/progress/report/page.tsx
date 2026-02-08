"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { ReportCard } from "@/components/progress/report-card";
import { ClinicalReport } from "@/components/progress/ClinicalReport";
import { getReportHistory } from "@/lib/actions/report-actions";

type Report = Awaited<ReturnType<typeof getReportHistory>>[number];

export default function ReportHistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"standard" | "clinical">("standard");

  useEffect(() => {
    async function load() {
      try {
        const data = await getReportHistory();
        setReports(data);
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const currentReport = reports[selectedIndex];
  const previousReport = reports[selectedIndex + 1] ?? null;
  const historyData = [...reports].reverse().map((r) => ({
    month: new Date(r.month).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
    percentSS: r.percentSS ?? 0,
    fluencyScore: r.fluencyScore ?? 0,
  }));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/progress">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Progress Reports
            </h1>
            <p className="text-muted-foreground text-sm">
              {reports.length} assessment{reports.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
        </div>
        <Link href="/progress/assess">
          <Button>New Assessment</Button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No Reports Yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Complete your first monthly assessment to start tracking your progress.
          </p>
          <Link href="/progress/assess">
            <Button className="mt-4">Start Assessment</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Report selector */}
          {reports.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {reports.map((r, i) => (
                <Badge
                  key={r.id}
                  variant={i === selectedIndex ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedIndex(i)}
                >
                  {new Date(r.month).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                  {" — "}
                  {r.percentSS?.toFixed(1)}%
                </Badge>
              ))}
            </div>
          )}

          {/* View mode toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "standard" ? "default" : "ghost"}
              size="sm"
              className="text-xs"
              onClick={() => setViewMode("standard")}
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              Standard
            </Button>
            <Button
              variant={viewMode === "clinical" ? "default" : "ghost"}
              size="sm"
              className="text-xs"
              onClick={() => setViewMode("clinical")}
            >
              <Activity className="h-3.5 w-3.5 mr-1" />
              Clinical (SSI-4)
            </Button>
          </div>

          {currentReport && viewMode === "standard" && (
            <ReportCard
              report={{
                id: currentReport.id,
                month: currentReport.month,
                passageId: currentReport.passageId,
                percentSS: currentReport.percentSS,
                severityRating: currentReport.severityRating,
                fluencyScore: currentReport.fluencyScore,
                totalSyllables: currentReport.totalSyllables,
                stutteredSyllables: currentReport.stutteredSyllables,
                speakingRate: currentReport.speakingRate,
                analysisJson: currentReport.analysisJson as Record<string, unknown> | null,
                recommendationsJson: currentReport.recommendationsJson as Record<string, unknown> | null,
                shareToken: currentReport.shareToken,
              }}
              previousReport={
                previousReport
                  ? {
                      id: previousReport.id,
                      month: previousReport.month,
                      passageId: previousReport.passageId,
                      percentSS: previousReport.percentSS,
                      severityRating: previousReport.severityRating,
                      fluencyScore: previousReport.fluencyScore,
                      totalSyllables: previousReport.totalSyllables,
                      stutteredSyllables: previousReport.stutteredSyllables,
                      speakingRate: previousReport.speakingRate,
                      analysisJson: previousReport.analysisJson as Record<string, unknown> | null,
                      recommendationsJson: previousReport.recommendationsJson as Record<string, unknown> | null,
                      shareToken: previousReport.shareToken,
                    }
                  : null
              }
              history={historyData}
            />
          )}

          {currentReport && viewMode === "clinical" && (
            <ClinicalReport
              report={{
                id: currentReport.id,
                month: currentReport.month,
                passageId: currentReport.passageId,
                percentSS: currentReport.percentSS,
                severityRating: currentReport.severityRating,
                fluencyScore: currentReport.fluencyScore,
                totalSyllables: currentReport.totalSyllables,
                stutteredSyllables: currentReport.stutteredSyllables,
                speakingRate: currentReport.speakingRate,
                analysisJson: currentReport.analysisJson as Record<string, unknown> | null,
                recommendationsJson: currentReport.recommendationsJson as Record<string, unknown> | null,
                shareToken: currentReport.shareToken,
              }}
              previousReport={
                previousReport
                  ? {
                      id: previousReport.id,
                      month: previousReport.month,
                      passageId: previousReport.passageId,
                      percentSS: previousReport.percentSS,
                      severityRating: previousReport.severityRating,
                      fluencyScore: previousReport.fluencyScore,
                      totalSyllables: previousReport.totalSyllables,
                      stutteredSyllables: previousReport.stutteredSyllables,
                      speakingRate: previousReport.speakingRate,
                      analysisJson: previousReport.analysisJson as Record<string, unknown> | null,
                      recommendationsJson: previousReport.recommendationsJson as Record<string, unknown> | null,
                      shareToken: previousReport.shareToken,
                    }
                  : null
              }
              history={historyData}
            />
          )}
        </>
      )}
    </div>
  );
}
