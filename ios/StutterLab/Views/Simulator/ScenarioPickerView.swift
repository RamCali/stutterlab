import SwiftUI

// MARK: - Scenario Picker View

struct ScenarioPickerView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @State private var selectedScenario: ScenarioType?
    @State private var showConversation = false

    private let columns = [
        GridItem(.flexible(), spacing: SLSpacing.s4),
        GridItem(.flexible(), spacing: SLSpacing.s4),
        GridItem(.flexible(), spacing: SLSpacing.s4),
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: SLSpacing.s6) {
                        Text("Pick a situation to practice.")
                            .font(.slBase)
                            .foregroundColor(.textSecondary)

                        LazyVGrid(columns: columns, spacing: SLSpacing.s4) {
                            ForEach(ScenarioType.allCases) { scenario in
                                scenarioTile(scenario)
                            }
                        }
                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100)
                }
            }
            .navigationTitle("AI Practice")
            .navigationBarTitleDisplayMode(.inline)
            .fullScreenCover(isPresented: $showConversation) {
                if let scenario = selectedScenario {
                    ConversationView(scenario: scenario)
                        .environmentObject(appViewModel)
                }
            }
        }
    }

    private func scenarioTile(_ scenario: ScenarioType) -> some View {
        Button(action: {
            if appViewModel.isPremium || scenario == .orderingFood {
                selectedScenario = scenario
                showConversation = true
            }
            // TODO: Show paywall for non-premium users
        }) {
            VStack(spacing: SLSpacing.s2) {
                Image(systemName: scenario.icon)
                    .font(.system(size: 28))
                    .foregroundColor(.fluencyGreen)

                Text(scenario.displayName)
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)

                Text(scenario.difficulty.displayName)
                    .font(.system(size: 10))
                    .foregroundColor(difficultyColor(scenario.difficulty))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, SLSpacing.s4)
            .padding(.horizontal, SLSpacing.s2)
            .background(Color.obsidianNight)
            .overlay(Color.elevation1)
            .cornerRadius(SLRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: SLRadius.md)
                    .stroke(Color.border, lineWidth: 1)
            )
        }
    }

    private func difficultyColor(_ difficulty: Difficulty) -> Color {
        switch difficulty {
        case .beginner: return .fluencyGreen
        case .intermediate: return .clarityTeal
        case .advanced: return .sunsetAmber
        case .expert: return .sunsetAmber
        }
    }
}
