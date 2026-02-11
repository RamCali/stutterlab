import SwiftUI

// MARK: - Onboarding Flow (8 Steps — matches web)

struct OnboardingFlow: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @State private var step = 0
    private let totalSteps = 8

    // Step 0: Name
    @State private var name = ""

    // Step 1: Severity + Stuttering Types
    @State private var severity: Severity? = nil
    @State private var stutteringTypes: Set<String> = []

    // Step 2: Confidence Ratings
    @State private var confidenceRatings: [String: Int] = [:]

    // Step 3: Feared Situations
    @State private var selectedFears: Set<String> = []

    // Step 4: Feared Words
    @State private var fearedWords: [String] = []
    @State private var wordInput = ""

    // Step 5: Avoidance + Frequency
    @State private var avoidanceBehaviors: Set<String> = []
    @State private var speakingFrequency: String? = nil

    // Step 6: Speech Goals + North Star
    @State private var selectedChallenges: Set<String> = []
    @State private var goalText = ""

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            VStack(spacing: 0) {
                // Progress bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(Color.elevation2)
                            .frame(height: 6)
                        Capsule()
                            .fill(
                                LinearGradient(
                                    colors: [.clarityTeal, .fluencyGreen],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: geo.size.width * CGFloat(step + 1) / CGFloat(totalSteps), height: 6)
                            .animation(.spring(response: 0.4), value: step)
                    }
                }
                .frame(height: 6)
                .padding(.horizontal, SLSpacing.s4)
                .padding(.top, SLSpacing.s4)

                TabView(selection: $step) {
                    nameStep.tag(0)
                    severityStep.tag(1)
                    confidenceStep.tag(2)
                    fearedSituationsStep.tag(3)
                    fearedWordsStep.tag(4)
                    avoidanceStep.tag(5)
                    goalsStep.tag(6)
                    assessmentStep.tag(7)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut, value: step)
            }
        }
    }

    // MARK: - Step 0: Name

    private var nameStep: some View {
        OnboardingStep(
            icon: "clipboard.fill",
            title: "Speech Assessment",
            subtitle: "Answer a few questions so we can build your personalized 90-day fluency program."
        ) {
            TextField("Your first name", text: $name)
                .font(.slBase)
                .padding(SLSpacing.s4)
                .background(Color.cardSurface)
                .foregroundColor(.textPrimary)
                .cornerRadius(SLRadius.md)
                .overlay(
                    RoundedRectangle(cornerRadius: SLRadius.md)
                        .stroke(Color.border, lineWidth: 1)
                )
                .autocorrectionDisabled()
        } action: {
            if !name.trimmingCharacters(in: .whitespaces).isEmpty { step = 1 }
        }
    }

    // MARK: - Step 1: Severity + Stuttering Types

    private var severityStep: some View {
        OnboardingStep(
            title: "Tell us about your stutter, \(name)",
            subtitle: "This helps us calibrate your program."
        ) {
            VStack(spacing: SLSpacing.s5) {
                // Severity
                VStack(spacing: SLSpacing.s3) {
                    singleOption("Mild — occasional blocks", selected: severity == .mild) { severity = .mild }
                    singleOption("Moderate — noticeable in conversations", selected: severity == .moderate) { severity = .moderate }
                    singleOption("Severe — affects most speaking", selected: severity == .severe) { severity = .severe }
                }

                // Stuttering types
                VStack(alignment: .leading, spacing: SLSpacing.s2) {
                    Text("What does your stutter look like?")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: SLSpacing.s2) {
                        stutteringTypeCard(id: "blocks", emoji: "🧱", label: "Blocks", desc: "Getting stuck")
                        stutteringTypeCard(id: "repetitions", emoji: "🔁", label: "Repetitions", desc: "b-b-b-but")
                        stutteringTypeCard(id: "prolongations", emoji: "➡", label: "Prolongations", desc: "ssssnake")
                        stutteringTypeCard(id: "interjections", emoji: "💭", label: "Filler words", desc: "um, uh, like")
                    }
                }
            }
        } action: {
            if severity != nil { step = 2 }
        }
    }

    // MARK: - Step 2: Confidence Ratings

    private var confidenceStep: some View {
        ScrollView {
            VStack(spacing: SLSpacing.s5) {
                VStack(spacing: SLSpacing.s2) {
                    Text("Rate your confidence")
                        .font(.slXL)
                        .foregroundColor(.textPrimary)
                    Text("1 = very anxious, 5 = confident")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                }
                .padding(.top, SLSpacing.s6)

                VStack(spacing: SLSpacing.s3) {
                    ForEach(OnboardingData.confidenceSituations, id: \.id) { situation in
                        confidenceRow(situation: situation)
                    }
                }
                .padding(.horizontal, SLSpacing.s4)

                Button(action: { step = 3 }) {
                    Text("Continue")
                }
                .buttonStyle(SLPrimaryButtonStyle())
                .disabled(confidenceRatings.count < 4)
                .opacity(confidenceRatings.count >= 4 ? 1.0 : 0.4)
                .padding(.horizontal, SLSpacing.s4)
                .padding(.bottom, SLSpacing.s8)
            }
        }
    }

    // MARK: - Step 3: Feared Situations

    private var fearedSituationsStep: some View {
        OnboardingStep(
            title: "What situations feel hardest, \(name)?",
            subtitle: "Select all that apply. We'll prioritize practice for these."
        ) {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: SLSpacing.s2) {
                ForEach(OnboardingData.fearedSituations, id: \.id) { situation in
                    fearedSituationCard(situation: situation)
                }
            }
        } action: {
            step = 4 // Can skip
        } skipLabel: {
            selectedFears.isEmpty ? "Skip" : "\(selectedFears.count) selected"
        }
    }

    // MARK: - Step 4: Feared Words

    private var fearedWordsStep: some View {
        OnboardingStep(
            title: "Any words that trip you up?",
            subtitle: "We'll create personalized practice for each one."
        ) {
            VStack(spacing: SLSpacing.s4) {
                // Input
                HStack(spacing: SLSpacing.s2) {
                    TextField("Type a word...", text: $wordInput)
                        .font(.slBase)
                        .padding(SLSpacing.s3)
                        .background(Color.cardSurface)
                        .foregroundColor(.textPrimary)
                        .cornerRadius(SLRadius.md)
                        .overlay(
                            RoundedRectangle(cornerRadius: SLRadius.md)
                                .stroke(Color.border, lineWidth: 1)
                        )
                        .autocorrectionDisabled()
                        .onSubmit { addWord() }

                    Button(action: addWord) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .foregroundColor(.clarityTeal)
                    }
                }

                // Added words
                if !fearedWords.isEmpty {
                    FlowLayout(spacing: SLSpacing.s2) {
                        ForEach(fearedWords, id: \.self) { word in
                            HStack(spacing: 4) {
                                Text(word)
                                    .font(.slSM)
                                Button(action: { fearedWords.removeAll { $0 == word } }) {
                                    Image(systemName: "xmark.circle.fill")
                                        .font(.caption)
                                }
                            }
                            .foregroundColor(.obsidianNight)
                            .padding(.horizontal, SLSpacing.s3)
                            .padding(.vertical, SLSpacing.s1)
                            .background(Color.clarityTeal)
                            .cornerRadius(SLRadius.full)
                        }
                    }
                }

                // Suggestions
                VStack(alignment: .leading, spacing: SLSpacing.s2) {
                    Text("Common difficult words:")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                    FlowLayout(spacing: SLSpacing.s2) {
                        ForEach(OnboardingData.suggestedWords, id: \.self) { word in
                            Button(action: { toggleSuggestedWord(word) }) {
                                Text(word)
                                    .font(.slSM)
                                    .foregroundColor(fearedWords.contains(word) ? .obsidianNight : .textSecondary)
                                    .padding(.horizontal, SLSpacing.s3)
                                    .padding(.vertical, SLSpacing.s1)
                                    .background(fearedWords.contains(word) ? Color.clarityTeal : Color.cardSurface)
                                    .cornerRadius(SLRadius.full)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: SLRadius.full)
                                            .stroke(Color.border, lineWidth: 1)
                                    )
                            }
                        }
                    }
                }
            }
        } action: {
            step = 5
        } skipLabel: {
            fearedWords.isEmpty ? "Skip" : "\(fearedWords.count) word(s)"
        }
    }

    // MARK: - Step 5: Avoidance + Frequency

    private var avoidanceStep: some View {
        ScrollView {
            VStack(spacing: SLSpacing.s5) {
                VStack(spacing: SLSpacing.s2) {
                    Text("How does stuttering affect your daily life?")
                        .font(.slXL)
                        .foregroundColor(.textPrimary)
                        .multilineTextAlignment(.center)
                    Text("This helps us understand your avoidance patterns.")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                }
                .padding(.top, SLSpacing.s6)
                .padding(.horizontal, SLSpacing.s4)

                // Avoidance behaviors
                VStack(spacing: SLSpacing.s2) {
                    ForEach(OnboardingData.avoidanceBehaviors, id: \.id) { behavior in
                        multiToggle(
                            emoji: behavior.emoji,
                            label: behavior.label,
                            selected: avoidanceBehaviors.contains(behavior.id)
                        ) {
                            if avoidanceBehaviors.contains(behavior.id) {
                                avoidanceBehaviors.remove(behavior.id)
                            } else {
                                avoidanceBehaviors.insert(behavior.id)
                            }
                        }
                    }
                }
                .padding(.horizontal, SLSpacing.s4)

                // Speaking frequency
                VStack(alignment: .leading, spacing: SLSpacing.s2) {
                    Text("How often do you speak throughout the day?")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                        .padding(.horizontal, SLSpacing.s4)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: SLSpacing.s2) {
                        ForEach(OnboardingData.frequencyOptions, id: \.id) { option in
                            frequencyCard(option: option)
                        }
                    }
                    .padding(.horizontal, SLSpacing.s4)
                }

                Button(action: { step = 6 }) {
                    Text("Continue")
                }
                .buttonStyle(SLPrimaryButtonStyle())
                .disabled(speakingFrequency == nil)
                .opacity(speakingFrequency != nil ? 1.0 : 0.4)
                .padding(.horizontal, SLSpacing.s4)
                .padding(.bottom, SLSpacing.s8)
            }
        }
    }

    // MARK: - Step 6: Goals + North Star

    private var goalsStep: some View {
        ScrollView {
            VStack(spacing: SLSpacing.s5) {
                VStack(spacing: SLSpacing.s2) {
                    Image(systemName: "star.fill")
                        .font(.title)
                        .foregroundColor(.sunsetAmber)
                    Text("What's your speech goal, \(name)?")
                        .font(.slXL)
                        .foregroundColor(.textPrimary)
                        .multilineTextAlignment(.center)
                    Text("This becomes your North Star.")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                }
                .padding(.top, SLSpacing.s6)
                .padding(.horizontal, SLSpacing.s4)

                // Speech challenges
                VStack(alignment: .leading, spacing: SLSpacing.s2) {
                    Text("How is stuttering holding you back?")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                        .padding(.horizontal, SLSpacing.s4)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: SLSpacing.s2) {
                        ForEach(OnboardingData.speechChallenges, id: \.id) { challenge in
                            challengeCard(challenge: challenge)
                        }
                    }
                    .padding(.horizontal, SLSpacing.s4)
                }

                // North Star
                VStack(alignment: .leading, spacing: SLSpacing.s2) {
                    Text("Your North Star goal:")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                        .padding(.horizontal, SLSpacing.s4)

                    TextEditor(text: $goalText)
                        .font(.slBase)
                        .foregroundColor(.textPrimary)
                        .scrollContentBackground(.hidden)
                        .frame(minHeight: 80)
                        .padding(SLSpacing.s3)
                        .background(Color.cardSurface)
                        .cornerRadius(SLRadius.md)
                        .overlay(
                            RoundedRectangle(cornerRadius: SLRadius.md)
                                .stroke(Color.border, lineWidth: 1)
                        )
                        .padding(.horizontal, SLSpacing.s4)

                    Text("e.g., Give my best man speech confidently in October")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                        .padding(.horizontal, SLSpacing.s4)
                }

                Button(action: { step = 7 }) {
                    Text("Continue")
                }
                .buttonStyle(SLPrimaryButtonStyle())
                .padding(.horizontal, SLSpacing.s4)
                .padding(.bottom, SLSpacing.s8)
            }
        }
    }

    // MARK: - Step 7: Assessment Results

    private var assessmentStep: some View {
        let scores = OnboardingScoring.calculate(
            severity: severity ?? .moderate,
            confidenceRatings: confidenceRatings,
            avoidanceBehaviors: Array(avoidanceBehaviors),
            stutteringTypes: Array(stutteringTypes),
            speakingFrequency: speakingFrequency ?? "sometimes",
            fearedSituations: Array(selectedFears)
        )

        return ScrollView {
            VStack(spacing: SLSpacing.s6) {
                VStack(spacing: SLSpacing.s2) {
                    Text("Your Speech Assessment")
                        .font(.sl2XL)
                        .foregroundColor(.textPrimary)
                    Text("Here's your personalized profile, \(name).")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                }
                .padding(.top, SLSpacing.s6)

                // Score rings
                HStack(spacing: SLSpacing.s8) {
                    scoreRing(
                        value: scores.severityScore,
                        label: "Severity",
                        color: .sunsetAmber
                    )
                    scoreRing(
                        value: scores.confidenceScore,
                        label: "Confidence",
                        color: .clarityTeal
                    )
                }

                // Profile description
                VStack(alignment: .leading, spacing: SLSpacing.s2) {
                    Text(scores.profile.label)
                        .font(.slBase)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                    Text(scores.profile.description)
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                }
                .slCardAccent(.clarityTeal)
                .padding(.horizontal, SLSpacing.s4)

                // Treatment emphasis
                VStack(alignment: .leading, spacing: SLSpacing.s2) {
                    Text("Your Program Focus")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                        .padding(.horizontal, SLSpacing.s4)

                    ForEach(scores.profile.emphasis.sorted(by: { $0.value > $1.value }), id: \.key) { key, value in
                        HStack {
                            Text(key)
                                .font(.slSM)
                                .foregroundColor(.textPrimary)
                            Spacer()
                            Text("\(value)%")
                                .font(.slSM)
                                .fontWeight(.semibold)
                                .foregroundColor(.clarityTeal)
                        }
                        .padding(.horizontal, SLSpacing.s4)
                    }
                }

                // North Star
                if !goalText.trimmingCharacters(in: .whitespaces).isEmpty {
                    HStack(spacing: SLSpacing.s3) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.sunsetAmber)
                        Text(goalText)
                            .font(.slSM)
                            .foregroundColor(.textPrimary)
                    }
                    .slCardAccent(.sunsetAmber)
                    .padding(.horizontal, SLSpacing.s4)
                }

                // 90-day roadmap
                VStack(alignment: .leading, spacing: SLSpacing.s3) {
                    Text("Your 90-Day Roadmap")
                        .font(.slBase)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                        .padding(.horizontal, SLSpacing.s4)

                    ForEach(OnboardingData.roadmapPhases, id: \.phase) { phase in
                        HStack(spacing: SLSpacing.s3) {
                            Circle()
                                .fill(Color.clarityTeal)
                                .frame(width: 8, height: 8)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Phase \(phase.phase): \(phase.label)")
                                    .font(.slSM)
                                    .fontWeight(.medium)
                                    .foregroundColor(.textPrimary)
                                Text(phase.focus)
                                    .font(.slXS)
                                    .foregroundColor(.textSecondary)
                            }
                        }
                        .padding(.horizontal, SLSpacing.s4)
                    }
                }

                // Start button
                Button(action: { completeOnboarding(scores: scores) }) {
                    Text("Start Your Journey")
                }
                .buttonStyle(SLPrimaryButtonStyle())
                .slHaptic(.heavy)
                .padding(.horizontal, SLSpacing.s4)
                .padding(.bottom, SLSpacing.s8)
            }
        }
    }

    // MARK: - Complete Onboarding

    private func completeOnboarding(scores: OnboardingScoring.Result) {
        Task {
            await appViewModel.completeOnboarding(
                data: OnboardingPayload(
                    name: name,
                    severity: severity ?? .moderate,
                    stutteringTypes: Array(stutteringTypes),
                    confidenceRatings: confidenceRatings,
                    fearedSituations: Array(selectedFears),
                    fearedWords: fearedWords,
                    avoidanceBehaviors: Array(avoidanceBehaviors),
                    speakingFrequency: speakingFrequency ?? "sometimes",
                    speechChallenges: Array(selectedChallenges),
                    northStarGoal: goalText,
                    severityScore: scores.severityScore,
                    confidenceScore: scores.confidenceScore,
                    assessmentProfile: scores.profile.id
                )
            )
        }
    }

    // MARK: - Helpers

    private func addWord() {
        let trimmed = wordInput.trimmingCharacters(in: .whitespaces).lowercased()
        guard !trimmed.isEmpty, !fearedWords.contains(trimmed) else { return }
        fearedWords.append(trimmed)
        wordInput = ""
    }

    private func toggleSuggestedWord(_ word: String) {
        if fearedWords.contains(word) {
            fearedWords.removeAll { $0 == word }
        } else {
            fearedWords.append(word)
        }
    }

    // MARK: - Reusable Components

    private func singleOption(_ label: String, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.slBase)
                .foregroundColor(selected ? .obsidianNight : .textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(SLSpacing.s4)
                .background(selected ? Color.clarityTeal : Color.cardSurface)
                .cornerRadius(SLRadius.md)
                .overlay(
                    RoundedRectangle(cornerRadius: SLRadius.md)
                        .stroke(selected ? Color.clarityTeal : Color.border, lineWidth: 1)
                )
        }
        .slHaptic(.light)
    }

    private func stutteringTypeCard(id: String, emoji: String, label: String, desc: String) -> some View {
        let selected = stutteringTypes.contains(id)
        return Button(action: {
            if selected { stutteringTypes.remove(id) } else { stutteringTypes.insert(id) }
        }) {
            VStack(spacing: 4) {
                Text(emoji)
                    .font(.title2)
                Text(label)
                    .font(.slSM)
                    .fontWeight(.medium)
                    .foregroundColor(selected ? .obsidianNight : .textPrimary)
                Text(desc)
                    .font(.slXS)
                    .foregroundColor(selected ? .obsidianNight.opacity(0.7) : .textSecondary)
            }
            .frame(maxWidth: .infinity)
            .padding(SLSpacing.s3)
            .background(selected ? Color.clarityTeal : Color.cardSurface)
            .cornerRadius(SLRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: SLRadius.md)
                    .stroke(selected ? Color.clarityTeal : Color.border, lineWidth: 1)
            )
        }
        .slHaptic(.light)
    }

    private func confidenceRow(situation: OnboardingData.Situation) -> some View {
        VStack(alignment: .leading, spacing: SLSpacing.s2) {
            HStack(spacing: SLSpacing.s2) {
                Text(situation.emoji)
                Text(situation.label)
                    .font(.slSM)
                    .foregroundColor(.textPrimary)
            }

            HStack(spacing: SLSpacing.s2) {
                ForEach(1...5, id: \.self) { rating in
                    Button(action: {
                        confidenceRatings[situation.id] = rating
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }) {
                        Text("\(rating)")
                            .font(.slSM)
                            .fontWeight(.medium)
                            .foregroundColor(confidenceRatings[situation.id] == rating ? .obsidianNight : .textSecondary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, SLSpacing.s2)
                            .background(confidenceRatings[situation.id] == rating ? Color.clarityTeal : Color.cardSurface)
                            .cornerRadius(SLRadius.sm)
                    }
                }
            }
        }
        .padding(SLSpacing.s3)
        .background(Color.cardSurface)
        .cornerRadius(SLRadius.md)
        .overlay(
            RoundedRectangle(cornerRadius: SLRadius.md)
                .stroke(Color.borderSubtle, lineWidth: 1)
        )
    }

    private func fearedSituationCard(situation: OnboardingData.FearedSituation) -> some View {
        let selected = selectedFears.contains(situation.id)
        return Button(action: {
            if selected { selectedFears.remove(situation.id) } else { selectedFears.insert(situation.id) }
        }) {
            VStack(spacing: 4) {
                Text(situation.emoji)
                    .font(.title2)
                Text(situation.label)
                    .font(.slSM)
                    .fontWeight(.medium)
                    .foregroundColor(selected ? .obsidianNight : .textPrimary)
                Text(situation.desc)
                    .font(.slXS)
                    .foregroundColor(selected ? .obsidianNight.opacity(0.7) : .textSecondary)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(SLSpacing.s3)
            .background(selected ? Color.clarityTeal : Color.cardSurface)
            .cornerRadius(SLRadius.md)
            .overlay(
                ZStack {
                    RoundedRectangle(cornerRadius: SLRadius.md)
                        .stroke(selected ? Color.clarityTeal : Color.border, lineWidth: 1)
                    if selected {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.obsidianNight)
                            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                            .padding(6)
                    }
                }
            )
        }
    }

    private func multiToggle(emoji: String, label: String, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack {
                Text(emoji)
                Text(label)
                    .font(.slBase)
                    .foregroundColor(selected ? .obsidianNight : .textPrimary)
                Spacer()
                if selected {
                    Image(systemName: "checkmark")
                        .foregroundColor(.obsidianNight)
                }
            }
            .padding(SLSpacing.s4)
            .background(selected ? Color.clarityTeal : Color.cardSurface)
            .cornerRadius(SLRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: SLRadius.md)
                    .stroke(selected ? Color.clarityTeal : Color.border, lineWidth: 1)
            )
        }
        .slHaptic(.light)
    }

    private func frequencyCard(option: OnboardingData.FrequencyOption) -> some View {
        let selected = speakingFrequency == option.id
        return Button(action: { speakingFrequency = option.id }) {
            VStack(spacing: 4) {
                Text(option.label)
                    .font(.slSM)
                    .fontWeight(.medium)
                    .foregroundColor(selected ? .obsidianNight : .textPrimary)
                Text(option.desc)
                    .font(.slXS)
                    .foregroundColor(selected ? .obsidianNight.opacity(0.7) : .textSecondary)
            }
            .frame(maxWidth: .infinity)
            .padding(SLSpacing.s3)
            .background(selected ? Color.clarityTeal : Color.cardSurface)
            .cornerRadius(SLRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: SLRadius.md)
                    .stroke(selected ? Color.clarityTeal : Color.border, lineWidth: 1)
            )
        }
        .slHaptic(.light)
    }

    private func challengeCard(challenge: OnboardingData.Challenge) -> some View {
        let selected = selectedChallenges.contains(challenge.id)
        return Button(action: {
            if selected { selectedChallenges.remove(challenge.id) } else { selectedChallenges.insert(challenge.id) }
        }) {
            HStack(spacing: SLSpacing.s2) {
                Text(challenge.emoji)
                Text(challenge.label)
                    .font(.slSM)
                    .foregroundColor(selected ? .obsidianNight : .textPrimary)
                Spacer()
                if selected {
                    Image(systemName: "checkmark")
                        .font(.caption)
                        .foregroundColor(.obsidianNight)
                }
            }
            .padding(SLSpacing.s3)
            .background(selected ? Color.clarityTeal : Color.cardSurface)
            .cornerRadius(SLRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: SLRadius.md)
                    .stroke(selected ? Color.clarityTeal : Color.border, lineWidth: 1)
            )
        }
        .slHaptic(.light)
    }

    private func scoreRing(value: Int, label: String, color: Color) -> some View {
        VStack(spacing: SLSpacing.s2) {
            ZStack {
                GlowCircle(color: color, size: 90, blur: 30)
                Circle()
                    .stroke(Color.elevation2, lineWidth: 8)
                Circle()
                    .trim(from: 0, to: CGFloat(value) / 100)
                    .stroke(
                        AngularGradient(
                            colors: [color, color.opacity(0.5), color],
                            center: .center,
                            startAngle: .degrees(-90),
                            endAngle: .degrees(270)
                        ),
                        style: StrokeStyle(lineWidth: 8, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 1), value: value)
                AnimatedNumber(value: Double(value), color: .textPrimary, font: .sl2XL)
            }
            .frame(width: 100, height: 100)

            Text(label)
                .font(.slSM)
                .foregroundColor(.textSecondary)
        }
    }
}

