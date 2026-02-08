import Charts
import SwiftUI

// MARK: - Progress Dashboard

struct StutterLabProgressView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @StateObject private var viewModel = ProgressViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: SLSpacing.s6) {
                        // Hero metric: Fluency Score
                        if let score = viewModel.latestFluencyScore {
                            heroMetric(value: String(format: "%.0f", score), label: "Fluency Score", color: .sunsetAmber)
                        }

                        // Stats row
                        statsRow

                        // Fluency trend chart
                        if !viewModel.fluencyTrend.isEmpty {
                            chartCard(
                                title: "Fluency Score Over Time",
                                data: viewModel.fluencyTrend,
                                color: .fluencyGreen
                            )
                        }

                        // SPM trend
                        if !viewModel.spmTrend.isEmpty {
                            spmChart
                        }

                        // Block count trend
                        if !viewModel.blockTrend.isEmpty {
                            blockChart
                        }

                        // Streak calendar
                        StreakCalendarView(
                            practiceDates: viewModel.practiceDates,
                            currentStreak: appViewModel.userProfile?.currentStreak ?? 0
                        )

                        // Confidence trend
                        if !viewModel.confidenceTrend.isEmpty {
                            confidenceChart
                        }
                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100)
                }
            }
            .navigationTitle("Progress")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                if let uid = appViewModel.userProfile?.id {
                    await viewModel.loadData(userId: uid)
                }
            }
        }
    }

    // MARK: - Hero Metric

    private func heroMetric(value: String, label: String, color: Color) -> some View {
        VStack(spacing: SLSpacing.s2) {
            Text(label)
                .font(.slXS)
                .foregroundColor(.textTertiary)
            Text(value)
                .font(.system(size: 56, weight: .bold))
                .foregroundColor(color)
            Text("Practice metric — not a clinical measure")
                .font(.system(size: 10))
                .foregroundColor(.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, SLSpacing.s6)
        .background(Color.elevation2)
        .cornerRadius(SLRadius.md)
    }

    // MARK: - Stats Row

    private var statsRow: some View {
        HStack(spacing: SLSpacing.s4) {
            miniStat(
                label: "Sessions",
                value: "\(viewModel.totalSessions)",
                color: .clarityTeal
            )
            miniStat(
                label: "Minutes",
                value: "\(viewModel.totalPracticeMinutes)",
                color: .sunsetAmber
            )
            miniStat(
                label: "Avg Confidence",
                value: String(format: "%.1f", viewModel.averageConfidence),
                color: .fluencyGreen
            )
        }
    }

    private func miniStat(label: String, value: String, color: Color) -> some View {
        VStack(spacing: SLSpacing.s1) {
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(.textTertiary)
            Text(value)
                .font(.slLG)
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, SLSpacing.s3)
        .background(Color.elevation1)
        .cornerRadius(SLRadius.md)
    }

    // MARK: - Charts

    private func chartCard(title: String, data: [(date: Date, score: Double)], color: Color) -> some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            Text(title)
                .font(.slSM)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)

            Chart {
                ForEach(Array(data.enumerated()), id: \.offset) { _, point in
                    LineMark(
                        x: .value("Date", point.date),
                        y: .value("Score", point.score)
                    )
                    .foregroundStyle(color)
                    .lineStyle(StrokeStyle(lineWidth: 2))
                }
            }
            .frame(height: 160)
            .chartYAxis {
                AxisMarks(position: .leading) { _ in
                    AxisValueLabel()
                        .foregroundStyle(Color.textTertiary)
                }
            }
            .chartXAxis {
                AxisMarks { _ in
                    AxisValueLabel(format: .dateTime.month(.abbreviated).day())
                        .foregroundStyle(Color.textTertiary)
                }
            }
        }
        .padding(SLSpacing.s4)
        .background(Color.elevation1)
        .cornerRadius(SLRadius.md)
    }

    // MARK: SPM Chart (with target range)

    private var spmChart: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            Text("Speaking Rate (SPM)")
                .font(.slSM)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)

            Chart {
                // Target range band
                RectangleMark(
                    yStart: .value("Min", LiveSpeechMetrics.targetSPMRange.lowerBound),
                    yEnd: .value("Max", LiveSpeechMetrics.targetSPMRange.upperBound)
                )
                .foregroundStyle(Color.fluencyGreen.opacity(0.1))

                ForEach(Array(viewModel.spmTrend.enumerated()), id: \.offset) { _, point in
                    LineMark(
                        x: .value("Date", point.date),
                        y: .value("SPM", point.spm)
                    )
                    .foregroundStyle(Color.clarityTeal)
                    .lineStyle(StrokeStyle(lineWidth: 2))
                }
            }
            .frame(height: 160)
            .chartYAxis {
                AxisMarks(position: .leading) { _ in
                    AxisValueLabel().foregroundStyle(Color.textTertiary)
                }
            }
            .chartXAxis {
                AxisMarks { _ in
                    AxisValueLabel(format: .dateTime.month(.abbreviated).day())
                        .foregroundStyle(Color.textTertiary)
                }
            }

            Text("Green zone: 120–180 SPM (target range)")
                .font(.system(size: 10))
                .foregroundColor(.textTertiary)
        }
        .padding(SLSpacing.s4)
        .background(Color.elevation1)
        .cornerRadius(SLRadius.md)
    }

    // MARK: Block Count Chart

    private var blockChart: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            Text("Block Count (decreasing = progress)")
                .font(.slSM)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)

            Chart {
                ForEach(Array(viewModel.blockTrend.enumerated()), id: \.offset) { _, point in
                    BarMark(
                        x: .value("Date", point.date),
                        y: .value("Blocks", point.blocks)
                    )
                    .foregroundStyle(Color.sunsetAmber)
                    .cornerRadius(SLRadius.sm)
                }
            }
            .frame(height: 120)
        }
        .padding(SLSpacing.s4)
        .background(Color.elevation1)
        .cornerRadius(SLRadius.md)
    }

    // MARK: Confidence Chart

    private var confidenceChart: some View {
        chartCard(
            title: "Confidence Over Time",
            data: viewModel.confidenceTrend.map { (date: $0.date, score: Double($0.rating)) },
            color: .sunsetAmber
        )
    }
}
