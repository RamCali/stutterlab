import SwiftUI

// MARK: - Home View

struct HomeView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @StateObject private var dailyLoopVM = DailyLoopViewModel()
    @State private var showSession = false

    private var profile: UserProfile? { appViewModel.userProfile }
    private var phaseInfo: PhaseInfo? {
        guard let day = profile?.currentDay else { return nil }
        return PhaseInfo.info(for: day)
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: SLSpacing.s6) {
                        // Greeting + Affirmation
                        greetingSection

                        // Today's plan summary
                        todayCard

                        // Streak + Stats
                        statsRow

                        // Phase progress
                        phaseProgressCard

                        // Real World Mission (if pending)
                        if let mission = dailyLoopVM.currentPlan?.realWorldMission,
                           !mission.isCompleted {
                            missionCard(mission)
                        }
                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100) // space for FAB
                }
            }
            .navigationTitle("Home")
            .navigationBarTitleDisplayMode(.inline)
            .fullScreenCover(isPresented: $showSession) {
                SessionView(viewModel: dailyLoopVM)
                    .environmentObject(appViewModel)
            }
            .onAppear {
                if let day = profile?.currentDay {
                    dailyLoopVM.loadPlan(for: day)
                }
            }
        }
    }

    // MARK: - Greeting

    private var greetingSection: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s2) {
            Text("Good \(timeOfDay), \(profile?.name ?? "there")!")
                .font(.slXL)
                .foregroundColor(.textPrimary)

            if let plan = dailyLoopVM.currentPlan {
                Text("\"\(plan.affirmation)\"")
                    .font(.system(size: 14, weight: .light, design: .serif))
                    .italic()
                    .foregroundColor(.textSecondary)
                    .lineLimit(3)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Today's Card

    private var todayCard: some View {
        VStack(spacing: SLSpacing.s4) {
            HStack {
                VStack(alignment: .leading, spacing: SLSpacing.s1) {
                    Text("Day \(profile?.currentDay ?? 1)")
                        .font(.sl2XL)
                        .foregroundColor(.sunsetAmber)
                    Text(dailyLoopVM.currentPlan?.title ?? "Today's Practice")
                        .font(.slLG)
                        .foregroundColor(.textPrimary)
                    Text("\(dailyLoopVM.currentPlan?.tasks.count ?? 0) exercises")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                }
                Spacer()
            }

            Button(action: {
                if let uid = profile?.id, let day = profile?.currentDay {
                    dailyLoopVM.startSession(userId: uid, day: day)
                    showSession = true
                }
            }) {
                HStack {
                    Image(systemName: "play.fill")
                    Text("Start Today's Session")
                        .font(.slBase)
                        .fontWeight(.semibold)
                }
                .foregroundColor(.obsidianNight)
                .frame(maxWidth: .infinity)
                .padding(.vertical, SLSpacing.s3)
                .background(Color.clarityTeal)
                .cornerRadius(SLRadius.md)
            }
        }
        .padding(SLSpacing.s6)
        .background(Color.obsidianNight)
        .overlay(Color.elevation2)
        .cornerRadius(SLRadius.md)
        .overlay(
            RoundedRectangle(cornerRadius: SLRadius.md)
                .stroke(Color.border, lineWidth: 1)
        )
    }

    // MARK: - Stats Row

    private var statsRow: some View {
        HStack(spacing: SLSpacing.s4) {
            statCard(
                label: "Streak",
                value: "\(profile?.currentStreak ?? 0)",
                unit: "days",
                color: .fluencyGreen
            )
            statCard(
                label: "Total XP",
                value: "\(profile?.totalXP ?? 0)",
                unit: "xp",
                color: .sunsetAmber
            )
            statCard(
                label: "Best",
                value: "\(profile?.longestStreak ?? 0)",
                unit: "days",
                color: .clarityTeal
            )
        }
    }

    private func statCard(label: String, value: String, unit: String, color: Color) -> some View {
        VStack(spacing: SLSpacing.s1) {
            Text(label)
                .font(.slXS)
                .foregroundColor(.textTertiary)
            Text(value)
                .font(.sl2XL)
                .foregroundColor(color)
            Text(unit)
                .font(.slXS)
                .foregroundColor(.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, SLSpacing.s4)
        .background(Color.obsidianNight)
        .overlay(Color.elevation1)
        .cornerRadius(SLRadius.md)
        .overlay(
            RoundedRectangle(cornerRadius: SLRadius.md)
                .stroke(Color.border, lineWidth: 1)
        )
    }

    // MARK: - Phase Progress

    private var phaseProgressCard: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            if let info = phaseInfo {
                HStack {
                    Text("Phase \(info.phase): \(info.label)")
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                    Spacer()
                    Text("Day \(info.dayInPhase)/\(info.daysInPhase)")
                        .font(.slXS)
                        .foregroundColor(.textSecondary)
                }

                ProgressView(value: info.progress)
                    .tint(.clarityTeal)
                    .scaleEffect(y: 1.5)
            }
        }
        .padding(SLSpacing.s4)
        .background(Color.obsidianNight)
        .overlay(Color.elevation1)
        .cornerRadius(SLRadius.md)
        .overlay(
            RoundedRectangle(cornerRadius: SLRadius.md)
                .stroke(Color.border, lineWidth: 1)
        )
    }

    // MARK: - Mission Card

    private func missionCard(_ mission: RealWorldMission) -> some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            HStack {
                Image(systemName: "flag.fill")
                    .foregroundColor(.sunsetAmber)
                Text("Real World Mission")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.sunsetAmber)
            }
            Text(mission.description)
                .font(.slBase)
                .foregroundColor(.textPrimary)
            Text("Technique: \(mission.technique) · +\(mission.bonusXP) XP")
                .font(.slXS)
                .foregroundColor(.textSecondary)

            Button("I did it!") {
                // Mark mission complete
                Task { await appViewModel.addXP(mission.bonusXP) }
            }
            .font(.slSM)
            .fontWeight(.semibold)
            .foregroundColor(.obsidianNight)
            .padding(.horizontal, SLSpacing.s4)
            .padding(.vertical, SLSpacing.s2)
            .background(Color.sunsetAmber)
            .cornerRadius(SLRadius.md)
        }
        .padding(SLSpacing.s4)
        .background(Color.obsidianNight)
        .overlay(Color.elevation1)
        .cornerRadius(SLRadius.md)
        .overlay(
            RoundedRectangle(cornerRadius: SLRadius.md)
                .stroke(Color.sunsetAmber.opacity(0.3), lineWidth: 1)
        )
    }

    // MARK: - Helpers

    private var timeOfDay: String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 12 { return "morning" }
        if hour < 17 { return "afternoon" }
        return "evening"
    }
}
