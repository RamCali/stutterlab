import Foundation

// MARK: - Daily Task

struct DailyTask: Codable, Identifiable {
    let id: String
    var title: String
    var subtitle: String
    var duration: String
    var type: TaskType
    var isPremium: Bool
    var isCompleted: Bool

    init(
        title: String,
        subtitle: String,
        duration: String,
        type: TaskType,
        isPremium: Bool = false,
        isCompleted: Bool = false
    ) {
        self.id = UUID().uuidString
        self.title = title
        self.subtitle = subtitle
        self.duration = duration
        self.type = type
        self.isPremium = isPremium
        self.isCompleted = isCompleted
    }

    var icon: String {
        switch type {
        case .warmup: return "wind"
        case .exercise: return "waveform.path"
        case .audioLab: return "headphones"
        case .journal: return "mic.fill"
        case .ai: return "bubble.left.and.text.bubble.right.fill"
        case .mindfulness: return "leaf.fill"
        case .learn: return "book.fill"
        case .challenge: return "flag.fill"
        case .fearedWords: return "textformat.abc"
        }
    }
}

// MARK: - Real World Mission

struct RealWorldMission: Codable {
    let description: String
    let technique: String
    var isCompleted: Bool
    let bonusXP: Int

    static func mission(for day: Int, phase: Int) -> RealWorldMission {
        let missions: [(description: String, technique: String)] = {
            switch phase {
            case 1:
                return [
                    ("Say 'good morning' to someone using easy onset", "Gentle Onset"),
                    ("Greet a family member with a slow, gentle start", "Gentle Onset"),
                    ("Say 'thank you' at a store using easy onset", "Gentle Onset"),
                    ("Introduce yourself to someone using a gentle start", "Gentle Onset"),
                    ("Ask 'how are you?' using diaphragmatic breathing", "Breathing"),
                    ("Read a menu item aloud at a restaurant", "Pausing"),
                    ("Say your name and order using easy onset", "Gentle Onset"),
                ]
            case 2:
                return [
                    ("Order a drink using light contact on the first word", "Light Contact"),
                    ("Ask a store employee a question using prolonged speech", "Prolonged Speech"),
                    ("Make a brief phone call using light contact", "Light Contact"),
                    ("Tell someone about your day using pausing", "Pausing"),
                    ("Read a sign out loud with continuous phonation", "Prolonged Speech"),
                    ("Ask for directions using light articulatory contact", "Light Contact"),
                ]
            case 3:
                return [
                    ("Make a 30-second phone call using pausing", "Pausing"),
                    ("Order food and ask a follow-up question", "Cancellation"),
                    ("Start a conversation with a stranger at a store", "Pull-Out"),
                    ("Call a business and ask about their hours", "Preparatory Set"),
                    ("Tell a coworker about your weekend using techniques", "Combined"),
                    ("Ask a waiter a question about the menu", "Pull-Out"),
                ]
            case 4:
                return [
                    ("Introduce yourself to a stranger using pull-outs if needed", "Pull-Out"),
                    ("Make a 2-minute phone call about an appointment", "Combined"),
                    ("Have a full conversation ordering at a restaurant", "Combined"),
                    ("Ask for help at a store and have a back-and-forth", "Cancellation"),
                    ("Participate actively in a group conversation", "Combined"),
                    ("Make a cold call to schedule something", "Preparatory Set"),
                ]
            default: // Phase 5
                return [
                    ("Lead a 2-minute conversation with a colleague", "Combined"),
                    ("Give a short impromptu presentation or update", "Combined"),
                    ("Make a challenging phone call you've been avoiding", "Combined"),
                    ("Have a 5-minute conversation with someone new", "Combined"),
                    ("Speak up in a meeting or group setting", "Combined"),
                    ("Tell a story to a group of people", "Combined"),
                ]
            }
        }()

        let index = (day - 1) % missions.count
        let mission = missions[index]
        return RealWorldMission(
            description: mission.description,
            technique: mission.technique,
            isCompleted: false,
            bonusXP: 20 // 2x base session XP
        )
    }
}

// MARK: - Daily Plan

struct DailyPlan: Codable, Identifiable {
    var id: String { "day-\(day)" }
    let day: Int
    let phase: Int
    let phaseLabel: String
    let title: String
    let affirmation: String
    var tasks: [DailyTask]
    let realWorldMission: RealWorldMission
}
