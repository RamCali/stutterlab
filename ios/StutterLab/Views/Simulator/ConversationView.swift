import SwiftUI

// MARK: - Conversation View (Chat UI)

struct ConversationView: View {
    let scenario: ScenarioType
    @EnvironmentObject var appViewModel: AppViewModel
    @StateObject private var viewModel = SimulatorViewModel()
    @Environment(\.dismiss) private var dismiss
    @FocusState private var inputFocused: Bool

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                header

                // Messages
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: SLSpacing.s3) {
                            ForEach(viewModel.messages) { message in
                                messageBubble(message)
                                    .id(message.id)
                            }

                            if viewModel.isLoading {
                                typingIndicator
                            }
                        }
                        .padding(SLSpacing.s4)
                    }
                    .onChange(of: viewModel.messages.count) { _, _ in
                        if let last = viewModel.messages.last {
                            withAnimation {
                                proxy.scrollTo(last.id, anchor: .bottom)
                            }
                        }
                    }
                }

                // Error
                if let error = viewModel.error {
                    Text(error)
                        .font(.slXS)
                        .foregroundColor(.sunsetAmber)
                        .padding(.horizontal, SLSpacing.s4)
                }

                // Input bar
                inputBar
            }
        }
        .onAppear {
            if let uid = appViewModel.userProfile?.id {
                viewModel.startConversation(userId: uid, scenario: scenario)
            }
        }
    }

    // MARK: - Header

    private var header: some View {
        HStack {
            Button(action: {
                Task {
                    if let uid = appViewModel.userProfile?.id {
                        await viewModel.endConversation(userId: uid)
                    }
                    dismiss()
                }
            }) {
                Image(systemName: "xmark")
                    .foregroundColor(.textSecondary)
            }

            Spacer()

            VStack(spacing: 2) {
                Text(scenario.displayName)
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                Text(scenario.difficulty.displayName)
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
            }

            Spacer()

            Button("End") {
                Task {
                    if let uid = appViewModel.userProfile?.id {
                        await viewModel.endConversation(userId: uid)
                    }
                    dismiss()
                }
            }
            .font(.slSM)
            .foregroundColor(.sunsetAmber)
        }
        .padding(.horizontal, SLSpacing.s4)
        .padding(.vertical, SLSpacing.s3)
        .background(Color.deepSlate)
    }

    // MARK: - Message Bubble

    private func messageBubble(_ message: ChatMessage) -> some View {
        HStack {
            if message.role == .user { Spacer(minLength: 60) }

            Text(message.content)
                .font(.slBase)
                .foregroundColor(message.role == .user ? .obsidianNight : .textPrimary)
                .padding(.horizontal, SLSpacing.s4)
                .padding(.vertical, SLSpacing.s3)
                .background(
                    message.role == .user
                        ? Color.clarityTeal
                        : Color.elevation2
                )
                .cornerRadius(SLRadius.lg)

            if message.role == .assistant { Spacer(minLength: 60) }
        }
    }

    // MARK: - Typing Indicator

    private var typingIndicator: some View {
        HStack {
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(Color.textTertiary)
                        .frame(width: 6, height: 6)
                        .opacity(0.6)
                }
            }
            .padding(.horizontal, SLSpacing.s4)
            .padding(.vertical, SLSpacing.s3)
            .background(Color.elevation2)
            .cornerRadius(SLRadius.lg)

            Spacer()
        }
    }

    // MARK: - Input Bar

    private var inputBar: some View {
        HStack(spacing: SLSpacing.s2) {
            TextField("Type your response...", text: $viewModel.inputText)
                .font(.slBase)
                .foregroundColor(.textPrimary)
                .padding(.horizontal, SLSpacing.s4)
                .padding(.vertical, SLSpacing.s3)
                .background(Color.elevation1)
                .cornerRadius(SLRadius.md)
                .focused($inputFocused)

            Button(action: { viewModel.sendMessage() }) {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
                    .foregroundColor(
                        viewModel.inputText.trimmingCharacters(in: .whitespaces).isEmpty
                            ? Color.textTertiary
                            : Color.clarityTeal
                    )
            }
            .disabled(viewModel.inputText.trimmingCharacters(in: .whitespaces).isEmpty || viewModel.isLoading)
        }
        .padding(.horizontal, SLSpacing.s4)
        .padding(.vertical, SLSpacing.s3)
        .background(Color.deepSlate)
    }
}
