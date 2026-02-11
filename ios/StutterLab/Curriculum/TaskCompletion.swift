import Foundation

// MARK: - Task Completion Persistence (iOS equivalent of web localStorage)

@MainActor
final class TaskCompletionManager: ObservableObject {

    @Published var completedTypes: Set<String> = []
    private var currentDay: Int = 0

    private static let keyPrefix = "stutterlab_task_completions_day_"

    // MARK: - Load

    func load(for day: Int) {
        currentDay = day
        let key = Self.keyPrefix + "\(day)"
        if let data = UserDefaults.standard.data(forKey: key),
           let types = try? JSONDecoder().decode(Set<String>.self, from: data) {
            completedTypes = types
        } else {
            completedTypes = []
        }
        cleanupOldEntries(currentDay: day)
    }

    // MARK: - Mark Completed

    func markCompleted(taskType: String) {
        completedTypes.insert(taskType)
        save()
    }

    func isCompleted(taskType: String) -> Bool {
        completedTypes.contains(taskType)
    }

    // MARK: - All Complete

    func isAllComplete(totalTasks: Int) -> Bool {
        completedTypes.count >= totalTasks
    }

    var completedCount: Int {
        completedTypes.count
    }

    // MARK: - Persistence

    private func save() {
        let key = Self.keyPrefix + "\(currentDay)"
        if let data = try? JSONEncoder().encode(completedTypes) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }

    private func cleanupOldEntries(currentDay: Int) {
        // Keep only last 7 days of data
        let keysToKeep = Set((max(1, currentDay - 6)...currentDay).map { Self.keyPrefix + "\($0)" })
        let allKeys = UserDefaults.standard.dictionaryRepresentation().keys
        for key in allKeys where key.hasPrefix(Self.keyPrefix) && !keysToKeep.contains(key) {
            UserDefaults.standard.removeObject(forKey: key)
        }
    }
}
