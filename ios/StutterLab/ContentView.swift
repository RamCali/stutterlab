import SwiftUI

// MARK: - Root Navigation (Auth Gate)

struct ContentView: View {
    @EnvironmentObject var appViewModel: AppViewModel

    var body: some View {
        Group {
            if appViewModel.isLoading {
                loadingView
            } else if !appViewModel.isAuthenticated {
                AuthView()
            } else if !appViewModel.onboardingCompleted {
                OnboardingFlow()
            } else {
                MainTabView()
            }
        }
        .background(Color.obsidianNight)
    }

    private var loadingView: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()
            VStack(spacing: SLSpacing.s4) {
                ZStack {
                    GlowCircle(color: .clarityTeal, size: 100, blur: 35)
                    Text("StutterLab")
                        .font(.sl2XL)
                        .foregroundStyle(Color.tealGradient)
                }
                Text("The Science of Happy Talking.")
                    .font(.system(size: 14, weight: .light, design: .serif))
                    .italic()
                    .foregroundColor(.textSecondary)
            }
        }
    }
}

// MARK: - Main Tab View (3-Tab + Week Strip — aligned with web)

struct MainTabView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @State private var selectedTab = 0

    private var currentDay: Int { appViewModel.userProfile?.currentDay ?? 1 }

    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                // Content area
                Group {
                    switch selectedTab {
                    case 0: HomeView()
                    case 1: StutterLabProgressView()
                    case 2: ProfileView()
                    default: HomeView()
                    }
                }
                .frame(maxHeight: .infinity)

                // Week day strip above tab bar
                WeekDayStripView(currentDay: currentDay)

                // Custom tab bar
                tabBar
            }
            .ignoresSafeArea(.keyboard)
            .background(Color.obsidianNight)

            PanicButtonView()
        }
    }

    private var tabBar: some View {
        HStack {
            tabButton(icon: "house.fill", label: "Today", tab: 0)
            tabButton(icon: "chart.line.uptrend.xyaxis", label: "Progress", tab: 1)
            tabButton(icon: "person.fill", label: "Profile", tab: 2)
        }
        .padding(.top, SLSpacing.s2)
        .padding(.bottom, SLSpacing.s4)
        .background(
            Color.obsidianNight
                .overlay(
                    Rectangle()
                        .fill(Color.border)
                        .frame(height: 1),
                    alignment: .top
                )
        )
    }

    private func tabButton(icon: String, label: String, tab: Int) -> some View {
        Button {
            withAnimation(.spring(response: 0.25)) {
                selectedTab = tab
            }
        } label: {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                Text(label)
                    .font(.system(size: 10, weight: .medium))
            }
            .foregroundColor(selectedTab == tab ? .clarityTeal : .textTertiary)
            .frame(maxWidth: .infinity)
        }
    }
}

// MARK: - Profile View

struct ProfileView: View {
    @EnvironmentObject var appViewModel: AppViewModel

