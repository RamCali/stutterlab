import Foundation

// MARK: - Achievement

struct Achievement: Identifiable {
    let id: String
    let title: String
    let description: String
    let icon: String // SF Symbol
    let xpReward: Int
    let category: Category
    var unlocked: Bool = false

    enum Category: String, CaseIterable {
        case gettingStarted = "Getting Started"
        case streaks = "Streaks"
        case volume = "Volume"
        case practiceTime = "Practice Time"
        case conversations = "Conversations"
        case fearedWords = "Feared Words"
        case xpMilestones = "XP Milestones"
    }

    // MARK: - All Achievements (matches web's 22 achievements)

    static let all: [Achievement] = [
        // Getting Started
        Achievement(id: "first_steps", title: "First Steps", description: "Complete your first exercise", icon: "target", xpReward: 25, category: .gettingStarted),
        Achievement(id: "warm_up", title: "Warm Up", description: "Complete 5 exercises", icon: "sunrise.fill", xpReward: 50, category: .gettingStarted),
        Achievement(id: "ten_sessions", title: "Double Digits", description: "Complete 10 exercises", icon: "10.circle.fill", xpReward: 75, category: .gettingStarted),

        // Streaks
        Achievement(id: "streak_3", title: "Consistent", description: "3-day practice streak", icon: "flame.fill", xpReward: 30, category: .streaks),
        Achievement(id: "streak_7", title: "Dedicated", description: "7-day practice streak", icon: "bolt.fill", xpReward: 75, category: .streaks),
        Achievement(id: "streak_14", title: "Two Weeks Strong", description: "14-day practice streak", icon: "hand.raised.fill", xpReward: 150, category: .streaks),
        Achievement(id: "streak_30", title: "Monthly Master", description: "30-day practice streak", icon: "star.fill", xpReward: 300, category: .streaks),
        Achievement(id: "streak_60", title: "Unstoppable", description: "60-day practice streak", icon: "trophy.fill", xpReward: 500, category: .streaks),
        Achievement(id: "streak_90", title: "Program Graduate", description: "90-day practice streak", icon: "graduationcap.fill", xpReward: 1000, category: .streaks),

        // Volume
        Achievement(id: "fifty_sessions", title: "Half Century", description: "Complete 50 exercises", icon: "target", xpReward: 150, category: .volume),
        Achievement(id: "century", title: "Century", description: "Complete 100 exercises", icon: "100.circle", xpReward: 300, category: .volume),

        // Practice Time
        Achievement(id: "hour_one", title: "First Hour", description: "Practice for 1 hour total", icon: "timer", xpReward: 50, category: .practiceTime),
        Achievement(id: "five_hours", title: "Dedicated Practitioner", description: "Practice for 5 hours total", icon: "book.fill", xpReward: 150, category: .practiceTime),
        Achievement(id: "ten_hours", title: "Time Investor", description: "Practice for 10 hours total", icon: "clock.fill", xpReward: 250, category: .practiceTime),

        // Conversations
        Achievement(id: "brave_caller", title: "Brave Caller", description: "Complete your first AI conversation", icon: "phone.fill", xpReward: 50, category: .conversations),
        Achievement(id: "social_butterfly", title: "Social Butterfly", description: "Complete 10 AI conversations", icon: "butterfly.fill", xpReward: 150, category: .conversations),
        Achievement(id: "conversation_pro", title: "Conversation Pro", description: "Complete 25 AI conversations", icon: "bubble.left.and.bubble.right.fill", xpReward: 300, category: .conversations),

        // Feared Words
        Achievement(id: "word_warrior", title: "Word Warrior", description: "Master your first feared word", icon: "textformat.abc", xpReward: 50, category: .fearedWords),
        Achievement(id: "word_conqueror", title: "Word Conqueror", description: "Master 10 feared words", icon: "crown.fill", xpReward: 200, category: .fearedWords),

        // XP Milestones
        Achievement(id: "xp_500", title: "Rising Star", description: "Earn 500 XP", icon: "star.circle.fill", xpReward: 25, category: .xpMilestones),
        Achievement(id: "xp_2000", title: "Shining Bright", description: "Earn 2,000 XP", icon: "sparkles", xpReward: 50, category: .xpMilestones),
        Achievement(id: "xp_5000", title: "XP Legend", description: "Earn 5,000 XP", icon: "medal.fill", xpReward: 100, category: .xpMilestones),
    ]
}

