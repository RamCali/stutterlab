import Foundation

// MARK: - Progress View Model

@MainActor
final class ProgressViewModel: ObservableObject {

    @Published var sessions: [PracticeSession] = []
    @Published var analyses: [SpeechAnalysisResult] = []
    @Published var checkIns: [DailyCheckIn] = []
    @Published var isLoading = false

    private let firestoreService = FirestoreService()

    // MARK: Computed Stats

    var latestFluencyScore: Double? {
        analyses.first?.fluencyScore
    }

    var latestSPM: Double? {
        analyses.first?.syllablesPerMinute
    }

    var totalPracticeMinutes: Int {
        sessions.compactMap(\.durationSeconds).reduce(0, +) / 60
    }

    var totalSessions: Int {
        sessions.count
    }

    var averageConfidence: Double {
        let ratings = checkIns.map(\.confidenceRating)
        guard !ratings.isEmpty else { return 0 }
        return Double(ratings.reduce(0, +)) / Double(ratings.count)
    }

    /// Fluency score data points for chart (date → score)
    var fluencyTrend: [(date: Date, score: Double)] {
        analyses.reversed().map { ($0.analyzedAt, $0.fluencyScore) }
    }

    /// SPM data points for chart (date → SPM)
    var spmTrend: [(date: Date, spm: Double)] {
        analyses.reversed().map { ($0.analyzedAt, $0.syllablesPerMinute) }
    }

    /// Block count trend (date → count)
    var blockTrend: [(date: Date, blocks: Int)] {
        analyses.reversed().map { ($0.analyzedAt, $0.blockCount) }
    }

    /// Confidence trend (date → rating)
    var confidenceTrend: [(date: Date, rating: Int)] {
        checkIns.reversed().map { ($0.date, $0.confidenceRating) }
    }

    /// Dates the user practiced (for streak calendar)
    var practiceDates: Set<Date> {
        Set(sessions.map { Calendar.current.startOfDay(for: $0.startedAt) })
    }

    // MARK: - Load Data

    func loadData(userId: String) async {
        isLoading = true
        defer { isLoading = false }

        async let sessionsTask = firestoreService.getSessions(userId: userId)
        async let analysesTask = firestoreService.getAnalyses(userId: userId)
        async let checkInsTask = firestoreService.getCheckIns(userId: userId)

        do {
            sessions = try await sessionsTask
            analyses = try await analysesTask
            checkIns = try await checkInsTask
        } catch {
            print("Failed to load progress data: \(error)")
        }
    }
}
