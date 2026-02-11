import Foundation

// MARK: - AI Service (Direct API — no Firebase Cloud Functions)

/// Sends conversation messages to the Vercel-hosted AI endpoint.
/// The endpoint uses Claude (Anthropic) with scenario-specific system prompts.
final class AIService {

    private let apiService = APIService()

    // MARK: - Scenario System Prompts (kept for reference — server applies these)

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

    /// Sends a message to the AI conversation endpoint.
    /// - Parameters:
    ///   - scenario: The conversation scenario type
    ///   - messages: Full conversation history
    ///   - userMessage: The new user message
    ///   - metrics: Optional live speech metrics for adaptive AI behavior
    /// - Returns: The assistant's response text
    func sendMessage(
        scenario: ScenarioType,
        messages: [ChatMessage],
        userMessage: String,
        metrics: LiveSpeechMetrics? = nil
    ) async throws -> String {
        let messageData = messages.map { msg -> [String: String] in
            ["role": msg.role.rawValue, "content": msg.content]
        }

        var speechMetrics: SpeechMetricsDTO? = nil
        if let metrics, metrics.runningSPM > 0 || metrics.runningBlockCount > 0 {
            speechMetrics = SpeechMetricsDTO(
                currentSPM: metrics.runningSPM > 0 ? metrics.runningSPM : nil,
                vocalEffort: nil,
                recentDisfluencies: metrics.runningBlockCount > 0 ? metrics.runningBlockCount : nil,
                detectedTechniques: nil
            )
        }

        let response = try await apiService.sendAIMessage(
            scenario: scenario.rawValue,
            messages: messageData,
            userMessage: userMessage,
            speechMetrics: speechMetrics
        )

        return response.message
    }

    enum AIServiceError: LocalizedError {
        case invalidResponse

        var errorDescription: String? {
            "Invalid response from AI service."
        }
    }
}