// MARK: - Challenge

struct Challenge: Identifiable {
    let id: String
    let title: String
    let description: String
    let category: Category
    let difficulty: Difficulty
    let xpReward: Int
    let icon: String // SF Symbol
    let tips: [String]

    enum Category: String, CaseIterable {
        case phone = "Phone"
        case social = "Social"
        case ordering = "Ordering"
        case work = "Work"
        case general = "General"

        var color: String {
            switch self {
            case .phone: return "007AFF"
            case .social: return "48C6B3"
            case .ordering: return "FFB347"
            case .work: return "FF6B6B"
            case .general: return "00E676"
            }
        }
    }

    enum Difficulty: String, CaseIterable {
        case easy = "Easy"
        case medium = "Medium"
        case hard = "Hard"

        var color: String {
            switch self {
            case .easy: return "00E676"
            case .medium: return "FFB347"
            case .hard: return "FF6B6B"
            }
        }
    }

    // MARK: - All 15 Challenges (matches web)

    static let all: [Challenge] = [
        // Easy
        Challenge(id: "order-coffee", title: "Order a Coffee", description: "Go to a coffee shop and order your drink by speaking to the barista.", category: .ordering, difficulty: .easy, xpReward: 50, icon: "cup.and.saucer.fill", tips: ["Take a breath before ordering", "Use gentle onset on the first word", "It's okay to pause"]),
        Challenge(id: "greet-stranger", title: "Greet a Stranger", description: "Say hello or good morning to someone you pass by today.", category: .social, difficulty: .easy, xpReward: 40, icon: "hand.wave.fill", tips: ["A simple 'hi' counts", "Smile — it relaxes your vocal cords"]),
        Challenge(id: "ask-directions", title: "Ask for Directions", description: "Ask someone for directions to a nearby place, even if you know the way.", category: .social, difficulty: .easy, xpReward: 50, icon: "map.fill", tips: ["Start with 'Excuse me...'", "Use prolonged speech on the first syllable"]),
        Challenge(id: "read-aloud-5", title: "Read Aloud for 5 Minutes", description: "Read a book, article, or website out loud for 5 minutes.", category: .general, difficulty: .easy, xpReward: 30, icon: "book.fill", tips: ["Read at a comfortable pace", "Focus on smooth airflow", "Pause at commas and periods"]),
        Challenge(id: "introduce-yourself", title: "Introduce Yourself", description: "Introduce yourself to someone new today — your name, what you do.", category: .social, difficulty: .easy, xpReward: 50, icon: "person.badge.plus", tips: ["Practice your intro once before", "Gentle onset on your name", "Eye contact shows confidence"]),

        // Medium
        Challenge(id: "phone-call-simple", title: "Make a Phone Call", description: "Call a business to ask about their hours or a product.", category: .phone, difficulty: .medium, xpReward: 75, icon: "phone.fill", tips: ["Write down what you'll say first", "Take 3 breaths before dialing", "You control the pace"]),
        Challenge(id: "order-food-restaurant", title: "Order at a Restaurant", description: "Order your meal by speaking directly to the server. No pointing!", category: .ordering, difficulty: .medium, xpReward: 75, icon: "fork.knife", tips: ["Order what you WANT, not what's easy to say", "Pause between items", "Gentle onset technique"]),
        Challenge(id: "small-talk-coworker", title: "Small Talk with a Coworker", description: "Start a casual conversation with a coworker about their weekend.", category: .work, difficulty: .medium, xpReward: 75, icon: "bubble.left.fill", tips: ["Ask open-ended questions", "Listen actively", "It's a conversation, not a performance"]),
        Challenge(id: "return-item", title: "Return an Item", description: "Return or exchange something at a store. Explain the reason.", category: .ordering, difficulty: .medium, xpReward: 80, icon: "arrow.uturn.left.circle.fill", tips: ["Plan your explanation beforehand", "You have every right to return items"]),
        Challenge(id: "ask-question-meeting", title: "Ask a Question in a Meeting", description: "Raise your hand and ask a question during a meeting or class.", category: .work, difficulty: .medium, xpReward: 100, icon: "hand.raised.fill", tips: ["Write your question down first", "Start with a breath", "Your question matters"]),

        // Hard
        Challenge(id: "phone-reservation", title: "Make a Reservation", description: "Call a restaurant and make a dinner reservation.", category: .phone, difficulty: .hard, xpReward: 100, icon: "phone.arrow.up.right.fill", tips: ["Have date/time/party size ready", "Spell your name if needed — take your time"]),
        Challenge(id: "present-idea", title: "Present an Idea", description: "Share an idea or suggestion during a team meeting.", category: .work, difficulty: .hard, xpReward: 125, icon: "lightbulb.fill", tips: ["Outline your idea in 3 points", "Slow, controlled breathing", "Your ideas deserve to be heard"]),
        Challenge(id: "complaint-phone", title: "Make a Complaint", description: "Call a company about an issue with a product or service.", category: .phone, difficulty: .hard, xpReward: 100, icon: "exclamationmark.bubble.fill", tips: ["Write down your main points", "Be assertive but calm"]),
        Challenge(id: "story-group", title: "Tell a Story to a Group", description: "Tell a story or anecdote to 3+ people.", category: .social, difficulty: .hard, xpReward: 125, icon: "theatermasks.fill", tips: ["Pick a story you know well", "Use pauses for dramatic effect"]),
        Challenge(id: "voicemail", title: "Leave a Voicemail", description: "Call someone and leave a voicemail with your name and message.", category: .phone, difficulty: .hard, xpReward: 100, icon: "envelope.fill", tips: ["Plan: name, reason, callback number", "Speak slowly and clearly"]),
    ]

