import Foundation

// MARK: - StutterLab Enums (ported from schema.ts)

enum Severity: String, Codable, CaseIterable, Identifiable {
    case mild
    case moderate
    case severe

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .mild: return "Mild"
        case .moderate: return "Moderate"
        case .severe: return "Severe"
        }
    }
}

enum ExerciseType: String, Codable, CaseIterable, Identifiable {
    case gentleOnset = "gentle_onset"
    case lightContact = "light_contact"
    case prolongedSpeech = "prolonged_speech"
    case pausing
    case cancellation
    case pullOut = "pull_out"
    case preparatorySet = "preparatory_set"
    case voluntaryStuttering = "voluntary_stuttering"
    case breathing
    case reading
    case tongueTwister = "tongue_twister"
    case phoneNumber = "phone_number"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .gentleOnset: return "Gentle Onset"
        case .lightContact: return "Light Contact"
        case .prolongedSpeech: return "Prolonged Speech"
        case .pausing: return "Pausing"
        case .cancellation: return "Cancellation"
        case .pullOut: return "Pull-Out"
        case .preparatorySet: return "Preparatory Set"
        case .voluntaryStuttering: return "Voluntary Stuttering"
        case .breathing: return "Breathing"
        case .reading: return "Reading"
        case .tongueTwister: return "Tongue Twister"
        case .phoneNumber: return "Phone Number"
        }
    }

    var evidenceLevel: EvidenceLevel {
        switch self {
        case .gentleOnset, .lightContact, .prolongedSpeech, .pausing:
            return .high
        case .cancellation, .pullOut, .preparatorySet:
            return .moderate
        case .voluntaryStuttering:
            return .moderate
        case .breathing, .reading, .tongueTwister, .phoneNumber:
            return .supportive
        }
    }
}

enum EvidenceLevel: String, Codable {
    case high
    case moderate
    case supportive

    var displayName: String {
        switch self {
        case .high: return "High Evidence"
        case .moderate: return "Moderate Evidence"
        case .supportive: return "Supportive"
        }
    }

    var effectSizeRange: String? {
        switch self {
        case .high: return "d = 0.75–1.63"
        case .moderate: return "d = 0.56–0.65"
        case .supportive: return nil
        }
    }
}

enum Difficulty: String, Codable, CaseIterable, Comparable {
    case beginner
    case intermediate
    case advanced
    case expert

    static func < (lhs: Difficulty, rhs: Difficulty) -> Bool {
        let order: [Difficulty] = [.beginner, .intermediate, .advanced, .expert]
        return order.firstIndex(of: lhs)! < order.firstIndex(of: rhs)!
    }

    var displayName: String {
        rawValue.capitalized
    }
}

enum EmotionalTag: String, Codable, CaseIterable, Identifiable {
    case confident
    case anxious
    case frustrated
    case proud
    case neutral
    case hopeful
    case discouraged

    var id: String { rawValue }

    var emoji: String {
        switch self {
        case .confident: return "💪"
        case .anxious: return "😰"
        case .frustrated: return "😤"
        case .proud: return "🌟"
        case .neutral: return "😐"
        case .hopeful: return "🌱"
        case .discouraged: return "😔"
        }
    }
}

enum TaskType: String, Codable {
    case warmup
    case exercise
    case audioLab = "audio-lab"
    case journal
    case ai
    case mindfulness
    case learn
    case challenge
    case fearedWords = "feared-words"
}

enum SubscriptionPlan: String, Codable {
    case free
    case pro
}

enum SubscriptionStatus: String, Codable {
    case active
    case canceled
    case pastDue = "past_due"
    case trialing
    case incomplete
}

enum ScenarioType: String, Codable, CaseIterable, Identifiable {
    case phoneCall = "phone-call"
    case jobInterview = "job-interview"
    case orderingFood = "ordering-food"
    case classPresentation = "class-presentation"
    case smallTalk = "small-talk"
    case shopping
    case askingDirections = "asking-directions"
    case customerService = "customer-service"
    case meetingIntro = "meeting-intro"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .phoneCall: return "Phone Call"
        case .jobInterview: return "Job Interview"
        case .orderingFood: return "Order Coffee"
        case .classPresentation: return "Class Presentation"
        case .smallTalk: return "Small Talk"
        case .shopping: return "Shopping"
        case .askingDirections: return "Ask Directions"
        case .customerService: return "Customer Service"
        case .meetingIntro: return "Meeting Intro"
        }
    }

    var difficulty: Difficulty {
        switch self {
        case .orderingFood, .askingDirections, .shopping:
            return .beginner
        case .smallTalk, .customerService, .meetingIntro:
            return .intermediate
        case .phoneCall, .classPresentation:
            return .advanced
        case .jobInterview:
            return .expert
        }
    }

    var description: String {
        switch self {
        case .phoneCall:
            return "Practice calling a doctor's office to schedule an appointment."
        case .jobInterview:
            return "Rehearse common interview questions with a friendly hiring manager."
        case .orderingFood:
            return "Order your favorite drink at a coffee shop."
        case .classPresentation:
            return "Present a topic to a supportive audience."
        case .smallTalk:
            return "Have a casual chat at a social gathering."
        case .shopping:
            return "Ask about a product or handle a return at a store."
        case .askingDirections:
            return "Ask a friendly stranger for directions."
        case .customerService:
            return "Resolve an issue with your account over the phone."
        case .meetingIntro:
            return "Introduce yourself at a professional meeting."
        }
    }

    var icon: String {
        switch self {
        case .phoneCall: return "phone.fill"
        case .jobInterview: return "briefcase.fill"
        case .orderingFood: return "cup.and.saucer.fill"
        case .classPresentation: return "person.wave.2.fill"
        case .smallTalk: return "bubble.left.and.bubble.right.fill"
        case .shopping: return "bag.fill"
        case .askingDirections: return "map.fill"
        case .customerService: return "headphones"
        case .meetingIntro: return "person.3.fill"
        }
    }
}