// MARK: - Onboarding Step (Reusable)

struct OnboardingStep<Content: View>: View {
    var icon: String? = nil
    let title: String
    let subtitle: String
    @ViewBuilder let content: () -> Content
    let action: () -> Void
    var skipLabel: (() -> String)? = nil

    var body: some View {
        ScrollView {
            VStack(spacing: SLSpacing.s6) {
                Spacer().frame(height: SLSpacing.s4)

                VStack(spacing: SLSpacing.s2) {
                    if let icon {
                        ZStack {
                            GlowCircle(color: .clarityTeal, size: 60, blur: 25)
                            Image(systemName: icon)
                                .font(.title)
                                .foregroundStyle(Color.tealGradient)
                        }
                    }
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
                    Text(skipLabel?() ?? "Continue")
                }
                .buttonStyle(SLPrimaryButtonStyle())
                .padding(.horizontal, SLSpacing.s4)
                .padding(.bottom, SLSpacing.s8)
            }
            .frame(minHeight: UIScreen.main.bounds.height - 60)
        }
    }
}

// MARK: - Flow Layout (for word chips)

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (positions, CGSize(width: maxWidth, height: y + rowHeight))
    }
}

// MARK: - Onboarding Data (matches web config)

enum OnboardingData {

    struct Situation {
        let id: String
        let emoji: String
        let label: String
    }

