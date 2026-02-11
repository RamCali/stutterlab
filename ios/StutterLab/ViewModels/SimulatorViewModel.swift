import Foundation

// MARK: - Simulator View Model

@MainActor
final class SimulatorViewModel: ObservableObject {

    @Published var conversation: AIConversation?
    @Published var isLoading = false
    @Published var inputText = ""
    @Published var error: String?

    private let aiService = AIService()
    private let apiService = APIService()

    var messages: [ChatMessage] {
        conversation?.messages ?? []
    }

    // MARK: - Start Conversation

    func startConversation(userId: String, scenario: ScenarioType) {
        conversation = AIConversation.new(userId: userId, scenario: scenario)
        error = nil

        // Send initial greeting from assistant
        Task {
            isLoading = true
            defer { isLoading = false }
            do {
                let greeting = try await aiService.sendMessage(
                    scenario: scenario,
                    messages: [],
                    userMessage: "[Start the conversation. The user just arrived/called.]"
                )
                conversation?.messages.append(.assistant(greeting))
            } catch {
                self.error = "Couldn't start the conversation. Check your connection."
            }
        }
    }

    // MARK: - Send Message

    func sendMessage() {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, let conversation else { return }

        let userMessage = ChatMessage.user(text)
        self.conversation?.messages.append(userMessage)
        inputText = ""
        error = nil

        Task {
            isLoading = true
            defer { isLoading = false }
            do {
                let response = try await aiService.sendMessage(
                    scenario: conversation.scenario,
                    messages: conversation.messages,
                    userMessage: text
                )
                self.conversation?.messages.append(.assistant(response))
            } catch {
                self.error = "Couldn't get a response. Try again."
            }
        }
    }

    // MARK: - End Conversation (save via BFF API)

    func endConversation(userId: String) async {
        guard var conv = conversation else { return }
        conv.completedAt = Date()
        if let start = conv.messages.first?.timestamp {
            conv.durationSeconds = Int(Date().timeIntervalSince(start))
        }

        // Save as a session on the backend
        do {
            let request = SessionSaveRequest(
                exerciseType: "ai_conversation",
                durationSeconds: conv.durationSeconds ?? 0,
                fluencyScore: conv.fluencyScore,
                confidenceBefore: nil,
                confidenceAfter: nil,
                exercisesCompleted: 1,
                notes: "AI: \(conv.scenario.displayName)"
            )
            _ = try await apiService.saveSession(request)
        } catch {
            print("Failed to save conversation: \(error)")
        }
        conversation = nil
    }
}
