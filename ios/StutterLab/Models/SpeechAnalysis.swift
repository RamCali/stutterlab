import Foundation

// MARK: - Speech Analysis Result

/// Represents the output of one speech analysis session.
/// Computed on-device from AVAudioEngine RMS + SFSpeechRecognizer.
/// Presented as "practice metric" — not a clinical measure.
struct SpeechAnalysisResult: Codable, Identifiable {
    let id: String
    let userId: String
    let sessionId: String?
    let analyzedAt: Date

    // Core metrics
    let fluencyScore: Double           // 0-100 composite
    let syllablesPerMinute: Double     // SPM from vowel peak frequency
    let percentageSyllablesStuttered: Double // %SS
    let averagePhonationDuration: Double     // seconds per voiced segment
    let blockCount: Int                      // mid-utterance silence events >500ms
    let averageBlockDuration: Double         // seconds

    // Raw data for progress charts
    let totalSyllables: Int
    let totalDurationSeconds: Double
    let speakingDurationSeconds: Double // time spent actually speaking (non-silent)

    static func empty(userId: String) -> SpeechAnalysisResult {
        SpeechAnalysisResult(
            id: UUID().uuidString,
            userId: userId,
            sessionId: nil,
            analyzedAt: Date(),
            fluencyScore: 0,
            syllablesPerMinute: 0,
            percentageSyllablesStuttered: 0,
            averagePhonationDuration: 0,
            blockCount: 0,
            averageBlockDuration: 0,
            totalSyllables: 0,
            totalDurationSeconds: 0,
            speakingDurationSeconds: 0
        )
    }
}

// MARK: - Real-time Analysis State

/// Published by SpeechAnalysisService during recording for live UI updates.
struct LiveSpeechMetrics {
    var currentRMS: Float = 0
    var isVoiced: Bool = false
    var runningSPM: Double = 0
    var runningSyllableCount: Int = 0
    var runningBlockCount: Int = 0
    var currentTranscription: String = ""
    var spmNudge: String? = nil // e.g. "Try slowing down — use your pausing technique"

    /// SPM target range for behavioral nudging
    static let targetSPMRange: ClosedRange<Double> = 120...180

    var isSpeakingTooFast: Bool {
        runningSPM > Self.targetSPMRange.upperBound && runningSyllableCount > 10
    }
}
