import SwiftUI

// MARK: - Session View (Guided Exercise Flow)

struct SessionView: View {
    @ObservedObject var viewModel: DailyLoopViewModel
    @EnvironmentObject var appViewModel: AppViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var showConfidenceRating = true // Before session
    @State private var showSkipConfirmation = false

    private var currentDay: Int { appViewModel.userProfile?.currentDay ?? 1 }

    var body: some View {
        ZStack {
            Color.sessionGradient.ignoresSafeArea()

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
        VStack(spacing: 0) {
            // Progress bar + close
            HStack(spacing: SLSpacing.s2) {
                Button(action: { dismiss() }) {
                    Image(systemName: "xmark")
                        .foregroundColor(.textSecondary)
                }
                ProgressView(value: viewModel.progressFraction)
                    .tint(.fluencyGreen)
                Text("\(viewModel.currentTaskIndex + 1)/\(viewModel.currentPlan?.tasks.count ?? 0)")
                    .font(.slXS)
                    .foregroundColor(.textSecondary)
            }
            .padding(.horizontal, SLSpacing.s4)
            .padding(.top, SLSpacing.s2)

            // Stepper bar (Breathe → Practice → Speak → Reflect)
            SessionStepperView(
                currentTaskType: task.type,
                completedTaskTypes: completedTaskTypes
            )

            // Day + title header
            VStack(spacing: 2) {
                Text("Day \(currentDay)")
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
                Text(task.title)
                    .font(.slLG)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
            }
            .padding(.bottom, SLSpacing.s2)

            // Task-specific content
            taskContent(task: task)

            // Skip button
            Button(action: { showSkipConfirmation = true }) {
                Text("Skip this step")
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
            }
            .padding(.bottom, SLSpacing.s4)
        }
        .alert("Are you sure?", isPresented: $showSkipConfirmation) {
            Button("Skip anyway", role: .destructive) {
                viewModel.completeCurrentTask()
            }
            Button("Keep going", role: .cancel) {}
        } message: {
            Text(skipMessage(for: task.type))
        }
    }

    /// Clinical stat nudge per task type
    private func skipMessage(for type: TaskType) -> String {
        switch type {
        case .warmup, .mindfulness:
            return "Controlled breathing reduces stuttering frequency by up to 60% in clinical studies. Even one cycle can calm your nervous system before speaking."
        case .exercise:
            return "Regular reading practice builds fluency automaticity. Studies show patients who practice daily are 74% more likely to show lasting improvement."
        case .journal:
            return "Self-reflection helps 68% of therapy participants maintain long-term fluency gains. A quick 30-second recording still counts."
        case .ai, .challenge:
            return "Conversational practice is the #1 predictor of real-world fluency transfer. Even brief practice strengthens neural pathways."
        default:
            return "Consistent daily practice is the strongest predictor of lasting fluency improvement. Every step counts."
        }
    }

    // MARK: - Task-Specific Content

    @ViewBuilder
    private func taskContent(task: DailyTask) -> some View {
        switch task.type {
        case .warmup, .mindfulness:
            embeddedBreathingView(task: task)
        case .exercise:
            embeddedWordPractice(task: task)
        case .journal:
            embeddedJournal()
        case .ai:
            embeddedAIView(task: task)
        default:
            // Generic timer fallback for learn, challenge, fearedWords, audioLab
            genericTimerView(task: task)
        }
    }

    // MARK: - Embedded Breathing

    private func embeddedBreathingView(task: DailyTask) -> some View {
        let phase = PhaseInfo.phase(for: currentDay)
        let pattern: BreathingPattern = {
            switch phase {
            case 1, 2:
                return BreathingPattern.catalog.first { $0.id == "diaphragmatic" } ?? BreathingPattern.catalog[0]
            case 3, 4:
                return BreathingPattern.catalog.first { $0.id == "box" } ?? BreathingPattern.catalog[0]
            default:
                return BreathingPattern.catalog.first { $0.id == "4-7-8" } ?? BreathingPattern.catalog[0]
            }
        }()

        return InlineBreathingView(pattern: pattern) {
            viewModel.completeCurrentTask()
        }
    }

    // MARK: - Embedded Word Practice

    private func embeddedWordPractice(task: DailyTask) -> some View {
        let level = ReadingContent.contentLevel(for: currentDay)
        let items = ReadingContent.items(for: level)

        return WordPracticeStepView(
            technique: task.title,
            techniqueTip: task.subtitle,
            items: items,
            onComplete: { viewModel.completeCurrentTask() },
            embedded: true
        )
    }

    // MARK: - Embedded Journal

    private func embeddedJournal() -> some View {
        VoiceJournalView(
            onComplete: { viewModel.completeCurrentTask() },
            embedded: true
        )
    }

    // MARK: - Embedded AI

    private func embeddedAIView(task: DailyTask) -> some View {
        VStack(spacing: SLSpacing.s6) {
            Spacer()

            Image(systemName: "bubble.left.and.text.bubble.right.fill")
                .font(.system(size: 48))
                .foregroundColor(.clarityTeal)

            Text(task.title)
                .font(.slXL)
                .foregroundColor(.textPrimary)
                .multilineTextAlignment(.center)

            Text(task.subtitle)
                .font(.slBase)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, SLSpacing.s8)

            Spacer()

            NavigationLink {
                ScenarioPickerView()
                    .environmentObject(appViewModel)
            } label: {
                HStack(spacing: SLSpacing.s2) {
                    Image(systemName: "mic.fill")
                    Text("Start Voice Conversation")
                }
                .font(.slBase)
                .fontWeight(.semibold)
                .foregroundColor(.obsidianNight)
                .frame(maxWidth: .infinity)
                .padding(.vertical, SLSpacing.s4)
                .background(Color.clarityTeal)
                .cornerRadius(SLRadius.lg)
            }
            .padding(.horizontal, SLSpacing.s6)

            Spacer()
        }
    }

