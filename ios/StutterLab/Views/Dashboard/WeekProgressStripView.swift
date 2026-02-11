import SwiftUI

// MARK: - Week Progress Strip (Dashboard Card)

struct WeekProgressStripView: View {
    let currentDay: Int

    private var weekNumber: Int { WeekData.weekForDay(currentDay) }
    private var days: [DayInfo] { WeekData.daysForWeek(weekNumber, currentDay: currentDay) }
    private var weekInfo: WeekInfo { WeekData.weekInfo(weekNumber) }

    var body: some View {
        VStack(spacing: SLSpacing.s3) {
            HStack {
                Text("Week \(weekNumber) of 13")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                Spacer()
                Text(weekInfo.title)
                    .font(.slXS)
                    .foregroundColor(.textSecondary)
            }

            HStack(spacing: SLSpacing.s2) {
                ForEach(days) { day in
                    dayCircle(day)
                }
            }
        }
        .slCard()
    }

    private func dayCircle(_ day: DayInfo) -> some View {
        let dayLabels = ["M", "T", "W", "T", "F", "S", "S"]
        let label = day.dayOfWeek < dayLabels.count ? dayLabels[day.dayOfWeek] : "?"

        return VStack(spacing: SLSpacing.s1) {
            ZStack {
                if day.isCurrent {
                    Circle()
                        .stroke(Color.clarityTeal, lineWidth: 2)
                        .frame(width: 38, height: 38)
                    Circle()
                        .fill(Color.clarityTeal)
                        .frame(width: 32, height: 32)
                    Text("\(day.dayNumber)")
                        .font(.slXS)
                        .fontWeight(.bold)
                        .foregroundColor(.obsidianNight)
                } else if day.isCompleted {
                    Circle()
                        .fill(Color.clarityTeal.opacity(0.2))
                        .frame(width: 36, height: 36)
                    Image(systemName: "checkmark")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.clarityTeal)
                } else {
                    Circle()
                        .fill(Color.elevation2)
                        .frame(width: 36, height: 36)
                    Text("\(day.dayNumber)")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
            }
            .frame(width: 38, height: 38)

            Text(label)
                .font(.system(size: 10, weight: day.isCurrent ? .bold : .regular))
                .foregroundColor(day.isCurrent ? .clarityTeal : .textTertiary)
        }
        .frame(maxWidth: .infinity)
    }
}