    struct FearedSituation {
        let id: String
        let emoji: String
        let label: String
        let desc: String
    }

    struct FrequencyOption {
        let id: String
        let label: String
        let desc: String
    }

    struct Challenge {
        let id: String
        let emoji: String
        let label: String
    }

    struct AvoidanceBehavior {
        let id: String
        let emoji: String
        let label: String
    }

    struct RoadmapPhase {
        let phase: Int
        let label: String
        let focus: String
    }

    static let confidenceSituations: [Situation] = [
        .init(id: "phone-call", emoji: "📞", label: "Making a phone call"),
        .init(id: "ordering", emoji: "☕", label: "Ordering food"),
        .init(id: "meeting", emoji: "🏢", label: "Speaking up in a meeting"),
        .init(id: "introduction", emoji: "👋", label: "Introducing yourself"),
        .init(id: "asking-question", emoji: "✋", label: "Asking a question in a group"),
        .init(id: "small-talk", emoji: "💬", label: "Small talk with strangers"),
        .init(id: "presenting", emoji: "🎤", label: "Giving a presentation"),
        .init(id: "saying-name", emoji: "🏷", label: "Saying your name"),
    ]

    static let fearedSituations: [FearedSituation] = [
        .init(id: "strangers", emoji: "👤", label: "Talking to strangers", desc: "Asking for help or directions"),
        .init(id: "phone-calls", emoji: "📞", label: "Phone calls", desc: "Making or receiving calls"),
        .init(id: "ordering", emoji: "☕", label: "Ordering food", desc: "Restaurants, coffee shops"),
        .init(id: "authority", emoji: "👔", label: "Authority figures", desc: "Boss, teacher, professor"),
        .init(id: "romantic", emoji: "💬", label: "Someone I like", desc: "Dates, romantic interests"),
        .init(id: "presentations", emoji: "🎤", label: "Presentations", desc: "Public speaking, demos"),
        .init(id: "groups", emoji: "👥", label: "Group conversations", desc: "Meetings, parties"),
        .init(id: "shopping", emoji: "🛒", label: "Shopping / returns", desc: "Asking for help, complaints"),
    ]

