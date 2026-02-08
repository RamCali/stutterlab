import Foundation

// MARK: - Daily Loop View Model

@MainActor
final class DailyLoopViewModel: ObservableObject {

    @Published var currentPlan: DailyPlan?
    @Published var currentTaskIndex = 0
    @Published var isSessionActive = false
    @Published var session: PracticeSession?
    @Published var confidenceBefore: Int = 5
    @Published var confidenceAfter: Int = 5
    @Published var showMission = false
    @Published var showPhaseUnlock = false
    @Published var phaseInfo: PhaseInfo?

    private let firestoreService = FirestoreService()

    var currentTask: DailyTask? {
        guard let plan = currentPlan, currentTaskIndex < plan.tasks.count else { return nil }
        return plan.tasks[currentTaskIndex]
    }

    var isLastTask: Bool {
        guard let plan = currentPlan else { return false }
        return currentTaskIndex >= plan.tasks.count - 1
    }

    var progressFraction: Double {
        guard let plan = currentPlan, !plan.tasks.isEmpty else { return 0 }
        return Double(currentTaskIndex) / Double(plan.tasks.count)
    }

    // MARK: - Load Today's Plan

    func loadPlan(for day: Int) {
        currentPlan = DailyPlanGenerator.plan(for: day)
        phaseInfo = PhaseInfo.info(for: day)
        currentTaskIndex = 0
    }

    // MARK: - Session Flow

    func startSession(userId: String, day: Int) {
        loadPlan(for: day)
        session = PracticeSession.new(userId: userId, day: day)
        isSessionActive = true
        currentTaskIndex = 0
    }

    func completeCurrentTask() {
        guard var plan = currentPlan else { return }

        // Mark task as completed
        if currentTaskIndex < plan.tasks.count {
            plan.tasks[currentTaskIndex].isCompleted = true
            currentPlan = plan
            session?.exercisesCompleted += 1
            session?.xpEarned += 10 // Base XP per task
        }

        if isLastTask {
            // Show Real World Mission card
            showMission = true
        } else {
            currentTaskIndex += 1
        }
    }

    func completeMission() {
        session?.missionCompleted = true
        session?.xpEarned += (currentPlan?.realWorldMission.bonusXP ?? 20)
        finishSession()
    }

    func skipMission() {
        finishSession()
    }

    func finishSession() {
        showMission = false
        session?.endedAt = Date()

        if let start = session?.startedAt {
            session?.durationSeconds = Int(Date().timeIntervalSince(start))
        }
        session?.confidenceBefore = confidenceBefore
        session?.confidenceAfter = confidenceAfter

        // Check for phase transition
        if let day = currentPlan?.day, PhaseInfo.isPhaseTransition(day: day) {
            showPhaseUnlock = true
        }

        isSessionActive = false
    }

    // MARK: - Save Session

    func saveSession(userId: String) async {
        guard let session else { return }
        do {
            try await firestoreService.saveSession(session, userId: userId)
        } catch {
            print("Failed to save session: \(error)")
        }
    }
}
