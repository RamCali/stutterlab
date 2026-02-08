import Foundation

// MARK: - 90-Day Structured Stuttering Treatment Curriculum

/// Ported from src/lib/curriculum/daily-plans.ts
///
/// Phase 1 (Days 1-14):  Foundation — breathing, gentle onset, basic exercises
/// Phase 2 (Days 15-30): Building Blocks — light contact, prolonged speech
/// Phase 3 (Days 31-50): Technique Integration — cancellation, pull-out, CBT
/// Phase 4 (Days 51-70): Real-World Practice — AI conversations, feared words
/// Phase 5 (Days 71-90): Mastery & Maintenance — advanced scenarios, independence

enum DailyPlanGenerator {

    // MARK: - Affirmations

    private static let affirmations = [
        "My voice has value. I speak at my own pace, and that pace is perfect.",
        "Every word I say matters — not how I say it.",
        "I am more than my stutter. My ideas deserve to be heard.",
        "Progress isn't always linear. Every practice session counts.",
        "I choose courage over comfort. My speech gets better each day.",
        "I am patient with myself. Growth takes time.",
        "My stutter does not define my intelligence or worth.",
        "I deserve to be heard, just like everyone else.",
        "Today, I practice not for perfection, but for progress.",
        "I am building new neural pathways with every exercise.",
    ]

    // MARK: - Phase Titles

    private static let phase1Titles = [
        "Getting Started",
        "Breath Control Basics",
        "Gentle Onset Introduction",
        "Easy Breathing + Onset",
        "First Guided Session",
        "Reading Practice",
        "Pausing Strategy",
        "Combining Breath + Onset",
        "Sentence Practice",
        "Prolonged Speech Intro",
        "Review & Voice Journal",
        "Building Confidence",
        "Gentle Onset Phrases",
        "Foundation Checkpoint",
    ]

    private static let phase2Titles = [
        "Light Contact Introduction",
        "Prolonged Speech Focus",
        "Prolonged Speech Practice",
        "Combining Techniques",
        "Continuous Phonation",
        "Light Contact Words",
        "Reading Practice",
        "Breathing Under Pressure",
        "Sentence-Level Fluency",
        "Rate Control Practice",
        "Midpoint Review",
        "Paragraph Reading",
        "Emotional Awareness",
        "Building Block Phrases",
        "Confidence Check",
        "Phase 2 Checkpoint",
    ]

    private static let phase3Titles = [
        "Cancellation Technique",
        "Pull-Out Introduction",
        "Preparatory Set Basics",
        "Combined Practice",
        "Cancellation Practice",
        "Pull-Out with Sentences",
        "Combined Modification",
        "Long Passage Reading",
        "Voluntary Stuttering",
        "Desensitization Day",
        "Technique Choice Practice",
        "CBT: Thought Records",
        "Feared Sounds Drill",
        "Mixed Techniques",
        "Passage Reading Fluency",
        "Conversation Prep",
        "AI Practice Introduction",
        "Phone Anxiety Prep",
        "Technique Integration Review",
        "Phase 3 Checkpoint",
    ]

    private static let phase4Titles = [
        "AI Conversation: Ordering Food",
        "Phone Call Simulator",
        "Real-World Challenge Day",
        "AI: Job Interview Prep",
        "Feared Words Deep Dive",
        "AI: Doctor Appointment",
        "Community Practice Room",
        "AI: Meeting Introduction",
        "Phone Call Challenge",
        "AI: Presentation Practice",
        "Real-World: Coffee Shop Order",
        "Disclosure Practice",
        "AI: Small Talk at Party",
        "Advanced Technique Review",
        "Weekly Coaching Review",
        "AI: Customer Service Call",
        "Real-World: Phone a Friend",
        "AI: Asking for Directions",
        "Confidence Building Day",
        "Phase 4 Checkpoint",
    ]

    private static let phase5Titles = [
        "Advanced Conversation",
        "Public Speaking Prep",
        "Maintenance Strategies",
        "Teaching Others Your Techniques",
        "Relapse Prevention",
        "Long Conversation Practice",
        "Presentation Mode Practice",
        "Community Mentoring",
        "Advanced Phone Challenges",
        "Stress Testing Your Fluency",
        "Creating Your Toolbox",
        "AI: Unscripted Conversation",
        "Real-World Challenge Marathon",
        "Reflection & Voice Journal",
        "Advanced AI Scenarios",
        "Maintenance Planning",
        "Celebrating Your Journey",
        "Your Personal Toolkit",
        "Looking Forward",
        "Day 90: Graduation!",
    ]

