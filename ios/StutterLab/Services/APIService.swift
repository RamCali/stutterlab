import Foundation

// MARK: - API Service (replaces FirestoreService)

/// Central data layer — all reads/writes go through the Vercel backend.
final class APIService {

    private let client = APIClient.shared

    // MARK: - User Profile

    func getProfile() async throws -> ProfileResponse {
        try await client.get("/api/mobile/profile")
    }

    func updateProfile(_ update: ProfileUpdate) async throws {
        try await client.putVoid("/api/mobile/profile", body: update)
    }

    func completeOnboarding(data: OnboardingPayload) async throws {
        let update = FullOnboardingUpdate(
            name: data.name,
            treatmentPath: FullTreatmentPath(
                stutteringType: "developmental",
                severity: data.severity.rawValue,
                stutteringTypes: data.stutteringTypes,
                confidenceRatings: data.confidenceRatings,
                fearedSituations: data.fearedSituations,
                fearedWords: data.fearedWords,
                avoidanceBehaviors: data.avoidanceBehaviors,
                speakingFrequency: data.speakingFrequency,
                speechChallenges: data.speechChallenges,
                northStarGoal: data.northStarGoal,
                severityScore: data.severityScore,
                confidenceScore: data.confidenceScore,
                assessmentProfile: data.assessmentProfile,
                goals: data.speechChallenges
            )
        )
        try await client.putVoid("/api/mobile/profile", body: update)
    }

    // MARK: - Sessions

    func saveSession(_ session: SessionSaveRequest) async throws -> SessionSaveResponse {
        try await client.post("/api/mobile/sessions", body: session)
    }

    func getSessions(limit: Int = 30) async throws -> SessionsListResponse {
        try await client.get(
            "/api/mobile/sessions",
            queryItems: [URLQueryItem(name: "limit", value: "\(limit)")]
        )
    }

    // MARK: - AI Conversation

    func sendAIMessage(
        scenario: String,
        messages: [[String: String]],
        userMessage: String,
        speechMetrics: SpeechMetricsDTO? = nil
    ) async throws -> AIMessageResponse {
        try await client.post(
            "/api/ai-conversation",
            body: AIConversationRequest(
                scenario: scenario,
                messages: messages,
                userMessage: userMessage,
                speechMetrics: speechMetrics
            )
        )
    }
}

// MARK: - Request/Response DTOs

struct ProfileUpdate: Encodable {
    var name: String?
    var image: String?
    var treatmentPath: TreatmentPathUpdate?
}

struct TreatmentPathUpdate: Encodable {
    let severity: String
    let goals: [String]
    let stutteringType: String
}

struct OnboardingUpdate: Encodable {
    let treatmentPath: TreatmentPathUpdate
}

struct FullOnboardingUpdate: Encodable {
    let name: String
    let treatmentPath: FullTreatmentPath
}

struct FullTreatmentPath: Encodable {
    let stutteringType: String
    let severity: String
    let stutteringTypes: [String]
    let confidenceRatings: [String: Int]
    let fearedSituations: [String]
    let fearedWords: [String]
    let avoidanceBehaviors: [String]
    let speakingFrequency: String
    let speechChallenges: [String]
    let northStarGoal: String
    let severityScore: Int
    let confidenceScore: Int
    let assessmentProfile: String
    let goals: [String]
}

struct SessionSaveRequest: Encodable {
    let exerciseType: String
    let durationSeconds: Int
    let fluencyScore: Double?
    let confidenceBefore: Int?
    let confidenceAfter: Int?
    let exercisesCompleted: Int
    let notes: String?
}

struct SessionSaveResponse: Decodable {
    let sessionId: String
    let xpEarned: Int
    let currentStreak: Int
    let longestStreak: Int
}

struct SessionsListResponse: Decodable {
    let sessions: [SessionDTO]
}

struct SessionDTO: Decodable, Identifiable {
    let id: String
    let exerciseType: String?
    let durationSeconds: Int?
    let selfRatedFluency: Int?
    let confidenceBefore: Int?
    let confidenceAfter: Int?
    let createdAt: String?
}

struct AIConversationRequest: Encodable {
    let scenario: String
    let messages: [[String: String]]
    let userMessage: String
    let speechMetrics: SpeechMetricsDTO?
}

struct SpeechMetricsDTO: Encodable {
    let currentSPM: Double?
    let vocalEffort: Double?
    let recentDisfluencies: Int?
    let detectedTechniques: [String]?
}

struct AIMessageResponse: Decodable {
    let message: String
}
