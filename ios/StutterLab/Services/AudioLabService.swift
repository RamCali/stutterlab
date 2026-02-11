import AVFoundation
import Combine

// MARK: - Audio Lab Service

/// Native audio processing engine for clinical speech tools.
///
/// Audio Graph:
///   Microphone → InputNode → installTap (RMS) →
///     → AVAudioUnitDelay (DAF) → AVAudioUnitTimePitch (FAF) → Mixer → Output
///   + AVAudioPlayerNode (Metronome click)
///
/// All processing happens on-device via AVAudioEngine.
@MainActor
final class AudioLabService: ObservableObject {

    // MARK: Published State

    @Published var isRunning = false
    @Published var inputLevel: Float = 0
    @Published var dafEnabled = false { didSet { updateDAF() } }
    @Published var dafDelayMs: Double = 100 { didSet { updateDAF() } }
    @Published var fafEnabled = false { didSet { updateFAF() } }
    @Published var fafSemitones: Double = 0 { didSet { updateFAF() } }
    @Published var metronomeEnabled = false { didSet { updateMetronome() } }
    @Published var metronomeBPM: Double = 80 { didSet { updateMetronomeRate() } }

    // MARK: Audio Engine

    private let engine = AVAudioEngine()
    private let delayNode = AVAudioUnitDelay()
    private let pitchNode = AVAudioUnitTimePitch()
    private let metronomePlayer = AVAudioPlayerNode()
    private var metronomeBuffer: AVAudioPCMBuffer?
    private var metronomeTimer: Timer?

    // MARK: Configuration

    static let dafRange: ClosedRange<Double> = 50...300
    static let fafRange: ClosedRange<Double> = -12...12
    static let bpmRange: ClosedRange<Double> = 40...208
    static let defaultDAFDelay: Double = 100
    static let defaultBPM: Double = 80

    // MARK: - Start / Stop

    func start() throws {
        guard !isRunning else { return }

        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker, .allowBluetooth])
        try session.setActive(true)

        let inputNode = engine.inputNode
        let inputFormat = inputNode.outputFormat(forBus: 0)

        // Build graph: input → delay → pitch → mainMixer
        engine.attach(delayNode)
        engine.attach(pitchNode)
        engine.attach(metronomePlayer)

        let mixerFormat = engine.mainMixerNode.outputFormat(forBus: 0)

        engine.connect(inputNode, to: delayNode, format: inputFormat)
        engine.connect(delayNode, to: pitchNode, format: inputFormat)
        engine.connect(pitchNode, to: engine.mainMixerNode, format: inputFormat)
        engine.connect(metronomePlayer, to: engine.mainMixerNode, format: mixerFormat)

        // Install tap for input level metering
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: inputFormat) { [weak self] buffer, _ in
            let rms = SpeechAnalysisService.computeRMS(buffer: buffer)
            Task { @MainActor in
                self?.inputLevel = rms
            }
        }

        // Configure initial states
        updateDAF()
        updateFAF()
        generateMetronomeClick(sampleRate: mixerFormat.sampleRate)

        engine.prepare()
        try engine.start()
        isRunning = true

        if metronomeEnabled {
            startMetronomeTicking()
        }
    }

    func stop() {
        guard isRunning else { return }
        metronomeTimer?.invalidate()
        metronomeTimer = nil
        metronomePlayer.stop()
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        engine.reset()
        isRunning = false
        inputLevel = 0
    }

    // MARK: - DAF

    private func updateDAF() {
        if dafEnabled {
            delayNode.delayTime = dafDelayMs / 1000.0
            delayNode.feedback = 0
            delayNode.wetDryMix = 100
            delayNode.lowPassCutoff = 20000
        } else {
            delayNode.wetDryMix = 0
            delayNode.delayTime = 0
        }
    }

    // MARK: - FAF

    private func updateFAF() {
        if fafEnabled {
            pitchNode.pitch = Float(fafSemitones * 100) // cents
            pitchNode.rate = 1.0
        } else {
            pitchNode.pitch = 0
        }
    }

    // MARK: - Metronome

    private func generateMetronomeClick(sampleRate: Double) {
        let duration: Double = 0.03 // 30ms click
        let frameCount = AVAudioFrameCount(sampleRate * duration)
        guard let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1),
              let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { return }

        buffer.frameLength = frameCount
        let data = buffer.floatChannelData![0]

        for i in 0..<Int(frameCount) {
            let t = Double(i) / sampleRate
            let freq = 1000.0 // 1kHz click
            let envelope = 1.0 - (t / duration) // linear decay
            data[i] = Float(sin(2.0 * .pi * freq * t) * envelope * 0.5)
        }

        metronomeBuffer = buffer
    }

    private func updateMetronome() {
        if metronomeEnabled && isRunning {
            startMetronomeTicking()
        } else {
            metronomeTimer?.invalidate()
            metronomeTimer = nil
            metronomePlayer.stop()
        }
    }

    private func updateMetronomeRate() {
        guard metronomeEnabled && isRunning else { return }
        metronomeTimer?.invalidate()
        startMetronomeTicking()
    }

    private func startMetronomeTicking() {
        metronomeTimer?.invalidate()
        let interval = 60.0 / metronomeBPM
        metronomeTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.playClick()
            }
        }
        // Play immediately
        playClick()
    }

    private func playClick() {
        guard let buffer = metronomeBuffer, isRunning else { return }
        metronomePlayer.stop()
        metronomePlayer.scheduleBuffer(buffer, at: nil, options: .interrupts)
        metronomePlayer.play()
    }

    // MARK: - Presets

    struct Preset: Codable, Identifiable {
        let id: String
        var name: String
        var dafEnabled: Bool
        var dafDelayMs: Double
        var fafEnabled: Bool
        var fafSemitones: Double
        var metronomeEnabled: Bool
        var metronomeBPM: Double

        static let `default` = Preset(
            id: "default",
            name: "Default",
            dafEnabled: true,
            dafDelayMs: 100,
            fafEnabled: false,
            fafSemitones: 0,
            metronomeEnabled: false,
            metronomeBPM: 80
        )
    }

    func applyPreset(_ preset: Preset) {
        dafEnabled = preset.dafEnabled
        dafDelayMs = preset.dafDelayMs
        fafEnabled = preset.fafEnabled
        fafSemitones = preset.fafSemitones
        metronomeEnabled = preset.metronomeEnabled
        metronomeBPM = preset.metronomeBPM
    }

    func currentPreset(name: String) -> Preset {
        Preset(
            id: UUID().uuidString,
            name: name,
            dafEnabled: dafEnabled,
            dafDelayMs: dafDelayMs,
            fafEnabled: fafEnabled,
            fafSemitones: fafSemitones,
            metronomeEnabled: metronomeEnabled,
            metronomeBPM: metronomeBPM
        )
    }
}
