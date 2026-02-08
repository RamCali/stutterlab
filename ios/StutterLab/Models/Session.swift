import Foundation

// MARK: - Practice Session

struct PracticeSession: Codable, Identifiable {
    let id: String
    let userId: String
    let day: Int
    let startedAt: Date
    var endedAt: Date?
    var durationSeconds: Int?
    var exercisesCompleted: Int
    var confidenceBefore: Int? // 1-10
    var confidenceAfter: Int?  // 1-10
    var xpEarned: Int
    var missionCompleted: Bool
    var notes: String?

    // Speech analysis results (if available)
    var fluencyScore: Double? // 0-100
    var syllablesPerMinute: Double?
    var percentageSyllablesStuttered: Double?
    var blockCount: Int?

    var isComplete: Bool {
        endedAt != nil
    }

    static func new(userId: String, day: Int) -> PracticeSession {
        PracticeSession(
            id: UUID().uuidString,
            userId: userId,
            day: day,
            startedAt: Date(),
            endedAt: nil,
            durationSeconds: nil,
            exercisesCompleted: 0,
            confidenceBefore: nil,
            confidenceAfter: nil,
            xpEarned: 0,
            missionCompleted: false,
            notes: nil,
            fluencyScore: nil,
            syllablesPerMinute: nil,
            percentageSyllablesStuttered: nil,
            blockCount: nil
        )
    }
}
