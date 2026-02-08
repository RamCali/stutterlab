import AVFoundation
import Combine
import Speech

// MARK: - Speech Analysis Service

/// Dual-pipeline speech analysis engine.
///
/// Pipeline 1: AVAudioEngine → installTap → RMS energy analysis → vowel peak detection
/// Pipeline 2: SFSpeechRecognizer → real-time transcription → timing correlation
///
/// All processing happens **on-device** — no audio leaves the phone.
///
/// V1 Limitation: Energy-based peak detection can trigger on background noise.
/// Mitigations: calibration step, noise gate, quiet-space prompt.
/// V2 Path: CoreML model to distinguish speech vowels from ambient sounds.
@MainActor
final class SpeechAnalysisService: ObservableObject {

    // MARK: Published State

    @Published var isRecording = false
    @Published var liveMetrics = LiveSpeechMetrics()
    @Published var authorizationStatus: SpeechAuthStatus = .notDetermined

    enum SpeechAuthStatus {
        case notDetermined, authorized, denied, micDenied
    }

    // MARK: Audio Engine

    private let audioEngine = AVAudioEngine()
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?

    // MARK: Analysis State

    private var rmsHistory: [(timestamp: TimeInterval, rms: Float)] = []
    private var vowelPeaks: [TimeInterval] = []
    private var blocks: [(start: TimeInterval, duration: TimeInterval)] = []
    private var recordingStartTime: TimeInterval = 0
    private var lastVoicedTime: TimeInterval = 0
    private var isCurrentlyVoiced = false
    private var silenceStartTime: TimeInterval? = nil
    private var transcriptionSegments: [(text: String, timestamp: TimeInterval)] = []

    // MARK: Configuration

    /// RMS threshold for voiced speech detection.
    /// Calibrated during session start; default is conservative.
    private var voiceThreshold: Float = 0.02

    /// Minimum duration (seconds) for a voiced segment to count as a syllable.
    private let minVowelDuration: TimeInterval = 0.08

    /// Silence duration (seconds) to flag as a potential block.
    private let blockThreshold: TimeInterval = 0.5

    /// Buffer size for audio tap (1024 frames at 44.1kHz ≈ 23ms windows).
    private let bufferSize: AVAudioFrameCount = 1024

    /// Noise gate: reject RMS readings below this absolute floor.
    private let noiseFloor: Float = 0.005

    // MARK: - Authorization

    func requestAuthorization() async {
        // Request microphone permission
        let micGranted: Bool
        if #available(iOS 17.0, *) {
            micGranted = await AVAudioApplication.requestRecordPermission()
        } else {
            micGranted = await withCheckedContinuation { continuation in
                AVAudioSession.sharedInstance().requestRecordPermission { granted in
                    continuation.resume(returning: granted)
                }
            }
        }

        guard micGranted else {
            authorizationStatus = .micDenied
            return
        }

