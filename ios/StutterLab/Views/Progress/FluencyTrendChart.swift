import SwiftUI
import Charts

// MARK: - Fluency Trend Chart

/// Weekly-aggregated fluency scores as an area chart with trend line.
struct FluencyTrendChart: View {
    let sessions: [SessionDTO]

    private var weeklyData: [WeeklyFluency] {
        let calendar = Calendar.current
        let scored = sessions.compactMap { s -> (Date, Double)? in
            guard let score = s.selfRatedFluency,
                  let dateStr = s.createdAt,
                  let date = ISO8601DateFormatter().date(from: dateStr)
                    ?? DateFormatter.flexible.date(from: dateStr) else { return nil }
            return (date, Double(score) * 10) // Convert 1-10 to 0-100
        }

        // Group by week
        var weeks: [Date: [Double]] = [:]
        for (date, score) in scored {
            let weekStart = calendar.dateInterval(of: .weekOfYear, for: date)?.start ?? date
            weeks[weekStart, default: []].append(score)
        }

        return weeks.map { (week, scores) in
            WeeklyFluency(
                week: week,
                averageScore: scores.reduce(0, +) / Double(scores.count),
                sessionCount: scores.count
            )
        }
        .sorted { $0.week < $1.week }
        .suffix(12)
        .map { $0 }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            HStack {
                VStack(alignment: .leading, spacing: SLSpacing.s1) {
                    Text("Fluency Trend")
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                    Text("Weekly average scores")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
                Spacer()
                if let latest = weeklyData.last, let first = weeklyData.first, weeklyData.count > 1 {
                    let delta = latest.averageScore - first.averageScore
                    HStack(spacing: SLSpacing.s1) {
                        Image(systemName: delta >= 0 ? "arrow.up.right" : "arrow.down.right")
                            .font(.system(size: 12))
                        Text(String(format: "%+.0f", delta))
                            .font(.slXS)
                            .fontWeight(.semibold)
                    }
                    .foregroundColor(delta >= 0 ? .fluencyGreen : Color(hex: "FF6B6B"))
                }
            }

            if weeklyData.count >= 2 {
                Chart {
                    ForEach(weeklyData) { point in
                        AreaMark(
                            x: .value("Week", point.week, unit: .weekOfYear),
                            y: .value("Score", point.averageScore)
                        )
                        .foregroundStyle(
                            LinearGradient(
                                colors: [.clarityTeal.opacity(0.4), .clarityTeal.opacity(0.05)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )

                        LineMark(
                            x: .value("Week", point.week, unit: .weekOfYear),
                            y: .value("Score", point.averageScore)
                        )
                        .foregroundStyle(Color.clarityTeal)
                        .lineStyle(StrokeStyle(lineWidth: 2))

                        PointMark(
                            x: .value("Week", point.week, unit: .weekOfYear),
                            y: .value("Score", point.averageScore)
                        )
                        .foregroundStyle(Color.clarityTeal)
                        .symbolSize(20)
                    }
                }
                .chartYScale(domain: 0...100)
                .chartYAxis {
                    AxisMarks(position: .leading, values: [0, 25, 50, 75, 100]) { value in
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
                        AxisValueLabel(format: .dateTime.month(.abbreviated).day())
                            .foregroundStyle(Color.textTertiary)
                            .font(.system(size: 9))
                    }
                }
                .frame(height: 180)
            } else {
                noDataView
            }
        }
        .slCard()
    }

    private var noDataView: some View {
        VStack(spacing: SLSpacing.s2) {
            Image(systemName: "chart.line.uptrend.xyaxis")
                .font(.system(size: 28))
                .foregroundColor(.textTertiary)
            Text("Complete more sessions to see trends")
                .font(.slXS)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 120)
    }
}

// MARK: - Weekly Fluency Data Point

struct WeeklyFluency: Identifiable {
    let id = UUID()
    let week: Date
    let averageScore: Double
    let sessionCount: Int
}

// MARK: - Flexible Date Formatter

extension DateFormatter {
    static let flexible: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        f.locale = Locale(identifier: "en_US_POSIX")
        return f
    }()
}