    static let avoidanceBehaviors: [AvoidanceBehavior] = [
        .init(id: "word-swap", emoji: "🔄", label: "I substitute words to avoid stuttering"),
        .init(id: "avoid-calls", emoji: "📵", label: "I avoid making phone calls"),
        .init(id: "stay-silent", emoji: "🤐", label: "I stay silent rather than risk stuttering"),
        .init(id: "let-others", emoji: "👥", label: "I let others speak for me"),
        .init(id: "avoid-eye", emoji: "👀", label: "I avoid eye contact when speaking"),
        .init(id: "rush-speech", emoji: "⚡", label: "I rush through words"),
    ]

    static let frequencyOptions: [FrequencyOption] = [
        .init(id: "rarely", label: "Rarely", desc: "I mostly avoid it"),
        .init(id: "sometimes", label: "Sometimes", desc: "A few times a day"),
        .init(id: "often", label: "Often", desc: "Throughout the day"),
        .init(id: "daily", label: "Constantly", desc: "Speaking is my job"),
    ]

    static let speechChallenges: [Challenge] = [
        .init(id: "work-calls", emoji: "📞", label: "Phone calls at work"),
        .init(id: "interviews", emoji: "💼", label: "Job interviews"),
        .init(id: "ordering", emoji: "☕", label: "Ordering food or drinks"),
        .init(id: "dating", emoji: "💬", label: "Dating conversations"),
        .init(id: "presentations", emoji: "🎤", label: "Presentations & meetings"),
        .init(id: "family", emoji: "👨‍👩‍👧", label: "Talking to family"),
        .init(id: "friends", emoji: "🤝", label: "Making new friends"),
        .init(id: "advocating", emoji: "✊", label: "Advocating for myself"),
    ]

