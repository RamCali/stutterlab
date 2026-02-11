import SwiftUI

// MARK: - Audio Lab View

struct AudioLabView: View {
    @StateObject private var audioLab = AudioLabService()
    @State private var showPresetSheet = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: SLSpacing.s6) {
                        // Header
                        headerSection

                        // Input Level Meter
                        InputLevelMeter(level: audioLab.inputLevel, isRunning: audioLab.isRunning)

                        // Start/Stop Button
                        startStopButton

                        // Tool Cards
                        dafCard
                        fafCard
                        metronomeCard

                        // Evidence note
                        evidenceNote
                    }
                    .padding(SLSpacing.s4)
                    .padding(.bottom, 100)
                }
            }
            .navigationTitle("Audio Lab")
            .navigationBarTitleDisplayMode(.inline)
            .alert("Error", isPresented: .init(
                get: { error != nil },
                set: { if !$0 { error = nil } }
            )) {
                Button("OK") { error = nil }
            } message: {
                Text(error ?? "")
            }
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s2) {
            HStack {
                Image(systemName: "waveform.circle.fill")
                    .font(.system(size: 28))
                    .foregroundColor(.clarityTeal)
                Text("Clinical Audio Tools")
                    .font(.slXL)
                    .foregroundColor(.textPrimary)
            }
            Text("DAF and FAF are clinically proven to reduce stuttering up to 80%. Adjust settings to find your sweet spot.")
                .font(.slSM)
                .foregroundColor(.textSecondary)
                .lineLimit(3)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Start / Stop

    private var startStopButton: some View {
        Button(action: toggleAudio) {
            HStack(spacing: SLSpacing.s2) {
                Image(systemName: audioLab.isRunning ? "stop.fill" : "mic.fill")
                Text(audioLab.isRunning ? "Stop Audio Lab" : "Start Audio Lab")
            }
        }
        .buttonStyle(SLPrimaryButtonStyle(color: audioLab.isRunning ? .sunsetAmber : .clarityTeal))
        .slHaptic(.heavy)
    }

    private func toggleAudio() {
        if audioLab.isRunning {
            audioLab.stop()
        } else {
            do {
                try audioLab.start()
            } catch {
                self.error = "Could not start audio: \(error.localizedDescription)"
            }
        }
    }

    // MARK: - DAF Card

    private var dafCard: some View {
        toolCard(
            icon: "waveform.path",
            title: "Delayed Auditory Feedback",
            subtitle: "Hear your voice delayed — proven to reduce stuttering",
            evidence: "d = 0.75-1.63",
            isEnabled: $audioLab.dafEnabled,
            isPremium: false
        ) {
            VStack(spacing: SLSpacing.s3) {
                HStack {
                    Text("Delay")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                    Spacer()
                    Text("\(Int(audioLab.dafDelayMs)) ms")
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.clarityTeal)
                }

                Slider(
                    value: $audioLab.dafDelayMs,
                    in: AudioLabService.dafRange,
                    step: 10
                )
                .tint(.clarityTeal)

                HStack {
                    Text("50 ms")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                    Spacer()
                    Text("300 ms")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }

                // Quick presets
                HStack(spacing: SLSpacing.s2) {
                    quickPresetButton("Light", delay: 70)
                    quickPresetButton("Medium", delay: 120)
                    quickPresetButton("Strong", delay: 200)
                }
            }
        }
    }

    private func quickPresetButton(_ label: String, delay: Double) -> some View {
        Button(action: { audioLab.dafDelayMs = delay }) {
            Text(label)
                .font(.slXS)
                .fontWeight(.medium)
                .foregroundColor(audioLab.dafDelayMs == delay ? .obsidianNight : .textSecondary)
                .padding(.horizontal, SLSpacing.s3)
                .padding(.vertical, SLSpacing.s1)
                .background(audioLab.dafDelayMs == delay ? Color.clarityTeal : Color.elevation2)
                .cornerRadius(SLRadius.full)
        }
    }

    // MARK: - FAF Card

    private var fafCard: some View {
        toolCard(
            icon: "tuningfork",
            title: "Frequency-Altered Feedback",
            subtitle: "Shifts your voice pitch to trigger the choral effect",
            evidence: "d = 0.56-0.65",
            isEnabled: $audioLab.fafEnabled,
            isPremium: true
        ) {
            VStack(spacing: SLSpacing.s3) {
                HStack {
                    Text("Pitch Shift")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                    Spacer()
                    Text(fafLabel)
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.clarityTeal)
                }

                Slider(
                    value: $audioLab.fafSemitones,
                    in: AudioLabService.fafRange,
                    step: 0.5
                )
                .tint(.clarityTeal)

                HStack {
                    Text("-12 st")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                    Spacer()
                    Text("0")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                    Spacer()
                    Text("+12 st")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
            }
        }
    }

    private var fafLabel: String {
        let val = audioLab.fafSemitones
        if val == 0 { return "Off" }
        return String(format: "%+.1f semitones", val)
    }

    // MARK: - Metronome Card

    private var metronomeCard: some View {
        toolCard(
            icon: "metronome.fill",
            title: "Speech Pacing Metronome",
            subtitle: "Rhythmic pacing to control speaking rate",
            evidence: nil,
            isEnabled: $audioLab.metronomeEnabled,
            isPremium: false
        ) {
            VStack(spacing: SLSpacing.s3) {
                HStack {
                    Text("Tempo")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                    Spacer()
                    Text("\(Int(audioLab.metronomeBPM)) BPM")
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.clarityTeal)
                }

                Slider(
                    value: $audioLab.metronomeBPM,
                    in: AudioLabService.bpmRange,
                    step: 2
                )
                .tint(.clarityTeal)

                HStack {
                    Text("40")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                    Spacer()
                    Text("Normal speech: 80-120")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                    Spacer()
                    Text("208")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
            }
        }
    }

    // MARK: - Tool Card Template

    private func toolCard<Content: View>(
        icon: String,
        title: String,
        subtitle: String,
        evidence: String?,
        isEnabled: Binding<Bool>,
        isPremium: Bool,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: SLSpacing.s4) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(.clarityTeal)

                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text(title)
                            .font(.slSM)
                            .fontWeight(.semibold)
                            .foregroundColor(.textPrimary)
                        if isPremium {
                            Text("PRO")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(.sunsetAmber)
                                .padding(.horizontal, 4)
                                .padding(.vertical, 1)
                                .background(Color.sunsetAmber.opacity(0.15))
                                .cornerRadius(3)
                        }
                    }
                    Text(subtitle)
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                        .lineLimit(2)
                }

                Spacer()

                Toggle("", isOn: isEnabled)
                    .tint(.clarityTeal)
                    .labelsHidden()
            }

            if let evidence {
                HStack(spacing: SLSpacing.s1) {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.fluencyGreen)
                    Text("Effect size: \(evidence)")
                        .font(.system(size: 10))
                        .foregroundColor(.fluencyGreen)
                }
            }

            if isEnabled.wrappedValue {
                content()
            }
        }
        .slCardElevated()
    }

    // MARK: - Evidence Note

    private var evidenceNote: some View {
        HStack(alignment: .top, spacing: SLSpacing.s2) {
            Image(systemName: "info.circle")
                .font(.system(size: 14))
                .foregroundColor(.textTertiary)
            Text("DAF and FAF are the most studied stuttering tools in speech-language pathology with effect sizes of d = 0.75-1.63 (large). Use headphones for best results.")
                .font(.slXS)
                .foregroundColor(.textTertiary)
                .lineLimit(4)
        }
        .slCard(padding: SLSpacing.s3)
    }
}
