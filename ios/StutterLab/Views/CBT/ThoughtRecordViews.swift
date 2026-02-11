import SwiftUI

// MARK: - Thought Record Model

struct ThoughtRecord: Codable, Identifiable {
    let id: String
    let createdAt: Date
    var situation: String
    var automaticThought: String
    var emotions: [String: Int] // emotion name → intensity 1-10
    var evidenceFor: String
    var evidenceAgainst: String
    var balancedThought: String
    var emotionsAfter: [String: Int]

    static let emotionOptions = ["Fear", "Shame", "Anxiety", "Anger", "Sadness", "Frustration", "Helplessness"]

    var avgEmotionBefore: Double {
        guard !emotions.isEmpty else { return 0 }
        return Double(emotions.values.reduce(0, +)) / Double(emotions.count)
    }

    var avgEmotionAfter: Double {
        guard !emotionsAfter.isEmpty else { return 0 }
        return Double(emotionsAfter.values.reduce(0, +)) / Double(emotionsAfter.count)
    }

    var emotionDelta: Double {
        avgEmotionBefore - avgEmotionAfter
    }
}

// MARK: - Prediction Model

struct PredictionRecord: Codable, Identifiable {
    let id: String
    let createdAt: Date
    var prediction: String
    var anxietyBefore: Int
    var actualOutcome: String?
    var anxietyAfter: Int?
    var learningInsight: String?

    var isCompleted: Bool { actualOutcome != nil }
    var anxietyDelta: Int? {
        guard let after = anxietyAfter else { return nil }
        return anxietyBefore - after
    }
}

// MARK: - CBT View Model

@MainActor
final class CBTViewModel: ObservableObject {
    @Published var thoughtRecords: [ThoughtRecord] = []
    @Published var predictions: [PredictionRecord] = []

    private let thoughtsKey = "cbt_thought_records_v1"
    private let predictionsKey = "cbt_predictions_v1"

    func loadAll() {
        if let data = UserDefaults.standard.data(forKey: thoughtsKey),
           let saved = try? JSONDecoder().decode([ThoughtRecord].self, from: data) {
            thoughtRecords = saved.sorted { $0.createdAt > $1.createdAt }
        }
        if let data = UserDefaults.standard.data(forKey: predictionsKey),
           let saved = try? JSONDecoder().decode([PredictionRecord].self, from: data) {
            predictions = saved.sorted { $0.createdAt > $1.createdAt }
        }
    }

    func saveThoughtRecord(_ record: ThoughtRecord) {
        thoughtRecords.insert(record, at: 0)
        persist(thoughtRecords, key: thoughtsKey)
    }

    func savePrediction(_ prediction: PredictionRecord) {
        if let index = predictions.firstIndex(where: { $0.id == prediction.id }) {
            predictions[index] = prediction
        } else {
            predictions.insert(prediction, at: 0)
        }
        persist(predictions, key: predictionsKey)
    }

    func deleteThoughtRecord(_ id: String) {
        thoughtRecords.removeAll { $0.id == id }
        persist(thoughtRecords, key: thoughtsKey)
    }

    func deletePrediction(_ id: String) {
        predictions.removeAll { $0.id == id }
        persist(predictions, key: predictionsKey)
    }

    private func persist<T: Encodable>(_ items: [T], key: String) {
        if let data = try? JSONEncoder().encode(items) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }
}

// MARK: - Thought Record List View

