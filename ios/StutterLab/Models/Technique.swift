import Foundation

// MARK: - Technique

struct Technique: Identifiable {
    let id: String
    let name: String
    let category: TechniqueCategory
    let icon: String
    let description: String
    let whenToUse: String
    let howTo: [String]
    let evidence: EvidenceLevel
    let effectSize: String?
    let citation: String?
    let relatedExercises: [ExerciseType]

    enum TechniqueCategory: String, CaseIterable {
        case fluencyShaping = "Fluency Shaping"
        case stutteringModification = "Stuttering Modification"
    }
}

// MARK: - Technique Catalog

extension Technique {
    static let catalog: [Technique] = [
        // Fluency Shaping (6)
        Technique(
            id: "gentle-onset",
            name: "Gentle Onset",
            category: .fluencyShaping,
            icon: "waveform.path.ecg",
            description: "Start words with soft, easy airflow rather than hard vocal cord contact. This reduces blocks on initial sounds by easing into speech.",
            whenToUse: "Before saying feared words, starting sentences, or when you feel tension building in your throat.",
            howTo: [
                "Take a gentle breath",
                "Begin with a soft 'h' sound (almost a sigh)",
                "Let the first sound flow naturally from the breath",
                "Gradually build volume — don't start loud"
            ],
            evidence: .high,
            effectSize: "d = 0.75-1.63",
            citation: "Foundstone (2019), Ingham et al. (2001)",
            relatedExercises: [.gentleOnset, .reading]
        ),
        Technique(
            id: "light-contact",
            name: "Light Articulatory Contact",
            category: .fluencyShaping,
            icon: "hand.raised.fingers.spread",
            description: "Use minimal tension in lips, tongue, and jaw when forming sounds. Reduces the physical effort that triggers blocks.",
            whenToUse: "On plosive sounds (p, b, t, d, k, g) that tend to cause blocks. Especially useful during phone calls.",
            howTo: [
                "Barely touch your lips together for 'p' and 'b' sounds",
                "Keep your tongue relaxed against the roof of your mouth",
                "Think of 'touching' sounds rather than 'pressing' them",
                "Practice saying 'papa' with feather-light lip contact"
            ],
            evidence: .high,
            effectSize: "d = 0.75-1.63",
            citation: "Guitar (2014), Manning & DiLollo (2018)",
            relatedExercises: [.lightContact, .reading]
        ),
        Technique(
            id: "prolonged-speech",
            name: "Prolonged Speech",
            category: .fluencyShaping,
            icon: "waveform",
            description: "Stretch vowels and blend words together for smoother, more continuous speech. Creates a flowing rhythm that bypasses stuttering patterns.",
            whenToUse: "During reading practice, structured exercises, or when you need to slow down and find your rhythm.",
            howTo: [
                "Stretch each vowel sound slightly longer than normal",
                "Blend the end of one word into the beginning of the next",
                "Maintain continuous airflow — don't stop between words",
                "Start very slow (60 SPM), gradually increase to normal rate"
            ],
            evidence: .high,
            effectSize: "d = 0.75-1.63",
            citation: "O'Brian et al. (2010), Onslow et al. (2012)",
            relatedExercises: [.prolongedSpeech, .reading]
        ),
        Technique(
            id: "pausing",
            name: "Pausing Strategy",
            category: .fluencyShaping,
            icon: "pause.circle",
            description: "Practice natural pauses between phrases. Reduces time pressure and gives your brain time to plan the next phrase.",
            whenToUse: "When speaking feels rushed, during conversations, presentations, or any time you feel time pressure.",
            howTo: [
                "Pause at natural phrase boundaries (commas, periods)",
                "Take a soft breath during each pause",
                "Don't rush to fill silence — pauses are natural",
                "Aim for 2-3 second pauses between thoughts"
            ],
            evidence: .moderate,
            effectSize: "d = 0.56-0.65",
            citation: "Logan & Caruso (1997)",
            relatedExercises: [.pausing, .reading]
        ),
        Technique(
            id: "breathing",
            name: "Diaphragmatic Breathing",
            category: .fluencyShaping,
            icon: "wind",
            description: "Use belly breathing to support speech with steady airflow. Reduces throat tension and provides a stable foundation for voice.",
            whenToUse: "Before speaking situations, as a warmup, and whenever you feel anxiety building.",
            howTo: [
                "Place hand on belly — feel it rise as you inhale",
                "Inhale through nose for 4 seconds",
                "Exhale through mouth while speaking for 6-8 seconds",
                "Keep shoulders relaxed — movement should be in your belly"
            ],
            evidence: .moderate,
            effectSize: "d = 0.56-0.65",
            citation: "Kell et al. (2009)",
            relatedExercises: [.breathing]
        ),
        Technique(
            id: "daf-faf",
            name: "Altered Auditory Feedback",
            category: .fluencyShaping,
            icon: "headphones",
            description: "DAF delays your voice; FAF shifts its pitch. Both trigger the 'choral effect' that dramatically reduces stuttering in most people.",
            whenToUse: "During practice sessions in the Audio Lab. Start with DAF at 70-100ms delay, then experiment with FAF.",
            howTo: [
                "Put on headphones and open the Audio Lab",
                "Start with DAF at 100ms delay",
                "Read aloud — you'll hear your voice slightly delayed",
                "Naturally slow down to match the feedback"
            ],
            evidence: .high,
            effectSize: "d = 0.75-1.63",
            citation: "Lincoln et al. (2006), Kalinowski & Saltuklaroglu (2003)",
            relatedExercises: [.reading]
        ),

        // Stuttering Modification (6)
        Technique(
            id: "cancellation",
            name: "Cancellation",
            category: .stutteringModification,
            icon: "arrow.uturn.backward",
            description: "After a stutter, pause, then say the word again using a modification technique. Builds control and reduces fear of stuttering.",
            whenToUse: "After you stutter on a word. Instead of pushing through or avoiding, you practice controlled re-saying.",
            howTo: [
                "When you stutter, STOP completely",
                "Pause for 2-3 seconds (don't rush)",
                "Plan how you'll say the word differently",
                "Re-say the word using gentle onset or prolongation"
            ],
            evidence: .moderate,
            effectSize: "d = 0.56-0.65",
            citation: "Van Riper (1973), Guitar (2014)",
            relatedExercises: [.cancellation]
        ),
        Technique(
            id: "pull-out",
            name: "Pull-Out",
            category: .stutteringModification,
            icon: "arrow.right.circle",
            description: "Modify a stutter WHILE it's happening by easing out of the block and finishing the word smoothly.",
            whenToUse: "Mid-stutter — when you feel yourself getting stuck on a sound. Instead of forcing through, ease out.",
            howTo: [
                "When you feel a block, don't fight it",
                "Slow down the movement of the stuck sound",
                "Ease the tension in your lips/tongue/jaw",
                "Stretch the sound and slide into the rest of the word"
            ],
            evidence: .moderate,
            effectSize: "d = 0.56-0.65",
            citation: "Van Riper (1973)",
            relatedExercises: [.pullOut]
        ),
        Technique(
            id: "preparatory-set",
            name: "Preparatory Set",
            category: .stutteringModification,
            icon: "target",
            description: "Pre-plan your articulatory position before saying a difficult word. Prevents blocks before they happen.",
            whenToUse: "Before feared words or sounds you know are difficult. Think of it as 'setting up' your mouth for success.",
            howTo: [
                "Identify the feared word coming up",
                "Mentally rehearse the first sound with light contact",
                "Position your tongue/lips gently before speaking",
                "Start with gentle onset into the prepared position"
            ],
            evidence: .moderate,
            effectSize: "d = 0.56-0.65",
            citation: "Van Riper (1973), Manning (2010)",
            relatedExercises: [.preparatorySet]
        ),
        Technique(
            id: "voluntary-stuttering",
            name: "Voluntary Stuttering",
            category: .stutteringModification,
            icon: "speaker.wave.3",
            description: "Intentionally stutter on EASY words to reduce fear and desensitize yourself. Gives you control over stuttering rather than it controlling you.",
            whenToUse: "During practice sessions or safe conversations. Helps break the anxiety cycle by making stuttering a choice.",
            howTo: [
                "Choose easy words (ones you don't normally stutter on)",
                "Intentionally repeat the first sound: 'I-I-I want...'",
                "Keep it smooth and controlled — not forced",
                "Gradually increase to harder words as comfort grows"
            ],
            evidence: .moderate,
            effectSize: nil,
            citation: "Sheehan (1970), Murphy et al. (2007)",
            relatedExercises: [.voluntaryStuttering]
        ),
        Technique(
            id: "desensitization",
            name: "Feared Word Desensitization",
            category: .stutteringModification,
            icon: "shield.lefthalf.filled",
            description: "Systematically practice your trigger words in safe settings. Repeated exposure reduces the anxiety that makes stuttering worse.",
            whenToUse: "In the Feared Words section. Practice your most difficult words until they feel routine.",
            howTo: [
                "Identify your feared words in the Feared Words dashboard",
                "Practice saying each word in isolation (just the word)",
                "Then practice in a sentence",
                "Then practice in a paragraph or conversation"
            ],
            evidence: .moderate,
            effectSize: nil,
            citation: "Blomgren et al. (2005)",
            relatedExercises: [.reading]
        ),
        Technique(
            id: "openness",
            name: "Open Stuttering",
            category: .stutteringModification,
            icon: "hand.wave",
            description: "Stutter openly without hiding or avoiding. Reduces shame, builds confidence, and paradoxically often improves fluency.",
            whenToUse: "In daily life. Tell people you stutter. Don't substitute words. Let stuttering happen without fighting it.",
            howTo: [
                "Practice telling one person: 'I stutter sometimes'",
                "When you feel a block coming, don't switch words",
                "Maintain eye contact during moments of stuttering",
                "Remind yourself: the stutter is not the problem — avoidance is"
            ],
            evidence: .supportive,
            effectSize: nil,
            citation: "Yaruss & Quesal (2006)",
            relatedExercises: [.voluntaryStuttering]
        ),
    ]

