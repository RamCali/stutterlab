import SwiftUI

// MARK: - Feared Word Model

struct FearedWord: Codable, Identifiable {
    let id: String
    var word: String
    var difficulty: Int // 1-10
    var practiceCount: Int
    var mastered: Bool
    var lastPracticed: Date?

    static func new(word: String) -> FearedWord {
        FearedWord(
            id: UUID().uuidString,
            word: word.lowercased().trimmingCharacters(in: .whitespaces),
            difficulty: estimateDifficulty(word),
            practiceCount: 0,
            mastered: false,
            lastPracticed: nil
        )
    }

    /// Estimate difficulty based on initial phoneme
    static func estimateDifficulty(_ word: String) -> Int {
        guard let first = word.lowercased().first else { return 5 }
        // Stops and affricates are hardest
        let hard: Set<Character> = ["p", "b", "t", "d", "k", "g", "c", "j"]
        let medium: Set<Character> = ["s", "z", "f", "v", "m", "n", "l", "r"]
        if hard.contains(first) { return Int.random(in: 7...9) }
        if medium.contains(first) { return Int.random(in: 4...6) }
        return Int.random(in: 2...4)
    }
}

// MARK: - Feared Words View Model

@MainActor
final class FearedWordsViewModel: ObservableObject {
    @Published var words: [FearedWord] = []

    private let storageKey = "feared_words_v1"

    var masteredCount: Int { words.filter(\.mastered).count }
    var totalCount: Int { words.count }
    var masteryPercent: Int {
        guard totalCount > 0 else { return 0 }
        return Int(Double(masteredCount) / Double(totalCount) * 100)
    }

    func load(fromOnboarding onboardingWords: [String]) {
        // Load from UserDefaults
        if let data = UserDefaults.standard.data(forKey: storageKey),
           let saved = try? JSONDecoder().decode([FearedWord].self, from: data) {
            words = saved
        }

        // Add any onboarding words not yet in the list
        for word in onboardingWords {
            let cleaned = word.lowercased().trimmingCharacters(in: .whitespaces)
            if !cleaned.isEmpty && !words.contains(where: { $0.word == cleaned }) {
                words.append(FearedWord.new(word: cleaned))
            }
        }
        save()
    }

    func addWord(_ word: String) {
        let cleaned = word.lowercased().trimmingCharacters(in: .whitespaces)
        guard !cleaned.isEmpty, !words.contains(where: { $0.word == cleaned }) else { return }
        words.append(FearedWord.new(word: cleaned))
        save()
    }

    func removeWord(_ word: FearedWord) {
        words.removeAll { $0.id == word.id }
        save()
    }

    func recordPractice(wordId: String, fluencyScore: Double) {
        guard let index = words.firstIndex(where: { $0.id == wordId }) else { return }
        words[index].practiceCount += 1
        words[index].lastPracticed = Date()

        // Mastered after 10+ practices with good scores
        if words[index].practiceCount >= 10 && fluencyScore >= 70 {
            words[index].mastered = true
        }
        save()
    }

    private func save() {
        if let data = try? JSONEncoder().encode(words) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }
}

// MARK: - Feared Words Dashboard View

