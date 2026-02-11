import SwiftUI

// MARK: - Challenges & Achievements View

struct ChallengesView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @State private var selectedTab = 0
    @State private var showLevelUp = false
    @State private var challengeCompleted = false

    private var currentDay: Int {
        appViewModel.userProfile?.currentDay ?? 1
    }

    private var totalXP: Int {
        appViewModel.userProfile?.totalXP ?? 0
    }

    private var levelInfo: (level: Int, title: String, xpInLevel: Int, xpNeeded: Int, percent: Double) {
        LevelSystem.progress(totalXP: totalXP)
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: SLSpacing.s6) {
                        // Level + XP header
                        levelHeader

                        // Tab picker
                        Picker("Section", selection: $selectedTab) {
                            Text("Today's Challenge").tag(0)
                            Text("Achievements").tag(1)
                        }
                        .pickerStyle(.segmented)

                        if selectedTab == 0 {
                            dailyChallengeSection
                        } else {
                            achievementsSection
                        }
                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100)
                }

                if showLevelUp {
                    LevelUpView(level: levelInfo.level, title: levelInfo.title) {
                        showLevelUp = false
                    }
                }
            }
            .navigationTitle("Challenges")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // MARK: - Level Header

    private var levelHeader: some View {
        VStack(spacing: SLSpacing.s3) {
            HStack {
                VStack(alignment: .leading, spacing: SLSpacing.s1) {
                    Text("Level \(levelInfo.level)")
                        .font(.slLG)
                        .foregroundColor(.sunsetAmber)
                    Text(levelInfo.title)
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: SLSpacing.s1) {
                    Text("\(totalXP) XP")
                        .font(.slLG)
                        .foregroundColor(.clarityTeal)
                    Text("Total earned")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
            }

            // XP progress bar
            VStack(spacing: SLSpacing.s1) {
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.elevation2)
                            .frame(height: 8)
                        RoundedRectangle(cornerRadius: 4)
                            .fill(
                                LinearGradient(
                                    colors: [.sunsetAmber, .clarityTeal],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: geometry.size.width * levelInfo.percent, height: 8)
                    }
                }
                .frame(height: 8)

                HStack {
                    Text("\(levelInfo.xpInLevel) / \(levelInfo.xpNeeded) XP to next level")
                        .font(.system(size: 10))
                        .foregroundColor(.textTertiary)
                    Spacer()
                    if levelInfo.level < LevelSystem.titles.count {
                        Text("Next: \(LevelSystem.title(for: levelInfo.level + 1))")
                            .font(.system(size: 10))
                            .foregroundColor(.textTertiary)
                    }
                }
            }
        }
        .slCardElevated()
        .slEntrance(delay: 0)
    }

    // MARK: - Daily Challenge Section

    private var dailyChallengeSection: some View {
        let challenge = Challenge.forDay(currentDay)

        return VStack(spacing: SLSpacing.s4) {
            DailyChallengeCard(
                challenge: challenge,
                completed: challengeCompleted,
                onComplete: {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                        challengeCompleted = true
                    }
                    let generator = UINotificationFeedbackGenerator()
                    generator.notificationOccurred(.success)
                }
            )

            // Upcoming challenges
            VStack(alignment: .leading, spacing: SLSpacing.s3) {
                Text("Coming Up")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)

                ForEach(1...3, id: \.self) { offset in
                    let upcoming = Challenge.forDay(currentDay + offset)
                    upcomingChallengeRow(upcoming, dayOffset: offset)
                }
            }
        }
    }

    private func upcomingChallengeRow(_ challenge: Challenge, dayOffset: Int) -> some View {
        HStack(spacing: SLSpacing.s3) {
            Image(systemName: challenge.icon)
                .font(.system(size: 20))
                .foregroundColor(Color(hex: challenge.category.color))
                .frame(width: 36, height: 36)
                .background(Color(hex: challenge.category.color).opacity(0.1))
                .cornerRadius(SLRadius.md)

            VStack(alignment: .leading, spacing: SLSpacing.xs) {
                Text(challenge.title)
                    .font(.slSM)
                    .foregroundColor(.textPrimary)
                Text("Day \(currentDay + dayOffset)")
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
            }

            Spacer()

            Text("\(challenge.xpReward) XP")
                .font(.slXS)
                .fontWeight(.semibold)
                .foregroundColor(.sunsetAmber)

            Text(challenge.difficulty.rawValue)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(Color(hex: challenge.difficulty.color))
                .padding(.horizontal, SLSpacing.s2)
                .padding(.vertical, 2)
                .background(Color(hex: challenge.difficulty.color).opacity(0.12))
                .cornerRadius(SLRadius.sm)
        }
        .slCard(padding: SLSpacing.s3)
    }

    // MARK: - Achievements Section

    private var achievementsSection: some View {
        let categories = Achievement.Category.allCases

        return VStack(spacing: SLSpacing.s6) {
            // Summary
            let unlocked = Achievement.all.filter(\.unlocked).count
            HStack(spacing: SLSpacing.s4) {
                VStack {
                    Text("\(unlocked)")
                        .font(.sl2XL)
                        .foregroundColor(.sunsetAmber)
                    Text("Unlocked")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
                .frame(maxWidth: .infinity)

                VStack {
                    Text("\(Achievement.all.count)")
                        .font(.sl2XL)
                        .foregroundColor(.textSecondary)
                    Text("Total")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
                .frame(maxWidth: .infinity)

                VStack {
                    let totalXPReward = Achievement.all.filter(\.unlocked).reduce(0) { $0 + $1.xpReward }
                    Text("\(totalXPReward)")
                        .font(.sl2XL)
                        .foregroundColor(.clarityTeal)
                    Text("XP Earned")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
                .frame(maxWidth: .infinity)
            }
            .slCard()
            .slEntrance(delay: 0.1)

            // By category
            ForEach(categories, id: \.rawValue) { category in
                let items = Achievement.all.filter { $0.category == category }
                if !items.isEmpty {
                    achievementCategory(category.rawValue, achievements: items)
                }
            }
        }
    }

    private func achievementCategory(_ title: String, achievements: [Achievement]) -> some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            HStack {
                Text(title)
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                Spacer()
                let unlocked = achievements.filter(\.unlocked).count
                Text("\(unlocked)/\(achievements.count)")
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: SLSpacing.s3) {
                ForEach(achievements) { achievement in
                    AchievementCard(achievement: achievement)
                }
            }
        }
    }
}

