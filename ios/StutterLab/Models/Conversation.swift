import Foundation

// MARK: - Chat Message

struct ChatMessage: Codable, Identifiable {
    let id: String
    let role: MessageRole
    let content: String
    let timestamp: Date

    enum MessageRole: String, Codable {
        case user
        case assistant
    }

    static func user(_ content: String) -> ChatMessage {
        ChatMessage(
            id: UUID().uuidString,
            role: .user,
            content: content,
            timestamp: Date()
        )
    }

    static func assistant(_ content: String) -> ChatMessage {
        ChatMessage(
            id: UUID().uuidString,
            role: .assistant,
            content: content,
            timestamp: Date()
        )
    }
}

// MARK: - AI Conversation

struct AIConversation: Codable, Identifiable {
    let id: String
    let userId: String
    let scenario: ScenarioType
    var messages: [ChatMessage]
    var fluencyScore: Double?
    var durationSeconds: Int?
    let createdAt: Date
    var completedAt: Date?

    var isComplete: Bool {
        completedAt != nil
    }

    static func new(userId: String, scenario: ScenarioType) -> AIConversation {
        AIConversation(
            id: UUID().uuidString,
            userId: userId,
            scenario: scenario,
            messages: [],
            fluencyScore: nil,
            durationSeconds: nil,
            createdAt: Date(),
            completedAt: nil
        )
    }
}