    // MARK: - Generate Plan for a Day

    static func plan(for day: Int) -> DailyPlan? {
        guard (1...90).contains(day) else { return nil }

        let phase = PhaseInfo.phase(for: day)
        let phaseLabel = PhaseInfo.labels[phase] ?? ""
        let affirmation = affirmations[(day - 1) % affirmations.count]
        let title = dayTitle(day: day, phase: phase)
        let tasks = dayTasks(day: day, phase: phase)
        let mission = RealWorldMission.mission(for: day, phase: phase)

        return DailyPlan(
            day: day,
            phase: phase,
            phaseLabel: phaseLabel,
            title: title,
            affirmation: affirmation,
            tasks: tasks,
            realWorldMission: mission
        )
    }

    /// Generate all 90 plans. Use sparingly — prefer plan(for:) for single lookups.
    static func allPlans() -> [DailyPlan] {
        (1...90).compactMap { plan(for: $0) }
    }

    // MARK: - Day Title

    private static func dayTitle(day: Int, phase: Int) -> String {
        switch phase {
        case 1:
            let idx = day - 1
            return idx < phase1Titles.count ? phase1Titles[idx] : "Foundation Day \(day)"
        case 2:
            let idx = day - 15
            return idx < phase2Titles.count ? phase2Titles[idx] : "Building Blocks Day \(day)"
        case 3:
            let idx = day - 31
            return idx < phase3Titles.count ? phase3Titles[idx] : "Integration Day \(day)"
        case 4:
            let idx = day - 51
            return idx < phase4Titles.count ? phase4Titles[idx] : "Real-World Day \(day)"
        default:
            let idx = day - 71
            return idx < phase5Titles.count ? phase5Titles[idx] : "Mastery Day \(day)"
        }
    }

    // MARK: - Day Tasks

    private static func dayTasks(day: Int, phase: Int) -> [DailyTask] {
        var tasks: [DailyTask] = []

        // Every day starts with breathing warm-up
        tasks.append(DailyTask(
            title: "Diaphragmatic Breathing",
            subtitle: phase >= 3 ? "Advanced breathing with body scan" : "Belly breathing warm-up",
            duration: phase >= 3 ? "2 min" : "3 min",
            type: .warmup
        ))

        // Phase-specific exercises
        switch phase {
        case 1:
            addPhase1Tasks(day: day, to: &tasks)
        case 2:
            addPhase2Tasks(day: day, to: &tasks)
        case 3:
            addPhase3Tasks(day: day, to: &tasks)
        case 4:
            addPhase4Tasks(day: day, to: &tasks)
        default:
            addPhase5Tasks(day: day, to: &tasks)
        }

        // Every day ends with voice journal
        tasks.append(DailyTask(
            title: "Voice Journal Entry",
            subtitle: "Record how your speech feels today",
            duration: "2 min",
            type: .journal
        ))

        // Mindfulness on every 5th day
        if day % 5 == 0 {
            tasks.append(DailyTask(
                title: "Mindfulness Check-In",
                subtitle: "2-minute guided breathing + anxiety rating",
                duration: "2 min",
                type: .mindfulness
            ))
        }

        // Educational content on every 7th day
        if day % 7 == 0 {
            tasks.append(DailyTask(
                title: "Learn Something New",
                subtitle: "Short educational module",
                duration: "5 min",
                type: .learn
            ))
        }

        return tasks
    }

    // MARK: Phase 1: Foundation (Days 1-14)

    private static func addPhase1Tasks(day: Int, to tasks: inout [DailyTask]) {
        if day <= 4 {
            tasks.append(DailyTask(
                title: "Gentle Onset Practice",
                subtitle: day <= 2 ? "Single words" : "Short phrases",
                duration: "5 min",
                type: .exercise
            ))
        }
        if day >= 5 {
            tasks.append(DailyTask(
                title: "Guided Reading Exercise",
                subtitle: day <= 9 ? "Easy passage" : "Medium passage",
                duration: "10 min",
                type: .exercise
            ))
        }
        if day >= 7 {
            tasks.append(DailyTask(
                title: "Pausing Strategy Practice",
                subtitle: "Read with deliberate pauses",
                duration: "5 min",
                type: .exercise
            ))
        }
    }

