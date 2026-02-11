import Foundation

// MARK: - Content Level

enum ContentLevel: String {
    case words = "Words"
    case phrases = "Phrases"
    case sentences = "Sentences"
    case paragraphs = "Paragraphs"
}

// MARK: - Reading Content (ported from src/lib/practice/daily-session.ts)

enum ReadingContent {

    /// Determine content level based on program day
    static func contentLevel(for day: Int) -> ContentLevel {
        if day <= 14 { return .words }
        if day <= 30 { return .phrases }
        if day <= 50 { return .sentences }
        return .paragraphs
    }

    /// Get items for a content level
    static func items(for level: ContentLevel) -> [String] {
        switch level {
        case .words:      return words
        case .phrases:    return phrases
        case .sentences:  return sentences
        case .paragraphs: return paragraphs
        }
    }

    // MARK: - Words (Phase 1: Days 1-14)

    static let words: [String] = [
        "hello", "morning", "water", "today", "happy",
        "beautiful", "sunshine", "together", "wonderful", "practice",
        "breathing", "gentle", "slowly", "natural", "progress",
    ]

    // MARK: - Phrases (Phase 2: Days 15-30)

    static let phrases: [String] = [
        "Good morning",
        "How are you today",
        "I would like to order",
        "My name is",
        "Thank you very much",
        "Nice to meet you",
        "Can I help you",
        "I'm doing well",
    ]

    // MARK: - Sentences (Phase 3: Days 31-50)

    static let sentences: [String] = [
        "I am practicing my speech techniques today.",
        "The weather is beautiful this morning.",
        "Could you please help me find the right section?",
        "I'd like to schedule an appointment for next week.",
        "Thank you for your patience and understanding.",
        "I'm working on improving my fluency every day.",
    ]

    // MARK: - Paragraphs (Phase 4-5: Days 51+)

    static let paragraphs: [String] = [
        "Speaking is a skill that improves with practice. Every time you use your techniques — gentle onset, light contact, or pacing — you build new neural pathways. The key is consistency, not perfection. Some days will feel easier than others, and that is completely normal.",
        "The ocean waves rolled gently onto the shore as the sun began to set. A cool breeze carried the scent of salt and seaweed. Children played near the water's edge while their parents watched from colorful beach chairs. It was the perfect end to a long summer day.",
    ]
}
