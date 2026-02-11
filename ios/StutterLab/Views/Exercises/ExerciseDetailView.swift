import SwiftUI

// MARK: - Exercise Detail View

struct ExerciseDetailView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    let exercise: Exercise
    @State private var showPractice = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: SLSpacing.s6) {
                        // Header
                        headerSection

                        // Evidence
                        evidenceSection

                        // Description
                        descriptionSection

                        // Instructions
                        instructionsSection

                        // Start Practice Button
                        startButton
                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100)
                }
            }
            .navigationTitle(exercise.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") { dismiss() }
                        .foregroundColor(.clarityTeal)
                }
            }
            .fullScreenCover(isPresented: $showPractice) {
                ExerciseTimerView(exercise: exercise)
                    .environmentObject(appViewModel)
            }
        }
    }

    // MARK: - Sections

    private var headerSection: some View {
        HStack(spacing: SLSpacing.s4) {
            Image(systemName: exercise.type.icon)
                .font(.system(size: 36))
                .foregroundColor(.clarityTeal)
                .frame(width: 64, height: 64)
                .background(Color.clarityTeal.opacity(0.1))
                .cornerRadius(SLRadius.lg)

            VStack(alignment: .leading, spacing: SLSpacing.s1) {
                Text(exercise.title)
                    .font(.slXL)
                    .foregroundColor(.textPrimary)
                Text(exercise.technique)
                    .font(.slSM)
                    .foregroundColor(.clarityTeal)

                HStack(spacing: SLSpacing.s2) {
                    Text(exercise.difficulty.rawValue.capitalized)
                        .font(.slXS)
                        .foregroundColor(.textSecondary)
                    if let dur = exercise.durationSeconds {
                        Text("\(dur / 60) min")
                            .font(.slXS)
                            .foregroundColor(.textSecondary)
                    }
                    if exercise.isPremium {
                        Text("PREMIUM")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.sunsetAmber)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 1)
                            .background(Color.sunsetAmber.opacity(0.15))
                            .cornerRadius(3)
                    }
                }
            }
        }
    }

    private var evidenceSection: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s2) {
            EvidenceBadge(level: exercise.evidenceLevel, effectSize: exercise.effectSize, citation: exercise.citation)
        }
    }

    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s2) {
            Text("About")
                .font(.slSM)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)
            Text(exercise.description)
                .font(.slBase)
                .foregroundColor(.textSecondary)
        }
    }

    private var instructionsSection: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s2) {
            Text("Instructions")
                .font(.slSM)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)
            Text(exercise.instructions)
                .font(.slBase)
                .foregroundColor(.textSecondary)
                .lineLimit(nil)
        }
        .slCard()
    }

    private var startButton: some View {
        Button(action: { showPractice = true }) {
            HStack {
                Image(systemName: "play.fill")
                Text("Start Practice")
            }
        }
        .buttonStyle(SLPrimaryButtonStyle())
    }
}

// MARK: - Exercise Timer View (Standalone Practice)

struct ExerciseTimerView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    let exercise: Exercise
    @Environment(\.dismiss) private var dismiss
    @State private var timeRemaining: Int = 0
    @State private var totalSeconds: Int = 0
    @State private var isRunning = false
    @State private var timer: Timer?
    @State private var showReport = false
    @State private var analysisResult: SpeechAnalysisResult?

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            VStack(spacing: SLSpacing.s6) {
                // Close button
                HStack {
                    Button(action: { stopAndDismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.textTertiary)
                    }
                    Spacer()
                }
                .padding(.horizontal, SLSpacing.s4)

                Spacer()

                // Exercise info
                Text(exercise.title)
                    .font(.slXL)
                    .foregroundColor(.textPrimary)
                Text(exercise.instructions)
                    .font(.slSM)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, SLSpacing.s6)

                Spacer()

                // Timer ring
                ZStack {
                    Circle()
                        .stroke(Color.elevation2, lineWidth: 8)
                        .frame(width: 180, height: 180)

                    if totalSeconds > 0 {
                        Circle()
                            .trim(from: 0, to: Double(totalSeconds - timeRemaining) / Double(totalSeconds))
                            .stroke(Color.clarityTeal, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                            .frame(width: 180, height: 180)
                            .rotationEffect(.degrees(-90))
                            .animation(.linear(duration: 1), value: timeRemaining)
                    }

                    VStack {
                        Text(timerText)
                            .font(.system(size: 48, weight: .bold, design: .rounded))
                            .foregroundColor(.textPrimary)
                        Text(isRunning ? "Tap to pause" : "Tap to start")
                            .font(.slXS)
                            .foregroundColor(.textTertiary)
                    }
                }
                .onTapGesture { toggleTimer() }

                Spacer()

                // Actions
                HStack(spacing: SLSpacing.s4) {
                    Button("Skip") {
                        completeExercise()
                    }
                    .font(.slSM)
                    .foregroundColor(.textSecondary)

                    if timeRemaining == 0 && isRunning == false && totalSeconds > 0 {
                        Button(action: { completeExercise() }) {
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                Text("Done")
                                    .fontWeight(.semibold)
                            }
                            .font(.slBase)
                            .foregroundColor(.obsidianNight)
                            .padding(.horizontal, SLSpacing.s8)
                            .padding(.vertical, SLSpacing.s3)
                            .background(Color.clarityTeal)
                            .cornerRadius(SLRadius.lg)
                        }
                    }
                }
                .padding(.bottom, SLSpacing.s8)
            }
        }
        .onAppear {
            let secs = exercise.durationSeconds ?? 300
            totalSeconds = secs
            timeRemaining = secs
        }
        .fullScreenCover(isPresented: $showReport) {
            PerformanceReportView(
                analysisResult: analysisResult,
                xpEarned: 15,
                exercisesCompleted: 1,
                confidenceBefore: 5,
                confidenceAfter: 5,
                onDismiss: { dismiss() }
            )
        }
    }

    private var timerText: String {
        let minutes = timeRemaining / 60
        let seconds = timeRemaining % 60
        return String(format: "%d:%02d", minutes, seconds)
    }

    private func toggleTimer() {
        if isRunning {
            timer?.invalidate()
            isRunning = false
        } else {
            isRunning = true
            timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
                if timeRemaining > 0 {
                    timeRemaining -= 1
                } else {
                    timer?.invalidate()
                    isRunning = false
                }
            }
        }
    }

    private func completeExercise() {
        timer?.invalidate()
        isRunning = false
        // Award XP
        Task {
            await appViewModel.addXP(15)
        }
        showReport = true
    }

    private func stopAndDismiss() {
        timer?.invalidate()
        dismiss()
    }
}