    // MARK: Phase 2: Building Blocks (Days 15-30)

    private static func addPhase2Tasks(day: Int, to tasks: inout [DailyTask]) {
        let techniqueTitle: String
        switch day % 3 {
        case 0: techniqueTitle = "Prolonged Speech Practice"
        case 1: techniqueTitle = "Light Articulatory Contact"
        default: techniqueTitle = "Continuous Phonation"
        }
        tasks.append(DailyTask(
            title: techniqueTitle,
            subtitle: "Sentence-level practice",
            duration: "8 min",
            type: .exercise
        ))

        tasks.append(DailyTask(
            title: day % 2 == 0 ? "Reading Session" : "Combined Technique Practice",
            subtitle: "Paragraph-level reading",
            duration: "10 min",
            type: .exercise,
            isPremium: true
        ))
    }

    // MARK: Phase 3: Technique Integration (Days 31-50)

    private static func addPhase3Tasks(day: Int, to tasks: inout [DailyTask]) {
        let techniqueTitle: String
        switch day % 4 {
        case 0: techniqueTitle = "Cancellation Practice"
        case 1: techniqueTitle = "Pull-Out Technique"
        case 2: techniqueTitle = "Preparatory Set Drill"
        default: techniqueTitle = "Voluntary Stuttering"
        }
        tasks.append(DailyTask(
            title: techniqueTitle,
            subtitle: "Stuttering modification technique",
            duration: "8 min",
            type: .exercise,
            isPremium: true
        ))

        if day >= 43 {
            tasks.append(DailyTask(
                title: "AI Conversation Warm-Up",
                subtitle: "Easy scenario practice",
                duration: "5 min",
                type: .ai,
                isPremium: true
            ))
        }
    }

    // MARK: Phase 4: Real-World Practice (Days 51-70)

    private static func addPhase4Tasks(day: Int, to tasks: inout [DailyTask]) {
        tasks.append(DailyTask(
            title: "Technique Refresher",
            subtitle: "Quick review of today's focus technique",
            duration: "5 min",
            type: .exercise
        ))

        switch day % 3 {
        case 0:
            tasks.append(DailyTask(
                title: "Phone Call Simulator",
                subtitle: "Practice a real phone scenario",
                duration: "8 min",
                type: .ai,
                isPremium: true
            ))
        case 1:
            tasks.append(DailyTask(
                title: "AI Conversation Practice",
                subtitle: "Dynamic AI scenario",
                duration: "8 min",
                type: .ai,
                isPremium: true
            ))
        default:
            tasks.append(DailyTask(
                title: "Feared Words Drill",
                subtitle: "Target your trigger words",
                duration: "5 min",
                type: .fearedWords,
                isPremium: true
            ))
        }

        if day % 4 == 0 {
            tasks.append(DailyTask(
                title: "Real-World Challenge",
                subtitle: "Take your practice into the real world",
                duration: "varies",
                type: .challenge,
                isPremium: true
            ))
        }
    }

    // MARK: Phase 5: Mastery & Maintenance (Days 71-90)

    private static func addPhase5Tasks(day: Int, to tasks: inout [DailyTask]) {
        tasks.append(DailyTask(
            title: "Advanced Technique Practice",
            subtitle: "Choose your own technique combination",
            duration: "8 min",
            type: .exercise,
            isPremium: true
        ))

        tasks.append(DailyTask(
            title: day % 2 == 0 ? "Advanced AI Scenario" : "Long Conversation Practice",
            subtitle: "Extended real-world simulation",
            duration: "10 min",
            type: .ai,
            isPremium: true
        ))

        if day % 3 == 0 {
            tasks.append(DailyTask(
                title: "Real-World Challenge",
                subtitle: "Advanced real-life speaking mission",
                duration: "varies",
                type: .challenge,
                isPremium: true
            ))
        }
    }
}
