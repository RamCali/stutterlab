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
    let firestoreService = FirestoreService()
    let storeKitService = StoreKitService()
    let speechAnalysisService = SpeechAnalysisService()

    private var cancellables = Set<AnyCancellable>()

    init() {
        // Observe auth state changes
        authService.$isAuthenticated
            .sink { [weak self] isAuth in
                self?.isAuthenticated = isAuth
                if isAuth, let uid = self?.authService.currentUser?.uid {
                    Task { await self?.loadProfile(userId: uid) }
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
            if let profile = try await firestoreService.getProfile(userId: userId) {
                userProfile = profile
                onboardingCompleted = profile.onboardingCompleted
            } else {
                // New user — create default profile
                let user = authService.currentUser
                let profile = UserProfile.new(
                    id: userId,
                    name: user?.displayName ?? "User",
                    email: user?.email ?? ""
                )
                try await firestoreService.saveProfile(profile)
                userProfile = profile
                onboardingCompleted = false
            }
        } catch {
            print("Failed to load profile: \(error)")
        }
    }

    func completeOnboarding(severity: Severity, goals: [String]) async {
        guard var profile = userProfile else { return }
        profile.severity = severity
        profile.goals = goals
        profile.onboardingCompleted = true

        do {
            try await firestoreService.saveProfile(profile)
            userProfile = profile
            onboardingCompleted = true
        } catch {
            print("Failed to save onboarding: \(error)")
        }
    }

    // MARK: - Streak Management

    func updateStreak() async {
        guard var profile = userProfile else { return }
        let today = Calendar.current.startOfDay(for: Date())

        if let lastPractice = profile.lastPracticeDate {
            let lastDay = Calendar.current.startOfDay(for: lastPractice)
            let dayDiff = Calendar.current.dateComponents([.day], from: lastDay, to: today).day ?? 0

            if dayDiff == 1 {
                // Consecutive day — increment streak
                profile.currentStreak += 1
            } else if dayDiff > 1 {
                // Streak broken
                profile.currentStreak = 1
            }
            // dayDiff == 0 means already practiced today — no change
        } else {
            profile.currentStreak = 1
        }

        profile.longestStreak = max(profile.longestStreak, profile.currentStreak)
        profile.lastPracticeDate = today

        do {
            try await firestoreService.updateStreak(
                userId: profile.id,
                currentStreak: profile.currentStreak,
                longestStreak: profile.longestStreak,
                lastPracticeDate: today
            )
            userProfile = profile
        } catch {
            print("Failed to update streak: \(error)")
        }
    }

    func advanceDay() async {
        guard var profile = userProfile, profile.currentDay < 90 else { return }
        profile.currentDay += 1
        do {
            try await firestoreService.incrementDay(userId: profile.id, newDay: profile.currentDay)
            userProfile = profile
        } catch {
            print("Failed to advance day: \(error)")
        }
    }

    func addXP(_ amount: Int) async {
        guard var profile = userProfile else { return }
        profile.totalXP += amount
        profile.totalExercisesCompleted += 1
        do {
            try await firestoreService.addXP(userId: profile.id, xp: amount)
            userProfile = profile
        } catch {
            print("Failed to add XP: \(error)")
        }
    }

    // MARK: - Premium Check

    var isPremium: Bool {
        storeKitService.isPremium || (userProfile?.isPremium ?? false)
    }
}
