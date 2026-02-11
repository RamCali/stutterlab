import SwiftUI

// MARK: - Technique Library View

struct TechniqueLibraryView: View {
    @State private var selectedTechnique: Technique? = nil

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: SLSpacing.s6) {
                    // Intro
                    VStack(alignment: .leading, spacing: SLSpacing.s2) {
                        Text("Evidence-based techniques used by Speech-Language Pathologists worldwide.")
                            .font(.slSM)
                            .foregroundColor(.textSecondary)
                    }

                    // Fluency Shaping
                    sectionHeader("Fluency Shaping", subtitle: "Techniques that reshape HOW you speak", icon: "waveform.path", count: Technique.fluencyShaping.count)

                    ForEach(Technique.fluencyShaping) { technique in
                        techniqueCard(technique)
                    }

                    // Stuttering Modification
                    sectionHeader("Stuttering Modification", subtitle: "Techniques that change HOW you stutter", icon: "arrow.triangle.2.circlepath", count: Technique.stutteringModification.count)

                    ForEach(Technique.stutteringModification) { technique in
                        techniqueCard(technique)
                    }
                }
                .padding(SLSpacing.s4)
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Techniques")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $selectedTechnique) { technique in
            TechniqueDetailView(technique: technique)
        }
    }

    // MARK: - Section Header

    private func sectionHeader(_ title: String, subtitle: String, icon: String, count: Int) -> some View {
        HStack {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(.clarityTeal)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.slLG)
                    .foregroundColor(.textPrimary)
                Text(subtitle)
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
            }
            Spacer()
            Text("\(count)")
                .font(.slSM)
                .fontWeight(.semibold)
                .foregroundColor(.clarityTeal)
                .padding(.horizontal, SLSpacing.s2)
                .padding(.vertical, 2)
                .background(Color.clarityTeal.opacity(0.1))
                .cornerRadius(SLRadius.full)
        }
    }

    // MARK: - Technique Card

    private func techniqueCard(_ technique: Technique) -> some View {
        Button(action: { selectedTechnique = technique }) {
            HStack(spacing: SLSpacing.s3) {
                Image(systemName: technique.icon)
                    .font(.system(size: 22))
                    .foregroundColor(.clarityTeal)
                    .frame(width: 40, height: 40)

                VStack(alignment: .leading, spacing: 2) {
                    Text(technique.name)
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                    Text(technique.description)
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                        .lineLimit(2)

                    HStack(spacing: SLSpacing.s2) {
                        evidencePill(technique.evidence)
                        if let effect = technique.effectSize {
                            Text(effect)
                                .font(.system(size: 9))
                                .foregroundColor(.fluencyGreen)
                        }
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

    private func evidencePill(_ level: EvidenceLevel) -> some View {
        HStack(spacing: 2) {
            Image(systemName: level == .high ? "checkmark.seal.fill" : "checkmark.seal")
                .font(.system(size: 8))
            Text(level.rawValue.capitalized)
                .font(.system(size: 9, weight: .medium))
        }
        .foregroundColor(level == .high ? .fluencyGreen : (level == .moderate ? .clarityTeal : .textTertiary))
    }
}

// MARK: - Technique Detail View

struct TechniqueDetailView: View {
    let technique: Technique
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: SLSpacing.s6) {
                        // Header
                        HStack {
                            Image(systemName: technique.icon)
                                .font(.system(size: 36))
                                .foregroundColor(.clarityTeal)
                            VStack(alignment: .leading) {
                                Text(technique.name)
                                    .font(.slXL)
                                    .foregroundColor(.textPrimary)
                                Text(technique.category.rawValue)
                                    .font(.slSM)
                                    .foregroundColor(.clarityTeal)
                            }
                        }

                        // Evidence
                        if let effect = technique.effectSize {
                            HStack(spacing: SLSpacing.s2) {
                                Image(systemName: "checkmark.seal.fill")
                                    .foregroundColor(.fluencyGreen)
                                Text("Evidence: \(technique.evidence.rawValue.capitalized) (\(effect))")
                                    .font(.slSM)
                                    .foregroundColor(.fluencyGreen)
                            }
                            .padding(SLSpacing.s3)
                            .background(Color.fluencyGreen.opacity(0.1))
                            .cornerRadius(SLRadius.md)
                        }

                        // Description
                        sectionCard("What It Is", content: technique.description)

                        // When to Use
                        sectionCard("When to Use", content: technique.whenToUse)

                        // How To
                        VStack(alignment: .leading, spacing: SLSpacing.s3) {
                            Text("How To Do It")
                                .font(.slSM)
                                .fontWeight(.semibold)
                                .foregroundColor(.textPrimary)

                            ForEach(Array(technique.howTo.enumerated()), id: \.offset) { index, step in
                                HStack(alignment: .top, spacing: SLSpacing.s3) {
                                    Text("\(index + 1)")
                                        .font(.slSM)
                                        .fontWeight(.bold)
                                        .foregroundColor(.clarityTeal)
                                        .frame(width: 24, height: 24)
                                        .background(Color.clarityTeal.opacity(0.1))
                                        .cornerRadius(12)
                                    Text(step)
                                        .font(.slBase)
                                        .foregroundColor(.textSecondary)
                                }
                            }
                        }
                        .slCard()

                        // Citation
                        if let citation = technique.citation {
                            HStack(alignment: .top, spacing: SLSpacing.s2) {
                                Image(systemName: "book.closed")
                                    .font(.system(size: 12))
                                    .foregroundColor(.textTertiary)
                                Text(citation)
                                    .font(.slXS)
                                    .foregroundColor(.textTertiary)
                            }
                        }
                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100)
                }
            }
            .navigationTitle(technique.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") { dismiss() }
                        .foregroundColor(.clarityTeal)
                }
            }
        }
    }

    private func sectionCard(_ title: String, content: String) -> some View {
        VStack(alignment: .leading, spacing: SLSpacing.s2) {
            Text(title)
                .font(.slSM)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)
            Text(content)
                .font(.slBase)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .slCard()
    }
}
