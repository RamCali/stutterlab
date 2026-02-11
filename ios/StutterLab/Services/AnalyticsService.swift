import Foundation

// MARK: - Analytics Response Models

struct AnalyticsResponse: Decodable {
    let ai: AIAnalytics
    let fearedWords: FearedWordsAnalytics
    let anxiety: AnxietyAnalytics?
}

struct AIAnalytics: Decodable {
    let totalConversations: Int
    let avgFluency: Int?
    let totalMinutes: Int
    let scenarioBreakdown: [ScenarioBreakdown]
    let techniqueFrequency: [TechniqueFrequency]
}

struct ScenarioBreakdown: Decodable, Identifiable {
    var id: String { name }
    let name: String
    let count: Int
    let avgScore: Int
}

struct TechniqueFrequency: Decodable, Identifiable {
    var id: String { name }
    let name: String
    let count: Int
}

struct FearedWordsAnalytics: Decodable {
    let total: Int
    let mastered: Int
    let masteryPercent: Int
    let byDifficulty: DifficultyBreakdown
    let totalReps: Int
}

struct DifficultyBreakdown: Decodable {
    let easy: Int
    let medium: Int
    let hard: Int
}

struct AnxietyAnalytics: Decodable {
    let totalSituations: Int
    let avgReduction: Double
    let byType: [AnxietyByType]
}

struct AnxietyByType: Decodable, Identifiable {
    var id: String { type }
    let type: String
    let count: Int
    let avgReduction: Double
}

// MARK: - Analytics Service

enum AnalyticsService {
    static func getAnalytics() async throws -> AnalyticsResponse {
        try await APIClient.shared.get("/api/mobile/analytics")
    }
}
