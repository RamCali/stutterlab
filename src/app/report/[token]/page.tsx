import { notFound } from "next/navigation";
import { getReportByShareToken } from "@/lib/actions/report-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const report = await getReportByShareToken(token);

  if (!report) {
    notFound();
  }

  const severityColors: Record<string, string> = {
    normal: "text-[#00E676] bg-[#00E676]/10",
    mild: "text-[#FFB347] bg-[#FFB347]/10",
    moderate: "text-[#FF8C00] bg-[#FF8C00]/10",
    severe: "text-[#FF5252] bg-[#FF5252]/10",
  };

  const recommendations = report.recommendationsJson as {
    recommendations?: string[];
    encouragement?: string;
  } | null;

  const monthLabel = report.month
    ? new Date(report.month).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Assessment";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            StutterLab Progress Report
          </h1>
          <p className="text-sm text-muted-foreground">{monthLabel}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Speech Assessment Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Main metrics */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-4 rounded-lg bg-muted/10">
                <p className="text-3xl font-bold">
                  {report.percentSS != null
                    ? `${report.percentSS.toFixed(1)}%`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">%SS Score</p>
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
                <p className="text-2xl font-bold">
                  {report.fluencyScore ?? "—"}
                </p>
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
                Total syllables:{" "}
                <strong>{report.totalSyllables ?? "—"}</strong>
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
            </div>

            {/* Recommendations */}
            {recommendations?.recommendations && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Recommendations
                </p>
                <ul className="space-y-1">
                  {recommendations.recommendations.map(
                    (rec: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-0.5">&#x2022;</span>
                        {rec}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Encouragement */}
            {recommendations?.encouragement && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm italic">
                  {recommendations.encouragement}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Generated by StutterLab — Evidence-based stuttering training
        </p>
      </div>
    </div>
  );
}
