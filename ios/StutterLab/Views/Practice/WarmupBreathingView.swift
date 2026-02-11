import SwiftUI

// MARK: - Warmup Breathing View

/// Auto-selects a breathing pattern based on the current phase
/// and presents BreathingExerciseView inline.
struct WarmupBreathingView: View {
    let currentDay: Int
    var onComplete: (() -> Void)?

    @Environment(\.dismiss) private var dismiss

    private var phase: Int { PhaseInfo.phase(for: currentDay) }

    /// Select breathing pattern based on phase progression
    private var selectedPattern: BreathingPattern {
        switch phase {
        case 1, 2:
            // Foundation: Simple diaphragmatic breathing
            return BreathingPattern.catalog.first { $0.id == "diaphragmatic" }
                ?? BreathingPattern.catalog[0]
        case 3, 4:
            // Integration: Box breathing
            return BreathingPattern.catalog.first { $0.id == "box" }
                ?? BreathingPattern.catalog[0]
        default:
            // Mastery: 4-7-8 calming
            return BreathingPattern.catalog.first { $0.id == "4-7-8" }
                ?? BreathingPattern.catalog[0]
        }
    }

    var body: some View {
        BreathingExerciseView(pattern: selectedPattern)
    }
}
