import SwiftUI

// MARK: - Real World Mission View

struct RealWorldMissionView: View {
    let mission: RealWorldMission
    let onAccept: () -> Void
    let onSkip: () -> Void

    @State private var appear = false

    var body: some View {
        VStack(spacing: SLSpacing.s8) {
            Spacer()

            // Icon
            Image(systemName: "flag.checkered")
                .font(.system(size: 64))
                .foregroundColor(.sunsetAmber)
                .scaleEffect(appear ? 1 : 0.5)
                .opacity(appear ? 1 : 0)
                .animation(.spring(response: 0.6, dampingFraction: 0.7), value: appear)

            // Title
            Text("Real World Mission")
                .font(.sl2XL)
                .foregroundColor(.textPrimary)
                .opacity(appear ? 1 : 0)
                .animation(.easeIn(duration: 0.4).delay(0.2), value: appear)

            // Description
            VStack(spacing: SLSpacing.s3) {
                Text(mission.description)
                    .font(.slLG)
                    .foregroundColor(.textPrimary)
                    .multilineTextAlignment(.center)

                Text("Technique: \(mission.technique)")
                    .font(.slSM)
                    .foregroundColor(.clarityTeal)

                Text("+\(mission.bonusXP) Bonus XP")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.sunsetAmber)
            }
            .padding(.horizontal, SLSpacing.s6)
            .slCardAccent(.sunsetAmber)
            .padding(.horizontal, SLSpacing.s4)
            .opacity(appear ? 1 : 0)
            .animation(.easeIn(duration: 0.4).delay(0.4), value: appear)

            Spacer()

            // Buttons
            VStack(spacing: SLSpacing.s3) {
                Button(action: onAccept) {
                    Text("Challenge Accepted")
                }
                .buttonStyle(SLPrimaryButtonStyle(color: .sunsetAmber))
                .slHaptic(.heavy)

                Button(action: onSkip) {
                    Text("Skip for Today")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                }
            }
            .padding(.horizontal, SLSpacing.s4)
            .padding(.bottom, SLSpacing.s8)
            .opacity(appear ? 1 : 0)
            .animation(.easeIn(duration: 0.4).delay(0.6), value: appear)
        }
        .background(Color.obsidianNight.ignoresSafeArea())
        .onAppear { appear = true }
    }
}
