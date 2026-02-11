import SwiftUI

// MARK: - Exercise Library View

struct ExerciseLibraryView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @State private var searchText = ""
    @State private var selectedDifficulty: Difficulty? = nil
    @State private var showPremiumOnly = false
    @State private var selectedExercise: Exercise? = nil

    private var filteredExercises: [Exercise] {
        Exercise.catalog.filter { exercise in
            let matchesSearch = searchText.isEmpty ||
                exercise.title.localizedCaseInsensitiveContains(searchText) ||
                exercise.technique.localizedCaseInsensitiveContains(searchText)
            let matchesDifficulty = selectedDifficulty == nil || exercise.difficulty == selectedDifficulty
            let matchesPremium = !showPremiumOnly || exercise.isPremium
            return matchesSearch && matchesDifficulty && matchesPremium
        }
    }

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            VStack(spacing: 0) {
                // Filters
                filterBar

                ScrollView {
                    LazyVGrid(columns: [GridItem(.flexible())], spacing: SLSpacing.s3) {
                        ForEach(filteredExercises) { exercise in
                            ExerciseListCard(exercise: exercise) {
                                selectedExercise = exercise
                            }
                        }
                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100)
                }
            }
        }
        .navigationTitle("Exercises")
        .navigationBarTitleDisplayMode(.inline)
        .searchable(text: $searchText, prompt: "Search exercises...")
        .sheet(item: $selectedExercise) { exercise in
            ExerciseDetailView(exercise: exercise)
                .environmentObject(appViewModel)
        }
    }

    // MARK: - Filter Bar

    private var filterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: SLSpacing.s2) {
                filterChip("All", isSelected: selectedDifficulty == nil) {
                    selectedDifficulty = nil
                }
                ForEach(Difficulty.allCases, id: \.self) { difficulty in
                    filterChip(difficulty.rawValue.capitalized, isSelected: selectedDifficulty == difficulty) {
                        selectedDifficulty = difficulty
                    }
                }
            }
            .padding(.horizontal, SLSpacing.s4)
            .padding(.vertical, SLSpacing.s2)
        }
        .background(Color.obsidianNight)
    }

    private func filterChip(_ text: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(text)
                .font(.slXS)
                .fontWeight(.medium)
                .foregroundColor(isSelected ? .obsidianNight : .textSecondary)
                .padding(.horizontal, SLSpacing.s3)
                .padding(.vertical, SLSpacing.s1)
                .background(isSelected ? Color.clarityTeal : Color.elevation2)
                .cornerRadius(SLRadius.full)
        }
    }
}

// MARK: - Exercise List Card

struct ExerciseListCard: View {
    let exercise: Exercise
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: SLSpacing.s3) {
                // Icon
                Image(systemName: exercise.type.icon)
                    .font(.system(size: 24))
                    .foregroundColor(.clarityTeal)
                    .frame(width: 44, height: 44)
                    .background(Color.clarityTeal.opacity(0.1))
                    .cornerRadius(SLRadius.md)

                // Info
                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text(exercise.title)
                            .font(.slSM)
                            .fontWeight(.semibold)
                            .foregroundColor(.textPrimary)
                        if exercise.isPremium {
                            Text("PRO")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(.sunsetAmber)
                                .padding(.horizontal, 4)
                                .padding(.vertical, 1)
                                .background(Color.sunsetAmber.opacity(0.15))
                                .cornerRadius(3)
                        }
                    }
                    Text(exercise.description)
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                        .lineLimit(2)

                    HStack(spacing: SLSpacing.s2) {
                        difficultyBadge(exercise.difficulty)
                        if let duration = exercise.durationSeconds {
                            Text("\(duration / 60) min")
                                .font(.system(size: 10))
                                .foregroundColor(.textTertiary)
                        }
                        EvidenceBadge(level: exercise.evidenceLevel, effectSize: exercise.effectSize, citation: exercise.citation)
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 12))
                    .foregroundColor(.textTertiary)
            }
            .slCard(padding: SLSpacing.s3)
        }
    }

    private func difficultyBadge(_ difficulty: Difficulty) -> some View {
        Text(difficulty.rawValue.capitalized)
            .font(.system(size: 9, weight: .medium))
            .foregroundColor(difficultyColor(difficulty))
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(difficultyColor(difficulty).opacity(0.15))
            .cornerRadius(SLRadius.full)
    }

    private func difficultyColor(_ difficulty: Difficulty) -> Color {
        switch difficulty {
        case .beginner: return .fluencyGreen
        case .intermediate: return .clarityTeal
        case .advanced: return .sunsetAmber
        case .expert: return Color(hex: "FF6B6B")
        }
    }
}

// MARK: - Exercise Type Icon Helper

extension ExerciseType {
    var icon: String {
        switch self {
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
