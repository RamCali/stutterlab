import Combine
import CoreHaptics
import UIKit

// MARK: - Panic / Box Breathing View Model

@MainActor
final class PanicViewModel: ObservableObject {

    // MARK: Published State

    @Published var isActive = false
    @Published var currentPhase: BreathingPhase = .inhale
    @Published var progress: Double = 0 // 0.0–1.0 within current phase
    @Published var cycleCount = 0
    @Published var showGentleOnset = false

    enum BreathingPhase: String, CaseIterable {
        case inhale = "Breathe In"
        case holdIn = "Hold"
        case exhale = "Breathe Out"
        case holdOut = "Rest"

        var duration: TimeInterval { 4.0 }

        var next: BreathingPhase {
            switch self {
            case .inhale: return .holdIn
            case .holdIn: return .exhale
            case .exhale: return .holdOut
            case .holdOut: return .inhale
            }
        }
    }

    // MARK: Config

    let totalCycles = 3

    // MARK: Private

    private var timer: Timer?
    private var phaseStartTime: Date?
    private var hapticEngine: HapticBreathingEngine?

    // MARK: - Start Breathing Exercise

    func start() {
        isActive = true
        cycleCount = 0
        currentPhase = .inhale
        progress = 0
        showGentleOnset = false

        hapticEngine = HapticBreathingEngine()
        hapticEngine?.prepare()

        startPhase(.inhale)
    }

    // MARK: - Stop

    func stop() {
        timer?.invalidate()
        timer = nil
        hapticEngine?.stop()
        hapticEngine = nil
        isActive = false
    }

    // MARK: - Phase Management

    private func startPhase(_ phase: BreathingPhase) {
        currentPhase = phase
        progress = 0
        phaseStartTime = Date()

        // Fire haptic for this phase
        hapticEngine?.playPhaseHaptic(phase)

        // Timer updates progress 60 times/sec for smooth animation
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0 / 60.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.tick()
            }
        }
    }

    private func tick() {
        guard let start = phaseStartTime else { return }
        let elapsed = Date().timeIntervalSince(start)
        let duration = currentPhase.duration

        progress = min(elapsed / duration, 1.0)

        if elapsed >= duration {
            advancePhase()
        }
    }

    private func advancePhase() {
        let next = currentPhase.next

        // If completing a full cycle (holdOut → inhale)
        if currentPhase == .holdOut {
            cycleCount += 1
            if cycleCount >= totalCycles {
                // Done — offer gentle onset or dismiss
                timer?.invalidate()
                timer = nil
                hapticEngine?.playCompletion()
                showGentleOnset = true
                return
            }
        }

        // Fire transition haptic
        hapticEngine?.playTransition()

        startPhase(next)
    }
}

// MARK: - Haptic Breathing Engine

/// Distinct haptic patterns per breathing phase using CoreHaptics.
///
/// - Inhale (4s): Rising intensity — light → medium → heavy (escalating)
/// - Hold In (4s): Single soft tap at 2s (stillness)
/// - Exhale (4s): Falling intensity — heavy → medium → light (de-escalating)
/// - Hold Out (4s): No haptic (complete stillness)
/// - Phase transition: double-tap success notification
final class HapticBreathingEngine {

    private var engine: CHHapticEngine?
    private let impactGenerator = UIImpactFeedbackGenerator()
    private let notificationGenerator = UINotificationFeedbackGenerator()
    private var isEngineReady = false

    func prepare() {
        impactGenerator.prepare()
        notificationGenerator.prepare()

        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        do {
            engine = try CHHapticEngine()
            engine?.resetHandler = { [weak self] in
                try? self?.engine?.start()
            }
            try engine?.start()
            isEngineReady = true
        } catch {
            print("CoreHaptics unavailable: \(error)")
        }
    }

    func stop() {
        engine?.stop()
        isEngineReady = false
    }

    func playPhaseHaptic(_ phase: PanicViewModel.BreathingPhase) {
        switch phase {
        case .inhale:
            playInhalePattern()
        case .holdIn:
            playHoldInPattern()
        case .exhale:
            playExhalePattern()
        case .holdOut:
            // Complete stillness — no haptic
            break
        }
    }

    func playTransition() {
        notificationGenerator.notificationOccurred(.success)
    }

    func playCompletion() {
        // Triple burst
        notificationGenerator.notificationOccurred(.success)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [self] in
            notificationGenerator.notificationOccurred(.success)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.30) { [self] in
            notificationGenerator.notificationOccurred(.success)
        }
    }

    // MARK: - Inhale: Escalating (light → medium → heavy)

    private func playInhalePattern() {
        if isEngineReady, let engine {
            do {
                let pattern = try CHHapticPattern(events: [
                    CHHapticEvent(
                        eventType: .hapticTransient,
                        parameters: [CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.3)],
                        relativeTime: 0
                    ),
                    CHHapticEvent(
                        eventType: .hapticTransient,
                        parameters: [CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.6)],
                        relativeTime: 2.0
                    ),
                    CHHapticEvent(
                        eventType: .hapticTransient,
                        parameters: [CHHapticEventParameter(parameterID: .hapticIntensity, value: 1.0)],
                        relativeTime: 4.0
                    ),
                ], parameters: [])
                let player = try engine.makePlayer(with: pattern)
                try player.start(atTime: CHHapticTimeImmediate)
            } catch {
                fallbackInhale()
            }
        } else {
            fallbackInhale()
        }
    }

    private func fallbackInhale() {
        impactGenerator.impactOccurred(intensity: 0.3)
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [self] in
            impactGenerator.impactOccurred(intensity: 0.6)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) { [self] in
            impactGenerator.impactOccurred(intensity: 1.0)
        }
    }

    // MARK: - Hold In: Single soft tap at 2s

    private func playHoldInPattern() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [self] in
            impactGenerator.impactOccurred(intensity: 0.2)
        }
    }

    // MARK: - Exhale: De-escalating (heavy → medium → light)

    private func playExhalePattern() {
        if isEngineReady, let engine {
            do {
                let pattern = try CHHapticPattern(events: [
                    CHHapticEvent(
                        eventType: .hapticTransient,
                        parameters: [CHHapticEventParameter(parameterID: .hapticIntensity, value: 1.0)],
                        relativeTime: 0
                    ),
                    CHHapticEvent(
                        eventType: .hapticTransient,
                        parameters: [CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.6)],
                        relativeTime: 2.0
                    ),
                    CHHapticEvent(
                        eventType: .hapticTransient,
                        parameters: [CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.3)],
                        relativeTime: 4.0
                    ),
                ], parameters: [])
                let player = try engine.makePlayer(with: pattern)
                try player.start(atTime: CHHapticTimeImmediate)
            } catch {
                fallbackExhale()
            }
        } else {
            fallbackExhale()
        }
    }

    private func fallbackExhale() {
        impactGenerator.impactOccurred(intensity: 1.0)
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [self] in
            impactGenerator.impactOccurred(intensity: 0.6)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) { [self] in
            impactGenerator.impactOccurred(intensity: 0.3)
        }
    }
}
