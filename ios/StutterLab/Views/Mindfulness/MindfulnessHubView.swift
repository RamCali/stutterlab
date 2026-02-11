import SwiftUI

// MARK: - Breathing Pattern

struct BreathingPattern: Identifiable {
    let id: String
    let name: String
    let icon: String
    let description: String
    let inhale: TimeInterval
    let holdIn: TimeInterval
    let exhale: TimeInterval
    let holdOut: TimeInterval
    let cycles: Int
    let isPremium: Bool

    var totalCycleDuration: TimeInterval {
        inhale + holdIn + exhale + holdOut
    }

    static let catalog: [BreathingPattern] = [
        BreathingPattern(id: "4-7-8", name: "4-7-8 Calming", icon: "moon.fill", description: "The most effective anxiety reduction technique. Activates your parasympathetic nervous system.", inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, cycles: 3, isPremium: false),
        BreathingPattern(id: "box", name: "Box Breathing", icon: "square", description: "Used by Navy SEALs. Equal phases create a calming rhythm.", inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, cycles: 4, isPremium: false),
        BreathingPattern(id: "diaphragmatic", name: "Diaphragmatic", icon: "wind", description: "The foundation of speech support. Belly breathing for steady airflow.", inhale: 4, holdIn: 0, exhale: 6, holdOut: 0, cycles: 5, isPremium: false),
        BreathingPattern(id: "2min-calm", name: "2-Min Calm Down", icon: "heart.fill", description: "Quick anxiety reset before any speaking situation.", inhale: 3, holdIn: 2, exhale: 5, holdOut: 0, cycles: 4, isPremium: false),
        BreathingPattern(id: "pre-presentation", name: "Pre-Presentation", icon: "mic.fill", description: "Extended routine to prepare for presentations or meetings.", inhale: 4, holdIn: 4, exhale: 6, holdOut: 0, cycles: 5, isPremium: true),
        BreathingPattern(id: "phone-prep", name: "Phone Call Prep", icon: "phone.fill", description: "Quick grounding before making a phone call.", inhale: 3, holdIn: 3, exhale: 4, holdOut: 0, cycles: 3, isPremium: true),
    ]
}

// MARK: - Mindfulness Hub View