// MARK: - Daily Challenge Card

struct DailyChallengeCard: View {
    let challenge: Challenge
    let completed: Bool
    let onComplete: () -> Void

    var body: some View {
        VStack(spacing: SLSpacing.s4) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: SLSpacing.s1) {
                    Text("Today's Challenge")
                        .font(.slXS)
                        .fontWeight(.semibold)
                        .foregroundColor(.sunsetAmber)
                        .textCase(.uppercase)
                    Text(challenge.title)
                        .font(.slXL)
                        .foregroundColor(.textPrimary)
                }
                Spacer()
                Image(systemName: challenge.icon)
                    .font(.system(size: 32))
                    .foregroundColor(Color(hex: challenge.category.color))
            }

            Text(challenge.description)
                .font(.slBase)
                .foregroundColor(.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            // Difficulty + XP
            HStack(spacing: SLSpacing.s3) {
                Text(challenge.difficulty.rawValue)
                    .font(.slXS)
                    .fontWeight(.semibold)
                    .foregroundColor(Color(hex: challenge.difficulty.color))
                    .padding(.horizontal, SLSpacing.s2)
                    .padding(.vertical, 4)
                    .background(Color(hex: challenge.difficulty.color).opacity(0.12))
                    .cornerRadius(SLRadius.sm)

                Text(challenge.category.rawValue)
                    .font(.slXS)
                    .foregroundColor(Color(hex: challenge.category.color))
                    .padding(.horizontal, SLSpacing.s2)
                    .padding(.vertical, 4)
                    .background(Color(hex: challenge.category.color).opacity(0.12))
                    .cornerRadius(SLRadius.sm)

                Spacer()

                HStack(spacing: SLSpacing.s1) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 12))
                    Text("\(challenge.xpReward) XP")
                        .font(.slSM)
                        .fontWeight(.semibold)
                }
                .foregroundColor(.sunsetAmber)
            }

            // Tips
            VStack(alignment: .leading, spacing: SLSpacing.s2) {
                Text("Tips")
                    .font(.slXS)
                    .fontWeight(.semibold)
                    .foregroundColor(.textSecondary)
                ForEach(challenge.tips, id: \.self) { tip in
                    HStack(alignment: .top, spacing: SLSpacing.s2) {
                        Image(systemName: "lightbulb.fill")
                            .font(.system(size: 10))
                            .foregroundColor(.sunsetAmber)
                            .padding(.top, 3)
                        Text(tip)
                            .font(.slSM)
                            .foregroundColor(.textSecondary)
                    }
                }
            }

            // Complete button
            Button(action: onComplete) {
                HStack {
                    Image(systemName: completed ? "checkmark.circle.fill" : "hand.thumbsup.fill")
                    Text(completed ? "Completed!" : "I Did It!")
                }
            }
            .buttonStyle(SLPrimaryButtonStyle(color: .fluencyGreen))
            .slHaptic(.heavy)
            .disabled(completed)
            .opacity(completed ? 0.6 : 1.0)
        }
        .slCardAccent(.fluencyGreen, radius: SLRadius.lg)
        .slEntrance(delay: 0.1)
    }
}

