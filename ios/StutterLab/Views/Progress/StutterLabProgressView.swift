import SwiftUI

// MARK: - Progress Dashboard

struct StutterLabProgressView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @StateObject private var viewModel = ProgressViewModel()
    @State private var showAssessment = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: SLSpacing.s6) {
                        // Overview stats
                        overviewCards
                            .slEntrance(delay: 0)

                        // Fluency gauge (latest)
                        if let score = viewModel.latestFluencyScore {
                            FluencyGauge(score: score, label: "Latest Fluency", size: 120)
                                .frame(maxWidth: .infinity)
                                .slEntrance(delay: 0.05)
                        }

                        // Fluency trend chart
                        FluencyTrendChart(sessions: viewModel.sessions)
                            .slEntrance(delay: 0.1)

                        // Streak heatmap
                        StreakHeatmap(
                            practiceDates: viewModel.practiceDates,
                            currentStreak: appViewModel.userProfile?.currentStreak ?? 0,
                            longestStreak: appViewModel.userProfile?.longestStreak ?? 0
                        )
                        .slEntrance(delay: 0.15)

                        // Confidence growth chart
                        AnxietyDeltaChart(sessions: viewModel.sessions)
                            .slEntrance(delay: 0.2)

                        // Monthly assessment CTA
                        assessmentCard
                            .slEntrance(delay: 0.25)

                        // Recent sessions
                        if !viewModel.sessions.isEmpty {
                            recentSessionsSection
                                .slEntrance(delay: 0.3)
                        }

                        // Premium Analytics
                        premiumAnalyticsSection
                            .slEntrance(delay: 0.35)

                        // Empty state
                        if viewModel.sessions.isEmpty && !viewModel.isLoading {
                            emptyState
                        }
                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100)
                }

                if viewModel.isLoading {
                    ProgressView()
                        .tint(.clarityTeal)
                }
            }
            .navigationTitle("Progress")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                await viewModel.loadData()
                if appViewModel.isPremium {
                    await viewModel.loadAnalytics()
                }
            }
            .sheet(isPresented: $showAssessment) {
                MonthlyAssessmentView()
                    .environmentObject(appViewModel)
            }
        }
    }

    // MARK: - Overview Cards

    private var overviewCards: some View {
        VStack(spacing: SLSpacing.s3) {
            HStack(spacing: SLSpacing.s3) {
                miniStat(
                    icon: "flame.fill",
                    label: "Streak",
                    value: "\(appViewModel.userProfile?.currentStreak ?? 0)",
                    unit: "days",
                    color: .fluencyGreen
                )
                miniStat(
                    icon: "star.fill",
                    label: "Total XP",
                    value: "\(appViewModel.userProfile?.totalXP ?? 0)",
                    unit: "xp",
                    color: .sunsetAmber
                )
                miniStat(
                    icon: "trophy.fill",
                    label: "Best",
                    value: "\(appViewModel.userProfile?.longestStreak ?? 0)",
                    unit: "days",
                    color: .clarityTeal
                )
            }
            HStack(spacing: SLSpacing.s3) {
                miniStat(
                    icon: "bolt.fill",
                    label: "Sessions",
                    value: "\(viewModel.totalSessions)",
                    unit: "total",
                    color: .clarityTeal
                )
                miniStat(
                    icon: "clock.fill",
                    label: "Practice",
                    value: "\(viewModel.totalPracticeMinutes)",
                    unit: "mins",
                    color: .sunsetAmber
                )
                miniStat(
                    icon: "calendar",
                    label: "This Week",
                    value: "\(viewModel.weeklySessionCount)",
                    unit: "sessions",
                    color: .fluencyGreen
                )
            }
        }
    }

    private func miniStat(icon: String, label: String, value: String, unit: String, color: Color) -> some View {
        VStack(spacing: SLSpacing.s1) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(color.opacity(0.7))
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(.textTertiary)
            Text(value)
                .font(.slLG)
                .foregroundColor(color)
            Text(unit)
                .font(.system(size: 10))
                .foregroundColor(.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .slCard(padding: SLSpacing.s3)
    }

    // MARK: - Assessment Card

    private var assessmentCard: some View {
        Button(action: { showAssessment = true }) {
            HStack(spacing: SLSpacing.s3) {
                Image(systemName: "doc.text.magnifyingglass")
                    .font(.system(size: 24))
                    .foregroundColor(.clarityTeal)

                VStack(alignment: .leading, spacing: SLSpacing.s1) {
                    Text("Monthly Fluency Assessment")
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                    Text("Read a standard passage to measure your %SS and track improvement")
                        .font(.slXS)
                        .foregroundColor(.textSecondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14))
                    .foregroundColor(.textTertiary)
            }
            .slCardAccent(.clarityTeal)
        }
    }

    // MARK: - Recent Sessions

    private var recentSessionsSection: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            Text("Recent Sessions")
                .font(.slSM)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)

            ForEach(viewModel.sessions.prefix(10)) { session in
                sessionRow(session)
            }
        }
    }

    private func sessionRow(_ session: SessionDTO) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: SLSpacing.xs) {
                Text(session.exerciseType?.replacingOccurrences(of: "_", with: " ").capitalized ?? "Session")
                    .font(.slSM)
                    .foregroundColor(.textPrimary)
                HStack(spacing: SLSpacing.s2) {
                    if let secs = session.durationSeconds {
                        Label("\(secs / 60) min", systemImage: "clock")
                            .font(.slXS)
                            .foregroundColor(.textSecondary)
                    }
                    if let dateStr = session.createdAt,
                       let date = ISO8601DateFormatter().date(from: dateStr)
                        ?? DateFormatter.flexible.date(from: dateStr) {
                        Text(date, style: .relative)
                            .font(.slXS)
                            .foregroundColor(.textTertiary)
                    }
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: SLSpacing.xs) {
                if let score = session.selfRatedFluency {
                    Text("\(score * 10)")
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(score >= 7 ? .fluencyGreen : score >= 5 ? .sunsetAmber : Color(hex: "FF6B6B"))
                }
                if let before = session.confidenceBefore, let after = session.confidenceAfter {
                    let delta = after - before
                    Text(delta >= 0 ? "+\(delta)" : "\(delta)")
                        .font(.slXS)
                        .foregroundColor(delta >= 0 ? .fluencyGreen : Color(hex: "FF6B6B"))
                }
            }
        }
        .slCard(padding: SLSpacing.s3)
    }

    // MARK: - Premium Analytics

    @ViewBuilder
    private var premiumAnalyticsSection: some View {
        if appViewModel.isPremium {
            if let analytics = viewModel.analytics {
                VStack(alignment: .leading, spacing: SLSpacing.s5) {
                    // Header
                    HStack(spacing: SLSpacing.s2) {
                        Image(systemName: "crown.fill")
                            .foregroundColor(.sunsetAmber)
                        Text("Premium Analytics")
                            .font(.slLG)
                            .foregroundColor(.textPrimary)
                    }

                    // AI Conversation Insights
                    aiInsightsCard(analytics.ai)

                    // Feared Words Progress
                    fearedWordsCard(analytics.fearedWords)

                    // Anxiety Trend
                    if let anxiety = analytics.anxiety {
                        anxietyCard(anxiety)
                    }
                }
            }
        } else {
            // Upsell card for free users
            VStack(spacing: SLSpacing.s4) {
                Image(systemName: "crown.fill")
                    .font(.system(size: 32))
                    .foregroundColor(.sunsetAmber)
                Text("Unlock Premium Analytics")
                    .font(.slLG)
                    .foregroundColor(.textPrimary)
                VStack(alignment: .leading, spacing: SLSpacing.s2) {
                    upsellRow("AI Conversation Insights")
                    upsellRow("Feared Words Mastery Tracking")
                    upsellRow("Anxiety Reduction Trends")
                    upsellRow("Scenario & Technique Breakdown")
                }
                NavigationLink(destination: PaywallView().environmentObject(appViewModel)) {
                    Text("Upgrade to Premium")
                }
                .buttonStyle(SLPrimaryButtonStyle(color: .sunsetAmber))
            }
            .slCardGradient([.sunsetAmber.opacity(0.08), .obsidianNight])
        }
    }

    private func upsellRow(_ text: String) -> some View {
        HStack(spacing: SLSpacing.s2) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 14))
                .foregroundColor(.sunsetAmber)
            Text(text)
                .font(.slSM)
                .foregroundColor(.textSecondary)
        }
    }

    // MARK: - AI Insights Card

    private func aiInsightsCard(_ ai: AIAnalytics) -> some View {
        VStack(alignment: .leading, spacing: SLSpacing.s4) {
            HStack {
                Image(systemName: "bubble.left.and.text.bubble.right.fill")
                    .foregroundColor(.clarityTeal)
                Text("AI Conversation Insights")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
            }

            HStack(spacing: SLSpacing.s3) {
                analyticsStatPill(value: "\(ai.totalConversations)", label: "Conversations", color: .clarityTeal)
                analyticsStatPill(value: ai.avgFluency != nil ? "\(ai.avgFluency!)%" : "—", label: "Avg Fluency", color: .fluencyGreen)
                analyticsStatPill(value: "\(ai.totalMinutes)", label: "Minutes", color: .sunsetAmber)
            }

            if !ai.scenarioBreakdown.isEmpty {
                VStack(alignment: .leading, spacing: SLSpacing.s2) {
                    Text("Scenario Breakdown")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                    ForEach(ai.scenarioBreakdown.prefix(5)) { scenario in
                        HStack {
                            Text(scenario.name.replacingOccurrences(of: "_", with: " ").capitalized)
                                .font(.slXS)
                                .foregroundColor(.textSecondary)
                            Spacer()
                            Text("\(scenario.count)x")
                                .font(.slXS)
                                .fontWeight(.medium)
                                .foregroundColor(.clarityTeal)
                            Text("avg \(scenario.avgScore)%")
                                .font(.slXS)
                                .foregroundColor(.textTertiary)
                        }
                    }
                }
            }

            if !ai.techniqueFrequency.isEmpty {
                VStack(alignment: .leading, spacing: SLSpacing.s2) {
                    Text("Top Techniques")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: SLSpacing.s2) {
                            ForEach(ai.techniqueFrequency.prefix(6)) { technique in
                                Text("\(technique.name) (\(technique.count))")
                                    .font(.slXS)
                                    .foregroundColor(.clarityTeal)
                                    .padding(.horizontal, SLSpacing.s2)
                                    .padding(.vertical, 4)
                                    .background(Color.clarityTeal.opacity(0.1))
                                    .cornerRadius(SLRadius.full)
                            }
                        }
                    }
                }
            }
        }
        .slCardAccent(.clarityTeal)
    }

    // MARK: - Feared Words Card

    private func fearedWordsCard(_ fw: FearedWordsAnalytics) -> some View {
        VStack(alignment: .leading, spacing: SLSpacing.s4) {
            HStack {
                Image(systemName: "textformat.abc")
                    .foregroundColor(.sunsetAmber)
                Text("Feared Words Progress")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
            }

            HStack(spacing: SLSpacing.s3) {
                analyticsStatPill(value: "\(fw.total)", label: "Total", color: .sunsetAmber)
                analyticsStatPill(value: "\(fw.mastered)", label: "Mastered", color: .fluencyGreen)
                analyticsStatPill(value: "\(fw.totalReps)", label: "Reps", color: .clarityTeal)
            }

            // Mastery progress bar
            VStack(alignment: .leading, spacing: SLSpacing.s1) {
                HStack {
                    Text("Mastery")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                    Spacer()
                    Text("\(fw.masteryPercent)%")
                        .font(.slXS)
                        .fontWeight(.bold)
                        .foregroundColor(.fluencyGreen)
                }
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color.elevation2)
                            .frame(height: 6)
                        RoundedRectangle(cornerRadius: 3)
                            .fill(
                                LinearGradient(colors: [.sunsetAmber, .fluencyGreen], startPoint: .leading, endPoint: .trailing)
                            )
                            .frame(width: geo.size.width * (Double(fw.masteryPercent) / 100.0), height: 6)
                    }
                }
                .frame(height: 6)
            }

            // Difficulty breakdown
            HStack(spacing: SLSpacing.s3) {
                difficultyPill(label: "Easy", count: fw.byDifficulty.easy, color: .fluencyGreen)
                difficultyPill(label: "Medium", count: fw.byDifficulty.medium, color: .sunsetAmber)
                difficultyPill(label: "Hard", count: fw.byDifficulty.hard, color: Color(hex: "FF6B6B"))
            }
        }
        .slCardAccent(.sunsetAmber)
    }

    private func difficultyPill(label: String, count: Int, color: Color) -> some View {
        HStack(spacing: SLSpacing.s1) {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)
            Text("\(label): \(count)")
                .font(.slXS)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Anxiety Card

    private func anxietyCard(_ anxiety: AnxietyAnalytics) -> some View {
        VStack(alignment: .leading, spacing: SLSpacing.s4) {
            HStack {
                Image(systemName: "heart.text.square.fill")
                    .foregroundColor(.fluencyGreen)
                Text("Anxiety Reduction")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
            }

            HStack(spacing: SLSpacing.s3) {
                analyticsStatPill(value: "\(anxiety.totalSituations)", label: "Situations", color: .fluencyGreen)
                analyticsStatPill(
                    value: String(format: "%.1f", anxiety.avgReduction),
                    label: "Avg Drop",
                    color: .clarityTeal
                )
            }

            if !anxiety.byType.isEmpty {
                VStack(alignment: .leading, spacing: SLSpacing.s2) {
                    Text("By Situation Type")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                    ForEach(anxiety.byType.prefix(5)) { item in
                        HStack {
                            Text(item.type.replacingOccurrences(of: "_", with: " ").capitalized)
                                .font(.slXS)
                                .foregroundColor(.textSecondary)
                            Spacer()
                            Text("\(item.count)x")
                                .font(.slXS)
                                .fontWeight(.medium)
                                .foregroundColor(.fluencyGreen)
                            Text("↓\(String(format: "%.1f", item.avgReduction))")
                                .font(.slXS)
                                .foregroundColor(.clarityTeal)
                        }
                    }
                }
            }
        }
        .slCardAccent(.fluencyGreen)
    }

    private func analyticsStatPill(value: String, label: String, color: Color) -> some View {
        VStack(spacing: SLSpacing.xs) {
            Text(value)
                .font(.slLG)
                .fontWeight(.bold)
                .foregroundColor(color)
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .slCard(padding: SLSpacing.s3)
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: SLSpacing.s4) {
            Image(systemName: "chart.line.uptrend.xyaxis")
                .font(.system(size: 48))
                .foregroundColor(.textTertiary)
            Text("Start practicing to see your progress")
                .font(.slBase)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
            Text("Complete daily sessions, challenges, and exercises to build your fluency data.")
                .font(.slXS)
                .foregroundColor(.textTertiary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, SLSpacing.s10)
    }
}