    /// Get challenge for a given program day (cycles through all 15)
    static func forDay(_ day: Int) -> Challenge {
        let index = (day - 1) % all.count
        return all[index]
    }
}

// MARK: - Level System (matches web's 13 levels)

struct LevelSystem {
    static let titles = [
        "Beginner",          // 1
        "Getting Started",   // 2
        "Warming Up",        // 3
        "Building Momentum", // 4
        "Finding Your Voice",// 5
        "Confident Speaker", // 6
        "Fluency Builder",   // 7
        "Technique Master",  // 8
        "Speech Warrior",    // 9
        "Fluency Champion",  // 10
        "Voice Virtuoso",    // 11
        "Communication Pro", // 12
        "Speech Legend",     // 13
    ]

    static func xpRequired(for level: Int) -> Int {
        guard level > 1 else { return 0 }
        return Int(round(50 * pow(Double(level - 1), 1.8)))
    }

    static func level(for totalXP: Int) -> Int {
        var level = 1
        while level < titles.count && xpRequired(for: level + 1) <= totalXP {
            level += 1
        }
        return level
    }

    static func title(for level: Int) -> String {
        guard level >= 1, level <= titles.count else { return titles.last! }
        return titles[level - 1]
    }

    static func progress(totalXP: Int) -> (level: Int, title: String, xpInLevel: Int, xpNeeded: Int, percent: Double) {
        let lvl = level(for: totalXP)
        let currentLevelXP = xpRequired(for: lvl)
        let nextLevelXP = xpRequired(for: lvl + 1)
        let xpInLevel = totalXP - currentLevelXP
        let xpNeeded = nextLevelXP - currentLevelXP
        let pct = xpNeeded > 0 ? min(1.0, Double(xpInLevel) / Double(xpNeeded)) : 1.0
        return (lvl, title(for: lvl), xpInLevel, xpNeeded, pct)
    }
}
