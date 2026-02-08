import SwiftUI

// MARK: - Timer View

struct TimerView: View {
    let durationString: String
    let onComplete: () -> Void

    @State private var timeRemaining: Int = 0
    @State private var totalSeconds: Int = 0
    @State private var isRunning = false
    @State private var timer: Timer?

    var body: some View {
        VStack(spacing: SLSpacing.s4) {
            // Circular timer
            ZStack {
                Circle()
                    .stroke(Color.elevation2, lineWidth: 6)
                    .frame(width: 160, height: 160)

                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(Color.clarityTeal, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .frame(width: 160, height: 160)
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 1), value: progress)

                VStack(spacing: SLSpacing.s1) {
                    Text(formattedTime)
                        .font(.system(size: 40, weight: .bold, design: .monospaced))
                        .foregroundColor(.textPrimary)
                    Text(isRunning ? "Tap to pause" : "Tap to start")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
            }
            .onTapGesture {
                if isRunning {
                    pause()
                } else {
                    start()
                }
            }

            // Skip / Done buttons
            HStack(spacing: SLSpacing.s4) {
                Button("Skip") {
                    stop()
                    onComplete()
                }
                .font(.slSM)
                .foregroundColor(.textSecondary)

                if timeRemaining == 0 && totalSeconds > 0 {
                    Button("Done") {
                        onComplete()
                    }
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.obsidianNight)
                    .padding(.horizontal, SLSpacing.s6)
                    .padding(.vertical, SLSpacing.s2)
                    .background(Color.fluencyGreen)
                    .cornerRadius(SLRadius.md)
                }
            }
        }
        .onAppear {
            totalSeconds = parseDuration(durationString)
            timeRemaining = totalSeconds
        }
        .onDisappear {
            stop()
        }
    }

    // MARK: - Timer Logic

    private var progress: CGFloat {
        guard totalSeconds > 0 else { return 0 }
        return CGFloat(totalSeconds - timeRemaining) / CGFloat(totalSeconds)
    }

    private var formattedTime: String {
        let mins = timeRemaining / 60
        let secs = timeRemaining % 60
        return String(format: "%d:%02d", mins, secs)
    }

    private func start() {
        if timeRemaining == 0 { timeRemaining = totalSeconds }
        isRunning = true
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if timeRemaining > 0 {
                timeRemaining -= 1
            } else {
                stop()
                // Auto-complete when timer ends
                onComplete()
            }
        }
    }

    private func pause() {
        isRunning = false
        timer?.invalidate()
        timer = nil
    }

    private func stop() {
        isRunning = false
        timer?.invalidate()
        timer = nil
    }

    private func parseDuration(_ str: String) -> Int {
        // Parse "5 min", "10 min", "2 min", "varies"
        let digits = str.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
        if let mins = Int(digits) {
            return mins * 60
        }
        return 5 * 60 // default 5 minutes
    }
}
