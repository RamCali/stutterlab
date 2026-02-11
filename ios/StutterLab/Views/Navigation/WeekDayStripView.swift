import SwiftUI

// MARK: - Week Day Strip (Above Tab Bar)

struct WeekDayStripView: View {
    let currentDay: Int

    private var weekNumber: Int { WeekData.weekForDay(currentDay) }
    private var days: [DayInfo] { WeekData.daysForWeek(weekNumber, currentDay: currentDay) }

    var body: some View {
        VStack(spacing: SLSpacing.s1) {
            Text("Week \(weekNumber) of 13")
                .font(.slXS)
                .foregroundColor(.textTertiary)

            HStack(spacing: 0) {
                ForEach(days) { day in
                    dayPill(day)
                }
            }
        }
        .padding(.vertical, SLSpacing.s2)
        .padding(.horizontal, SLSpacing.s4)
        .background(Color.obsidianNight)
    }

    private func dayPill(_ day: DayInfo) -> some View {
        let dayLabels = ["M", "T", "W", "T", "F", "S", "S"]
        let label = day.dayOfWeek < dayLabels.count ? dayLabels[day.dayOfWeek] : "?"

        return VStack(spacing: 2) {
            Text(label)
                .font(.system(size: 10, weight: day.isCurrent ? .bold : .regular))
                .foregroundColor(day.isCurrent ? .clarityTeal : .textTertiary)

            ZStack {
                if day.isCurrent {
                    Circle()
                        .fill(Color.clarityTeal)
                        .frame(width: 28, height: 28)
                    Text("\(day.dayNumber)")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.obsidianNight)
                } else if day.isCompleted {
                    Circle()
                        .fill(Color.clarityTeal.opacity(0.2))
                        .frame(width: 28, height: 28)
                    Image(systemName: "checkmark")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.clarityTeal)
                } else {
                    Circle()
                        .fill(Color.elevation2)
                        .frame(width: 28, height: 28)
                    Text("\(day.dayNumber)")
                        .font(.system(size: 11))
                        .foregroundColor(.textTertiary.opacity(0.5))
                }
            }
        }
        .frame(maxWidth: .infinity)
    }
}
