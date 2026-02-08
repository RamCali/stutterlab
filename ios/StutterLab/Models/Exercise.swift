import Foundation

// MARK: - Exercise

struct Exercise: Codable, Identifiable {
    let id: String
    var title: String
    var description: String
    var type: ExerciseType
    var technique: String
    var difficulty: Difficulty
    var instructions: String
    var contentJSON: [String: AnyCodable]? // exercise-specific data
    var audioURL: String?
    var durationSeconds: Int?
    var isPremium: Bool
    var sortOrder: Int
    var evidenceLevel: EvidenceLevel
    var effectSize: String? // e.g. "d = 0.75-1.63"
    var citation: String?
    var createdAt: Date

    static func sample(
        type: ExerciseType,
        title: String,
        difficulty: Difficulty = .beginner
    ) -> Exercise {
        Exercise(
            id: UUID().uuidString,
            title: title,
            description: "Practice \(type.displayName) technique",
            type: type,
            technique: type.displayName,
            difficulty: difficulty,
            instructions: "Follow the guided prompts to practice this technique.",
            contentJSON: nil,
            audioURL: nil,
            durationSeconds: 300,
            isPremium: false,
            sortOrder: 0,
            evidenceLevel: type.evidenceLevel,
            effectSize: type.evidenceLevel.effectSizeRange,
            citation: nil,
            createdAt: Date()
        )
    }
}

// MARK: - AnyCodable (lightweight wrapper for Firestore JSON)

struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) {
        self.value = value
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let string = try? container.decode(String.self) {
            value = string
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map(\.value)
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            value = dict.mapValues(\.value)
        } else {
            value = NSNull()
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch value {
        case let string as String: try container.encode(string)
        case let int as Int: try container.encode(int)
        case let double as Double: try container.encode(double)
        case let bool as Bool: try container.encode(bool)
        default: try container.encodeNil()
        }
    }
}