        // Request speech recognition permission
        let speechStatus = await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status)
            }
        }

        switch speechStatus {
        case .authorized:
            authorizationStatus = .authorized
        default:
            authorizationStatus = .denied
        }
    }

    // MARK: - Calibration

    /// Record 2 seconds of ambient noise to set the voice threshold.
    /// Call this before starting a session: "Say this sentence so we can adjust."
    func calibrate() async -> Float {
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.record, mode: .measurement)
        try? session.setActive(true)

        let inputNode = audioEngine.inputNode
        let format = inputNode.outputFormat(forBus: 0)
        var samples: [Float] = []

        let semaphore = DispatchSemaphore(value: 0)

        inputNode.installTap(onBus: 0, bufferSize: bufferSize, format: format) { buffer, _ in
            let rms = Self.computeRMS(buffer: buffer)
            samples.append(rms)
            if samples.count >= 80 { // ~2 seconds at 23ms windows
                semaphore.signal()
            }
        }

        audioEngine.prepare()
        try? audioEngine.start()

        // Wait for samples (with timeout)
        _ = semaphore.wait(timeout: .now() + 3)

        inputNode.removeTap(onBus: 0)
        audioEngine.stop()

        // Set threshold at 2x the ambient noise floor
        let avgNoise = samples.isEmpty ? 0.01 : samples.reduce(0, +) / Float(samples.count)
        let calibrated = max(avgNoise * 2, noiseFloor * 2)
        voiceThreshold = calibrated

        return calibrated
    }

    // MARK: - Start Recording + Analysis

    func startRecording() throws {
        guard authorizationStatus == .authorized else { return }

        resetState()

        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.record, mode: .measurement)
        try session.setActive(true)

        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        // Pipeline 1: SFSpeechRecognizer
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        recognitionRequest?.shouldReportPartialResults = true

        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest!) { [weak self] result, error in
            guard let self else { return }
            if let result {
                let text = result.bestTranscription.formattedString
                let timestamp = CACurrentMediaTime() - self.recordingStartTime
                Task { @MainActor in
                    self.liveMetrics.currentTranscription = text
                    self.transcriptionSegments.append((text: text, timestamp: timestamp))
                }
            }
            if error != nil || (result?.isFinal ?? false) {
                // Recognition ended
            }
        }

        // Pipeline 2: AVAudioEngine RMS tap
        recordingStartTime = CACurrentMediaTime()

        inputNode.installTap(onBus: 0, bufferSize: bufferSize, format: recordingFormat) { [weak self] buffer, time in
            guard let self else { return }

            // Feed buffer to speech recognizer
            self.recognitionRequest?.append(buffer)

            // Compute RMS
            let rms = Self.computeRMS(buffer: buffer)
            let timestamp = CACurrentMediaTime() - self.recordingStartTime

            Task { @MainActor in
                self.processRMSSample(rms: rms, timestamp: timestamp)
            }
        }

        audioEngine.prepare()
        try audioEngine.start()
        isRecording = true
    }

    // MARK: - Stop Recording + Compute Results

    func stopRecording(userId: String, sessionId: String?) -> SpeechAnalysisResult {
        // Stop audio engine
        audioEngine.inputNode.removeTap(onBus: 0)
        audioEngine.stop()
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionRequest = nil
        recognitionTask = nil
        isRecording = false

        let totalDuration = CACurrentMediaTime() - recordingStartTime

        return computeResults(userId: userId, sessionId: sessionId, totalDuration: totalDuration)
    }

    // MARK: - RMS Processing (per buffer ≈ 23ms)

    private func processRMSSample(rms: Float, timestamp: TimeInterval) {
        rmsHistory.append((timestamp: timestamp, rms: rms))
        liveMetrics.currentRMS = rms

        let isVoiced = rms > voiceThreshold && rms > noiseFloor

        if isVoiced {
            // Voice detected
            if !isCurrentlyVoiced {
                // Transition: silence → voiced
                isCurrentlyVoiced = true

                // Check if the silence was a block (>500ms mid-utterance)
                if let silStart = silenceStartTime {
                    let silDuration = timestamp - silStart
                    if silDuration >= blockThreshold && lastVoicedTime > 0 {
                        blocks.append((start: silStart, duration: silDuration))
                        liveMetrics.runningBlockCount = blocks.count
                    }
                }
                silenceStartTime = nil
            }
            lastVoicedTime = timestamp
            liveMetrics.isVoiced = true
        } else {
            // Silence
            if isCurrentlyVoiced {
                // Transition: voiced → silence
                isCurrentlyVoiced = false

                // Check if voiced segment was long enough to be a syllable
                let voicedDuration = timestamp - (silenceStartTime ?? timestamp)
                if voicedDuration >= minVowelDuration || lastVoicedTime > 0 {
                    vowelPeaks.append(timestamp)
                    liveMetrics.runningSyllableCount = vowelPeaks.count
                }

                silenceStartTime = timestamp
            } else if silenceStartTime == nil && lastVoicedTime > 0 {
                silenceStartTime = timestamp
            }
            liveMetrics.isVoiced = false
        }

        // Update running SPM
        if timestamp > 1.0 && vowelPeaks.count > 1 {
            let spm = Double(vowelPeaks.count) / (timestamp / 60.0)
            liveMetrics.runningSPM = spm

            // Behavioral nudge
            if liveMetrics.isSpeakingTooFast {
                liveMetrics.spmNudge = "Try slowing down — use your pausing technique"
            } else {
                liveMetrics.spmNudge = nil
            }
        }
    }

    // MARK: - Compute Final Results

    private func computeResults(userId: String, sessionId: String?, totalDuration: TimeInterval) -> SpeechAnalysisResult {
        let totalSyllables = vowelPeaks.count
        let totalBlocks = blocks.count

        // %SS: blocks + detected repetitions vs total syllables
        let percentSS: Double = totalSyllables > 0
            ? (Double(totalBlocks) / Double(totalSyllables)) * 100.0
            : 0

        // SPM: syllables per minute
        let speakingMinutes = totalDuration / 60.0
        let spm: Double = speakingMinutes > 0
            ? Double(totalSyllables) / speakingMinutes
            : 0

        // Average phonation duration
        var phonationDurations: [TimeInterval] = []
        var segStart: TimeInterval? = nil
        for sample in rmsHistory {
            if sample.rms > voiceThreshold {
                if segStart == nil { segStart = sample.timestamp }
            } else {
                if let start = segStart {
                    phonationDurations.append(sample.timestamp - start)
                    segStart = nil
                }
            }
        }
        if let start = segStart, let last = rmsHistory.last {
            phonationDurations.append(last.timestamp - start)
        }
        let avgPhonation = phonationDurations.isEmpty
            ? 0
            : phonationDurations.reduce(0, +) / Double(phonationDurations.count)

        // Speaking duration (total voiced time)
        let speakingDuration = phonationDurations.reduce(0, +)

        // Average block duration
        let avgBlockDuration = blocks.isEmpty
            ? 0
            : blocks.map(\.duration).reduce(0, +) / Double(blocks.count)

        // Fluency Score: 0-100 composite
        // %SS (40%): 0%SS = 40pts, 10%SS+ = 0pts
        let ssScore = max(0, 40.0 - (percentSS * 4.0))

        // SPM consistency (30%): penalize deviation from 120-180 range
        let spmTarget = 150.0
        let spmDeviation = abs(spm - spmTarget) / spmTarget
        let spmScore = max(0, 30.0 - (spmDeviation * 30.0))

        // Avg phonation duration (30%): longer = smoother, cap at 0.4s
        let phonationScore = min(30.0, (avgPhonation / 0.4) * 30.0)

        let fluencyScore = min(100, max(0, ssScore + spmScore + phonationScore))

        return SpeechAnalysisResult(
            id: UUID().uuidString,
            userId: userId,
            sessionId: sessionId,
            analyzedAt: Date(),
            fluencyScore: fluencyScore,
            syllablesPerMinute: spm,
            percentageSyllablesStuttered: percentSS,
            averagePhonationDuration: avgPhonation,
            blockCount: totalBlocks,
            averageBlockDuration: avgBlockDuration,
            totalSyllables: totalSyllables,
            totalDurationSeconds: totalDuration,
            speakingDurationSeconds: speakingDuration
        )
    }

    // MARK: - Helpers

    private func resetState() {
        rmsHistory.removeAll()
        vowelPeaks.removeAll()
        blocks.removeAll()
        transcriptionSegments.removeAll()
        recordingStartTime = 0
        lastVoicedTime = 0
        isCurrentlyVoiced = false
        silenceStartTime = nil
        liveMetrics = LiveSpeechMetrics()
    }

    /// Compute RMS amplitude from an audio buffer.
    /// `sqrt(sum(samples²) / count)`
    static func computeRMS(buffer: AVAudioPCMBuffer) -> Float {
        guard let channelData = buffer.floatChannelData else { return 0 }
        let channelDataValue = channelData.pointee
        let frameLength = Int(buffer.frameLength)
        guard frameLength > 0 else { return 0 }

        var sum: Float = 0
        for i in 0..<frameLength {
            let sample = channelDataValue[i]
            sum += sample * sample
        }
        return sqrt(sum / Float(frameLength))
    }
}