struct ThoughtRecordListView: View {
    @StateObject private var viewModel = CBTViewModel()
    @State private var showNew = false

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            ScrollView {
                VStack(spacing: SLSpacing.s4) {
                    // Info card
                    infoCard

                    if viewModel.thoughtRecords.isEmpty {
                        emptyState
                    } else {
                        ForEach(viewModel.thoughtRecords) { record in
                            recordCard(record)
                        }
                    }
                }
                .padding(SLSpacing.s4)
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Thought Records")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showNew = true }) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(.clarityTeal)
                }
            }
        }
        .sheet(isPresented: $showNew) {
            NewThoughtRecordView(viewModel: viewModel)
        }
        .onAppear { viewModel.loadAll() }
    }

    private var infoCard: some View {
        HStack(alignment: .top, spacing: SLSpacing.s2) {
            Image(systemName: "brain.head.profile")
                .foregroundColor(.clarityTeal)
            VStack(alignment: .leading, spacing: 2) {
                Text("Challenge anxious thoughts")
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                Text("Identify the thought, examine evidence for and against, then create a balanced perspective.")
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
            }
        }
        .padding(SLSpacing.s3)
        .background(Color.clarityTeal.opacity(0.05))
        .cornerRadius(SLRadius.md)
    }

    private var emptyState: some View {
        VStack(spacing: SLSpacing.s4) {
            Image(systemName: "doc.text")
                .font(.system(size: 40))
                .foregroundColor(.textTertiary)
            Text("No thought records yet")
                .font(.slLG)
                .foregroundColor(.textSecondary)
            Text("Create your first thought record to start challenging anxious thoughts about speaking.")
                .font(.slSM)
                .foregroundColor(.textTertiary)
                .multilineTextAlignment(.center)
        }
        .padding(.vertical, SLSpacing.s10)
    }

    private func recordCard(_ record: ThoughtRecord) -> some View {
        VStack(alignment: .leading, spacing: SLSpacing.s2) {
            HStack {
                Text(record.situation)
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                    .lineLimit(1)
                Spacer()
                Text(record.createdAt, style: .date)
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
            }
            Text("Thought: \"\(record.automaticThought)\"")
                .font(.slXS)
                .foregroundColor(.textSecondary)
                .lineLimit(2)
                .italic()

            if record.emotionDelta > 0 {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.down")
                        .font(.system(size: 10))
                    Text("Anxiety reduced by \(String(format: "%.0f", record.emotionDelta)) points")
                        .font(.slXS)
                }
                .foregroundColor(.fluencyGreen)
            }
        }
        .slCard(padding: SLSpacing.s3)
    }
}

// MARK: - New Thought Record View

