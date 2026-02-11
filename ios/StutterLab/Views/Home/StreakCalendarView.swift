import SwiftUI

// MARK: - Streak Calendar View (Heatmap)

struct StreakCalendarView: View {
    let practiceDates: Set<Date>
    let currentStreak: Int

    private let calendar = Calendar.current
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 4), count: 7)

    var body: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            HStack {
                Text("Practice Calendar")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                Spacer()
                HStack(spacing: SLSpacing.s1) {
                    Image(systemName: "flame.fill")
                        .foregroundColor(.sunsetAmber)
                        .font(.system(size: 14))
                    Text("\(currentStreak) day streak")
                        .font(.slXS)
                        .foregroundColor(.sunsetAmber)
                }
            }

            // Day labels
            HStack(spacing: 4) {
                ForEach(["S", "M", "T", "W", "T", "F", "S"], id: \.self) { day in
                    Text(day)
                        .font(.system(size: 10))
                        .foregroundColor(.textTertiary)
                        .frame(maxWidth: .infinity)
                }
            }

            // Calendar grid (last 35 days)
            LazyVGrid(columns: columns, spacing: 4) {
                ForEach(last35Days(), id: \.self) { date in
                    let isPracticed = practiceDates.contains(calendar.startOfDay(for: date))
                    let isToday = calendar.isDateInToday(date)

                    RoundedRectangle(cornerRadius: 3)
                        .fill(
                            isPracticed
                                ? Color.fluencyGreen
                                : (isToday ? Color.clarityTeal.opacity(0.3) : Color.elevation1)
                        )
                        .frame(height: 20)
                        .overlay(
                            isToday
                                ? RoundedRectangle(cornerRadius: 3)
                                    .stroke(Color.clarityTeal, lineWidth: 1)
                                : nil
                        )
                }
            }
        }
        .slCard()
    }

    private func last35Days() -> [Date] {
        let today = calendar.startOfDay(for: Date())
        let weekday = calendar.component(.weekday, from: today) - 1 // 0=Sun
        let startOffset = -(28 + weekday) // 4 full weeks + current week offset
        return (startOffset...0).compactMap { offset in
            calendar.date(byAdding: .day, value: offset, to: today)
        }.suffix(35).map { $0 }
    }
}
