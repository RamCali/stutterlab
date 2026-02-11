import SwiftUI

// MARK: - Task Router

/// Maps DailyTask types to NavigationLink destinations.
enum TaskRouter {

    @ViewBuilder
    static func destination(for task: DailyTask, currentDay: Int) -> some View {
        switch task.type {
        case .warmup:
            WarmupBreathingView(currentDay: currentDay)
        case .exercise:
            WordPracticeStepView(
                technique: task.title,
                techniqueTip: task.subtitle,
                items: ReadingContent.items(for: ReadingContent.contentLevel(for: currentDay))
            )
        case .journal:
            VoiceJournalView()
        case .audioLab:
            AudioLabView()
        case .ai:
            ScenarioPickerView()
        case .mindfulness:
            MindfulnessHubView()
        case .learn:
            TechniqueLibraryView()
        case .challenge:
            ChallengesView()
        case .fearedWords:
            FearedWordsView()
        }
    }

    /// SF Symbol icon for each task type
    static func icon(for type: TaskType) -> String {
        switch type {
        case .warmup:     return "lungs.fill"
        case .exercise:   return "figure.wave"
        case .audioLab:   return "waveform.path"
        case .journal:    return "book.fill"
        case .ai:         return "bubble.left.and.text.bubble.right.fill"
        case .mindfulness: return "brain.head.profile"
        case .learn:      return "graduationcap.fill"
        case .challenge:  return "trophy.fill"
        case .fearedWords: return "textformat.abc"
        }
    }

    /// Accent color for each task type
    static func color(for type: TaskType) -> Color {
        switch type {
        case .warmup:     return .clarityTeal
        case .exercise:   return .fluencyGreen
        case .audioLab:   return .clarityTeal
        case .journal:    return .sunsetAmber
        case .ai:         return .clarityTeal
        case .mindfulness: return .fluencyGreen
        case .learn:      return .sunsetAmber
        case .challenge:  return .sunsetAmber
        case .fearedWords: return .clarityTeal
        }
    }
}
