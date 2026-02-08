import SwiftUI

// MARK: - Onboarding Flow (4 Screens)

struct OnboardingFlow: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @State private var currentStep = 0
    @State private var motivation = ""
    @State private var severity: Severity? = nil
    @State private var goals: Set<String> = []

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            VStack(spacing: 0) {
                // Progress dots
                HStack(spacing: SLSpacing.s2) {
                    ForEach(0..<4, id: \.self) { step in
                        Circle()
                            .fill(step <= currentStep ? Color.clarityTeal : Color.elevation2)
                            .frame(width: 8, height: 8)
                    }
                }
                .padding(.top, SLSpacing.s6)

                TabView(selection: $currentStep) {
                    motivationStep.tag(0)
                    severityStep.tag(1)
                    goalsStep.tag(2)
                    summaryStep.tag(3)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut, value: currentStep)
            }
        }
    }

    // MARK: Step 1: Motivation

    private var motivationStep: some View {
        OnboardingStep(
            title: "What brought you here?",
            subtitle: "This helps us personalize your experience."
        ) {
            VStack(spacing: SLSpacing.s3) {
                optionButton("I want to stutter less", selected: motivation == "stutter_less") {
                    motivation = "stutter_less"
                }
                optionButton("I want to feel less anxious about speaking", selected: motivation == "less_anxious") {
                    motivation = "less_anxious"
                }
                optionButton("My therapist recommended it", selected: motivation == "therapist") {
                    motivation = "therapist"
                }
                optionButton("Just exploring", selected: motivation == "exploring") {
                    motivation = "exploring"
                }
            }
        } action: {
            if !motivation.isEmpty { currentStep = 1 }
        }
    }

    // MARK: Step 2: Severity

    private var severityStep: some View {
        OnboardingStep(
            title: "How would you describe your stuttering?",
            subtitle: "There's no wrong answer. This helps us tailor techniques."
        ) {
            VStack(spacing: SLSpacing.s3) {
                optionButton("Mild — occasional blocks", selected: severity == .mild) {
                    severity = .mild
                }
                optionButton("Moderate — noticeable in conversations", selected: severity == .moderate) {
                    severity = .moderate
                }
                optionButton("Severe — affects most speaking", selected: severity == .severe) {
                    severity = .severe
                }
                optionButton("Not sure", selected: severity == nil && currentStep == 1) {
                    severity = .moderate // Default
                }
            }
        } action: {
            if severity != nil { currentStep = 2 }
        }
    }

    // MARK: Step 3: Goals

    private var goalsStep: some View {
        OnboardingStep(
            title: "What matters most to you?",
            subtitle: "Select all that apply."
        ) {
            VStack(spacing: SLSpacing.s3) {
                goalToggle("Work speaking (meetings, presentations)")
                goalToggle("Social confidence")
                goalToggle("Phone calls")
                goalToggle("Public speaking")
            }
        } action: {
            if !goals.isEmpty { currentStep = 3 }
        }
    }

    // MARK: Step 4: Summary

    private var summaryStep: some View {
        VStack(spacing: SLSpacing.s8) {
            Spacer()

            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 64))
                .foregroundColor(.fluencyGreen)

            Text("Your plan is ready!")
                .font(.sl2XL)
                .foregroundColor(.textPrimary)

            VStack(alignment: .leading, spacing: SLSpacing.s3) {
                summaryRow(icon: "waveform.path", text: "90-day structured curriculum")
                summaryRow(icon: "brain.head.profile", text: "Evidence-based techniques (d = 0.75–1.63)")
                summaryRow(icon: "flame.fill", text: "Daily practice in under 10 minutes")
                summaryRow(icon: "chart.line.uptrend.xyaxis", text: "Speech analysis & progress tracking")
            }
            .padding(.horizontal, SLSpacing.s6)

            Spacer()

            Button(action: {
                Task {
                    await appViewModel.completeOnboarding(
                        severity: severity ?? .moderate,
                        goals: Array(goals)
                    )
                }
            }) {
                Text("Start Your Journey")
                    .font(.slBase)
                    .fontWeight(.semibold)
                    .foregroundColor(.obsidianNight)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, SLSpacing.s3)
                    .background(Color.clarityTeal)
                    .cornerRadius(SLRadius.md)
            }
            .padding(.horizontal, SLSpacing.s4)
            .padding(.bottom, SLSpacing.s8)
        }
    }

    // MARK: - Components

    private func optionButton(_ label: String, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.slBase)
                .foregroundColor(selected ? .obsidianNight : .textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(SLSpacing.s4)
                .background(selected ? Color.clarityTeal : Color.elevation1)
                .cornerRadius(SLRadius.md)
                .overlay(
                    RoundedRectangle(cornerRadius: SLRadius.md)
                        .stroke(selected ? Color.clarityTeal : Color.border, lineWidth: 1)
                )
        }
    }

    private func goalToggle(_ label: String) -> some View {
        let isSelected = goals.contains(label)
        return Button(action: {
            if isSelected { goals.remove(label) } else { goals.insert(label) }
        }) {
            HStack {
                Text(label)
                    .font(.slBase)
                    .foregroundColor(isSelected ? .obsidianNight : .textPrimary)
                Spacer()
                if isSelected {
                    Image(systemName: "checkmark")
                        .foregroundColor(.obsidianNight)
                }
            }
            .padding(SLSpacing.s4)
            .background(isSelected ? Color.clarityTeal : Color.elevation1)
            .cornerRadius(SLRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: SLRadius.md)
                    .stroke(isSelected ? Color.clarityTeal : Color.border, lineWidth: 1)
            )
        }
    }

    private func summaryRow(icon: String, text: String) -> some View {
        HStack(spacing: SLSpacing.s3) {
            Image(systemName: icon)
                .foregroundColor(.clarityTeal)
                .frame(width: 24)
            Text(text)
                .font(.slBase)
                .foregroundColor(.textPrimary)
        }
    }
}

// MARK: - Onboarding Step (Reusable)

struct OnboardingStep<Content: View>: View {
    let title: String
    let subtitle: String
    @ViewBuilder let content: () -> Content
    let action: () -> Void

    var body: some View {
        VStack(spacing: SLSpacing.s6) {
            Spacer()

            VStack(spacing: SLSpacing.s2) {
                Text(title)
                    .font(.slXL)
                    .foregroundColor(.textPrimary)
                    .multilineTextAlignment(.center)
                Text(subtitle)
                    .font(.slSM)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.horizontal, SLSpacing.s4)

            content()
                .padding(.horizontal, SLSpacing.s4)

            Spacer()

            Button(action: action) {
                Text("Continue")
                    .font(.slBase)
                    .fontWeight(.semibold)
                    .foregroundColor(.obsidianNight)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, SLSpacing.s3)
                    .background(Color.clarityTeal)
                    .cornerRadius(SLRadius.md)
            }
            .padding(.horizontal, SLSpacing.s4)
            .padding(.bottom, SLSpacing.s8)
        }
    }
}