struct MindfulnessHubView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @State private var selectedPattern: BreathingPattern? = nil
    @State private var showCBT = false

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: SLSpacing.s6) {
                    // Breathing Exercises
                    sectionTitle("Breathing Exercises", icon: "wind", subtitle: "Calm your nervous system before speaking")

                    ForEach(BreathingPattern.catalog) { pattern in
                        breathingCard(pattern)
                    }

                    // Pre-Speaking Toolkit
                    sectionTitle("Pre-Speaking Toolkit", icon: "shield.lefthalf.filled", subtitle: "Quick routines before difficult situations")

                    toolkitCard(
                        title: "2-Minute Calm Down",
                        description: "Quick anxiety reset for any situation",
                        icon: "heart.fill",
                        duration: "2 min",
                        action: {
                            selectedPattern = BreathingPattern.catalog.first { $0.id == "2min-calm" }
                        }
                    )

                    toolkitCard(
                        title: "Phone Call Prep",
                        description: "Ground yourself before dialing",
                        icon: "phone.fill",
                        duration: "2 min",
                        isPremium: true,
                        action: {
                            selectedPattern = BreathingPattern.catalog.first { $0.id == "phone-prep" }
                        }
                    )

                    toolkitCard(
                        title: "Pre-Presentation Routine",
                        description: "Full preparation before speaking",
                        icon: "mic.fill",
                        duration: "5 min",
                        isPremium: true,
                        action: {
                            selectedPattern = BreathingPattern.catalog.first { $0.id == "pre-presentation" }
                        }
                    )

                    // CBT Tools
                    sectionTitle("CBT Tools", icon: "brain.head.profile", subtitle: "Change unhelpful thinking patterns")

                    NavigationLink(destination: ThoughtRecordListView()) {
                        toolkitCard(
                            title: "Thought Records",
                            description: "Challenge anxious thoughts about speaking",
                            icon: "doc.text",
                            duration: "5-10 min",
                            action: {}
                        )
                    }

                    NavigationLink(destination: PredictionTestListView()) {
                        toolkitCard(
                            title: "Prediction Testing",
                            description: "Compare anxiety predictions vs. reality",
                            icon: "chart.bar.xaxis",
                            duration: "2 min",
                            action: {}
                        )
                    }
                }
                .padding(SLSpacing.s4)
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Mindfulness & CBT")
        .navigationBarTitleDisplayMode(.inline)
        .fullScreenCover(item: $selectedPattern) { pattern in
            BreathingExerciseView(pattern: pattern)
        }
    }

    // MARK: - Section Title

    private func sectionTitle(_ title: String, icon: String, subtitle: String) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.clarityTeal)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.slLG)
                    .foregroundColor(.textPrimary)
                Text(subtitle)
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
            }
        }
    }

    // MARK: - Breathing Card

    private func breathingCard(_ pattern: BreathingPattern) -> some View {
        Button(action: { selectedPattern = pattern }) {
            HStack(spacing: SLSpacing.s3) {
                Image(systemName: pattern.icon)
                    .font(.system(size: 22))
                    .foregroundColor(.clarityTeal)
                    .frame(width: 40, height: 40)
                    .background(Color.clarityTeal.opacity(0.1))
                    .cornerRadius(SLRadius.md)

                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text(pattern.name)
                            .font(.slSM)
                            .fontWeight(.semibold)
                            .foregroundColor(.textPrimary)
                        if pattern.isPremium {
                            Text("PRO")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(.sunsetAmber)
                                .padding(.horizontal, 4)
                                .padding(.vertical, 1)
                                .background(Color.sunsetAmber.opacity(0.15))
                                .cornerRadius(3)
                        }
                    }
                    Text(pattern.description)
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                        .lineLimit(2)
                    Text("Pattern: \(Int(pattern.inhale))-\(Int(pattern.holdIn))-\(Int(pattern.exhale))\(pattern.holdOut > 0 ? "-\(Int(pattern.holdOut))" : "") · \(pattern.cycles) cycles")
                        .font(.system(size: 10))
                        .foregroundColor(.textTertiary)
                }

                Spacer()

                Image(systemName: "play.circle.fill")
                    .font(.system(size: 24))
                    .foregroundColor(.clarityTeal)
            }
            .slCardAccent(.tintPurple, radius: SLRadius.md)
        }
    }

    // MARK: - Toolkit Card

    private func toolkitCard(title: String, description: String, icon: String, duration: String, isPremium: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: SLSpacing.s3) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(.sunsetAmber)
                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text(title)
                            .font(.slSM)
                            .fontWeight(.semibold)
                            .foregroundColor(.textPrimary)
                        if isPremium {
                            Text("PRO")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(.sunsetAmber)
                                .padding(.horizontal, 4)
                                .padding(.vertical, 1)
                                .background(Color.sunsetAmber.opacity(0.15))
                                .cornerRadius(3)
                        }
                    }
                    Text(description)
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
                Spacer()
                Text(duration)
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
            }
            .slCard(padding: SLSpacing.s3)
        }
    }
}

// MARK: - Breathing Exercise View

struct BreathingExerciseView: View {
    let pattern: BreathingPattern
    @Environment(\.dismiss) private var dismiss
    @State private var isActive = false
    @State private var currentPhase: BreathPhase = .inhale
    @State private var progress: Double = 0
    @State private var cycleCount = 0
    @State private var isComplete = false
    @State private var timer: Timer?

    enum BreathPhase: String {
        case inhale = "Breathe In"
        case holdIn = "Hold"
        case exhale = "Breathe Out"
        case holdOut = "Rest"

        var color: Color {
            switch self {
            case .inhale: return .clarityTeal
            case .holdIn: return .sunsetAmber
            case .exhale: return .fluencyGreen
            case .holdOut: return .textSecondary
            }
        }
    }

    private var currentPhaseDuration: TimeInterval {
        switch currentPhase {
        case .inhale: return pattern.inhale
        case .holdIn: return pattern.holdIn
        case .exhale: return pattern.exhale
        case .holdOut: return pattern.holdOut
        }
    }

