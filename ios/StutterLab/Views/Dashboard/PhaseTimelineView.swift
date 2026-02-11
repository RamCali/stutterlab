import SwiftUI

// MARK: - Phase Timeline (5-segment proportional bar)

struct PhaseTimelineView: View {
    let currentDay: Int

    // Phase day ranges: 14, 16, 20, 20, 20 out of 90
    private let phaseWidths: [Double] = [14, 16, 20, 20, 20]
    private let totalDays: Double = 90

    private var currentPhase: Int { PhaseInfo.phase(for: currentDay) }

    var body: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            HStack {
                Text("Phase Progress")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                Spacer()
                Text("Day \(currentDay) of 90")
                    .font(.slXS)
                    .foregroundColor(.textSecondary)
            }

            GeometryReader { geo in
                HStack(spacing: 2) {
                    ForEach(1...5, id: \.self) { phase in
                        let width = geo.size.width * (phaseWidths[phase - 1] / totalDays) - 2
                        phaseSegment(phase: phase, width: max(width, 0))
                    }
                }
            }
            .frame(height: 10)

            // Phase labels
            HStack(spacing: 2) {
                ForEach(1...5, id: \.self) { phase in
                    Text(PhaseInfo.labels[phase] ?? "")
                        .font(.system(size: 9, weight: phase == currentPhase ? .bold : .regular))
                        .foregroundColor(phase == currentPhase ? .clarityTeal : .textTertiary)
                        .lineLimit(1)
                        .frame(maxWidth: .infinity)
                }
            }
        }
        .slCard()
    }

    private func phaseSegment(phase: Int, width: CGFloat) -> some View {
        let range = PhaseInfo.ranges[phase]!
        let fillPercent: Double = {
            if currentDay >= range.upperBound { return 1.0 }
            if currentDay < range.lowerBound { return 0.0 }
            return Double(currentDay - range.lowerBound + 1) / Double(range.count)
        }()

        return ZStack(alignment: .leading) {
            RoundedRectangle(cornerRadius: 3)
                .fill(Color.elevation2)
                .frame(width: width, height: 10)
            RoundedRectangle(cornerRadius: 3)
                .fill(
                    phase == currentPhase
                        ? LinearGradient(colors: [.clarityTeal, .fluencyGreen], startPoint: .leading, endPoint: .trailing)
                        : LinearGradient(colors: [.clarityTeal.opacity(0.6), .clarityTeal.opacity(0.4)], startPoint: .leading, endPoint: .trailing)
                )
                .frame(width: width * fillPercent, height: 10)
                .animation(.spring(response: 0.6), value: fillPercent)
        }
    }
}