struct FearedWordsView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @StateObject private var viewModel = FearedWordsViewModel()
    @State private var showAddSheet = false
    @State private var selectedWord: FearedWord? = nil

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            ScrollView {
                VStack(spacing: SLSpacing.s6) {
                    // Stats Header
                    statsHeader

                    // Word List
                    if viewModel.words.isEmpty {
                        emptyState
                    } else {
                        ForEach(viewModel.words) { word in
                            wordCard(word)
                        }
                    }

                    // Suggestions
                    suggestionsSection
                }
                .padding(SLSpacing.s4)
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Feared Words")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showAddSheet = true }) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(.clarityTeal)
                }
            }
        }
        .sheet(isPresented: $showAddSheet) {
            AddWordSheet(viewModel: viewModel)
        }
        .fullScreenCover(item: $selectedWord) { word in
            WordPracticeView(word: word, viewModel: viewModel)
                .environmentObject(appViewModel)
        }
        .onAppear {
            // Load words from onboarding data
            let onboardingWords = (appViewModel.userProfile as UserProfile?)
                .flatMap { _ in [] as [String] } ?? [] // TODO: extract from treatmentPath
            viewModel.load(fromOnboarding: onboardingWords)
        }
    }

    // MARK: - Stats Header

    private var statsHeader: some View {
        HStack(spacing: SLSpacing.s4) {
            statPill(
                value: "\(viewModel.totalCount)",
                label: "Total",
                color: .clarityTeal
            )
            statPill(
                value: "\(viewModel.masteredCount)",
                label: "Mastered",
                color: .fluencyGreen
            )
            statPill(
                value: "\(viewModel.masteryPercent)%",
                label: "Mastery",
                color: .sunsetAmber
            )
        }
    }

    private func statPill(value: String, label: String, color: Color) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.slLG)
                .foregroundColor(color)
            Text(label)
                .font(.slXS)
                .foregroundColor(.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .slCard(padding: SLSpacing.s3)
    }

    // MARK: - Word Card

    private func wordCard(_ word: FearedWord) -> some View {
        Button(action: { selectedWord = word }) {
            HStack(spacing: SLSpacing.s3) {
                // Difficulty indicator
                Circle()
                    .fill(difficultyColor(word.difficulty))
                    .frame(width: 8, height: 8)

                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text(word.word)
                            .font(.slBase)
                            .fontWeight(.semibold)
                            .foregroundColor(.textPrimary)
                        if word.mastered {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 14))
                                .foregroundColor(.fluencyGreen)
                        }
                    }
                    HStack(spacing: SLSpacing.s2) {
                        Text("Difficulty: \(word.difficulty)/10")
                            .font(.slXS)
                            .foregroundColor(.textTertiary)
                        Text("Practiced: \(word.practiceCount)x")
                            .font(.slXS)
                            .foregroundColor(.textTertiary)
                    }
                }

                Spacer()

                Button("Practice") {
                    selectedWord = word
                }
                .font(.slXS)
                .fontWeight(.medium)
                .foregroundColor(.clarityTeal)
                .padding(.horizontal, SLSpacing.s3)
                .padding(.vertical, SLSpacing.s1)
                .background(Color.clarityTeal.opacity(0.1))
                .cornerRadius(SLRadius.full)
            }
            .slCardAccent(.sunsetAmber, radius: SLRadius.md)
        }
        .swipeActions(edge: .trailing) {
            Button(role: .destructive) {
                viewModel.removeWord(word)
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
    }

    private func difficultyColor(_ difficulty: Int) -> Color {
        if difficulty <= 3 { return .fluencyGreen }
        if difficulty <= 6 { return .sunsetAmber }
        return Color(hex: "FF6B6B")
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: SLSpacing.s4) {
            Image(systemName: "text.badge.plus")
                .font(.system(size: 40))
                .foregroundColor(.textTertiary)
            Text("No feared words yet")
                .font(.slLG)
                .foregroundColor(.textSecondary)
            Text("Add words you find difficult to say. We'll create personalized practice for each one.")
                .font(.slSM)
                .foregroundColor(.textTertiary)
                .multilineTextAlignment(.center)
            Button(action: { showAddSheet = true }) {
                Text("Add Your First Word")
            }
            .buttonStyle(SLPrimaryButtonStyle())
        }
        .padding(.vertical, SLSpacing.s10)
    }

    // MARK: - Suggestions

    private var suggestionsSection: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s2) {
            Text("Common difficult words")
                .font(.slXS)
                .foregroundColor(.textTertiary)

            let suggestions = ["specifically", "presentation", "schedule", "telephone", "restaurant", "comfortable", "necessary", "particularly"]
            let filtered = suggestions.filter { sug in
                !viewModel.words.contains(where: { $0.word == sug })
            }

            FlowLayout(spacing: SLSpacing.s2) {
                ForEach(filtered, id: \.self) { word in
                    Button(action: { viewModel.addWord(word) }) {
                        Text(word)
                            .font(.slXS)
                            .foregroundColor(.textSecondary)
                            .padding(.horizontal, SLSpacing.s3)
                            .padding(.vertical, SLSpacing.s1)
                            .background(Color.elevation2)
                            .cornerRadius(SLRadius.full)
                    }
                }
            }
        }
    }
}

// MARK: - Add Word Sheet

