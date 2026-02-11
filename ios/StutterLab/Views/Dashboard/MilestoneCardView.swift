import SwiftUI

// MARK: - Next Milestone Card

struct MilestoneCardView: View {
    let currentDay: Int

    private var milestone: MilestoneInfo? {
        WeekData.nextMilestone(currentDay: currentDay)
    }

    var body: some View {
        if currentDay > 90 {
            completedView
        } else if let m = milestone {
            VStack(alignment: .leading, spacing: SLSpacing.s3) {
                HStack {
                    Image(systemName: "flag.fill")
                        .foregroundColor(.sunsetAmber)
                    Text("Next Milestone")
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                    Spacer()
                    Text("\(m.daysUntil) day\(m.daysUntil == 1 ? "" : "s") away")
                        .font(.slXS)
                        .fontWeight(.medium)
                        .foregroundColor(.sunsetAmber)
                        .padding(.horizontal, SLSpacing.s2)
                        .padding(.vertical, 4)
                        .background(Color.sunsetAmber.opacity(0.15))
                        .cornerRadius(SLRadius.full)
                }

                Text(m.label)
                    .font(.slBase)
                    .foregroundColor(.textPrimary)
            }
            .slCardAccent(.sunsetAmber)
        }
    }

    private var completedView: some View {
        VStack(spacing: SLSpacing.s3) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 32))
                .foregroundColor(.fluencyGreen)
            Text("Program Complete!")
                .font(.slLG)
                .foregroundColor(.textPrimary)
            Text("You've finished the 90-day program. Keep practicing in maintenance mode.")
                .font(.slSM)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
        }
        .slCardAccent(.fluencyGreen)
    }
}
