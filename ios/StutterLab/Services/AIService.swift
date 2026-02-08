import FirebaseFunctions
import Foundation

// MARK: - AI Service

/// Proxies conversation requests to Claude API via Firebase Cloud Functions.
/// The Cloud Function validates auth, applies system prompt, and returns the response.
final class AIService {

    private let functions = Functions.functions()

    // MARK: - Scenario System Prompts

    /// Ported from src/app/api/ai-conversation/route.ts
    static let scenarioPrompts: [ScenarioType: String] = [
        .phoneCall:
            "You are a receptionist at a doctor's office. The user is calling to schedule an appointment. Be natural, ask relevant questions (name, preferred date/time, reason for visit). Be patient and kind.",
        .jobInterview:
            "You are a friendly but professional hiring manager conducting a job interview. Ask common interview questions one at a time. Be encouraging. The user is practicing speaking fluently during interviews.",
        .orderingFood:
            "You are a barista/waiter at a coffee shop. Take the user's order naturally. Ask about size, additions, name for the order. Be casual and friendly.",
        .classPresentation:
            "You are a supportive audience member at a presentation. The user will present a topic. Ask a question or two after they finish. Be encouraging.",
        .smallTalk:
            "You are at a casual social gathering. Start a light conversation with the user. Topics: weather, weekend plans, hobbies, movies. Be warm and easygoing.",
        .shopping:
            "You are a store employee. The user wants to return an item or ask about a product. Be helpful but ask for details like receipt, reason for return, etc.",
        .askingDirections:
            "You are a friendly stranger. The user is asking for directions to a place. Give clear but conversational directions. Ask if they need clarification.",
        .customerService:
            "You are a customer service representative on a phone call. Help the user resolve an issue with their account/order. Ask for details, be professional.",
        .meetingIntro:
            "You are at a professional meeting. The user is introducing themselves. React naturally, ask a follow-up question about their role or background.",
    ]

    // MARK: - Send Message

    /// Sends a message to the AI conversation Cloud Function.
    /// - Parameters:
    ///   - scenario: The conversation scenario type
    ///   - messages: Conversation history
    ///   - userMessage: The new message from the user
    /// - Returns: The assistant's response text
    func sendMessage(
        scenario: ScenarioType,
        messages: [ChatMessage],
        userMessage: String
    ) async throws -> String {
        let messageData = messages.map { msg in
            ["role": msg.role.rawValue, "content": msg.content]
        }

        let data: [String: Any] = [
            "scenario": scenario.rawValue,
            "messages": messageData,
            "userMessage": userMessage,
        ]

        let result = try await functions.httpsCallable("aiConversation").call(data)

        guard let response = result.data as? [String: Any],
              let message = response["message"] as? String
        else {
            throw AIServiceError.invalidResponse
        }

        return message
    }

    enum AIServiceError: LocalizedError {
        case invalidResponse

        var errorDescription: String? {
            switch self {
            case .invalidResponse:
                return "Invalid response from AI service."
            }
        }
    }
}
