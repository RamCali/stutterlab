import Foundation

// MARK: - Daily Check-In

struct DailyCheckIn: Codable, Identifiable {
    let id: String
    let userId: String
    let date: Date
    var confidenceRating: Int // 1-10
    var emotionalTag: EmotionalTag?
    var intention: String?   // "What's your intention for today's practice?"
    var reflection: String?  // "How did your practice feel?"

    static func new(userId: String) -> DailyCheckIn {
        DailyCheckIn(
            id: UUID().uuidString,
            userId: userId,
            date: Date(),
            confidenceRating: 5,
            emotionalTag: nil,
            intention: nil,
            reflection: nil
        )
    }
}
