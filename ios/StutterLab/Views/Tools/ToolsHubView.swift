import SwiftUI

// MARK: - Tools Hub View

struct ToolsHubView: View {
    @EnvironmentObject var appViewModel: AppViewModel

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: SLPadding.sectionGap) {
                        NavigationLink(destination: AudioLabView().environmentObject(appViewModel)) {
                            heroToolCard
                        }
                        .slEntrance(delay: 0.05)

                        VStack(alignment: .leading, spacing: SLSpacing.s3) {
                            Text("CLINICAL TOOLS")
                                .font(.slXS)
                                .fontWeight(.semibold)
                                .foregroundColor(.textTertiary)
                                .tracking(SLLetterSpacing.wide)

                            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: SLSpacing.s3) {
                                NavigationLink(destination: ExerciseLibraryView().environmentObject(appViewModel)) {
                                    toolCard(icon: "list.bullet.clipboard.fill", title: "Exercises", subtitle: "12 evidence-based drills", color: .fluencyGreen)
                                }
                                .slEntrance(delay: 0.1)

                                NavigationLink(destination: TechniqueLibraryView()) {
                                    toolCard(icon: "brain.head.profile.fill", title: "Techniques", subtitle: "12 clinical methods", color: .clarityTeal)
                                }
                                .slEntrance(delay: 0.15)

                                NavigationLink(destination: FearedWordsView().environmentObject(appViewModel)) {
                                    toolCard(icon: "textformat.abc", title: "Feared Words", subtitle: "Practice trigger words", color: .sunsetAmber, isPremium: true)
                                }
                                .slEntrance(delay: 0.2)

                                NavigationLink(destination: MindfulnessHubView()) {
                                    toolCard(icon: "leaf.fill", title: "Mindfulness", subtitle: "Breathing & calm", color: .tintPurple)
                                }
                                .slEntrance(delay: 0.25)
                            }
                        }

                        VStack(alignment: .leading, spacing: SLSpacing.s3) {
                            Text("CBT & MENTAL TOOLS")
                                .font(.slXS)
                                .fontWeight(.semibold)
                                .foregroundColor(.textTertiary)
                                .tracking(SLLetterSpacing.wide)

                            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: SLSpacing.s3) {
                                NavigationLink(destination: ThoughtRecordListView()) {
                                    toolCard(icon: "doc.text.fill", title: "Thought Records", subtitle: "Challenge anxious thoughts", color: .tintPink)
                                }
                                .slEntrance(delay: 0.3)

                                NavigationLink(destination: PredictionTestListView()) {
                                    toolCard(icon: "chart.bar.doc.horizontal.fill", title: "Prediction Testing", subtitle: "Test anxiety predictions", color: .tintBlue)
                                }
                                .slEntrance(delay: 0.35)
                            }
                        }

                        quickTipsCard
                            .slEntrance(delay: 0.4)
                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100)
                }
            }
            .navigationTitle("Tools")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // MARK: - Hero Tool Card

    private var heroToolCard: some View {
        VStack(spacing: SLSpacing.s4) {
            HStack {
                VStack(alignment: .leading, spacing: SLSpacing.s1) {
                    HStack(spacing: SLSpacing.s2) {
                        ZStack {
                            GlowCircle(color: .clarityTeal, size: 40, blur: 15)
                            Image(systemName: "waveform.circle.fill")
                                .font(.system(size: 28))
                                .foregroundStyle(Color.tealGradient)
                        }
                        Text("Audio Lab")
                            .font(.slXL)
                            .foregroundColor(.textPrimary)
                    }
                    Text("DAF · FAF · Metronome — Real-time speech tools")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundColor(.textTertiary)
            }

            HStack(spacing: SLSpacing.s4) {
                featurePill(icon: "speaker.wave.2.fill", label: "DAF")
                featurePill(icon: "waveform", label: "FAF")
                featurePill(icon: "metronome.fill", label: "Metronome")
                Spacer()
            }

            Text("Clinically proven (d=0.75–1.63) · Powered by AVAudioEngine")
                .font(.system(size: 10))
                .foregroundColor(.textTertiary)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .slCardGradient([.clarityTeal.opacity(0.18), .tintBlue.opacity(0.05), .obsidianNight], radius: SLRadius.lg)
    }

    private func featurePill(icon: String, label: String) -> some View {
        HStack(spacing: SLSpacing.s1) {
            Image(systemName: icon)
                .font(.system(size: 10))
            Text(label)
                .font(.system(size: 11, weight: .medium))
        }
        .foregroundColor(.clarityTeal)
        .padding(.horizontal, SLSpacing.s2)
        .padding(.vertical, 4)
        .background(Color.clarityTeal.opacity(0.1))
        .cornerRadius(SLRadius.full)
    }

    // MARK: - Tool Card

    private func toolCard(icon: String, title: String, subtitle: String, color: Color, isPremium: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 24))
                    .foregroundColor(color)
                Spacer()
                if isPremium {
                    Text("PRO")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.obsidianNight)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color.amberGradient)
                        .cornerRadius(SLRadius.full)
                }
            }

            Text(title)
                .font(.slSM)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)

            Text(subtitle)
                .font(.slXS)
                .foregroundColor(.textSecondary)
                .lineLimit(2)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .slCardAccent(color)
    }

    // MARK: - Quick Tips

    private var quickTipsCard: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            Text("Quick Tips")
                .font(.slSM)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)

            VStack(alignment: .leading, spacing: SLSpacing.s2) {
                tipRow(icon: "speaker.wave.2", text: "Try DAF at 100ms for reading practice")
                Divider().background(Color.borderSubtle)
                tipRow(icon: "waveform", text: "FAF at -2 semitones helps with blocks")
                Divider().background(Color.borderSubtle)
                tipRow(icon: "metronome", text: "Metronome at 80 BPM paces your speech")
                Divider().background(Color.borderSubtle)
                tipRow(icon: "brain.head.profile", text: "Combine techniques for best results")
            }
        }
        .slCard()
    }

    private func tipRow(icon: String, text: String) -> some View {
        HStack(spacing: SLSpacing.s2) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(.clarityTeal)
                .frame(width: 20)
            Text(text)
                .font(.slXS)
                .foregroundColor(.textSecondary)
        }
    }
}
