import SwiftUI

// MARK: - Panic Button FAB (Always Visible)

struct PanicButtonView: View {
    @State private var showBreathing = false
    @State private var isPulsing = false

    var body: some View {
        VStack {
            Spacer()
            HStack {
                Spacer()
                Button(action: {
                    UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
                    showBreathing = true
                }) {
                    ZStack {
                        // Outer circle
                        Circle()
                            .fill(Color.clarityTeal)
                            .frame(width: 56, height: 56)

                        // Inner circle
                        Circle()
                            .fill(Color.clarityTeal.opacity(0.4))
                            .frame(width: 30, height: 30)

                        Circle()
                            .stroke(Color.obsidianNight.opacity(0.25), lineWidth: 2)
                            .frame(width: 30, height: 30)
                    }
                    .shadow(color: .clarityTeal.opacity(0.3), radius: 8, y: 4)
                }
                .scaleEffect(isPulsing ? 1.05 : 1.0)
                .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true), value: isPulsing)
                .onAppear { isPulsing = true }
                .padding(.trailing, SLSpacing.s4)
                .padding(.bottom, 90) // above tab bar
            }
        }
        .fullScreenCover(isPresented: $showBreathing) {
            BoxBreathingView()
        }
    }
}
