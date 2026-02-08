import SwiftUI

// MARK: - Technique Card

struct TechniqueCard: View {
    let exercise: Exercise
    var onTap: (() -> Void)? = nil

    var body: some View {
        Button(action: { onTap?() }) {
            HStack(spacing: SLSpacing.s3) {
                // Icon
                Image(systemName: iconName)
                    .font(.system(size: 24))
                    .foregroundColor(.clarityTeal)
                    .frame(width: 44, height: 44)
                    .background(Color.clarityTeal.opacity(0.1))
                    .cornerRadius(SLRadius.md)

                // Info
                VStack(alignment: .leading, spacing: SLSpacing.s1) {
                    Text(exercise.title)
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                        .lineLimit(1)

                    EvidenceBadge(
                        level: exercise.evidenceLevel,
                        effectSize: exercise.effectSize,
                        citation: exercise.citation
                    )
                }

                Spacer()

                // Difficulty + Duration
                VStack(alignment: .trailing, spacing: SLSpacing.s1) {
                    Text(exercise.difficulty.displayName)
                        .font(.system(size: 10))
                        .foregroundColor(.textTertiary)
                    if let duration = exercise.durationSeconds {
                        Text("\(duration / 60) min")
                            .font(.slXS)
                            .foregroundColor(.textSecondary)
                    }
                }

                if exercise.isPremium {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 12))
                        .foregroundColor(.sunsetAmber)
                }
            }
            .padding(SLSpacing.s4)
            .background(Color.obsidianNight)
            .overlay(Color.elevation1)
            .cornerRadius(SLRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: SLRadius.md)
                    .stroke(Color.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private var iconName: String {
        switch exercise.type {
        case .gentleOnset: return "waveform.path.ecg"
        case .lightContact: return "hand.raised.fingers.spread"
        case .prolongedSpeech: return "waveform"
        case .pausing: return "pause.circle"
        case .cancellation: return "arrow.uturn.backward"
        case .pullOut: return "arrow.right.circle"
        case .preparatorySet: return "target"
        case .voluntaryStuttering: return "speaker.wave.3"
        case .breathing: return "wind"
        case .reading: return "book"
        case .tongueTwister: return "mouth"
        case .phoneNumber: return "phone"
        }
    }
}
