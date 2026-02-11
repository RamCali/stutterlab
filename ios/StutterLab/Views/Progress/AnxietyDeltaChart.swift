import SwiftUI
import Charts

// MARK: - Anxiety Delta Chart

/// Bar chart comparing confidence before vs after each session.
struct AnxietyDeltaChart: View {
    let sessions: [SessionDTO]

    private var data: [ConfidenceDelta] {
        sessions.compactMap { s -> ConfidenceDelta? in
            guard let before = s.confidenceBefore,
                  let after = s.confidenceAfter,
                  let dateStr = s.createdAt,
                  let date = ISO8601DateFormatter().date(from: dateStr)
                    ?? DateFormatter.flexible.date(from: dateStr) else { return nil }
            return ConfidenceDelta(date: date, before: before, after: after)
        }
        .sorted { $0.date < $1.date }
        .suffix(15)
        .map { $0 }
    }

    private var averageDelta: Double {
        guard !data.isEmpty else { return 0 }
        let total = data.reduce(0) { $0 + ($1.after - $1.before) }
        return Double(total) / Double(data.count)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            HStack {
                VStack(alignment: .leading, spacing: SLSpacing.s1) {
                    Text("Confidence Growth")
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                    Text("Before vs. after each session")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
                Spacer()
                if !data.isEmpty {
                    VStack(alignment: .trailing, spacing: SLSpacing.s1) {
                        Text(String(format: "%+.1f avg", averageDelta))
                            .font(.slXS)
                            .fontWeight(.semibold)
                            .foregroundColor(averageDelta >= 0 ? .fluencyGreen : Color(hex: "FF6B6B"))
                        Text("per session")
                            .font(.system(size: 9))
                            .foregroundColor(.textTertiary)
                    }
                }
            }

            if data.count >= 2 {
                Chart {
                    ForEach(data) { point in
                        BarMark(
                            x: .value("Date", point.date, unit: .day),
                            yStart: .value("Before", point.before),
                            yEnd: .value("After", point.after)
                        )
                        .foregroundStyle(
                            point.after >= point.before
                                ? Color.fluencyGreen.opacity(0.8)
                                : Color(hex: "FF6B6B").opacity(0.8)
                        )
                        .cornerRadius(2)
                    }

                    // Show before markers
                    ForEach(data) { point in
                        PointMark(
                            x: .value("Date", point.date, unit: .day),
                            y: .value("Before", point.before)
                        )
                        .foregroundStyle(Color.sunsetAmber)
                        .symbolSize(12)
                    }
                }
                .chartYScale(domain: 0...10)
                .chartYAxis {
                    AxisMarks(position: .leading, values: [0, 2, 4, 6, 8, 10]) { value in
                        AxisValueLabel {
                            Text("\(value.as(Int.self) ?? 0)")
                                .font(.system(size: 10))
                                .foregroundColor(.textTertiary)
                        }
                        AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5, dash: [4]))
                            .foregroundStyle(Color.border)
                    }
                }
                .chartXAxis {
                    AxisMarks { value in
                        AxisValueLabel(format: .dateTime.month(.narrow).day())
                            .foregroundStyle(Color.textTertiary)
                            .font(.system(size: 8))
                    }
                }
                .frame(height: 160)

                // Legend
                HStack(spacing: SLSpacing.s4) {
                    legendItem(color: .sunsetAmber, label: "Before")
                    legendItem(color: .fluencyGreen, label: "After (improved)")
                    legendItem(color: Color(hex: "FF6B6B"), label: "After (declined)")
                }
                .font(.system(size: 9))
            } else {
                noDataView
            }
        }
        .slCard()
    }

    private func legendItem(color: Color, label: String) -> some View {
        HStack(spacing: 4) {
            Circle().fill(color).frame(width: 6, height: 6)
            Text(label).foregroundColor(.textTertiary)
        }
    }

    private var noDataView: some View {
        VStack(spacing: SLSpacing.s2) {
            Image(systemName: "chart.bar.fill")
                .font(.system(size: 28))
                .foregroundColor(.textTertiary)
            Text("Rate confidence before & after sessions to see growth")
                .font(.slXS)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 120)
    }
}

// MARK: - Confidence Delta

struct ConfidenceDelta: Identifiable {
    let id = UUID()
    let date: Date
    let before: Int
    let after: Int
}
