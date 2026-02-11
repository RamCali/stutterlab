import AVFoundation
import SwiftUI

// MARK: - Word Practice Step View (Web-aligned technique practice carousel)

struct WordPracticeStepView: View {
    let technique: String
    let techniqueTip: String
    let items: [String]
    var onComplete: (() -> Void)?
    var embedded = false

    @Environment(\.dismiss) private var dismiss
    @State private var sessionItems: [String] = []
    @State private var currentIndex = 0
    @State private var practicedIndices: Set<Int> = []
    @State private var isRecording = false
    @State private var audioRecorder: AVAudioRecorder?

    private var threshold: Int { min(5, items.count) }
    private var canComplete: Bool { practicedIndices.count >= sessionItems.count && !sessionItems.isEmpty }

    private var fontSize: CGFloat {
        let item = sessionItems[safe: currentIndex] ?? ""
        if item.count > 100 { return 16 } // paragraph
        if item.count > 50 { return 20 }  // sentence
        if item.count > 20 { return 28 }  // phrase
        return 48                          // word
    }

    var body: some View {
        ZStack {
            if !embedded {
                Color.obsidianNight.ignoresSafeArea()
            }

            VStack(spacing: SLSpacing.s5) {
                // Close button (standalone only)
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
                }

                // Technique tip card
                techniqueTipCard

                // Progress badge
                HStack(spacing: SLSpacing.s2) {
                    Text("\(practicedIndices.count)/\(sessionItems.count) items")
                        .font(.slSM)
                        .fontWeight(.semibold)
                        .foregroundColor(.clarityTeal)
                    Circle()
                        .fill(Color.textTertiary)
                        .frame(width: 3, height: 3)
                    Text(contentLevelLabel)
                        .font(.slXS)
                        .foregroundColor(.textSecondary)
                }

                Spacer()

                // Current item display
                Text(sessionItems[safe: currentIndex] ?? "")
                    .font(.system(size: fontSize, weight: .medium, design: .rounded))
                    .foregroundColor(.textPrimary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, SLSpacing.s6)
                    .animation(.easeInOut(duration: 0.2), value: currentIndex)

                Spacer()

                // Step dots
                stepDots

                // Navigation + Record
                HStack(spacing: SLSpacing.s8) {
                    // Previous
                    Button(action: previousItem) {
                        Image(systemName: "chevron.left.circle.fill")
                            .font(.system(size: 40))
                            .foregroundColor(currentIndex > 0 ? .textSecondary : .textTertiary.opacity(0.3))
                    }
                    .disabled(currentIndex == 0)

                    // Record button
                    recordButton

                    // Next
                    Button(action: nextItem) {
                        Image(systemName: "chevron.right.circle.fill")
                            .font(.system(size: 40))
                            .foregroundColor(currentIndex < sessionItems.count - 1 ? .textSecondary : .textTertiary.opacity(0.3))
                    }
                    .disabled(currentIndex >= sessionItems.count - 1)
                }
                .padding(.vertical, SLSpacing.s4)

                // Complete button
                if canComplete {
                    Button(action: {
                        stopRecording()
                        if let onComplete {
                            onComplete()
                        } else {
                            dismiss()
                        }
                    }) {
                        HStack(spacing: SLSpacing.s2) {
                            Image(systemName: "checkmark")
                            Text("Continue")
                        }
                    }
                    .buttonStyle(SLPrimaryButtonStyle())
                    .padding(.horizontal, SLSpacing.s4)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }

                Spacer().frame(height: SLSpacing.s4)
            }
        }
        .onAppear {
            setupAudioSession()
            if sessionItems.isEmpty {
                sessionItems = Array(items.shuffled().prefix(threshold))
            }
        }
        .onDisappear { stopRecording() }
    }

    // MARK: - Technique Tip Card

    private var techniqueTipCard: some View {
        HStack(spacing: SLSpacing.s3) {
            Image(systemName: "lightbulb.fill")
                .font(.system(size: 18))
                .foregroundColor(.sunsetAmber)

            VStack(alignment: .leading, spacing: 2) {
                Text(technique)
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                Text(techniqueTip)
                    .font(.slXS)
                    .foregroundColor(.textSecondary)
                    .lineLimit(2)
            }

            Spacer()
        }
        .padding(SLSpacing.s3)
        .background(
            RoundedRectangle(cornerRadius: SLRadius.md)
                .fill(Color.clarityTeal.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: SLRadius.md)
                        .stroke(Color.clarityTeal.opacity(0.2), lineWidth: 1)
                )
        )
        .padding(.horizontal, SLSpacing.s4)
    }

    // MARK: - Step Dots

    private var stepDots: some View {
        HStack(spacing: 6) {
            ForEach(0..<sessionItems.count, id: \.self) { i in
                Circle()
                    .fill(
                        i == currentIndex
                            ? Color.clarityTeal
                            : (practicedIndices.contains(i) ? Color.fluencyGreen : Color.elevation2)
                    )
                    .frame(width: i == currentIndex ? 10 : 7, height: i == currentIndex ? 10 : 7)
                    .animation(.spring(response: 0.3), value: currentIndex)
            }
        }
    }

    // MARK: - Record Button

    private var recordButton: some View {
        Button(action: toggleRecording) {
            ZStack {
                // Outer ring
                Circle()
                    .stroke(isRecording ? Color.red : Color.clarityTeal, lineWidth: 3)
                    .frame(width: 72, height: 72)

                // Pulsing background when recording
                if isRecording {
                    Circle()
                        .fill(Color.red.opacity(0.15))
                        .frame(width: 72, height: 72)
                }

                // Inner icon
                Image(systemName: isRecording ? "stop.fill" : "mic.fill")
                    .font(.system(size: 28))
                    .foregroundColor(isRecording ? .red : .clarityTeal)
            }
        }
        .slHaptic(.medium)
    }

    // MARK: - Navigation

    private func previousItem() {
        guard currentIndex > 0 else { return }
        stopRecording()
        currentIndex -= 1
    }

    private func nextItem() {
        guard currentIndex < sessionItems.count - 1 else { return }
        stopRecording()
        markCurrentPracticed()
        currentIndex += 1
    }

    private func markCurrentPracticed() {
        practicedIndices.insert(currentIndex)
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
            markCurrentPracticed()
        } else {
            startRecording()
        }
    }

    private func startRecording() {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("practice_\(currentIndex).m4a")
        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 44100,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.medium.rawValue,
        ]
        do {
            audioRecorder = try AVAudioRecorder(url: url, settings: settings)
            audioRecorder?.record()
            isRecording = true
        } catch {
            print("Recording failed: \(error)")
        }
    }

    private func stopRecording() {
        audioRecorder?.stop()
        audioRecorder = nil
        isRecording = false
    }

    // MARK: - Helpers

    private var contentLevelLabel: String {
        if items.first?.count ?? 0 > 100 { return "Paragraphs" }
        if items.first?.count ?? 0 > 50 { return "Sentences" }
        if items.first?.count ?? 0 > 20 { return "Phrases" }
        return "Words"
    }
}

// MARK: - Safe Array Subscript

private extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
