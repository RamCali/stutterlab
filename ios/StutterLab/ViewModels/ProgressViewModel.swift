import SwiftUI

// MARK: - Progress View Model

@MainActor
final class ProgressViewModel: ObservableObject {

    @Published var sessions: [SessionDTO] = []
    @Published var analytics: AnalyticsResponse?
    @Published var isLoading = false

    private let apiService = APIService()

    private static let flexibleDateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        f.locale = Locale(identifier: "en_US_POSIX")
        return f
    }()

    private func parseDate(_ dateStr: String) -> Date? {
        ISO8601DateFormatter().date(from: dateStr)
            ?? Self.flexibleDateFormatter.date(from: dateStr)
    }

    // MARK: Computed Stats

    var totalPracticeMinutes: Int {
        sessions.compactMap(\.durationSeconds).reduce(0, +) / 60
    }

    var totalSessions: Int {
        sessions.count
    }

    var latestFluencyScore: Double? {
        guard let score = sessions.first(where: { $0.selfRatedFluency != nil })?.selfRatedFluency else {
            return nil
        }
        return Double(score) * 10 // Convert 1-10 to 0-100
    }

    var averageFluency: Double? {
        let scores = sessions.compactMap(\.selfRatedFluency)
        guard !scores.isEmpty else { return nil }
        return Double(scores.reduce(0, +)) / Double(scores.count) * 10
    }

    var fluencyTrend: MetricCard.MetricTrend? {
        let scores = sessions.compactMap(\.selfRatedFluency)
        guard scores.count >= 4 else { return nil }
        let half = scores.count / 2
        let recentAvg = Double(scores.prefix(half).reduce(0, +)) / Double(half)
        let olderAvg = Double(scores.suffix(half).reduce(0, +)) / Double(half)
        let delta = recentAvg - olderAvg
        if delta > 0.5 { return .up }
        if delta < -0.5 { return .down }
        return .stable
    }

    var averageConfidenceDelta: Double? {
        let deltas = sessions.compactMap { s -> Int? in
            guard let before = s.confidenceBefore, let after = s.confidenceAfter else { return nil }
            return after - before
        }
        guard !deltas.isEmpty else { return nil }
        return Double(deltas.reduce(0, +)) / Double(deltas.count)
    }

    var practiceDates: Set<Date> {
        let calendar = Calendar.current
        let dates: [Date] = sessions.compactMap { s in
            guard let dateStr = s.createdAt, let date = parseDate(dateStr) else { return nil }
            return calendar.startOfDay(for: date)
        }
        return Set(dates)
    }

    var weeklySessionCount: Int {
        let calendar = Calendar.current
        let weekAgo = calendar.date(byAdding: .day, value: -7, to: Date()) ?? Date()
        return sessions.filter { s in
            guard let dateStr = s.createdAt, let date = parseDate(dateStr) else { return false }
            return date >= weekAgo
        }.count
    }

    // MARK: - Load Data

    func loadData() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let response = try await apiService.getSessions(limit: 100)
            sessions = response.sessions
        } catch {
            print("Failed to load progress data: \(error)")
        }
    }

    func loadAnalytics() async {
        do {
            analytics = try await AnalyticsService.getAnalytics()
        } catch {
            print("Failed to load analytics: \(error)")
        }
    }
}
