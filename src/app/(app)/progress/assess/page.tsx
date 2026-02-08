"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReadingAssessment } from "@/components/progress/reading-assessment";
import { ReportCard } from "@/components/progress/report-card";
import { PremiumGate } from "@/components/premium-gate";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);

  // TODO: Replace with actual premium check from server
  const isPro = true;

  async function handleAssessmentComplete({
    passageId,
    transcription,
  }: {
    passageId: string;
    transcription: string;
  }) {
    setLoading(true);
    try {
      const res = await fetch("/api/assess-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passageId, transcription }),
      });

      const data = await res.json();
      if (data.report) {
        setReportData(data.report);
      }
    } catch (error) {
      console.error("Assessment failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/progress">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Monthly Assessment</h1>
          <p className="text-muted-foreground text-sm">
            Read a standardized passage aloud to measure your %SS score
          </p>
        </div>
      </div>

      <PremiumGate
        isPremium={isPro}
        featureName="Clinical Progress Reports"
        description="Monthly standardized assessments with %SS scoring, trend tracking, and shareable PDF reports."
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Analyzing your speech with clinical precision...
            </p>
          </div>
        ) : reportData ? (
          <div className="space-y-4">
            <ReportCard
              report={{
                id: (reportData.id as string) || "",
                month: new Date(),
                passageId: (reportData.passageId as string) || "",
                percentSS: reportData.percentSS as number,
                severityRating: reportData.severityRating as string,
                fluencyScore: reportData.fluencyScore as number,
                totalSyllables: reportData.totalSyllables as number,
                stutteredSyllables: reportData.stutteredSyllables as number,
                speakingRate: reportData.speakingRate as number,
                analysisJson: reportData.analysis as Record<string, unknown>,
                recommendationsJson: {
                  recommendations: reportData.recommendations,
                  encouragement: reportData.encouragement,
                },
                shareToken: reportData.shareToken as string,
              }}
              history={[]}
            />
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/progress")}>
                View All Reports
              </Button>
              <Button
                onClick={() => {
                  setReportData(null);
                  setLoading(false);
                }}
              >
                Take Another Assessment
              </Button>
            </div>
          </div>
        ) : (
          <ReadingAssessment onComplete={handleAssessmentComplete} />
        )}
      </PremiumGate>
    </div>
  );
}
