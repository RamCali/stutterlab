import SwiftUI

// MARK: - Monthly Assessment View

/// Standardized reading passage assessment with speech analysis scoring.
struct MonthlyAssessmentView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @StateObject private var speechService = SpeechAnalysisService()
    @State private var state: AssessmentState = .intro
    @State private var result: SpeechAnalysisResult?
    @State private var selectedPassage = 0
    @Environment(\.dismiss) private var dismiss

    enum AssessmentState {
        case intro, reading, analyzing, results
    }

    private let passages = [
        ReadingPassage(
            title: "The Rainbow Passage",
            text: "When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow. The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon. There is, according to legend, a boiling pot of gold at one end. People look, but no one ever finds it.",
            wordCount: 67,
            difficulty: "Standard"
        ),
        ReadingPassage(
            title: "The Grandfather Passage",
            text: "You wished to know all about my grandfather. Well, he is nearly ninety-three years old. He dresses himself in an old black frock coat, usually several buttons missing. A long beard clings to his chin, giving those who observe him a pronounced feeling of the utmost respect. When he speaks, his voice is quite strong for the old man, though he puffs a bit.",
            wordCount: 62,
            difficulty: "Standard"
        ),
        ReadingPassage(
            title: "My Grandfather",
            text: "You wish to know all about my grandfather. Well, he is nearly ninety-three years old, yet he still thinks as swiftly as ever. He dresses himself in an old black frock coat, usually missing several buttons. A long beard clings to his chin, giving those who observe him a pronounced feeling of the utmost respect.",
            wordCount: 52,
            difficulty: "Easier"
        ),
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: SLSpacing.s6) {
                        switch state {
                        case .intro:
                            introView
                        case .reading:
                            readingView
                        case .analyzing:
                            analyzingView
                        case .results:
                            if let result {
                                resultsView(result)
                            }
                        }
                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100)
                }
            }
            .navigationTitle("Monthly Assessment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                        .foregroundColor(.clarityTeal)
                }
            }
        }
    }

    // MARK: - Intro

    private var introView: some View {
        VStack(spacing: SLSpacing.s6) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 48))
                .foregroundColor(.clarityTeal)

            VStack(spacing: SLSpacing.s2) {
                Text("Fluency Assessment")
                    .font(.slXL)
                    .foregroundColor(.textPrimary)
                Text("Read a standard passage aloud to measure your current fluency. This helps track your improvement over time.")
                    .font(.slBase)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
            }

            // Passage picker
            VStack(alignment: .leading, spacing: SLSpacing.s3) {
                Text("Select Passage")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)

                ForEach(Array(passages.enumerated()), id: \.offset) { index, passage in
                    Button(action: { selectedPassage = index }) {
                        HStack {
                            VStack(alignment: .leading, spacing: SLSpacing.s1) {
                                Text(passage.title)
                                    .font(.slSM)
                                    .foregroundColor(.textPrimary)
                                Text("\(passage.wordCount) words · \(passage.difficulty)")
                                    .font(.slXS)
                                    .foregroundColor(.textTertiary)
                            }
                            Spacer()
                            if selectedPassage == index {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.clarityTeal)
                            }
                        }
                        .slCard(padding: SLSpacing.s3)
                    }
                }
            }

            // Tips
            VStack(alignment: .leading, spacing: SLSpacing.s2) {
                Label("Find a quiet space", systemImage: "speaker.slash.fill")
                Label("Read at your natural pace", systemImage: "metronome.fill")
                Label("Don't try to hide stuttering", systemImage: "hand.raised.fill")
                Label("Results are private to you", systemImage: "lock.fill")
            }
            .font(.slSM)
            .foregroundColor(.textSecondary)

            Button(action: { state = .reading }) {
                Text("Begin Assessment")
            }
            .buttonStyle(SLPrimaryButtonStyle())
        }
    }

    // MARK: - Reading

    private var readingView: some View {
        VStack(spacing: SLSpacing.s6) {
            // Recording indicator
            HStack(spacing: SLSpacing.s2) {
                Circle()
                    .fill(speechService.isRecording ? Color(hex: "FF6B6B") : Color.textTertiary)
                    .frame(width: 10, height: 10)
                Text(speechService.isRecording ? "Recording..." : "Tap Start to begin")
                    .font(.slSM)
                    .foregroundColor(speechService.isRecording ? Color(hex: "FF6B6B") : .textSecondary)
            }
            .padding(.vertical, SLSpacing.s2)

            // Passage text
            VStack(alignment: .leading, spacing: SLSpacing.s2) {
                Text(passages[selectedPassage].title)
                    .font(.slLG)
                    .foregroundColor(.clarityTeal)

                Text(passages[selectedPassage].text)
                    .font(.system(size: 18, weight: .regular, design: .serif))
                    .foregroundColor(.textPrimary)
                    .lineSpacing(8)
                    .padding(SLSpacing.s4)
                    .background(Color.elevation1)
                    .cornerRadius(SLRadius.md)
            }

            // Live metrics
            if speechService.isRecording {
                HStack(spacing: SLSpacing.s4) {
                    liveMetric(label: "SPM", value: "\(Int(speechService.liveMetrics.runningSPM))")
                    liveMetric(label: "Syllables", value: "\(speechService.liveMetrics.runningSyllableCount)")
                    liveMetric(label: "Blocks", value: "\(speechService.liveMetrics.runningBlockCount)")
                }
            }

            // Controls
            HStack(spacing: SLSpacing.s4) {
                if !speechService.isRecording {
                    Button(action: startRecording) {
                        Label("Start Reading", systemImage: "mic.fill")
                    }
                    .buttonStyle(SLPrimaryButtonStyle())
                } else {
                    Button(action: stopRecording) {
                        Label("Done Reading", systemImage: "stop.fill")
                    }
                    .buttonStyle(SLPrimaryButtonStyle(color: .sunsetAmber))
                }
            }

            Button("Cancel") {
                if speechService.isRecording {
                    let _ = speechService.stopRecording(userId: appViewModel.userProfile?.id ?? "unknown", sessionId: nil)
                }
                state = .intro
            }
            .font(.slSM)
            .foregroundColor(.textTertiary)
        }
    }

    // MARK: - Analyzing

    private var analyzingView: some View {
        VStack(spacing: SLSpacing.s6) {
            ProgressView()
                .scaleEffect(1.5)
                .tint(.clarityTeal)
            Text("Analyzing your speech...")
                .font(.slLG)
                .foregroundColor(.textPrimary)
            Text("Computing fluency metrics")
                .font(.slSM)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, SLSpacing.s16)
    }

    // MARK: - Results

    private func resultsView(_ result: SpeechAnalysisResult) -> some View {
        VStack(spacing: SLSpacing.s6) {
            Text("Assessment Complete")
                .font(.slXL)
                .foregroundColor(.textPrimary)

            FluencyGauge(score: result.fluencyScore, label: "Fluency Score", size: 160)

            // Metrics grid
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: SLSpacing.s3) {
                MetricCard(
                    icon: "speedometer",
                    title: "Speaking Rate",
                    value: "\(Int(result.syllablesPerMinute))",
                    subtitle: "syllables/min (target: 120-180)",
                    color: result.syllablesPerMinute >= 120 && result.syllablesPerMinute <= 180 ? .fluencyGreen : .sunsetAmber
                )
                MetricCard(
                    icon: "waveform.badge.exclamationmark",
                    title: "Stuttering",
                    value: String(format: "%.1f%%", result.percentageSyllablesStuttered),
                    subtitle: "syllables stuttered",
                    color: result.percentageSyllablesStuttered < 5 ? .fluencyGreen : .sunsetAmber
                )
                MetricCard(
                    icon: "exclamationmark.triangle.fill",
                    title: "Blocks",
                    value: "\(result.blockCount)",
                    subtitle: "detected blocks",
                    color: result.blockCount == 0 ? .fluencyGreen : Color(hex: "FF6B6B")
                )
                MetricCard(
                    icon: "clock.fill",
                    title: "Duration",
                    value: String(format: "%.0fs", result.totalDurationSeconds),
                    subtitle: "total reading time",
                    color: .clarityTeal
                )
            }

            // Interpretation
            interpretationCard(result)

            Button(action: { dismiss() }) {
                Text("Done")
            }
            .buttonStyle(SLPrimaryButtonStyle())
        }
    }

    private func interpretationCard(_ result: SpeechAnalysisResult) -> some View {
        let ss = result.percentageSyllablesStuttered
        let severity: String
        let advice: String

        if ss < 3 {
            severity = "Mild"
            advice = "Your fluency is very good. Keep practicing to maintain these results."
        } else if ss < 8 {
            severity = "Mild-Moderate"
            advice = "You're making good progress. Focus on gentle onsets and light articulatory contacts."
        } else if ss < 15 {
            severity = "Moderate"
            advice = "Try using prolonged speech and pausing techniques. The Audio Lab's DAF can help."
        } else {
            severity = "Moderate-Severe"
            advice = "Consider using DAF at 100-150ms during practice. Cancellation and pull-out techniques will help."
        }

        return VStack(alignment: .leading, spacing: SLSpacing.s2) {
            HStack(spacing: SLSpacing.s2) {
                Image(systemName: "stethoscope")
                    .foregroundColor(.clarityTeal)
                Text("Clinical Interpretation")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
            }
            Text("Severity: \(severity) (\(String(format: "%.1f", ss))% SS)")
                .font(.slSM)
                .foregroundColor(.sunsetAmber)
            Text(advice)
                .font(.slSM)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .slCardAccent(.clarityTeal)
    }

    private func liveMetric(label: String, value: String) -> some View {
        VStack(spacing: SLSpacing.s1) {
            Text(value)
                .font(.slLG)
                .foregroundColor(.clarityTeal)
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, SLSpacing.s2)
        .background(Color.elevation1)
        .cornerRadius(SLRadius.sm)
    }

    // MARK: - Actions

    private func startRecording() {
        do {
            try speechService.startRecording()
        } catch {
            print("Failed to start assessment recording: \(error)")
        }
    }

    private func stopRecording() {
        state = .analyzing
        let userId = appViewModel.userProfile?.id ?? "unknown"
        let analysisResult = speechService.stopRecording(userId: userId, sessionId: nil)
        // Brief delay for UX
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            result = analysisResult
            state = .results
        }
    }
}

// MARK: - Reading Passage

struct ReadingPassage {
    let title: String
    let text: String
    let wordCount: Int
    let difficulty: String
}
