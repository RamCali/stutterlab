import SwiftUI

// MARK: - Box Breathing View

struct BoxBreathingView: View {
    @StateObject private var viewModel = PanicViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            // Dimmed background
            Color.obsidianNight.opacity(0.95).ignoresSafeArea()

            if viewModel.showGentleOnset {
                gentleOnsetOffer
            } else if viewModel.isActive {
                breathingContent
            } else {
                startContent
            }
        }
    }

    // MARK: - Start

    private var startContent: some View {
        VStack(spacing: SLSpacing.s8) {
            Spacer()

            Image(systemName: "heart.fill")
                .font(.system(size: 48))
                .foregroundColor(.clarityTeal)

            Text("Take a Moment")
                .font(.sl2XL)
                .foregroundColor(.textPrimary)

            Text("Box breathing helps calm your nervous system.\n4 seconds each: breathe in, hold, breathe out, rest.")
                .font(.slBase)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, SLSpacing.s8)

            Spacer()

            Button(action: { viewModel.start() }) {
                Text("Begin Breathing")
                    .font(.slBase)
                    .fontWeight(.semibold)
                    .foregroundColor(.obsidianNight)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, SLSpacing.s3)
                    .background(Color.clarityTeal)
                    .cornerRadius(SLRadius.md)
            }
            .padding(.horizontal, SLSpacing.s4)

            Button("Dismiss") { dismiss() }
                .font(.slSM)
                .foregroundColor(.textSecondary)
                .padding(.bottom, SLSpacing.s8)
        }
    }

    // MARK: - Breathing

    private var breathingContent: some View {
        VStack(spacing: SLSpacing.s8) {
            // Dismiss button
            HStack {
                Button(action: {
                    viewModel.stop()
                    dismiss()
                }) {
                    Image(systemName: "xmark")
                        .foregroundColor(.textSecondary)
                        .padding(SLSpacing.s4)
                }
                Spacer()
                Text("Cycle \(viewModel.cycleCount + 1) of \(viewModel.totalCycles)")
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
                    .padding(.trailing, SLSpacing.s4)
            }

            Spacer()

            // Pulsing circle
            ZStack {
                // Outer ring
                Circle()
                    .stroke(Color.clarityTeal.opacity(0.2), lineWidth: 4)
                    .frame(width: 220, height: 220)

                // Animated circle
                Circle()
                    .fill(Color.clarityTeal.opacity(circleOpacity))
                    .frame(width: circleSize, height: circleSize)
                    .animation(.easeInOut(duration: viewModel.currentPhase.duration), value: viewModel.progress)

                // Phase text
                VStack(spacing: SLSpacing.s2) {
                    Text(viewModel.currentPhase.rawValue)
                        .font(.slXL)
                        .foregroundColor(.textPrimary)

                    Text(secondsRemaining)
                        .font(.system(size: 40, weight: .bold, design: .monospaced))
                        .foregroundColor(.clarityTeal)
                }
            }

            // Calming copy
            Text("You're doing great. Let's reset.")
                .font(.system(size: 14, weight: .light, design: .serif))
                .italic()
                .foregroundColor(.textSecondary)

            Spacer()
        }
    }

    // MARK: - Gentle Onset Offer

    private var gentleOnsetOffer: some View {
        VStack(spacing: SLSpacing.s8) {
            Spacer()

            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 64))
                .foregroundColor(.fluencyGreen)

            Text("Nice work.")
                .font(.sl2XL)
                .foregroundColor(.textPrimary)

            Text("Feeling calmer? Try a quick gentle onset exercise.")
                .font(.slBase)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, SLSpacing.s8)

            Spacer()

            VStack(spacing: SLSpacing.s3) {
                Button(action: {
                    // TODO: Navigate to gentle onset exercise
                    dismiss()
                }) {
                    Text("Gentle Onset Quick Practice")
                        .font(.slBase)
                        .fontWeight(.semibold)
                        .foregroundColor(.obsidianNight)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, SLSpacing.s3)
                        .background(Color.clarityTeal)
                        .cornerRadius(SLRadius.md)
                }

                Button("I'm Good, Thanks") {
                    viewModel.stop()
                    dismiss()
                }
                .font(.slSM)
                .foregroundColor(.textSecondary)
            }
            .padding(.horizontal, SLSpacing.s4)
            .padding(.bottom, SLSpacing.s8)
        }
    }

    // MARK: - Helpers

    private var circleSize: CGFloat {
        switch viewModel.currentPhase {
        case .inhale:
            return 100 + CGFloat(viewModel.progress) * 100 // grows 100→200
        case .holdIn:
            return 200 // stays expanded
        case .exhale:
            return 200 - CGFloat(viewModel.progress) * 100 // shrinks 200→100
        case .holdOut:
            return 100 // stays contracted
        }
    }

    private var circleOpacity: Double {
        switch viewModel.currentPhase {
        case .inhale: return 0.15 + viewModel.progress * 0.15
        case .holdIn: return 0.30
        case .exhale: return 0.30 - viewModel.progress * 0.15
        case .holdOut: return 0.15
        }
    }

    private var secondsRemaining: String {
        let remaining = Int(viewModel.currentPhase.duration * (1 - viewModel.progress))
        return "\(max(remaining, 0))"
    }
}
