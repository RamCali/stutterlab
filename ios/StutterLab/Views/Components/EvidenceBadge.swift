import SwiftUI

// MARK: - Evidence Badge

/// Shows evidence level with effect size and tappable citation.
/// Core differentiator per PRODUCT_OUTLINE.md — builds trust.
struct EvidenceBadge: View {
    let level: EvidenceLevel
    let effectSize: String?
    let citation: String?

    @State private var showCitation = false

    var body: some View {
        Button(action: {
            if citation != nil { showCitation.toggle() }
        }) {
            HStack(spacing: SLSpacing.s1) {
                Image(systemName: badgeIcon)
                    .font(.system(size: 10))
                    .foregroundColor(badgeColor)

                Text(level.displayName)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(badgeColor)

                if let effectSize {
                    Text("(\(effectSize))")
                        .font(.system(size: 10))
                        .foregroundColor(badgeColor.opacity(0.8))
                }

                if citation != nil {
                    Image(systemName: "info.circle")
                        .font(.system(size: 10))
                        .foregroundColor(badgeColor.opacity(0.6))
                }
            }
            .padding(.horizontal, SLSpacing.s2)
            .padding(.vertical, SLSpacing.xs)
            .background(badgeColor.opacity(0.1))
            .cornerRadius(SLRadius.sm)
        }
        .buttonStyle(.plain)
        .popover(isPresented: $showCitation) {
            if let citation {
                Text(citation)
                    .font(.slXS)
                    .foregroundColor(.textPrimary)
                    .padding(SLSpacing.s4)
                    .background(Color.deepSlate)
                    .presentationCompactAdaptation(.popover)
            }
        }
    }

    private var badgeIcon: String {
        switch level {
        case .high: return "checkmark.seal.fill"
        case .moderate: return "checkmark.seal"
        case .supportive: return "info.circle"
        }
    }

    private var badgeColor: Color {
        switch level {
        case .high: return .fluencyGreen
        case .moderate: return .clarityTeal
        case .supportive: return .textSecondary
        }
    }
}
