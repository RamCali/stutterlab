import SwiftUI

// MARK: - Streak Heatmap (52-Week GitHub-Style)

/// Full 52-week practice heatmap showing daily practice status.
struct StreakHeatmap: View {
    let practiceDates: Set<Date>
    let currentStreak: Int
    let longestStreak: Int

    private let calendar = Calendar.current
    private let cellSize: CGFloat = 12
    private let cellSpacing: CGFloat = 3

    private var weeks: [[DayCell]] {
        let today = calendar.startOfDay(for: Date())
        let weekday = calendar.component(.weekday, from: today) // 1=Sun
        // Go back 51 full weeks + current partial week
        let totalDays = 51 * 7 + weekday
        guard let startDate = calendar.date(byAdding: .day, value: -totalDays + 1, to: today) else {
            return []
        }

        var allDays: [DayCell] = []
        for offset in 0..<totalDays {
            guard let date = calendar.date(byAdding: .day, value: offset, to: startDate) else { continue }
            let isPracticed = practiceDates.contains(calendar.startOfDay(for: date))
            let isToday = calendar.isDateInToday(date)
            let isFuture = date > today
            allDays.append(DayCell(date: date, practiced: isPracticed, isToday: isToday, isFuture: isFuture))
        }

        // Group into weeks (columns of 7)
        var result: [[DayCell]] = []
        var week: [DayCell] = []
        for day in allDays {
            week.append(day)
            if week.count == 7 {
                result.append(week)
                week = []
            }
        }
        if !week.isEmpty { result.append(week) }
        return result
    }

    var body: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: SLSpacing.s1) {
                    Text("Practice Heatmap")
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                    Text("Last 52 weeks")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: SLSpacing.s1) {
                    HStack(spacing: SLSpacing.s1) {
                        Image(systemName: "flame.fill")
                            .foregroundColor(.sunsetAmber)
                            .font(.system(size: 14))
                        Text("\(currentStreak) day streak")
                            .font(.slXS)
                            .foregroundColor(.sunsetAmber)
                    }
                    Text("Best: \(longestStreak) days")
                        .font(.system(size: 10))
                        .foregroundColor(.textTertiary)
                }
            }

            // Day labels
            HStack(spacing: 0) {
                VStack(alignment: .leading, spacing: cellSpacing) {
                    ForEach(["S", "M", "T", "W", "T", "F", "S"], id: \.self) { label in
                        Text(label)
                            .font(.system(size: 8))
                            .foregroundColor(.textTertiary)
                            .frame(width: 14, height: cellSize)
                    }
                }

                ScrollView(.horizontal, showsIndicators: false) {
                    ScrollViewReader { proxy in
                        HStack(spacing: cellSpacing) {
                            ForEach(Array(weeks.enumerated()), id: \.offset) { weekIndex, week in
                                VStack(spacing: cellSpacing) {
                                    ForEach(week, id: \.date) { day in
                                        heatmapCell(day)
                                    }
                                    // Pad incomplete weeks
                                    if week.count < 7 {
                                        ForEach(0..<(7 - week.count), id: \.self) { _ in
                                            Color.clear
                                                .frame(width: cellSize, height: cellSize)
                                        }
                                    }
                                }
                                .id(weekIndex)
                            }
                        }
                        .onAppear {
                            // Scroll to current week
                            proxy.scrollTo(weeks.count - 1, anchor: .trailing)
                        }
                    }
                }
            }

            // Legend
            HStack(spacing: SLSpacing.s3) {
                Text("Less")
                    .font(.system(size: 9))
                    .foregroundColor(.textTertiary)
                HStack(spacing: 2) {
                    legendSquare(color: .elevation1)
                    legendSquare(color: .fluencyGreen.opacity(0.3))
                    legendSquare(color: .fluencyGreen.opacity(0.6))
                    legendSquare(color: .fluencyGreen)
                }
                Text("More")
                    .font(.system(size: 9))
                    .foregroundColor(.textTertiary)

                Spacer()

                Text("\(practiceDates.count) days practiced")
                    .font(.system(size: 10))
                    .foregroundColor(.textSecondary)
            }
        }
        .slCard()
    }

    @ViewBuilder
    private func heatmapCell(_ day: DayCell) -> some View {
        if day.isFuture {
            Color.clear
                .frame(width: cellSize, height: cellSize)
        } else {
            RoundedRectangle(cornerRadius: 2)
                .fill(day.practiced ? Color.fluencyGreen : Color.elevation2)
                .frame(width: cellSize, height: cellSize)
                .overlay(
                    day.isToday
                        ? RoundedRectangle(cornerRadius: 2)
                            .stroke(Color.clarityTeal, lineWidth: 1.5)
                        : nil
                )
        }
    }

    private func legendSquare(color: Color) -> some View {
        RoundedRectangle(cornerRadius: 2)
            .fill(color)
            .frame(width: 10, height: 10)
    }
}

// MARK: - Day Cell

struct DayCell {
    let date: Date
    let practiced: Bool
    let isToday: Bool
    let isFuture: Bool
}