struct NewThoughtRecordView: View {
    @ObservedObject var viewModel: CBTViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var step = 0
    @State private var situation = ""
    @State private var automaticThought = ""
    @State private var emotions: [String: Int] = [:]
    @State private var evidenceFor = ""
    @State private var evidenceAgainst = ""
    @State private var balancedThought = ""
    @State private var emotionsAfter: [String: Int] = [:]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                VStack(spacing: SLSpacing.s6) {
                    // Progress
                    HStack(spacing: 4) {
                        ForEach(0..<5, id: \.self) { i in
                            RoundedRectangle(cornerRadius: 2)
                                .fill(i <= step ? Color.clarityTeal : Color.elevation2)
                                .frame(height: 4)
                        }
                    }
                    .padding(.horizontal, SLSpacing.s4)

                    ScrollView {
                        VStack(alignment: .leading, spacing: SLSpacing.s4) {
                            switch step {
                            case 0: situationStep
                            case 1: thoughtStep
                            case 2: emotionsStep
                            case 3: evidenceStep
                            case 4: reframeStep
                            default: EmptyView()
                            }
                        }
                        .padding(SLSpacing.s4)
                    }

                    // Navigation
                    HStack {
                        if step > 0 {
                            Button("Back") { step -= 1 }
                                .foregroundColor(.textSecondary)
                        }
                        Spacer()
                        Button(action: advance) {
                            Text(step == 4 ? "Save" : "Next")
                                .fontWeight(.semibold)
                                .foregroundColor(.obsidianNight)
                                .padding(.horizontal, SLSpacing.s6)
                                .padding(.vertical, SLSpacing.s3)
                                .background(Color.clarityTeal)
                                .cornerRadius(SLRadius.md)
                        }
                    }
                    .padding(.horizontal, SLSpacing.s4)
                    .padding(.bottom, SLSpacing.s4)
                }
            }
            .navigationTitle("New Thought Record")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(.clarityTeal)
                }
            }
        }
    }

    private var situationStep: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            Text("What's the situation?")
                .font(.slLG)
                .foregroundColor(.textPrimary)
            Text("Describe the speaking situation that's causing anxiety.")
                .font(.slSM)
                .foregroundColor(.textSecondary)
            TextField("e.g., About to call customer service...", text: $situation, axis: .vertical)
                .font(.slBase)
                .foregroundColor(.textPrimary)
                .lineLimit(3...5)
                .padding(SLSpacing.s3)
                .background(Color.elevation1)
                .cornerRadius(SLRadius.md)
        }
    }

    private var thoughtStep: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            Text("What's the automatic thought?")
                .font(.slLG)
                .foregroundColor(.textPrimary)
            Text("What negative prediction popped into your head?")
                .font(.slSM)
                .foregroundColor(.textSecondary)
            TextField("e.g., I'm going to stutter and they'll judge me...", text: $automaticThought, axis: .vertical)
                .font(.slBase)
                .foregroundColor(.textPrimary)
                .lineLimit(3...5)
                .padding(SLSpacing.s3)
                .background(Color.elevation1)
                .cornerRadius(SLRadius.md)
        }
    }

    private var emotionsStep: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            Text("How intense are these feelings?")
                .font(.slLG)
                .foregroundColor(.textPrimary)

            ForEach(ThoughtRecord.emotionOptions, id: \.self) { emotion in
                HStack {
                    Text(emotion)
                        .font(.slSM)
                        .foregroundColor(.textPrimary)
                        .frame(width: 100, alignment: .leading)
                    Slider(
                        value: Binding(
                            get: { Double(emotions[emotion] ?? 0) },
                            set: { emotions[emotion] = Int($0) }
                        ),
                        in: 0...10,
                        step: 1
                    )
                    .tint(.sunsetAmber)
                    Text("\(emotions[emotion] ?? 0)")
                        .font(.slSM)
                        .foregroundColor(.sunsetAmber)
                        .frame(width: 24)
                }
            }
        }
    }

    private var evidenceStep: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            Text("Examine the evidence")
                .font(.slLG)
                .foregroundColor(.textPrimary)

            Text("Evidence FOR the thought")
                .font(.slSM)
                .foregroundColor(.sunsetAmber)
            TextField("What supports this thought?", text: $evidenceFor, axis: .vertical)
                .font(.slBase)
                .foregroundColor(.textPrimary)
                .lineLimit(2...4)
                .padding(SLSpacing.s3)
                .background(Color.elevation1)
                .cornerRadius(SLRadius.md)

            Text("Evidence AGAINST the thought")
                .font(.slSM)
                .foregroundColor(.fluencyGreen)
            TextField("What contradicts it?", text: $evidenceAgainst, axis: .vertical)
                .font(.slBase)
                .foregroundColor(.textPrimary)
                .lineLimit(2...4)
                .padding(SLSpacing.s3)
                .background(Color.elevation1)
                .cornerRadius(SLRadius.md)
        }
    }

    private var reframeStep: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s3) {
            Text("Create a balanced thought")
                .font(.slLG)
                .foregroundColor(.textPrimary)
            Text("A more realistic way to think about this situation.")
                .font(.slSM)
                .foregroundColor(.textSecondary)
            TextField("e.g., They want to help. If I stutter, they'll still assist.", text: $balancedThought, axis: .vertical)
                .font(.slBase)
                .foregroundColor(.textPrimary)
                .lineLimit(3...5)
                .padding(SLSpacing.s3)
                .background(Color.elevation1)
                .cornerRadius(SLRadius.md)

            Text("How do you feel now?")
                .font(.slSM)
                .foregroundColor(.textPrimary)
                .padding(.top, SLSpacing.s2)

            ForEach(ThoughtRecord.emotionOptions, id: \.self) { emotion in
                if (emotions[emotion] ?? 0) > 0 {
                    HStack {
                        Text(emotion)
                            .font(.slSM)
                            .foregroundColor(.textPrimary)
                            .frame(width: 100, alignment: .leading)
                        Slider(
                            value: Binding(
                                get: { Double(emotionsAfter[emotion] ?? 0) },
                                set: { emotionsAfter[emotion] = Int($0) }
                            ),
                            in: 0...10,
                            step: 1
                        )
                        .tint(.fluencyGreen)
                        Text("\(emotionsAfter[emotion] ?? 0)")
                            .font(.slSM)
                            .foregroundColor(.fluencyGreen)
                            .frame(width: 24)
                    }
                }
            }
        }
    }

    private func advance() {
        if step < 4 {
            step += 1
        } else {
            let record = ThoughtRecord(
                id: UUID().uuidString,
                createdAt: Date(),
                situation: situation,
                automaticThought: automaticThought,
                emotions: emotions,
                evidenceFor: evidenceFor,
                evidenceAgainst: evidenceAgainst,
                balancedThought: balancedThought,
                emotionsAfter: emotionsAfter
            )
            viewModel.saveThoughtRecord(record)
            dismiss()
        }
    }
}

// MARK: - Prediction Test List View

