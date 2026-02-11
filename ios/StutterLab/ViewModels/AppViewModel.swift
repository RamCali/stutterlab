import Combine
import Foundation

// MARK: - App View Model (Global State)

@MainActor
final class AppViewModel: ObservableObject {

    // MARK: Published State

    @Published var isLoading = true
    @Published var isAuthenticated = false
    @Published var onboardingCompleted = false
    @Published var userProfile: UserProfile?

    // MARK: Services

    let authService = AuthService()
    let storeKitService = StoreKitService()
    let speechAnalysisService = SpeechAnalysisService()

    private let apiService = APIService()
    private var cancellables = Set<AnyCancellable>()

    init() {
        // Observe auth state changes
        authService.$isAuthenticated
            .sink { [weak self] isAuth in
                self?.isAuthenticated = isAuth
                if isAuth, let user = self?.authService.currentUser {
                    Task { await self?.loadProfile(userId: user.id) }
                } else {
                    self?.userProfile = nil
                    self?.onboardingCompleted = false
                }
            }
            .store(in: &cancellables)

        authService.$isLoading
            .sink { [weak self] loading in
                self?.isLoading = loading
            }
            .store(in: &cancellables)
    }

    // MARK: - Profile

    private func loadProfile(userId: String) async {
        do {
            let profile = try await apiService.getProfile()
            userProfile = UserProfile(
                id: profile.id,
                name: profile.name ?? "User",
                email: profile.email ?? "",
                avatarURL: profile.image,
                severity: Severity(rawValue: profile.severity ?? ""),
                goals: profile.goals ?? [],
                onboardingCompleted: profile.onboardingCompleted,
                currentDay: profile.currentDay,
                currentStreak: profile.currentStreak,
                longestStreak: profile.longestStreak,
                lastPracticeDate: nil,
                totalXP: profile.totalXp,
                totalPracticeSeconds: profile.totalPracticeSeconds,
                totalExercisesCompleted: profile.totalExercisesCompleted,
                northStarGoal: profile.northStarGoal,
                speechChallenges: profile.speechChallenges ?? [],
                subscriptionPlan: SubscriptionPlan(rawValue: profile.subscriptionPlan) ?? .free,
                subscriptionStatus: SubscriptionStatus(rawValue: profile.subscriptionStatus) ?? .active,
                createdAt: Date()
            )
            onboardingCompleted = profile.onboardingCompleted
        } catch {
            print("Failed to load profile: \(error)")
            // Use cached auth user data as fallback
            if let user = authService.currentUser {
                #if DEBUG
                // Offline dev mode — create a rich profile so the app is fully usable
                let devProfile = UserProfile(
                    id: user.id,
                    name: user.name ?? "Dev Tester",
                    email: user.email ?? "tester@stutterlab.dev",
                    avatarURL: nil,
                    severity: .moderate,
                    goals: ["Reduce blocks", "Phone calls", "Presentations"],
                    onboardingCompleted: false, // Set to true to skip onboarding in dev mode
                    currentDay: 5,
                    currentStreak: 3,
                    longestStreak: 5,
                    lastPracticeDate: Date(),
                    totalXP: 450,
                    totalPracticeSeconds: 3600,
                    totalExercisesCompleted: 12,
                    northStarGoal: "Order coffee without avoiding any words",
                    speechChallenges: ["Phone calls", "Ordering food", "Presentations"],
                    subscriptionPlan: .pro,
                    subscriptionStatus: .active,
                    createdAt: Date()
                )
                userProfile = devProfile
                onboardingCompleted = true
                #else
                userProfile = UserProfile.new(
                    id: user.id,
                    name: user.name ?? "User",
                    email: user.email ?? ""
                )
                onboardingCompleted = false
                #endif
            }
        }
    }

    func completeOnboarding(data: OnboardingPayload) async {
        guard var profile = userProfile else { return }
        profile.severity = data.severity
        profile.goals = data.speechChallenges
        profile.onboardingCompleted = true

        do {
            try await apiService.completeOnboarding(data: data)
        } catch {
            print("Failed to save onboarding to server: \(error)")
        }
        // Always update local state even if server call fails (offline support)
        userProfile = profile
        onboardingCompleted = true
    }

    // MARK: - Streak Management

    func updateStreak() async {
        // Streak is now managed server-side when sessions are saved.
        // Refresh profile to get latest streak data.
        if let userId = userProfile?.id {
            await loadProfile(userId: userId)
        }
    }

    func advanceDay() async {
        guard var profile = userProfile, profile.currentDay < 90 else { return }
        profile.currentDay += 1
        userProfile = profile
    }

    func addXP(_ amount: Int) async {
        guard var profile = userProfile else { return }
        profile.totalXP += amount
        profile.totalExercisesCompleted += 1
        userProfile = profile
    }

    // MARK: - Refresh Profile

    func refreshProfile() async {
        guard let userId = userProfile?.id else { return }
        await loadProfile(userId: userId)
    }

    // MARK: - Premium Check

    var isPremium: Bool {
        storeKitService.isPremium || (userProfile?.isPremium ?? false)
    }
}
