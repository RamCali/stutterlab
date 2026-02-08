import { NextRequest, NextResponse } from "next/server";
import { getReportByShareToken } from "@/lib/actions/report-actions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const { reportId: shareToken } = await params;

  const report = await getReportByShareToken(shareToken);

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Return sanitized report (no user ID)
  return NextResponse.json({
    report: {
      month: report.month,
      passageId: report.passageId,
      percentSS: report.percentSS,
      severityRating: report.severityRating,
      fluencyScore: report.fluencyScore,
      totalSyllables: report.totalSyllables,
      stutteredSyllables: report.stutteredSyllables,
      speakingRate: report.speakingRate,
      analysis: report.analysisJson,
      recommendations: report.recommendationsJson,
      createdAt: report.createdAt,
    },
  });
}
