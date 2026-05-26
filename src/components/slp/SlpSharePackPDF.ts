import jsPDF from "jspdf";
import type { SlpSharePackData } from "@/lib/slp/build-share-pack";

export function generateSlpSharePackPDF(data: SlpSharePackData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  let y = 16;

  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, w, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("StutterLab — SLP Share Pack", 14, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `For clinical collaboration · ${new Date(data.generatedAt).toLocaleDateString()}`,
    14,
    22
  );

  y = 36;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Member summary", 14, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = [
    `Name: ${data.displayName}`,
    `Severity (self-reported): ${data.severity ?? "—"}`,
    `Current streak: ${data.currentStreak} days · Longest: ${data.longestStreak}`,
    `Total practice: ${data.totalPracticeMinutes} min · Sessions (30d): ${data.sessionCount30d}`,
  ];
  for (const line of lines) {
    doc.text(line, 14, y);
    y += 5;
  }

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("OASES-S check-ins (recent)", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  if (data.recentOases.length === 0) {
    doc.text("No check-ins yet.", 14, y);
    y += 6;
  } else {
    for (const o of data.recentOases) {
      doc.text(`${o.date}: impact ${o.impactScore.toFixed(1)}`, 14, y);
      y += 5;
    }
  }

  y += 3;
  doc.setFont("helvetica", "bold");
  doc.text("Real-world micro-challenges", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  for (const c of data.recentChallenges.slice(0, 5)) {
    doc.text(
      `${c.date} · ${c.title} · ${c.outcome} (anxiety ${c.predictedAnxiety}→${c.actualAnxiety ?? "—"})`,
      14,
      y,
      { maxWidth: w - 28 }
    );
    y += 6;
  }

  y += 3;
  doc.setFont("helvetica", "bold");
  doc.text("Quick Calm moment logs", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  for (const m of data.recentMoments.slice(0, 5)) {
    doc.text(
      `${m.technique} · severity ${m.severity}/5 · helped: ${m.helped == null ? "—" : m.helped ? "yes" : "no"}`,
      14,
      y
    );
    y += 5;
  }

  if (data.latestWeeklyReview) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Latest weekly review", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Win: ${data.latestWeeklyReview.topWin}`, 14, y, { maxWidth: w - 28 });
    y += 6;
    doc.text(`Focus: ${data.latestWeeklyReview.targetSituation}`, 14, y, { maxWidth: w - 28 });
  }

  y = doc.internal.pageSize.getHeight() - 12;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Not a diagnostic report. For hybrid care planning only. StutterLab is a daily practice program.",
    14,
    y,
    { maxWidth: w - 28 }
  );

  doc.save(`stutterlab-slp-pack-${new Date().toISOString().slice(0, 10)}.pdf`);
}