    // MARK: - Generic Timer (fallback)

    private func genericTimerView(task: DailyTask) -> some View {
        VStack(spacing: SLSpacing.s6) {
            Spacer()

            Image(systemName: task.icon)
                .font(.system(size: 48))
                .foregroundColor(.clarityTeal)

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

            TimerView(
                durationString: task.duration,
                onComplete: {
                    viewModel.completeCurrentTask()
                }
            )

            Spacer()
        }
    }

    // MARK: - Helpers

    private var completedTaskTypes: Set<TaskType> {
        guard let plan = viewModel.currentPlan else { return [] }
        var types = Set<TaskType>()
        for i in 0..<viewModel.currentTaskIndex {
            if i < plan.tasks.count {
                types.insert(plan.tasks[i].type)
            }
        }
        return types
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
                        set: { newValue in
                            if isBefore {
                                viewModel.confidenceBefore = Int(newValue)
                            } else {
                                viewModel.confidenceAfter = Int(newValue)
                            }
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
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
            }
            .buttonStyle(SLPrimaryButtonStyle())
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

// MARK: - Inline Breathing View (identical to Quick Calm box path)

/// Uses fixed 4-4-4-4 box breathing (same as BoxBreathingView / Quick Calm).
/// Always smooth — no phase skipping, no variable durations.
private struct InlineBreathingView: View {
    let pattern: BreathingPattern
    let onComplete: () -> Void

    @StateObject private var vm = PanicViewModel()
    @State private var hasStarted = false

    var body: some View {
        VStack(spacing: SLSpacing.s4) {
            if vm.showGentleOnset {
                // Breathing complete
                completionContent
            } else if vm.isActive {
                breathingContent
            } else if hasStarted {
                // Just finished (fallback)
                completionContent
            } else {
                startContent
            }
        }
    }

    // MARK: - Start

    private var startContent: some View {
        VStack(spacing: SLSpacing.s6) {
            Spacer()

            Image(systemName: "square")
                .font(.system(size: 48))
                .foregroundColor(.clarityTeal)

            Text("Box Breathing")
                .font(.slXL)
                .foregroundColor(.textPrimary)

            Text("4 seconds each: breathe in, hold, breathe out, rest.")
                .font(.slSM)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, SLSpacing.s6)

            Text("Pattern: 4-4-4-4 · \(vm.totalCycles) cycles")
                .font(.slXS)
                .foregroundColor(.textTertiary)

            Spacer()

            Button(action: {
                hasStarted = true
                vm.start()
            }) {
                Text("Begin Breathing")
            }
            .buttonStyle(SLPrimaryButtonStyle())
            .padding(.horizontal, SLSpacing.s6)

            Spacer()
        }
    }

    // MARK: - Breathing (Box Path — exact same as BoxBreathingView)

    private var breathingContent: some View {
        let boxSize: CGFloat = 220
        let cr: CGFloat = 32
        let phase = currentPhaseIndex

        return VStack(spacing: SLSpacing.s3) {
            Text("Cycle \(vm.cycleCount + 1) of \(vm.totalCycles)")
                .font(.slXS)
                .foregroundColor(.textSecondary)

            HStack(spacing: SLSpacing.s2) {
                ForEach(0..<vm.totalCycles, id: \.self) { i in
                    RoundedRectangle(cornerRadius: 3)
                        .fill(i <= vm.cycleCount ? Color.clarityTeal : Color.elevation2)
                        .frame(width: 28, height: 6)
                }
            }

            Spacer()

            ZStack {
                boxLabels(boxSize: boxSize, phase: phase)

                RoundedRectangle(cornerRadius: cr)
                    .stroke(Color.textTertiary.opacity(0.2), lineWidth: 3)
                    .frame(width: boxSize, height: boxSize)

                coloredPathSegments(boxSize: boxSize, cr: cr, phase: phase)

                VStack(spacing: SLSpacing.s1) {
                    Text(secondsRemaining)
                        .font(.system(size: 48, weight: .bold, design: .monospaced))
                        .foregroundColor(.clarityTeal)
                    Text(phaseLabels[phase])
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(phaseColors[phase])
                }

                travelingDot(boxSize: boxSize, cr: cr, phase: phase)
            }
            .frame(width: 300, height: 300)

            Spacer()
        }
    }

    // MARK: - Completion

    private var completionContent: some View {
        VStack(spacing: SLSpacing.s4) {
            Spacer()
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 48))
                .foregroundColor(.fluencyGreen)
            Text("Breathing complete")
                .font(.slLG)
                .foregroundColor(.textPrimary)
            Text("\(vm.totalCycles) cycles of Box Breathing")
                .font(.slSM)
                .foregroundColor(.textSecondary)
            Spacer()
            Button(action: {
                vm.stop()
                onComplete()
            }) {
                Text("Continue")
            }
            .buttonStyle(SLPrimaryButtonStyle())
            .padding(.horizontal, SLSpacing.s6)
            Spacer()
        }
    }

    // MARK: - Phase Colors & Labels (matching BoxBreathingView exactly)

    private let phaseColors: [Color] = [
        Color(red: 56 / 255, green: 189 / 255, blue: 248 / 255),   // Inhale  — sky-400
        Color(red: 251 / 255, green: 191 / 255, blue: 36 / 255),   // Hold In — amber-400
        Color(red: 52 / 255, green: 211 / 255, blue: 153 / 255),   // Exhale  — emerald-400
        Color(red: 251 / 255, green: 191 / 255, blue: 36 / 255),   // Hold Out — amber-400
    ]
    private let phaseLabels = ["Breathe In", "Hold", "Breathe Out", "Hold"]

    private var currentPhaseIndex: Int {
        switch vm.currentPhase {
        case .inhale: return 0
        case .holdIn: return 1
        case .exhale: return 2
        case .holdOut: return 3
        }
    }

    private var secondsRemaining: String {
        let remaining = Int(ceil(vm.currentPhase.duration * (1 - vm.progress)))
        return "\(max(remaining, 0))"
    }

    // MARK: - Colored Path Segments

    private func coloredPathSegments(boxSize: CGFloat, cr: CGFloat, phase: Int) -> some View {
        let progress = CGFloat(vm.progress)

        return ZStack {
            ForEach(0..<4, id: \.self) { side in
                if side < phase {
                    InlineBoxPerimeter(cornerRadius: cr)
                        .trim(from: CGFloat(side) * 0.25, to: CGFloat(side + 1) * 0.25)
                        .stroke(phaseColors[side], style: StrokeStyle(lineWidth: 4, lineCap: .round))
                        .shadow(color: phaseColors[side].opacity(0.5), radius: 6)
                        .frame(width: boxSize, height: boxSize)
                } else if side == phase {
                    InlineBoxPerimeter(cornerRadius: cr)
                        .trim(from: CGFloat(side) * 0.25, to: CGFloat(side) * 0.25 + progress * 0.25)
                        .stroke(phaseColors[side], style: StrokeStyle(lineWidth: 4, lineCap: .round))
                        .shadow(color: phaseColors[side].opacity(0.5), radius: 6)
                        .frame(width: boxSize, height: boxSize)
                }
            }
        }
    }

    // MARK: - Corner Labels

    private func boxLabels(boxSize: CGFloat, phase: Int) -> some View {
        ZStack {
            Text("Breathe In")
                .font(.system(size: 13, weight: phase == 0 ? .bold : .regular))
                .foregroundColor(phase == 0 ? phaseColors[0] : .textTertiary.opacity(0.4))
                .offset(y: -(boxSize / 2 + 18))

            Text("Hold")
                .font(.system(size: 13, weight: phase == 1 ? .bold : .regular))
                .foregroundColor(phase == 1 ? phaseColors[1] : .textTertiary.opacity(0.4))
                .rotationEffect(.degrees(90))
                .offset(x: boxSize / 2 + 18)

            Text("Breathe Out")
                .font(.system(size: 13, weight: phase == 2 ? .bold : .regular))
                .foregroundColor(phase == 2 ? phaseColors[2] : .textTertiary.opacity(0.4))
                .offset(y: boxSize / 2 + 18)

            Text("Hold")
                .font(.system(size: 13, weight: phase == 3 ? .bold : .regular))
                .foregroundColor(phase == 3 ? phaseColors[3] : .textTertiary.opacity(0.4))
                .rotationEffect(.degrees(-90))
                .offset(x: -(boxSize / 2 + 18))
        }
        .animation(.easeInOut(duration: 0.3), value: phase)
    }

    // MARK: - Traveling Dot

    private func travelingDot(boxSize: CGFloat, cr: CGFloat, phase: Int) -> some View {
        let half = boxSize / 2
        let prog = CGFloat(vm.progress)
        let color = phaseColors[phase]
        let pos = perimeterPoint(side: phase, progress: prog, half: half, cr: cr)

        return ZStack {
            Circle()
                .fill(color.opacity(0.3))
                .frame(width: 30, height: 30)
                .blur(radius: 5)
            Circle()
                .fill(color)
                .frame(width: 18, height: 18)
            Circle()
                .fill(Color.white.opacity(0.5))
                .frame(width: 7, height: 7)
        }
        .offset(x: pos.x, y: pos.y)
    }

    // MARK: - Perimeter Point (identical to BoxBreathingView)

    private func perimeterPoint(side: Int, progress p: CGFloat, half: CGFloat, cr: CGFloat) -> CGPoint {
        let straight = 2 * half - 2 * cr
        let arcLen = CGFloat.pi / 2 * cr
        let sideLen = straight + arcLen
        let straightFrac = straight / sideLen

        switch side {
        case 0:
            if p <= straightFrac {
                let t = p / straightFrac
                return CGPoint(x: -half + cr + t * straight, y: -half)
            } else {
                let t = (p - straightFrac) / (1 - straightFrac)
                let angle = -CGFloat.pi / 2 + t * CGFloat.pi / 2
                return CGPoint(x: half - cr + cr * cos(angle), y: -half + cr + cr * sin(angle))
            }
        case 1:
            if p <= straightFrac {
                let t = p / straightFrac
                return CGPoint(x: half, y: -half + cr + t * straight)
            } else {
                let t = (p - straightFrac) / (1 - straightFrac)
                let angle = t * CGFloat.pi / 2
                return CGPoint(x: half - cr + cr * cos(angle), y: half - cr + cr * sin(angle))
            }
        case 2:
            if p <= straightFrac {
                let t = p / straightFrac
                return CGPoint(x: half - cr - t * straight, y: half)
            } else {
                let t = (p - straightFrac) / (1 - straightFrac)
                let angle = CGFloat.pi / 2 + t * CGFloat.pi / 2
                return CGPoint(x: -half + cr + cr * cos(angle), y: half - cr + cr * sin(angle))
            }
        case 3:
            if p <= straightFrac {
                let t = p / straightFrac
                return CGPoint(x: -half, y: half - cr - t * straight)
            } else {
                let t = (p - straightFrac) / (1 - straightFrac)
                let angle = CGFloat.pi + t * CGFloat.pi / 2
                return CGPoint(x: -half + cr + cr * cos(angle), y: -half + cr + cr * sin(angle))
            }
        default:
            return .zero
        }
    }
}