    static let suggestedWords = [
        "specifically", "presentation", "schedule", "telephone",
        "restaurant", "comfortable", "necessary", "particularly",
    ]

    static let roadmapPhases: [RoadmapPhase] = [
        .init(phase: 1, label: "Foundation", focus: "Breathing + Gentle Onset"),
        .init(phase: 2, label: "Building Blocks", focus: "Light Contact + FAF Feedback"),
        .init(phase: 3, label: "Integration", focus: "Technique Integration + CBT"),
        .init(phase: 4, label: "Real-World", focus: "AI Conversations + Phone Sims"),
        .init(phase: 5, label: "Mastery", focus: "Independence + Maintenance"),
    ]
}

// MARK: - Scoring (matches web scoring.ts)

enum OnboardingScoring {

    struct Profile {
        let id: String
        let label: String
        let description: String
        let emphasis: [String: Int]
    }

    struct Result {
        let severityScore: Int
        let confidenceScore: Int
        let profile: Profile
    }

    static func calculate(
        severity: Severity,
        confidenceRatings: [String: Int],
        avoidanceBehaviors: [String],
        stutteringTypes: [String],
        speakingFrequency: String,
        fearedSituations: [String]
    ) -> Result {
        // Severity score
        let baseScore: Int
        switch severity {
        case .mild: baseScore = 25
        case .moderate: baseScore = 50
        case .severe: baseScore = 75
        }

        let frequencyAdj: Int
        switch speakingFrequency {
        case "rarely": frequencyAdj = 10
        case "sometimes": frequencyAdj = 5
        case "often": frequencyAdj = -3
        case "daily": frequencyAdj = -5
        default: frequencyAdj = 0
        }

        var sevScore = baseScore
            + stutteringTypes.count * 4
            + avoidanceBehaviors.count * 3
            + frequencyAdj
        if fearedSituations.count > 5 { sevScore += 5 }
        else if fearedSituations.count > 3 { sevScore += 2 }
        sevScore = max(1, min(100, sevScore))

        // Confidence score
        var confScore: Int
        if confidenceRatings.isEmpty {
            confScore = 50
        } else {
            let avg = Double(confidenceRatings.values.reduce(0, +)) / Double(confidenceRatings.count)
            confScore = Int(((avg - 1.0) / 4.0) * 100.0)
        }
        confScore -= avoidanceBehaviors.count * 4
        confScore = max(1, min(100, confScore))

        // Profile
        let profile: Profile
        if avoidanceBehaviors.count >= 3 && confScore < 40 {
            profile = Profile(
                id: "avoidance-heavy",
                label: "Avoidance-Focused Profile",
                description: "You tend to avoid speaking situations. Your program emphasizes gradual exposure and confidence building alongside speech techniques.",
                emphasis: ["Fluency Shaping": 35, "Stuttering Modification": 30, "CBT": 35]
            )
        } else if confScore < 30 {
            profile = Profile(
                id: "anxiety-heavy",
                label: "Anxiety-Focused Profile",
                description: "Speaking anxiety is your main challenge. Your program includes extra mindfulness and CBT modules alongside core techniques.",
                emphasis: ["Fluency Shaping": 30, "Stuttering Modification": 25, "CBT": 45]
            )
        } else if confScore > 55 && sevScore < 60 {
            profile = Profile(
                id: "technique-ready",
                label: "Technique-Ready Profile",
                description: "You're ready to dive into techniques. Your program focuses heavily on speech modification skills with progressive real-world practice.",
                emphasis: ["Fluency Shaping": 45, "Stuttering Modification": 40, "CBT": 15]
            )
        } else {
            profile = Profile(
                id: "balanced",
                label: "Balanced Profile",
                description: "You have a well-rounded profile. Your program balances technique practice, confidence building, and real-world exposure evenly.",
                emphasis: ["Fluency Shaping": 40, "Stuttering Modification": 35, "CBT": 25]
            )
        }

        return Result(severityScore: sevScore, confidenceScore: confScore, profile: profile)
    }
}

// MARK: - Onboarding Payload

struct OnboardingPayload {
    let name: String
    let severity: Severity
    let stutteringTypes: [String]
    let confidenceRatings: [String: Int]
    let fearedSituations: [String]
    let fearedWords: [String]
    let avoidanceBehaviors: [String]
    let speakingFrequency: String
    let speechChallenges: [String]
    let northStarGoal: String
    let severityScore: Int
    let confidenceScore: Int
    let assessmentProfile: String
}