    private var profile: UserProfile? { appViewModel.userProfile }
    private var levelInfo: (level: Int, title: String, xpInLevel: Int, xpNeeded: Int, percent: Double) {
        LevelSystem.progress(totalXP: profile?.totalXP ?? 0)
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: SLPadding.sectionGap) {
                        // Avatar + Name
                        VStack(spacing: SLSpacing.s3) {
                            ZStack {
                                Circle()
                                    .stroke(
                                        LinearGradient(
                                            colors: [.clarityTeal, .sunsetAmber],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        ),
                                        lineWidth: 3
                                    )
                                    .frame(width: 90, height: 90)
                                Image(systemName: "person.circle.fill")
                                    .font(.system(size: 80))
                                    .foregroundColor(.clarityTeal)
                            }

                            Text(profile?.name ?? "User")
                                .font(.slXL)
                                .foregroundColor(.textPrimary)

                            Text(profile?.email ?? "")
                                .font(.slSM)
                                .foregroundColor(.textSecondary)
                        }
                        .slEntrance(delay: 0.05)

                        // Level + XP
                        VStack(spacing: SLSpacing.s3) {
                            HStack {
                                VStack(alignment: .leading, spacing: SLSpacing.xs) {
                                    Text("Level \(levelInfo.level) — \(levelInfo.title)")
                                        .font(.slSM)
                                        .fontWeight(.semibold)
                                        .foregroundColor(.sunsetAmber)
                                    HStack(spacing: SLSpacing.s1) {
                                        AnimatedNumber(value: Double(profile?.totalXP ?? 0), color: .textTertiary, font: .slXS)
                                        Text("total XP")
                                            .font(.slXS)
                                            .foregroundColor(.textTertiary)
                                    }
                                }
                                Spacer()
                            }

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
                                        .animation(.spring(response: 0.6), value: levelInfo.percent)
                                }
                            }
                            .frame(height: 8)
                        }
                        .slCardAccent(.sunsetAmber)
                        .slEntrance(delay: 0.1)

                        // Stats grid
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: SLSpacing.s3) {
                            profileStat(icon: "calendar", label: "Program Day", value: "\(profile?.currentDay ?? 1) of 90")
                            profileStat(icon: "flame.fill", label: "Current Streak", value: "\(profile?.currentStreak ?? 0) days")
                            profileStat(icon: "trophy.fill", label: "Best Streak", value: "\(profile?.longestStreak ?? 0) days")
                            profileStat(icon: "clock.fill", label: "Practice Time", value: "\((profile?.totalPracticeSeconds ?? 0) / 60) min")
                        }
                        .slEntrance(delay: 0.15)

                        // Subscription
                        subscriptionCard
                            .slEntrance(delay: 0.2)

                        // Navigation links
                        NavigationLink(destination: ChallengesView().environmentObject(appViewModel)) {
                            profileRow(icon: "trophy.fill", label: "Achievements & Challenges", color: .sunsetAmber)
                        }
                        .slEntrance(delay: 0.25)

                        // Sign out
                        Button(action: {
                            appViewModel.authService.signOut()
                        }) {
                            Text("Sign Out")
                        }
                        .buttonStyle(SLSecondaryButtonStyle(color: .sunsetAmber))
                        .slEntrance(delay: 0.3)

                        Spacer(minLength: SLSpacing.s10)
                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100)
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func profileStat(icon: String, label: String, value: String) -> some View {
        HStack(spacing: SLSpacing.s3) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(.clarityTeal)
                .frame(width: 24)
            VStack(alignment: .leading, spacing: SLSpacing.xs) {
                Text(label)
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
                Text(value)
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
            }
            Spacer()
        }
        .slCard(padding: SLSpacing.s3)
    }

    private var subscriptionCard: some View {
        let isPremium = profile?.isPremium ?? false
        return VStack(alignment: .leading, spacing: SLSpacing.s2) {
            HStack {
                Image(systemName: isPremium ? "crown.fill" : "lock.fill")
                    .foregroundColor(isPremium ? .sunsetAmber : .textTertiary)
                Text(isPremium ? "Premium Member" : "Free Plan")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(isPremium ? .sunsetAmber : .textPrimary)
                Spacer()
                if !isPremium {
                    Text("Upgrade")
                        .font(.slXS)
                        .fontWeight(.semibold)
                        .foregroundColor(.obsidianNight)
                        .padding(.horizontal, SLSpacing.s2)
                        .padding(.vertical, 4)
                        .background(Color.tealGradient)
                        .cornerRadius(SLRadius.full)
                }
            }
            if isPremium {
                Text("Full access to Audio Lab, Feared Words, AI Simulators, and all premium features")
                    .font(.slXS)
                    .foregroundColor(.textSecondary)
            } else {
                Text("Upgrade to unlock DAF/FAF, AI practice, feared words, and 12 clinical techniques")
                    .font(.slXS)
                    .foregroundColor(.textSecondary)
            }
        }
        .modifier(isPremium
            ? AnyViewModifier(SLCardGradientModifier(colors: [.sunsetAmber.opacity(0.12), .obsidianNight]))
            : AnyViewModifier(SLCardModifier())
        )
    }

    private func profileRow(icon: String, label: String, color: Color) -> some View {
        HStack(spacing: SLSpacing.s3) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(color)
                .frame(width: 24)
            Text(label)
                .font(.slSM)
                .foregroundColor(.textPrimary)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 12))
                .foregroundColor(.textTertiary)
        }
        .slCard()
    }
}

// MARK: - AnyViewModifier (type-erased modifier for conditional styling)

struct AnyViewModifier: ViewModifier {
    private let modifier: (AnyView) -> AnyView

    init<M: ViewModifier>(_ modifier: M) {
        self.modifier = { AnyView($0.modifier(modifier)) }
    }

    func body(content: Content) -> some View {
        modifier(AnyView(content))
    }
}
