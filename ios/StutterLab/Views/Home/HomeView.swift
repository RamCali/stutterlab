import SwiftUI

// MARK: - Home View (Web-Aligned Dashboard)

struct HomeView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @StateObject private var dailyLoopVM = DailyLoopViewModel()
    @StateObject private var taskCompletion = TaskCompletionManager()
    @State private var showSession = false
    @State private var selectedScenario: ScenarioType?

    private var profile: UserProfile? { appViewModel.userProfile }
    private var currentDay: Int { profile?.currentDay ?? 1 }
    private var plan: DailyPlan? { dailyLoopVM.currentPlan }
    private var phaseInfo: PhaseInfo? { PhaseInfo.info(for: currentDay) }

    private var completedCount: Int {
        plan?.tasks.filter { taskCompletion.isCompleted(taskType: $0.type.rawValue) }.count ?? 0
    }
    private var totalTasks: Int { plan?.tasks.count ?? 0 }
    private var allComplete: Bool { totalTasks > 0 && completedCount >= totalTasks }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                // Ambient teal glow at top
                VStack {
                    LinearGradient(
                        colors: [Color.clarityTeal.opacity(0.06), .clear],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: 250)
                    Spacer()
                }
                .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: SLPadding.sectionGap) {
                        // A. Header: Greeting + Day/Phase badge
                        headerSection
                            .slEntrance(delay: 0.05)

                        // North Star (visible motivational anchor)
                        NorthStarCardView(
                            goal: profile?.northStarGoal,
                            challenges: profile?.speechChallenges ?? []
                        )
                        .slEntrance(delay: 0.08)

                        // B. Program Progress Bar
                        programProgressBar
                            .slEntrance(delay: 0.1)

                        // C. Phase Timeline
                        PhaseTimelineView(currentDay: currentDay)
                            .slEntrance(delay: 0.15)

                        // D. Today's Tasks Checklist
                        todayTasksCard
                            .slEntrance(delay: 0.2)

                        // E. AI Practice Scenarios
                        aiPracticeSection
                            .slEntrance(delay: 0.25)

                        // F. Next Milestone
                        MilestoneCardView(currentDay: currentDay)
                            .slEntrance(delay: 0.3)


                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100)
                }
            }
            .navigationTitle("Today")
            .navigationBarTitleDisplayMode(.inline)
            .fullScreenCover(isPresented: $showSession) {
                SessionView(viewModel: dailyLoopVM)
                    .environmentObject(appViewModel)
            }
            .fullScreenCover(item: $selectedScenario) { scenario in
                ConversationView(scenario: scenario)
                    .environmentObject(appViewModel)
            }
            .onAppear {
                dailyLoopVM.loadPlan(for: currentDay)
                taskCompletion.load(for: currentDay)
            }
        }
    }

    // MARK: - A. Header

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s2) {
            HStack {
                Text("Good \(timeOfDay), \(profile?.name ?? "there")!")
                    .font(.slXL)
                    .foregroundColor(.textPrimary)
                Spacer()
            }

            // Day + Phase badge
            HStack(spacing: SLSpacing.s2) {
                Text("Day \(currentDay) of 90")
                    .font(.slSM)
                    .foregroundColor(.textSecondary)

                if let info = phaseInfo {
                    Text("Phase \(info.phase): \(info.label)")
                        .font(.slXS)
                        .fontWeight(.medium)
                        .foregroundColor(.clarityTeal)
                        .padding(.horizontal, SLSpacing.s2)
                        .padding(.vertical, 3)
                        .background(Color.clarityTeal.opacity(0.12))
                        .cornerRadius(SLRadius.full)
                }
            }

            if let affirmation = plan?.affirmation {
                Text("\"\(affirmation)\"")
                    .font(.system(size: 14, weight: .light, design: .serif))
                    .italic()
                    .foregroundColor(.textSecondary)
                    .lineLimit(3)
                    .padding(.top, SLSpacing.xs)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - B. Program Progress Bar

    private var programProgressBar: some View {
        VStack(spacing: SLSpacing.s2) {
            HStack {
                Text("Program Progress")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                Spacer()
                Text("\(Int(Double(currentDay) / 90.0 * 100))%")
                    .font(.slSM)
                    .fontWeight(.bold)
                    .foregroundColor(.clarityTeal)
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.elevation2)
                        .frame(height: 6)
                    RoundedRectangle(cornerRadius: 4)
                        .fill(
                            LinearGradient(
                                colors: [.clarityTeal, .fluencyGreen],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geo.size.width * min(Double(currentDay) / 90.0, 1.0), height: 6)
                        .animation(.spring(response: 0.6), value: currentDay)
                }
            }
            .frame(height: 6)
        }
        .slCard()
    }

    // MARK: - D. Today's Tasks Checklist

    private var todayTasksCard: some View {
        VStack(spacing: SLSpacing.s4) {
            // Header
            HStack {
                Text("Today's Tasks")
                    .font(.slLG)
                    .foregroundColor(.textPrimary)
                Spacer()
                Text("\(completedCount)/\(totalTasks)")
                    .font(.slSM)
                    .fontWeight(.bold)
                    .foregroundColor(allComplete ? .fluencyGreen : .clarityTeal)
            }

            // Plan title
            if let plan {
                HStack(spacing: SLSpacing.s2) {
                    Image(systemName: "calendar")
                        .font(.system(size: 12))
                        .foregroundColor(.textTertiary)
                    Text(plan.title)
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            // Task list
            if let tasks = plan?.tasks {
                VStack(spacing: SLSpacing.s2) {
                    ForEach(tasks) { task in
                        taskRow(task)
                    }
                }
            }

            // Completion banner or CTA
            if allComplete {
                allCompleteView
            } else {
                Button(action: {
                    if let uid = profile?.id {
                        dailyLoopVM.startSession(userId: uid, day: currentDay)
                        showSession = true
                    }
                }) {
                    HStack(spacing: SLSpacing.s2) {
                        Image(systemName: "play.fill")
                        Text("Start Today's Session")
                    }
                }
                .buttonStyle(SLPrimaryButtonStyle())
            }
        }
        .slCardGradient([.clarityTeal.opacity(0.08), .obsidianNight], radius: SLRadius.lg)
    }

    // MARK: - Task Row

    private func taskRow(_ task: DailyTask) -> some View {
        let completed = taskCompletion.isCompleted(taskType: task.type.rawValue)

        return NavigationLink {
            TaskRouter.destination(for: task, currentDay: currentDay)
                .environmentObject(appViewModel)
                .onDisappear {
                    // Mark completed when returning from the task view
                    if !completed {
                        taskCompletion.markCompleted(taskType: task.type.rawValue)
                    }
                }
        } label: {
            HStack(spacing: SLSpacing.s3) {
                // Completion indicator
                ZStack {
                    Circle()
                        .fill(completed
                            ? Color.fluencyGreen.opacity(0.2)
                            : TaskRouter.color(for: task.type).opacity(0.1))
                        .frame(width: 40, height: 40)
                    Image(systemName: completed ? "checkmark" : TaskRouter.icon(for: task.type))
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(completed
                            ? .fluencyGreen
                            : TaskRouter.color(for: task.type))
                }

                // Title + subtitle
                VStack(alignment: .leading, spacing: 2) {
                    Text(task.title)
                        .font(.slSM)
                        .fontWeight(.medium)
                        .foregroundColor(completed ? .textTertiary : .textPrimary)
                        .strikethrough(completed, color: .textTertiary)
                    Text(task.subtitle)
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                        .lineLimit(1)
                }

                Spacer()

                // Duration badge
                Text(task.duration)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.textSecondary)
                    .padding(.horizontal, SLSpacing.s2)
                    .padding(.vertical, 3)
                    .background(Color.elevation2)
                    .cornerRadius(SLRadius.full)

                // Premium lock
                if task.isPremium && !(profile?.isPremium ?? false) {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.textTertiary)
                }

                Image(systemName: "chevron.right")
                    .font(.system(size: 10))
                    .foregroundColor(.textTertiary)
            }
            .padding(SLSpacing.s3)
            .background(
                RoundedRectangle(cornerRadius: SLRadius.sm)
                    .fill(completed ? Color.fluencyGreen.opacity(0.04) : Color.cardSurface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: SLRadius.sm)
                    .stroke(completed ? Color.fluencyGreen.opacity(0.15) : Color.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
        .slHaptic(.light)
    }

    // MARK: - E. AI Practice Section

    private var aiPracticeSection: some View {
        VStack(spacing: SLSpacing.s3) {
            // Header
            HStack {
                HStack(spacing: SLSpacing.s2) {
                    Image(systemName: "bubble.left.and.text.bubble.right.fill")
                        .font(.system(size: 16))
                        .foregroundColor(.clarityTeal)
                    Text("AI Practice")
                        .font(.slLG)
                        .foregroundColor(.textPrimary)
                }

                Spacer()

                NavigationLink {
                    ScenarioPickerView()
                        .environmentObject(appViewModel)
                } label: {
                    HStack(spacing: 4) {
                        Text("See all")
                            .font(.slXS)
                            .foregroundColor(.clarityTeal)
                        Image(systemName: "chevron.right")
                            .font(.system(size: 10))
                            .foregroundColor(.clarityTeal)
                    }
                }
            }

            Text("Practice real-world conversations with AI")
                .font(.slXS)
                .foregroundColor(.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            // Horizontal scroll of scenario cards
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: SLSpacing.s3) {
                    ForEach(ScenarioType.allCases) { scenario in
                        scenarioCard(scenario)
                    }
                }
            }
        }
        .slCard()
    }

    private func scenarioCard(_ scenario: ScenarioType) -> some View {
        let isPremium = !(appViewModel.isPremium || scenario == .orderingFood)

        return Button(action: {
            if !isPremium {
                selectedScenario = scenario
            }
        }) {
            VStack(spacing: SLSpacing.s2) {
                ZStack {
                    Circle()
                        .fill(scenarioDifficultyColor(scenario.difficulty).opacity(0.12))
                        .frame(width: 48, height: 48)

                    Image(systemName: scenario.icon)
                        .font(.system(size: 20))
                        .foregroundColor(scenarioDifficultyColor(scenario.difficulty))

                    // Premium lock overlay
                    if isPremium {
                        Circle()
                            .fill(Color.obsidianNight.opacity(0.5))
                            .frame(width: 48, height: 48)
                        Image(systemName: "lock.fill")
                            .font(.system(size: 14))
                            .foregroundColor(.textTertiary)
                    }
                }

                Text(scenario.displayName)
                    .font(.slXS)
                    .fontWeight(.medium)
                    .foregroundColor(isPremium ? .textTertiary : .textPrimary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .frame(width: 80)

                Text(scenario.difficulty.displayName)
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(scenarioDifficultyColor(scenario.difficulty))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(scenarioDifficultyColor(scenario.difficulty).opacity(0.1))
                    .cornerRadius(SLRadius.full)
            }
            .padding(.vertical, SLSpacing.s3)
            .padding(.horizontal, SLSpacing.s2)
            .frame(width: 100)
            .background(
                RoundedRectangle(cornerRadius: SLRadius.md)
                    .fill(Color.elevation1)
            )
            .overlay(
                RoundedRectangle(cornerRadius: SLRadius.md)
                    .stroke(Color.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
        .slHaptic(.light)
    }

    private func scenarioDifficultyColor(_ difficulty: Difficulty) -> Color {
        switch difficulty {
        case .beginner: return .fluencyGreen
        case .intermediate: return .clarityTeal
        case .advanced: return .sunsetAmber
        case .expert: return .sunsetAmber
        }
    }

    // MARK: - All Complete Banner

    private var allCompleteView: some View {
        VStack(spacing: SLSpacing.s2) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 36))
                .foregroundColor(.fluencyGreen)
            Text("All done for today!")
                .font(.slLG)
                .foregroundColor(.textPrimary)
            Text("Great work! Come back tomorrow for Day \(currentDay + 1).")
                .font(.slSM)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, SLSpacing.s4)
    }

    // MARK: - Helpers

    private var timeOfDay: String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 12 { return "morning" }
        if hour < 17 { return "afternoon" }
        return "evening"
    }
}