// MARK: - Achievement Card

struct AchievementCard: View {
    let achievement: Achievement

    var body: some View {
        VStack(spacing: SLSpacing.s2) {
            ZStack {
                if achievement.unlocked {
                    GlowCircle(color: .sunsetAmber, size: 50, blur: 10)
                }

                Circle()
                    .fill(achievement.unlocked ? Color.sunsetAmber.opacity(0.15) : Color.elevation2)
                    .frame(width: 52, height: 52)

                Image(systemName: achievement.icon)
                    .font(.system(size: 22))
                    .foregroundColor(achievement.unlocked ? .sunsetAmber : .textTertiary)
            }

            Text(achievement.title)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(achievement.unlocked ? .textPrimary : .textTertiary)
                .multilineTextAlignment(.center)
                .lineLimit(2)

            Text("\(achievement.xpReward) XP")
                .font(.system(size: 9))
                .foregroundColor(achievement.unlocked ? .sunsetAmber : .textTertiary)
        }
        .padding(.vertical, SLSpacing.s2)
        .frame(maxWidth: .infinity)
        .opacity(achievement.unlocked ? 1.0 : 0.5)
    }
}

// MARK: - Level Up View

struct LevelUpView: View {
    let level: Int
    let title: String
    let onDismiss: () -> Void

    @State private var scale: CGFloat = 0.3
    @State private var opacity: Double = 0
    @State private var showConfetti = false

    var body: some View {
        ZStack {
            Color.black.opacity(0.85)
                .ignoresSafeArea()
                .onTapGesture(perform: onDismiss)

            VStack(spacing: SLSpacing.s6) {
                // Confetti particles
                if showConfetti {
                    LevelUpConfettiView()
                        .frame(height: 100)
                }

                Image(systemName: "star.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.sunsetAmber)
                    .shadow(color: .sunsetAmber.opacity(0.5), radius: 20)

                VStack(spacing: SLSpacing.s2) {
                    Text("LEVEL UP!")
                        .font(.sl2XL)
                        .foregroundColor(.sunsetAmber)

                    Text("Level \(level)")
                        .font(.slXL)
                        .foregroundColor(.textPrimary)

                    Text(title)
                        .font(.slLG)
                        .foregroundColor(.clarityTeal)
                }

                Button(action: onDismiss) {
                    Text("Continue")
                        .font(.slBase)
                        .fontWeight(.semibold)
                        .foregroundColor(.obsidianNight)
                        .padding(.horizontal, SLSpacing.s8)
                        .padding(.vertical, SLSpacing.s3)
                        .background(Color.sunsetAmber)
                        .cornerRadius(SLRadius.md)
                }
            }
            .scaleEffect(scale)
            .opacity(opacity)
        }
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                scale = 1.0
                opacity = 1.0
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                showConfetti = true
            }
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.success)
        }
    }
}

// MARK: - Level Up Confetti View

struct LevelUpConfettiView: View {
    @State private var particles: [LevelUpParticle] = (0..<30).map { _ in
        LevelUpParticle(
            x: CGFloat.random(in: 0...1),
            y: CGFloat.random(in: -0.3...0),
            color: [Color.sunsetAmber, .clarityTeal, .fluencyGreen, .white, Color(hex: "FF6B6B")].randomElement()!,
            size: CGFloat.random(in: 4...8)
        )
    }

    var body: some View {
        GeometryReader { geometry in
            ForEach(particles.indices, id: \.self) { i in
                Circle()
                    .fill(particles[i].color)
                    .frame(width: particles[i].size, height: particles[i].size)
                    .position(
                        x: particles[i].x * geometry.size.width,
                        y: particles[i].y * geometry.size.height
                    )
                    .onAppear {
                        withAnimation(.easeOut(duration: Double.random(in: 1.5...3.0))) {
                            particles[i].y = CGFloat.random(in: 0.8...1.5)
                            particles[i].x += CGFloat.random(in: -0.2...0.2)
                        }
                    }
            }
        }
    }
}

struct LevelUpParticle {
    var x: CGFloat
    var y: CGFloat
    let color: Color
    let size: CGFloat
}
