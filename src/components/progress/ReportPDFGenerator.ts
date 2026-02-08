import jsPDF from "jspdf";

interface ReportPDFData {
  monthLabel: string;
  percentSS: number | null;
  severityRating: string | null;
  fluencyScore: number | null;
  totalSyllables: number | null;
  stutteredSyllables: number | null;
  speakingRate: number | null;
  disfluencyBreakdown?: Record<string, number>;
  recommendations?: string[];
  encouragement?: string;
  techniqueUsage?: Record<string, number>;
  history?: { month: string; percentSS: number }[];
}

const COLORS = {
  primary: [59, 130, 246] as [number, number, number],   // blue-500
  green: [0, 230, 118] as [number, number, number],
  orange: [255, 179, 71] as [number, number, number],
  red: [255, 82, 82] as [number, number, number],
  dark: [30, 30, 30] as [number, number, number],
  muted: [120, 120, 120] as [number, number, number],
  lightBg: [245, 245, 245] as [number, number, number],
};

export function generateReportPDF(data: ReportPDFData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // === Header ===
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("StutterLab", 15, 15);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Progress Report — ${data.monthLabel}`, 15, 24);

  doc.setFontSize(8);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    15,
    30
  );

  y = 45;

  // === Key Metrics Row ===
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("KEY METRICS", 15, y);
  y += 6;

  const metrics = [
    {
      label: "%SS Score",
      value: data.percentSS != null ? `${data.percentSS.toFixed(1)}%` : "—",
    },
    {
      label: "Severity",
      value: data.severityRating
        ? data.severityRating.charAt(0).toUpperCase() +
          data.severityRating.slice(1)
        : "—",
    },
    {
      label: "Fluency Score",
      value: data.fluencyScore != null ? `${data.fluencyScore}` : "—",
    },
    {
      label: "Speaking Rate",
      value:
        data.speakingRate != null
          ? `${Math.round(data.speakingRate)} syl/min`
          : "—",
    },
  ];

  const colW = (pageWidth - 30) / metrics.length;
  metrics.forEach((m, i) => {
    const x = 15 + i * colW;
    doc.setFillColor(...COLORS.lightBg);
    doc.roundedRect(x, y, colW - 4, 22, 2, 2, "F");

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text(m.value, x + (colW - 4) / 2, y + 11, { align: "center" });

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text(m.label, x + (colW - 4) / 2, y + 18, { align: "center" });
  });

  y += 30;

  // === Syllable Breakdown ===
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Total Syllables: ${data.totalSyllables ?? "—"}    |    Stuttered: ${data.stutteredSyllables ?? "—"}`,
    15,
    y
  );
  y += 8;

  // === Severity Scale ===
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CLINICAL SEVERITY SCALE (%SS)", 15, y);
  y += 5;

  const scaleWidth = pageWidth - 30;
  const segments = [
    { label: "Normal", width: 0.25, color: COLORS.green, range: "<3%" },
    { label: "Mild", width: 0.17, color: COLORS.orange, range: "3-5%" },
    { label: "Moderate", width: 0.25, color: [255, 140, 0] as [number, number, number], range: "5-8%" },
    { label: "Severe", width: 0.33, color: COLORS.red, range: ">8%" },
  ];

  let sx = 15;
  segments.forEach((seg) => {
    const w = seg.width * scaleWidth;
    doc.setFillColor(...seg.color);
    doc.rect(sx, y, w, 5, "F");
    sx += w;
  });

  // Marker for current position
  if (data.percentSS != null) {
    const markerX = 15 + Math.min(1, data.percentSS / 12) * scaleWidth;
    doc.setFillColor(...COLORS.dark);
    doc.triangle(
      markerX - 2, y + 7,
      markerX + 2, y + 7,
      markerX, y + 5,
      "F"
    );
  }

  y += 10;

  // Scale labels
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.muted);
  doc.text("0%", 15, y);
  doc.text("3%", 15 + 0.25 * scaleWidth, y);
  doc.text("5%", 15 + 0.42 * scaleWidth, y);
  doc.text("8%", 15 + 0.67 * scaleWidth, y);
  doc.text("12%+", 15 + scaleWidth - 5, y);
  y += 8;

  // === Disfluency Breakdown ===
  if (data.disfluencyBreakdown && Object.keys(data.disfluencyBreakdown).length > 0) {
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DISFLUENCY BREAKDOWN", 15, y);
    y += 6;

    const entries = Object.entries(data.disfluencyBreakdown);
    const maxVal = Math.max(...entries.map(([, v]) => v), 1);

    entries.forEach(([type, count]) => {
      const label =
        type.charAt(0).toUpperCase() +
        type.slice(1).replace(/_/g, " ");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.dark);
      doc.text(label, 15, y + 3);

      // Bar
      const barMaxW = 80;
      const barW = (count / maxVal) * barMaxW;
      doc.setFillColor(...COLORS.lightBg);
      doc.rect(60, y, barMaxW, 4, "F");
      doc.setFillColor(...COLORS.orange);
      doc.rect(60, y, barW, 4, "F");

      // Count
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.muted);
      doc.text(`${count}`, 60 + barMaxW + 4, y + 3);

      y += 7;
    });

    y += 4;
  }

  // === Technique Usage ===
  if (data.techniqueUsage && Object.keys(data.techniqueUsage).length > 0) {
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TECHNIQUE USAGE", 15, y);
    y += 6;

    const techLabels: Record<string, string> = {
      gentle_onset: "Gentle Onset",
      pacing: "Pacing",
      rate_compliance: "Rate Compliance",
      prolonged_speech: "Prolonged Speech",
      cancellation: "Cancellation",
      pull_out: "Pull-out",
    };

    Object.entries(data.techniqueUsage).forEach(([tech, count]) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.dark);
      doc.text(`${techLabels[tech] || tech}: ${count}x`, 20, y + 3);
      doc.setFillColor(...COLORS.green);
      doc.circle(17, y + 2, 1.5, "F");
      y += 6;
    });

    y += 4;
  }

  // === Recommendations ===
  if (data.recommendations && data.recommendations.length > 0) {
    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RECOMMENDATIONS", 15, y);
    y += 6;

    data.recommendations.forEach((rec) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.dark);

      const lines = doc.splitTextToSize(`• ${rec}`, pageWidth - 35);
      doc.text(lines, 18, y);
      y += lines.length * 4 + 2;
    });

    y += 4;
  }

  // === Encouragement ===
  if (data.encouragement) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(240, 248, 255);
    const encLines = doc.splitTextToSize(data.encouragement, pageWidth - 40);
    const encH = encLines.length * 4 + 8;
    doc.roundedRect(15, y, pageWidth - 30, encH, 2, 2, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.primary);
    doc.text(encLines, 20, y + 5);
    y += encH + 6;
  }

  // === Trend Line ===
  if (data.history && data.history.length > 1) {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PROGRESS OVER TIME", 15, y);
    y += 6;

    const chartX = 25;
    const chartW = pageWidth - 50;
    const chartH = 35;

    // Axes
    doc.setDrawColor(...COLORS.muted);
    doc.setLineWidth(0.2);
    doc.line(chartX, y, chartX, y + chartH);
    doc.line(chartX, y + chartH, chartX + chartW, y + chartH);

    // Y-axis labels
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.muted);
    doc.text("0%", chartX - 8, y + chartH);
    doc.text("12%", chartX - 8, y + 2);

    // Data points + line
    const maxSS = 12;
    const points = data.history.map((h, i) => ({
      x: chartX + (i / (data.history!.length - 1)) * chartW,
      y: y + chartH - (h.percentSS / maxSS) * chartH,
    }));

    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    for (let i = 1; i < points.length; i++) {
      doc.line(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
    }

    // Dots
    points.forEach((p) => {
      doc.setFillColor(...COLORS.primary);
      doc.circle(p.x, p.y, 1.2, "F");
    });

    // X-axis labels
    doc.setFontSize(5);
    doc.setTextColor(...COLORS.muted);
    data.history.forEach((h, i) => {
      const x = chartX + (i / (data.history!.length - 1)) * chartW;
      doc.text(h.month, x, y + chartH + 4, { align: "center" });
    });

    y += chartH + 12;
  }

  // === Footer ===
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    "Generated by StutterLab — stutterlab.com — For clinical reference only",
    pageWidth / 2,
    pageH - 8,
    { align: "center" }
  );

  // Save
  doc.save(`StutterLab-Report-${data.monthLabel.replace(/\s+/g, "-")}.pdf`);
}