struct PredictionTestListView: View {
    @StateObject private var viewModel = CBTViewModel()
    @State private var showNew = false

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            ScrollView {
                VStack(spacing: SLSpacing.s4) {
                    HStack(alignment: .top, spacing: SLSpacing.s2) {
                        Image(systemName: "chart.bar.xaxis")
                            .foregroundColor(.clarityTeal)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Test your predictions")
                                .font(.slSM)
                                .fontWeight(.semibold)
                                .foregroundColor(.textPrimary)
                            Text("Record what you think will happen before a speaking situation, then record what actually happened. You'll see that anxiety almost always overestimates difficulty.")
                                .font(.slXS)
                                .foregroundColor(.textTertiary)
                        }
                    }
                    .padding(SLSpacing.s3)
                    .background(Color.clarityTeal.opacity(0.05))
                    .cornerRadius(SLRadius.md)

                    if viewModel.predictions.isEmpty {
                        VStack(spacing: SLSpacing.s4) {
                            Image(systemName: "chart.bar.xaxis")
                                .font(.system(size: 40))
                                .foregroundColor(.textTertiary)
                            Text("No predictions yet")
                                .font(.slLG)
                                .foregroundColor(.textSecondary)
                        }
                        .padding(.vertical, SLSpacing.s10)
                    } else {
                        ForEach(viewModel.predictions) { prediction in
                            predictionCard(prediction)
                        }
                    }
                }
                .padding(SLSpacing.s4)
                .padding(.bottom, 100)
            }
        }
        .navigationTitle("Prediction Testing")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showNew = true }) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(.clarityTeal)
                }
            }
        }
        .sheet(isPresented: $showNew) {
            NewPredictionView(viewModel: viewModel)
        }
        .onAppear { viewModel.loadAll() }
    }

    private func predictionCard(_ prediction: PredictionRecord) -> some View {
        VStack(alignment: .leading, spacing: SLSpacing.s2) {
            Text(prediction.prediction)
                .font(.slSM)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)
                .lineLimit(2)

            HStack {
                Text("Predicted anxiety: \(prediction.anxietyBefore)/10")
                    .font(.slXS)
                    .foregroundColor(.sunsetAmber)
                Spacer()
                if let delta = prediction.anxietyDelta {
                    HStack(spacing: 2) {
                        Image(systemName: delta > 0 ? "arrow.down" : "arrow.up")
                            .font(.system(size: 10))
                        Text("Actual: \(delta) points lower")
                    }
                    .font(.slXS)
                    .foregroundColor(.fluencyGreen)
                } else {
                    Text("Pending outcome")
                        .font(.slXS)
                        .foregroundColor(.textTertiary)
                }
            }
        }
        .slCard(padding: SLSpacing.s3)
    }
}

// MARK: - New Prediction View

struct NewPredictionView: View {
    @ObservedObject var viewModel: CBTViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var prediction = ""
    @State private var anxietyBefore: Double = 5

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()

                VStack(alignment: .leading, spacing: SLSpacing.s6) {
                    Text("What do you predict will happen?")
                        .font(.slLG)
                        .foregroundColor(.textPrimary)

                    TextField("e.g., I'll stutter multiple times on the call...", text: $prediction, axis: .vertical)
                        .font(.slBase)
                        .foregroundColor(.textPrimary)
                        .lineLimit(3...5)
                        .padding(SLSpacing.s3)
                        .background(Color.elevation1)
                        .cornerRadius(SLRadius.md)

                    VStack(alignment: .leading, spacing: SLSpacing.s2) {
                        Text("Anxiety level: \(Int(anxietyBefore))/10")
                            .font(.slSM)
                            .foregroundColor(.sunsetAmber)
                        Slider(value: $anxietyBefore, in: 1...10, step: 1)
                            .tint(.sunsetAmber)
                    }

                    Button(action: savePrediction) {
                        Text("Save Prediction")
                            .font(.slBase)
                            .fontWeight(.semibold)
                            .foregroundColor(.obsidianNight)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, SLSpacing.s3)
                            .background(prediction.isEmpty ? Color.textTertiary : Color.clarityTeal)
                            .cornerRadius(SLRadius.md)
                    }
                    .disabled(prediction.isEmpty)

                    Spacer()
                }
                .padding(SLSpacing.s4)
            }
            .navigationTitle("New Prediction")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(.clarityTeal)
                }
            }
        }
    }

    private func savePrediction() {
        let record = PredictionRecord(
            id: UUID().uuidString,
            createdAt: Date(),
            prediction: prediction,
            anxietyBefore: Int(anxietyBefore),
            actualOutcome: nil,
            anxietyAfter: nil,
            learningInsight: nil
        )
        viewModel.savePrediction(record)
        dismiss()
    }
}
