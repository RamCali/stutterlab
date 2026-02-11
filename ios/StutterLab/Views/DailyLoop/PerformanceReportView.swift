import SwiftUI

// MARK: - Performance Report View

/// Shown after completing a daily session with speech analysis results.
struct PerformanceReportView: View {
    let analysisResult: SpeechAnalysisResult?
    let xpEarned: Int
    let exercisesCompleted: Int
    let confidenceBefore: Int
    let confidenceAfter: Int
    let onDismiss: () -> Void

    @State private var showContent = false

    private var confidenceDelta: Int {
        confidenceAfter - confidenceBefore
    }

    private var coachingInsight: String {
        guard let result = analysisResult else {
            return "Great job completing your session! Keep showing up every day."
        }

        if result.fluencyScore >= 80 {
            return "Excellent fluency today! Your techniques are clearly working. Keep this consistency up."
        } else if result.fluencyScore >= 60 {
            if result.syllablesPerMinute > 180 {
                return "Good session! Try slowing down slightly — your pace was a bit fast. Use pausing between phrases."
            }
            return "Solid practice! Focus on gentle onset during your next session to push past 80."
        } else if result.fluencyScore >= 40 {
            if result.blockCount > 3 {
                return "I noticed some blocks. Try diaphragmatic breathing before speaking, and use light contact on difficult sounds."
            }
            return "You're building a foundation. The techniques take time — consistency is what matters most."
        } else {
            return "Every session counts. Try using DAF in the Audio Lab next time — it can reduce blocks by up to 80%."
        }
    }

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            ScrollView {
                VStack(spacing: SLSpacing.s6) {
                    // Title
                    VStack(spacing: SLSpacing.s2) {
                        Image(systemName: "chart.bar.doc.horizontal.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.clarityTeal)

                        Text("Session Complete")
                            .font(.sl2XL)
                            .foregroundColor(.textPrimary)

                        Text("+\(xpEarned) XP earned")
                            .font(.slLG)
                            .foregroundColor(.sunsetAmber)
                    }
                    .padding(.top, SLSpacing.s8)

                    if let result = analysisResult {
                        // Fluency Gauge
                        FluencyGauge(score: result.fluencyScore, label: "Fluency Score", size: 140)

                        // Metric Cards Grid
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: SLSpacing.s3) {
                            MetricCard(
                                icon: "waveform.path",
                                title: "Speaking Rate",
                                value: "\(Int(result.syllablesPerMinute))",
                                subtitle: "syllables/min (target: 120-180)",
                                color: result.syllablesPerMinute >= 120 && result.syllablesPerMinute <= 180 ? .fluencyGreen : .sunsetAmber
                            )

                            MetricCard(
                                icon: "percent",
                                title: "Stuttered Syllables",
                                value: String(format: "%.1f%%", result.percentageSyllablesStuttered),
                                subtitle: ssInterpretation(result.percentageSyllablesStuttered),
                                color: result.percentageSyllablesStuttered <= 5 ? .fluencyGreen : .sunsetAmber
                            )

                            MetricCard(
                                icon: "pause.circle",
                                title: "Blocks Detected",
                                value: "\(result.blockCount)",
                                subtitle: "silences > 500ms",
                                color: result.blockCount <= 2 ? .fluencyGreen : .sunsetAmber
                            )

                            MetricCard(
                                icon: "heart.fill",
                                title: "Confidence",
                                value: confidenceDelta >= 0 ? "+\(confidenceDelta)" : "\(confidenceDelta)",
                                subtitle: "\(confidenceBefore) before → \(confidenceAfter) after",
                                color: confidenceDelta >= 0 ? .fluencyGreen : .sunsetAmber
                            )
                        }
                    }

                    // Coaching Insight
                    VStack(alignment: .leading, spacing: SLSpacing.s2) {
                        HStack {
                            Image(systemName: "lightbulb.fill")
                                .foregroundColor(.sunsetAmber)
                            Text("Coaching Insight")
                                .font(.slSM)
                                .fontWeight(.semibold)
                                .foregroundColor(.sunsetAmber)
                        }
                        Text(coachingInsight)
                            .font(.slBase)
                            .foregroundColor(.textPrimary)
                            .lineLimit(4)
                    }
                    .slCardAccent(.sunsetAmber)

                    // Summary row
                    HStack(spacing: SLSpacing.s4) {
                        summaryPill(icon: "checkmark.circle.fill", text: "\(exercisesCompleted) exercises", color: .fluencyGreen)
                        if let result = analysisResult {
                            summaryPill(icon: "clock.fill", text: "\(Int(result.totalDurationSeconds / 60)) min", color: .clarityTeal)
                        }
                        summaryPill(icon: "bolt.fill", text: "+\(xpEarned) XP", color: .sunsetAmber)
                    }

                    // Done button
                    Button(action: onDismiss) {
                        Text("Done")
                    }
                    .buttonStyle(SLPrimaryButtonStyle())
                    .padding(.bottom, SLSpacing.s8)
                }
                .padding(SLSpacing.s4)
            }
        }
        .opacity(showContent ? 1 : 0)
        .onAppear {
            withAnimation(.easeIn(duration: 0.4)) {
                showContent = true
            }
        }
    }

    private func ssInterpretation(_ ss: Double) -> String {
        if ss <= 2 { return "Normal range" }
        if ss <= 5 { return "Mild" }
        if ss <= 10 { return "Moderate" }
        return "Severe"
    }

    private func summaryPill(icon: String, text: String, color: Color) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 10))
            Text(text)
                .font(.slXS)
        }
        .foregroundColor(color)
        .padding(.horizontal, SLSpacing.s2)
        .padding(.vertical, SLSpacing.s1)
        .background(color.opacity(0.1))
        .cornerRadius(SLRadius.full)
    }
}
