import SwiftUI

// MARK: - Input Level Meter

struct InputLevelMeter: View {
    let level: Float
    let isRunning: Bool

    private var normalizedLevel: Double {
        // Map RMS (0...0.3) to display (0...1)
        Double(min(level / 0.15, 1.0))
    }

    private var levelColor: Color {
        if normalizedLevel > 0.8 { return .sunsetAmber }
        if normalizedLevel > 0.5 { return .fluencyGreen }
        return .clarityTeal
    }

    var body: some View {
        VStack(spacing: SLSpacing.s2) {
            HStack(spacing: SLSpacing.s2) {
                Image(systemName: "mic.fill")
                    .font(.system(size: 14))
                    .foregroundColor(isRunning ? .clarityTeal : .textTertiary)
                Text("Input Level")
                    .font(.slXS)
                    .foregroundColor(.textSecondary)
                Spacer()
                if isRunning {
                    Text("\(Int(normalizedLevel * 100))%")
                        .font(.slXS)
                        .fontWeight(.medium)
                        .foregroundColor(levelColor)
                }
            }

            // Level bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Background
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.elevation1)
                        .frame(height: 8)

                    // Level fill
                    RoundedRectangle(cornerRadius: 4)
                        .fill(
                            LinearGradient(
                                colors: [.clarityTeal, .fluencyGreen, .sunsetAmber],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(
                            width: isRunning ? geometry.size.width * normalizedLevel : 0,
                            height: 8
                        )
                        .animation(.linear(duration: 0.05), value: normalizedLevel)
                }
            }
            .frame(height: 8)
        }
        .slCard(padding: SLSpacing.s3)
    }
}