struct AddWordSheet: View {
    @ObservedObject var viewModel: FearedWordsViewModel
    @State private var newWord = ""
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                VStack(spacing: SLSpacing.s6) {
                    Text("Add a word you find difficult")
                        .font(.slLG)
                        .foregroundColor(.textPrimary)

                    TextField("Type a word...", text: $newWord)
                        .font(.slBase)
                        .foregroundColor(.textPrimary)
                        .padding(SLSpacing.s4)
                        .background(Color.elevation1)
                        .cornerRadius(SLRadius.md)
                        .overlay(
                            RoundedRectangle(cornerRadius: SLRadius.md)
                                .stroke(Color.clarityTeal.opacity(0.3), lineWidth: 1)
                        )

                    Button(action: addAndDismiss) {
                        Text("Add Word")
                    }
                    .buttonStyle(SLPrimaryButtonStyle(color: newWord.isEmpty ? .textTertiary : .clarityTeal))
                    .disabled(newWord.isEmpty)

                    Spacer()
                }
                .padding(SLSpacing.s6)
            }
            .navigationTitle("Add Word")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(.clarityTeal)
                }
            }
        }
    }

    private func addAndDismiss() {
        viewModel.addWord(newWord)
        dismiss()
    }
}

// MARK: - Word Practice View

struct WordPracticeView: View {
    let word: FearedWord
    @ObservedObject var viewModel: FearedWordsViewModel
    @EnvironmentObject var appViewModel: AppViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var practiceMode: PracticeMode = .isolation
    @State private var isRecording = false
    @State private var showResult = false
    @State private var lastScore: Double = 0

    enum PracticeMode: String, CaseIterable {
        case isolation = "Word"
        case sentence = "Sentence"
        case paragraph = "Paragraph"
    }

    private var practiceText: String {
        switch practiceMode {
        case .isolation:
            return word.word
        case .sentence:
            return "I want to say the word \(word.word) confidently."
        case .paragraph:
            return "Today I'm practicing the word \(word.word). I know it can feel difficult, but I'm going to say \(word.word) using gentle onset. Each time I say \(word.word), it gets easier."
        }
    }

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            VStack(spacing: SLSpacing.s6) {
                // Close
                HStack {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.textTertiary)
                    }
                    Spacer()
                    Text("Practice: \(word.word)")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                    Spacer()
                    // Balance
                    Color.clear.frame(width: 28)
                }
                .padding(.horizontal, SLSpacing.s4)

                // Mode Picker
                Picker("Mode", selection: $practiceMode) {
                    ForEach(PracticeMode.allCases, id: \.self) { mode in
                        Text(mode.rawValue).tag(mode)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, SLSpacing.s4)

                Spacer()

                // Word display
                Text(practiceText)
                    .font(practiceMode == .isolation ? .system(size: 48, weight: .bold) : .slXL)
                    .foregroundColor(.textPrimary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, SLSpacing.s6)

                // Tip
                Text("Use gentle onset — start with soft airflow")
                    .font(.slSM)
                    .foregroundColor(.clarityTeal)

                Spacer()

                // Record button
                Button(action: toggleRecording) {
                    VStack(spacing: SLSpacing.s2) {
                        ZStack {
                            Circle()
                                .fill(isRecording ? Color.sunsetAmber : Color.clarityTeal)
                                .frame(width: 80, height: 80)
                            Image(systemName: isRecording ? "stop.fill" : "mic.fill")
                                .font(.system(size: 30))
                                .foregroundColor(.obsidianNight)
                        }
                        Text(isRecording ? "Tap to stop" : "Tap to speak")
                            .font(.slSM)
                            .foregroundColor(.textSecondary)
                    }
                }

                // Stats
                HStack(spacing: SLSpacing.s4) {
                    Text("Practiced \(word.practiceCount)x")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                    if word.mastered {
                        HStack(spacing: 2) {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 10))
                            Text("Mastered")
                        }
                        .font(.slXS)
                        .foregroundColor(.fluencyGreen)
                    }
                }

                Spacer()
            }
        }
        .alert("Practice Complete", isPresented: $showResult) {
            Button("Continue") {
                viewModel.recordPractice(wordId: word.id, fluencyScore: lastScore)
                Task { await appViewModel.addXP(10) }
            }
        } message: {
            Text("Nice work practicing '\(word.word)'! +10 XP")
        }
    }

    private func toggleRecording() {
        if isRecording {
            isRecording = false
            lastScore = Double.random(in: 50...90) // Placeholder — would use SpeechAnalysisService
            showResult = true
        } else {
            isRecording = true
        }
    }
}

// FlowLayout is defined in OnboardingFlow.swift and shared across the app
