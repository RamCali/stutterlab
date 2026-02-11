import AVFoundation
import SwiftUI

// MARK: - Voice Journal View

/// Guided speaking reflection: pick a prompt, speak your answer out loud,
/// optionally add written notes. The therapeutic value is the private,
/// low-pressure speaking opportunity.
struct VoiceJournalView: View {
    var onComplete: (() -> Void)?

    /// When embedded inside SessionView, hide the close button and header
    /// (SessionView already shows "Day X / Voice Journal Entry").
    var embedded = false

    @Environment(\.dismiss) private var dismiss
    @State private var isRecording = false
    @State private var recordingDuration: TimeInterval = 0
    @State private var audioRecorder: AVAudioRecorder?
    @State private var timer: Timer?
    @State private var textNote = ""
    @State private var selectedPrompt: String?
    @State private var hasRecording = false

    private let prompts = [
        "How did my speech feel today?",
        "What technique worked best?",
        "What was challenging?",
        "What am I proud of today?",
        "How was my breathing?",
    ]

    var body: some View {
        ZStack {
            if !embedded {
                Color.obsidianNight.ignoresSafeArea()
            }

            ScrollView {
                VStack(spacing: SLSpacing.s5) {
                    // Close button + header (standalone only)
                    if !embedded {
                        HStack {
                            Button(action: { dismiss() }) {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 28))
                                    .foregroundColor(.textTertiary)
                            }
                            Spacer()
                        }
                        .padding(.horizontal, SLSpacing.s4)

                        VStack(spacing: SLSpacing.s2) {
                            Image(systemName: "book.fill")
                                .font(.system(size: 40))
                                .foregroundColor(.sunsetAmber)

                            Text("Voice Journal")
                                .font(.slXL)
                                .foregroundColor(.textPrimary)

                            Text("Speak your reflection out loud — it's private practice")
                                .font(.slSM)
                                .foregroundColor(.textSecondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.top, SLSpacing.s4)
                    }

                    // Prompt selection
                    VStack(alignment: .leading, spacing: SLSpacing.s2) {
                        Text("Pick a topic to speak about")
                            .font(.slXS)
                            .fontWeight(.medium)
                            .foregroundColor(.textTertiary)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: SLSpacing.s2) {
                                ForEach(prompts, id: \.self) { prompt in
                                    promptChip(prompt)
                                }
                            }
                        }
                    }
                    .padding(.horizontal, SLSpacing.s4)

                    // Active prompt display
                    if let selected = selectedPrompt {
                        VStack(spacing: SLSpacing.s2) {
                            Text("Speak about:")
                                .font(.slXS)
                                .foregroundColor(.textTertiary)
                            Text(selected)
                                .font(.slLG)
                                .fontWeight(.semibold)
                                .foregroundColor(.clarityTeal)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, SLSpacing.s4)
                        }
                        .padding(.vertical, SLSpacing.s3)
                        .frame(maxWidth: .infinity)
                        .background(
                            RoundedRectangle(cornerRadius: SLRadius.lg)
                                .fill(Color.clarityTeal.opacity(0.08))
                                .overlay(
                                    RoundedRectangle(cornerRadius: SLRadius.lg)
                                        .stroke(Color.clarityTeal.opacity(0.2), lineWidth: 1)
                                )
                        )
                        .padding(.horizontal, SLSpacing.s4)
                    }

                    // Recording area
                    VStack(spacing: SLSpacing.s4) {
                        // Timer display
                        Text(formatDuration(recordingDuration))
                            .font(.system(size: 48, weight: .light, design: .monospaced))
                            .foregroundColor(isRecording ? .red : .textSecondary)

                        // Mic button
                        Button(action: toggleRecording) {
                            ZStack {
                                // Outer pulsing ring when recording
                                if isRecording {
                                    Circle()
                                        .stroke(Color.red.opacity(0.3), lineWidth: 3)
                                        .frame(width: 110, height: 110)
                                        .scaleEffect(isRecording ? 1.2 : 1.0)
                                        .animation(
                                            .easeInOut(duration: 1.0).repeatForever(autoreverses: true),
                                            value: isRecording
                                        )
                                }

                                // Main circle
                                Circle()
                                    .fill(isRecording ? Color.red.opacity(0.15) : Color.clarityTeal.opacity(0.1))
                                    .frame(width: 96, height: 96)

                                Circle()
                                    .stroke(isRecording ? Color.red : Color.clarityTeal, lineWidth: 3)
                                    .frame(width: 96, height: 96)

                                Image(systemName: isRecording ? "stop.fill" : "mic.fill")
                                    .font(.system(size: 40))
                                    .foregroundColor(isRecording ? .red : .clarityTeal)
                            }
                        }
                        .slHaptic(.medium)

                        if isRecording {
                            Text("Recording... tap to stop")
                                .font(.slSM)
                                .fontWeight(.medium)
                                .foregroundColor(.red)
                        } else if hasRecording {
                            HStack(spacing: SLSpacing.s2) {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(.fluencyGreen)
                                Text("Recording saved (\(formatDuration(recordingDuration)))")
                                    .font(.slSM)
                                    .foregroundColor(.fluencyGreen)
                            }
                        } else {
                            Text(selectedPrompt != nil
                                ? "Tap to speak your answer"
                                : "Pick a prompt above, then tap to speak")
                                .font(.slSM)
                                .foregroundColor(.textTertiary)
                        }
                    }
                    .padding(.vertical, SLSpacing.s3)

