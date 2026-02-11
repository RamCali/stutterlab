import SwiftUI

// MARK: - North Star Goal Card

struct NorthStarCardView: View {
    let goal: String?
    let challenges: [String]

    var body: some View {
        if let goal, !goal.isEmpty {
            VStack(alignment: .leading, spacing: SLSpacing.s3) {
                HStack {
                    Image(systemName: "star.fill")
                        .foregroundColor(.clarityTeal)
                    Text("Your North Star")
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                }

                Text(goal)
                    .font(.slBase)
                    .foregroundColor(.textPrimary)
                    .lineLimit(3)

                if !challenges.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: SLSpacing.s2) {
                            ForEach(challenges, id: \.self) { challenge in
                                Text(challenge)
                                    .font(.slXS)
                                    .foregroundColor(.clarityTeal)
                                    .padding(.horizontal, SLSpacing.s2)
                                    .padding(.vertical, 4)
                                    .background(Color.clarityTeal.opacity(0.1))
                                    .cornerRadius(SLRadius.full)
                            }
                        }
                    }
                }
            }
            .slCardAccent(.clarityTeal)
        }
    }
}