    private var circleScale: CGFloat {
        switch currentPhase {
        case .inhale: return 0.6 + (0.4 * progress)
        case .holdIn: return 1.0
        case .exhale: return 1.0 - (0.4 * progress)
        case .holdOut: return 0.6
        }
    }

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            if isComplete {
                completionView
            } else if isActive {
                breathingView
            } else {
                startView
            }
        }
    }

    // MARK: - Start View

    private var startView: some View {
        VStack(spacing: SLSpacing.s6) {
            Spacer()
            Image(systemName: pattern.icon)
                .font(.system(size: 60))
                .foregroundColor(.clarityTeal)
            Text(pattern.name)
                .font(.sl2XL)
                .foregroundColor(.textPrimary)
            Text(pattern.description)
                .font(.slBase)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, SLSpacing.s8)
            Text("Pattern: \(Int(pattern.inhale))-\(Int(pattern.holdIn))-\(Int(pattern.exhale))\(pattern.holdOut > 0 ? "-\(Int(pattern.holdOut))" : "")")
                .font(.slSM)
                .foregroundColor(.textTertiary)
            Spacer()
            Button(action: startBreathing) {
                Text("Begin")
                    .font(.slLG)
                    .fontWeight(.semibold)
                    .foregroundColor(.obsidianNight)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, SLSpacing.s4)
                    .background(Color.clarityTeal)
                    .cornerRadius(SLRadius.lg)
            }
            .padding(.horizontal, SLSpacing.s6)
            Button("Cancel") { dismiss() }
                .foregroundColor(.textSecondary)
            Spacer()
        }
    }

    // MARK: - Breathing View

    private var breathingView: some View {
        VStack(spacing: SLSpacing.s6) {
            // Close
            HStack {
                Button(action: { stopAndDismiss() }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(.textTertiary)
                }
                Spacer()
                Text("Cycle \(cycleCount + 1)/\(pattern.cycles)")
                    .font(.slSM)
                    .foregroundColor(.textSecondary)
            }
            .padding(.horizontal, SLSpacing.s4)

            Spacer()

            // Animated circle
            ZStack {
                Circle()
                    .fill(currentPhase.color.opacity(0.15))
                    .frame(width: 200 * circleScale, height: 200 * circleScale)
                    .animation(.easeInOut(duration: 0.3), value: circleScale)

                Circle()
                    .stroke(currentPhase.color.opacity(0.3), lineWidth: 2)
                    .frame(width: 200 * circleScale, height: 200 * circleScale)
                    .animation(.easeInOut(duration: 0.3), value: circleScale)

                VStack(spacing: SLSpacing.s2) {
                    Text(currentPhase.rawValue)
                        .font(.slXL)
                        .foregroundColor(currentPhase.color)

                    let remaining = Int(currentPhaseDuration * (1 - progress))
                    Text("\(remaining)")
                        .font(.system(size: 40, weight: .light, design: .rounded))
                        .foregroundColor(.textPrimary)
                }
            }

            Spacer()
        }
    }

    // MARK: - Completion View

    private var completionView: some View {
        VStack(spacing: SLSpacing.s6) {
            Spacer()
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(.fluencyGreen)
            Text("Nice work")
                .font(.sl2XL)
                .foregroundColor(.textPrimary)
            Text("You completed \(pattern.cycles) cycles of \(pattern.name).")
                .font(.slBase)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
            Spacer()
            Button(action: { dismiss() }) {
                Text("Done")
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

    // MARK: - Timer Logic

    private func startBreathing() {
        isActive = true
        currentPhase = .inhale
        progress = 0
        cycleCount = 0
        startPhaseTimer()
    }

    private func startPhaseTimer() {
        let duration = currentPhaseDuration
        guard duration > 0 else {
            advancePhase()
            return
        }
        let startTime = Date()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0 / 30.0, repeats: true) { _ in
            let elapsed = Date().timeIntervalSince(startTime)
            progress = min(elapsed / duration, 1.0)
            if elapsed >= duration {
                timer?.invalidate()
                advancePhase()
            }
        }
    }

    private func advancePhase() {
        switch currentPhase {
        case .inhale:
            currentPhase = pattern.holdIn > 0 ? .holdIn : .exhale
        case .holdIn:
            currentPhase = .exhale
        case .exhale:
            currentPhase = pattern.holdOut > 0 ? .holdOut : .inhale
            if pattern.holdOut == 0 { completeCycle() }
        case .holdOut:
            currentPhase = .inhale
            completeCycle()
        }
        progress = 0
        if !isComplete { startPhaseTimer() }
    }

    private func completeCycle() {
        cycleCount += 1
        if cycleCount >= pattern.cycles {
            timer?.invalidate()
            isComplete = true
            UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
        }
    }

    private func stopAndDismiss() {
        timer?.invalidate()
        dismiss()
    }
}
