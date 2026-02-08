import AVFoundation
import Combine

// MARK: - Audio Service

/// Manages AVAudioSession configuration and recording for exercises.
/// Separate from SpeechAnalysisService — this handles simple record/playback
/// for voice journal entries and exercise recordings.
@MainActor
final class AudioService: ObservableObject {

    @Published var isRecording = false
    @Published var isPlaying = false
    @Published var recordingDuration: TimeInterval = 0

    private var audioRecorder: AVAudioRecorder?
    private var audioPlayer: AVAudioPlayer?
    private var timer: Timer?

    // MARK: - Recording

    func startRecording(to url: URL) throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playAndRecord, mode: .default)
        try session.setActive(true)

        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 44100,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
        ]

        audioRecorder = try AVAudioRecorder(url: url, settings: settings)
        audioRecorder?.record()
        isRecording = true
        recordingDuration = 0

        timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.recordingDuration += 0.1
            }
        }
    }

    func stopRecording() -> URL? {
        timer?.invalidate()
        timer = nil
        let url = audioRecorder?.url
        audioRecorder?.stop()
        audioRecorder = nil
        isRecording = false
        return url
    }

    // MARK: - Playback

    func play(url: URL) throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playback, mode: .default)
        try session.setActive(true)

        audioPlayer = try AVAudioPlayer(contentsOf: url)
        audioPlayer?.play()
        isPlaying = true
    }

    func stopPlaying() {
        audioPlayer?.stop()
        audioPlayer = nil
        isPlaying = false
    }
}