                    // Optional written notes (separate from prompts)
                    VStack(alignment: .leading, spacing: SLSpacing.s2) {
                        Text("Written notes (optional)")
                            .font(.slXS)
                            .foregroundColor(.textTertiary)

                        TextEditor(text: $textNote)
                            .font(.slBase)
                            .foregroundColor(.textPrimary)
                            .scrollContentBackground(.hidden)
                            .frame(minHeight: 70)
                            .padding(SLSpacing.s3)
                            .background(
                                RoundedRectangle(cornerRadius: SLRadius.md)
                                    .fill(Color.elevation1)
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: SLRadius.md)
                                    .stroke(Color.border, lineWidth: 1)
                            )
                    }
                    .padding(.horizontal, SLSpacing.s4)

                    // Save button
                    Button(action: saveAndComplete) {
                        HStack(spacing: SLSpacing.s2) {
                            Image(systemName: "checkmark")
                            Text("Save & Complete")
                        }
                    }
                    .buttonStyle(SLPrimaryButtonStyle())
                    .padding(.horizontal, SLSpacing.s4)
                    .disabled(!hasRecording && textNote.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .opacity((!hasRecording && textNote.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) ? 0.5 : 1)

                    Spacer().frame(height: SLSpacing.s8)
                }
            }
        }
        .onAppear { setupAudioSession() }
        .onDisappear { stopRecording() }
    }

    // MARK: - Prompt Chip

    private func promptChip(_ prompt: String) -> some View {
        Button(action: {
            withAnimation(.easeInOut(duration: 0.2)) {
                selectedPrompt = (selectedPrompt == prompt) ? nil : prompt
            }
        }) {
            Text(prompt)
                .font(.slXS)
                .foregroundColor(selectedPrompt == prompt ? .clarityTeal : .textSecondary)
                .padding(.horizontal, SLSpacing.s3)
                .padding(.vertical, SLSpacing.s2)
                .background(
                    RoundedRectangle(cornerRadius: SLRadius.full)
                        .fill(selectedPrompt == prompt ? Color.clarityTeal.opacity(0.12) : Color.elevation2)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: SLRadius.full)
                        .stroke(selectedPrompt == prompt ? Color.clarityTeal.opacity(0.3) : Color.clear, lineWidth: 1)
                )
        }
    }

    // MARK: - Recording

    private func setupAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try session.setActive(true)
        } catch {
            print("Audio session setup failed: \(error)")
        }
    }

    private func toggleRecording() {
        if isRecording {
            stopRecording()
        } else {
            startRecording()
        }
    }

    private func startRecording() {
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd_HHmmss"
        let filename = "journal_\(dateFormatter.string(from: Date())).m4a"
        let url = documentsPath.appendingPathComponent(filename)

        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 44100,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
        ]

        do {
            audioRecorder = try AVAudioRecorder(url: url, settings: settings)
            audioRecorder?.record()
            isRecording = true
            recordingDuration = 0
            timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
                recordingDuration += 1
            }
        } catch {
            print("Recording failed: \(error)")
        }
    }

    private func stopRecording() {
        timer?.invalidate()
        timer = nil
        if isRecording {
            audioRecorder?.stop()
            isRecording = false
            hasRecording = true
        }
        audioRecorder = nil
    }

    private func saveAndComplete() {
        stopRecording()
        if let onComplete {
            onComplete()
        } else {
            dismiss()
        }
    }

    // MARK: - Helpers

    private func formatDuration(_ seconds: TimeInterval) -> String {
        let mins = Int(seconds) / 60
        let secs = Int(seconds) % 60
        return String(format: "%02d:%02d", mins, secs)
    }
}
