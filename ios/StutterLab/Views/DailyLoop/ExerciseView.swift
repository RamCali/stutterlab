import SwiftUI

// MARK: - Exercise View (Individual Technique Screen)

struct ExerciseView: View {
    let exercise: Exercise

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: SLSpacing.s6) {
                    // Header
                    VStack(alignment: .leading, spacing: SLSpacing.s2) {
                        Text(exercise.title)
                            .font(.slXL)
                            .foregroundColor(.textPrimary)

                        EvidenceBadge(
                            level: exercise.evidenceLevel,
                            effectSize: exercise.effectSize,
                            citation: exercise.citation
                        )
                    }

                    // Description
                    Text(exercise.description)
                        .font(.slBase)
                        .foregroundColor(.textSecondary)

                    // Instructions
                    VStack(alignment: .leading, spacing: SLSpacing.s3) {
                        Text("Instructions")
                            .font(.slLG)
                            .foregroundColor(.textPrimary)

                        Text(exercise.instructions)
                            .font(.slBase)
                            .foregroundColor(.textSecondary)
                            .lineSpacing(4)
                    }
                    .slCard()
                }
                .padding(SLSpacing.s4)
            }
        }
    }
}
