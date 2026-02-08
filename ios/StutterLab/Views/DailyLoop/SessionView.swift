import SwiftUI

// MARK: - Session View (Guided Exercise Flow)

struct SessionView: View {
    @ObservedObject var viewModel: DailyLoopViewModel
    @EnvironmentObject var appViewModel: AppViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var showConfidenceRating = true // Before session

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            if showConfidenceRating {
                confidenceRatingView(isBefore: true)
            } else if viewModel.showMission {
                RealWorldMissionView(
                    mission: viewModel.currentPlan?.realWorldMission ?? RealWorldMission.mission(for: 1, phase: 1),
                    onAccept: {
                        viewModel.completeMission()
                        finishAndDismiss()
                    },
                    onSkip: {
                        viewModel.skipMission()
                        finishAndDismiss()
                    }
                )
            } else if viewModel.showPhaseUnlock {
                PhaseUnlockView(
                    phase: (viewModel.phaseInfo?.phase ?? 1) + 1,
                    phaseLabel: PhaseInfo.labels[min((viewModel.phaseInfo?.phase ?? 1) + 1, 5)] ?? "",
                    onContinue: {
                        viewModel.showPhaseUnlock = false
                        dismiss()
                    }
                )
            } else if let task = viewModel.currentTask {
                exerciseFlowView(task: task)
            } else {
                // Post-session confidence
                confidenceRatingView(isBefore: false)
            }
        }
    }

    // MARK: - Exercise Flow

    private func exerciseFlowView(task: DailyTask) -> some View {
        VStack(spacing: SLSpacing.s6) {
            // Progress bar
            HStack(spacing: SLSpacing.s2) {
                Button(action: { dismiss() }) {
                    Image(systemName: "xmark")
                        .foregroundColor(.textSecondary)
                }
                ProgressView(value: viewModel.progressFraction)
                    .tint(.clarityTeal)
                Text("\(viewModel.currentTaskIndex + 1)/\(viewModel.currentPlan?.tasks.count ?? 0)")
                    .font(.slXS)
                    .foregroundColor(.textSecondary)
            }
            .padding(.horizontal, SLSpacing.s4)

            Spacer()

            // Task icon
            Image(systemName: task.icon)
                .font(.system(size: 48))
                .foregroundColor(.clarityTeal)

            // Task info
            VStack(spacing: SLSpacing.s2) {
                Text(task.title)
                    .font(.slXL)
                    .foregroundColor(.textPrimary)
                    .multilineTextAlignment(.center)

                Text(task.subtitle)
                    .font(.slBase)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)

                Text(task.duration)
                    .font(.slSM)
                    .foregroundColor(.sunsetAmber)
                    .padding(.top, SLSpacing.s1)
            }
            .padding(.horizontal, SLSpacing.s8)

            Spacer()

            // Timer View
            TimerView(
                durationString: task.duration,
                onComplete: {
                    viewModel.completeCurrentTask()
                }
            )

            Spacer()
        }
    }

    // MARK: - Confidence Rating

    private func confidenceRatingView(isBefore: Bool) -> some View {
        VStack(spacing: SLSpacing.s8) {
            Spacer()

            Text(isBefore ? "How confident do you feel?" : "How confident do you feel now?")
                .font(.slXL)
                .foregroundColor(.textPrimary)
                .multilineTextAlignment(.center)

            Text(isBefore ? "Before your session" : "After your session")
                .font(.slSM)
                .foregroundColor(.textSecondary)

            // Rating slider
            VStack(spacing: SLSpacing.s3) {
                Text("\(isBefore ? viewModel.confidenceBefore : viewModel.confidenceAfter)")
                    .font(.sl3XL)
                    .foregroundColor(.sunsetAmber)

                Slider(
                    value: Binding(
                        get: {
                            Double(isBefore ? viewModel.confidenceBefore : viewModel.confidenceAfter)
                        },
                        set: {
                            if isBefore {
                                viewModel.confidenceBefore = Int($0)
                            } else {
                                viewModel.confidenceAfter = Int($0)
                            }
                        }
                    ),
                    in: 1...10,
                    step: 1
                )
                .tint(.clarityTeal)
                .padding(.horizontal, SLSpacing.s8)

                HStack {
                    Text("Not confident")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                    Spacer()
                    Text("Very confident")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
                .padding(.horizontal, SLSpacing.s8)
            }

            Spacer()

            Button(action: {
                if isBefore {
                    showConfidenceRating = false
                } else {
                    finishAndDismiss()
                }
            }) {
                Text("Continue")
                    .font(.slBase)
                    .fontWeight(.semibold)
                    .foregroundColor(.obsidianNight)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, SLSpacing.s3)
                    .background(Color.clarityTeal)
                    .cornerRadius(SLRadius.md)
            }
            .padding(.horizontal, SLSpacing.s4)
            .padding(.bottom, SLSpacing.s8)
        }
    }

    // MARK: - Finish

    private func finishAndDismiss() {
        Task {
            await appViewModel.updateStreak()
            await appViewModel.advanceDay()
            await appViewModel.addXP(viewModel.session?.xpEarned ?? 10)
            await viewModel.saveSession(userId: appViewModel.userProfile?.id ?? "")
        }
        dismiss()
    }
}
