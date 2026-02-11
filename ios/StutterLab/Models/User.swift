import Foundation

// MARK: - User Profile

struct UserProfile: Codable, Identifiable {
    let id: String
    var name: String
    var email: String
    var avatarURL: String?
    var severity: Severity?
    var goals: [String]
    var onboardingCompleted: Bool

    // Curriculum state
    var currentDay: Int
    var currentStreak: Int
    var longestStreak: Int
    var lastPracticeDate: Date?
    var totalXP: Int
    var totalPracticeSeconds: Int
    var totalExercisesCompleted: Int

    // North Star (from onboarding)
    var northStarGoal: String?
    var speechChallenges: [String]

    // Subscription
    var subscriptionPlan: SubscriptionPlan
    var subscriptionStatus: SubscriptionStatus

    var createdAt: Date

    // MARK: Computed

    var isPremium: Bool {
        subscriptionPlan == .pro && subscriptionStatus == .active
    }

    var currentPhase: Int {
        PhaseInfo.phase(for: currentDay)
    }

    // MARK: Defaults

    static func new(id: String, name: String, email: String) -> UserProfile {
        UserProfile(
            id: id,
            name: name,
            email: email,
            avatarURL: nil,
            severity: nil,
            goals: [],
            onboardingCompleted: false,
            currentDay: 1,
            currentStreak: 0,
            longestStreak: 0,
            lastPracticeDate: nil,
            totalXP: 0,
            totalPracticeSeconds: 0,
            totalExercisesCompleted: 0,
            northStarGoal: nil,
            speechChallenges: [],
            subscriptionPlan: .free,
            subscriptionStatus: .active,
            createdAt: Date()
        )
    }
}

// MARK: - Phase Info

struct PhaseInfo {
    let phase: Int
    let label: String
    let dayInPhase: Int
    let daysInPhase: Int
    let progress: Double // 0.0–1.0

    static let labels: [Int: String] = [
        1: "Foundation",
        2: "Building Blocks",
        3: "Technique Integration",
        4: "Real-World Practice",
        5: "Mastery & Maintenance",
    ]

    static let ranges: [Int: ClosedRange<Int>] = [
        1: 1...14,
        2: 15...30,
        3: 31...50,
        4: 51...70,
        5: 71...90,
    ]

    static func phase(for day: Int) -> Int {
        if day <= 14 { return 1 }
        if day <= 30 { return 2 }
        if day <= 50 { return 3 }
        if day <= 70 { return 4 }
        return 5
    }

    static func info(for day: Int) -> PhaseInfo {
        let p = phase(for: day)
        let range = ranges[p]!
        let dayInPhase = day - range.lowerBound + 1
        let daysInPhase = range.count
        return PhaseInfo(
            phase: p,
            label: labels[p]!,
            dayInPhase: dayInPhase,
            daysInPhase: daysInPhase,
            progress: Double(dayInPhase) / Double(daysInPhase)
        )
    }

    /// True when user just completed the last day of a phase
    static func isPhaseTransition(day: Int) -> Bool {
        let range = ranges[phase(for: day)]!
        return day == range.upperBound
    }
}
