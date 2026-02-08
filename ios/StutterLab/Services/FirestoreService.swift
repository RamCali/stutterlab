import FirebaseFirestore
import Foundation

// MARK: - Firestore Service

/// Central data layer for all Firestore CRUD operations.
/// Collections:
///   users/{uid}                    — UserProfile
///   users/{uid}/sessions/{id}      — PracticeSession
///   users/{uid}/checkIns/{date}    — DailyCheckIn
///   users/{uid}/conversations/{id} — AIConversation
///   users/{uid}/analyses/{id}      — SpeechAnalysisResult
///   exercises/{id}                 — Exercise (global, read-only)
final class FirestoreService {

    private let db = Firestore.firestore()

    // MARK: - User Profile

    func getProfile(userId: String) async throws -> UserProfile? {
        let doc = try await db.collection("users").document(userId).getDocument()
        return try doc.data(as: UserProfile.self)
    }

    func saveProfile(_ profile: UserProfile) async throws {
        try db.collection("users").document(profile.id).setData(from: profile, merge: true)
    }

    func updateStreak(userId: String, currentStreak: Int, longestStreak: Int, lastPracticeDate: Date) async throws {
        try await db.collection("users").document(userId).updateData([
            "currentStreak": currentStreak,
            "longestStreak": longestStreak,
            "lastPracticeDate": Timestamp(date: lastPracticeDate),
        ])
    }

    func incrementDay(userId: String, newDay: Int) async throws {
        try await db.collection("users").document(userId).updateData([
            "currentDay": newDay,
        ])
    }

    func addXP(userId: String, xp: Int) async throws {
        try await db.collection("users").document(userId).updateData([
            "totalXP": FieldValue.increment(Int64(xp)),
            "totalExercisesCompleted": FieldValue.increment(Int64(1)),
        ])
    }

    // MARK: - Sessions

    func saveSession(_ session: PracticeSession, userId: String) async throws {
        try db.collection("users").document(userId)
            .collection("sessions").document(session.id)
            .setData(from: session)
    }

    func getSessions(userId: String, limit: Int = 30) async throws -> [PracticeSession] {
        let snapshot = try await db.collection("users").document(userId)
            .collection("sessions")
            .order(by: "startedAt", descending: true)
            .limit(to: limit)
            .getDocuments()
        return try snapshot.documents.compactMap { try $0.data(as: PracticeSession.self) }
    }

    // MARK: - Check-Ins

    func saveCheckIn(_ checkIn: DailyCheckIn, userId: String) async throws {
        let dateKey = ISO8601DateFormatter().string(from: checkIn.date).prefix(10)
        try db.collection("users").document(userId)
            .collection("checkIns").document(String(dateKey))
            .setData(from: checkIn)
    }

    func getCheckIns(userId: String, limit: Int = 30) async throws -> [DailyCheckIn] {
        let snapshot = try await db.collection("users").document(userId)
            .collection("checkIns")
            .order(by: "date", descending: true)
            .limit(to: limit)
            .getDocuments()
        return try snapshot.documents.compactMap { try $0.data(as: DailyCheckIn.self) }
    }

    // MARK: - AI Conversations

    func saveConversation(_ conversation: AIConversation, userId: String) async throws {
        try db.collection("users").document(userId)
            .collection("conversations").document(conversation.id)
            .setData(from: conversation)
    }

    func getConversations(userId: String, limit: Int = 20) async throws -> [AIConversation] {
        let snapshot = try await db.collection("users").document(userId)
            .collection("conversations")
            .order(by: "createdAt", descending: true)
            .limit(to: limit)
            .getDocuments()
        return try snapshot.documents.compactMap { try $0.data(as: AIConversation.self) }
    }

    // MARK: - Speech Analyses

    func saveAnalysis(_ analysis: SpeechAnalysisResult, userId: String) async throws {
        try db.collection("users").document(userId)
            .collection("analyses").document(analysis.id)
            .setData(from: analysis)
    }

    func getAnalyses(userId: String, limit: Int = 30) async throws -> [SpeechAnalysisResult] {
        let snapshot = try await db.collection("users").document(userId)
            .collection("analyses")
            .order(by: "analyzedAt", descending: true)
            .limit(to: limit)
            .getDocuments()
        return try snapshot.documents.compactMap { try $0.data(as: SpeechAnalysisResult.self) }
    }

    // MARK: - Exercises (global collection)

    func getExercises() async throws -> [Exercise] {
        let snapshot = try await db.collection("exercises")
            .order(by: "sortOrder")
            .getDocuments()
        return try snapshot.documents.compactMap { try $0.data(as: Exercise.self) }
    }
}