    static var fluencyShaping: [Technique] {
        catalog.filter { $0.category == .fluencyShaping }
    }

    static var stutteringModification: [Technique] {
        catalog.filter { $0.category == .stutteringModification }
    }
}

// MARK: - Exercise Catalog (for Exercise Library)

extension Exercise {
    static let catalog: [Exercise] = [
        Exercise(id: "reading-beginner", title: "Reading Aloud", description: "Practice fluency by reading words and short phrases at your own pace.", type: .reading, technique: "Fluency Shaping", difficulty: .beginner, instructions: "Choose a comfortable passage. Read slowly, focusing on smooth airflow and gentle onset on each word. Pause naturally between phrases.", contentJSON: nil, audioURL: nil, durationSeconds: 300, isPremium: false, sortOrder: 1, evidenceLevel: .high, effectSize: "d = 0.75-1.63", citation: "Ingham et al. (2001)", createdAt: .distantPast),

        Exercise(id: "gentle-onset-1", title: "Gentle Onset Practice", description: "Start words with soft, easy airflow. The foundational fluency shaping technique.", type: .gentleOnset, technique: "Gentle Onset", difficulty: .beginner, instructions: "Say each word starting with a soft 'h' sound. Let the first sound flow from your breath naturally. Practice: Hello, How, Happy, Here, Home.", contentJSON: nil, audioURL: nil, durationSeconds: 300, isPremium: false, sortOrder: 2, evidenceLevel: .high, effectSize: "d = 0.75-1.63", citation: "Guitar (2014)", createdAt: .distantPast),

        Exercise(id: "light-contact-1", title: "Light Contact Drill", description: "Practice minimal tension on plosive sounds (p, b, t, d, k, g).", type: .lightContact, technique: "Light Articulatory Contact", difficulty: .beginner, instructions: "Say these words with the lightest possible lip/tongue contact: Papa, Butter, Table, Door, Kitten, Go. Barely touch your articulators together.", contentJSON: nil, audioURL: nil, durationSeconds: 300, isPremium: false, sortOrder: 3, evidenceLevel: .high, effectSize: "d = 0.75-1.63", citation: "Manning & DiLollo (2018)", createdAt: .distantPast),

        Exercise(id: "prolonged-1", title: "Prolonged Speech", description: "Stretch vowels and blend words for smoother, continuous speech.", type: .prolongedSpeech, technique: "Prolonged Speech", difficulty: .intermediate, instructions: "Read the following slowly, stretching each vowel: 'Theee quiiick brooown foox juuumps oover theee laaazy doog.' Blend words into each other.", contentJSON: nil, audioURL: nil, durationSeconds: 600, isPremium: true, sortOrder: 4, evidenceLevel: .high, effectSize: "d = 0.75-1.63", citation: "O'Brian et al. (2010)", createdAt: .distantPast),

        Exercise(id: "pausing-1", title: "Pausing Strategy", description: "Practice natural pauses between phrases to reduce time pressure.", type: .pausing, technique: "Pausing", difficulty: .beginner, instructions: "Read a passage and deliberately pause for 2-3 seconds at every comma and period. Breathe during each pause. Notice how it reduces rushing.", contentJSON: nil, audioURL: nil, durationSeconds: 300, isPremium: false, sortOrder: 5, evidenceLevel: .moderate, effectSize: "d = 0.56-0.65", citation: "Logan & Caruso (1997)", createdAt: .distantPast),

        Exercise(id: "cancellation-1", title: "Cancellation Practice", description: "After a stutter, pause, then re-say the word using a technique.", type: .cancellation, technique: "Cancellation", difficulty: .intermediate, instructions: "Read aloud. When you stutter: 1) STOP completely 2) Pause 2-3 seconds 3) Re-say the word using gentle onset. Don't rush the re-attempt.", contentJSON: nil, audioURL: nil, durationSeconds: 600, isPremium: true, sortOrder: 6, evidenceLevel: .moderate, effectSize: "d = 0.56-0.65", citation: "Van Riper (1973)", createdAt: .distantPast),

        Exercise(id: "pullout-1", title: "Pull-Out Technique", description: "Modify stuttering mid-moment by easing out of a block.", type: .pullOut, technique: "Pull-Out", difficulty: .advanced, instructions: "Read aloud. When you feel a block: Don't stop or push — slow the stuck sound, ease tension, and slide into the rest of the word smoothly.", contentJSON: nil, audioURL: nil, durationSeconds: 600, isPremium: true, sortOrder: 7, evidenceLevel: .moderate, effectSize: "d = 0.56-0.65", citation: "Van Riper (1973)", createdAt: .distantPast),

        Exercise(id: "prep-set-1", title: "Preparatory Set", description: "Pre-plan articulation before feared words to prevent blocks.", type: .preparatorySet, technique: "Preparatory Set", difficulty: .advanced, instructions: "Choose 5 feared words. Before each: 1) Think about the first sound 2) Position your mouth gently 3) Start with soft airflow. Repeat each word 5 times.", contentJSON: nil, audioURL: nil, durationSeconds: 600, isPremium: true, sortOrder: 8, evidenceLevel: .moderate, effectSize: "d = 0.56-0.65", citation: "Manning (2010)", createdAt: .distantPast),

        Exercise(id: "voluntary-1", title: "Voluntary Stuttering", description: "Intentionally stutter on easy words to reduce fear and build control.", type: .voluntaryStuttering, technique: "Voluntary Stuttering", difficulty: .intermediate, instructions: "Read a passage and intentionally repeat the first sound of EASY words: 'I-I want to g-g-go to the st-st-store.' Keep it smooth and controlled.", contentJSON: nil, audioURL: nil, durationSeconds: 600, isPremium: true, sortOrder: 9, evidenceLevel: .moderate, effectSize: nil, citation: "Sheehan (1970)", createdAt: .distantPast),

        Exercise(id: "breathing-1", title: "Diaphragmatic Breathing", description: "Belly breathing to support speech with steady airflow.", type: .breathing, technique: "Breathing Control", difficulty: .beginner, instructions: "Place hand on belly. Inhale through nose (4s) — feel belly rise. Exhale through mouth (6s) while counting aloud. Repeat 10 cycles.", contentJSON: nil, audioURL: nil, durationSeconds: 180, isPremium: false, sortOrder: 10, evidenceLevel: .moderate, effectSize: nil, citation: "Kell et al. (2009)", createdAt: .distantPast),

        Exercise(id: "tongue-twister-1", title: "Tongue Twisters", description: "Challenge articulation with graded tongue twisters.", type: .tongueTwister, technique: "Articulation", difficulty: .intermediate, instructions: "Say each slowly, then speed up: 'She sells seashells.' 'Red lorry, yellow lorry.' 'Peter Piper picked a peck.' Focus on light contact, not speed.", contentJSON: nil, audioURL: nil, durationSeconds: 300, isPremium: false, sortOrder: 11, evidenceLevel: .supportive, effectSize: nil, citation: nil, createdAt: .distantPast),

        Exercise(id: "phone-reading", title: "Phone Number Reading", description: "Practice reading phone numbers aloud — a common feared task.", type: .phoneNumber, technique: "Number Fluency", difficulty: .intermediate, instructions: "Read these numbers aloud: 555-0123, 867-5309, 212-555-1234. Use gentle onset on each digit. Pause between number groups.", contentJSON: nil, audioURL: nil, durationSeconds: 300, isPremium: false, sortOrder: 12, evidenceLevel: .supportive, effectSize: nil, citation: nil, createdAt: .distantPast),
    ]
}