// MARK: - Box Perimeter Shape (for InlineBreathingView)

private struct InlineBoxPerimeter: Shape {
    var cornerRadius: CGFloat

    func path(in rect: CGRect) -> Path {
        let cr = cornerRadius
        var p = Path()
        p.move(to: CGPoint(x: rect.minX + cr, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX - cr, y: rect.minY))
        p.addArc(center: CGPoint(x: rect.maxX - cr, y: rect.minY + cr),
                  radius: cr, startAngle: .degrees(-90), endAngle: .degrees(0), clockwise: false)
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - cr))
        p.addArc(center: CGPoint(x: rect.maxX - cr, y: rect.maxY - cr),
                  radius: cr, startAngle: .degrees(0), endAngle: .degrees(90), clockwise: false)
        p.addLine(to: CGPoint(x: rect.minX + cr, y: rect.maxY))
        p.addArc(center: CGPoint(x: rect.minX + cr, y: rect.maxY - cr),
                  radius: cr, startAngle: .degrees(90), endAngle: .degrees(180), clockwise: false)
        p.addLine(to: CGPoint(x: rect.minX, y: rect.minY + cr))
        p.addArc(center: CGPoint(x: rect.minX + cr, y: rect.minY + cr),
                  radius: cr, startAngle: .degrees(180), endAngle: .degrees(270), clockwise: false)
        return p
    }
}
