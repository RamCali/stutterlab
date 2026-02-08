import SwiftUI

// MARK: - Panic Button FAB (Always Visible)

struct PanicButtonView: View {
    @State private var showBreathing = false

    var body: some View {
        VStack {
            Spacer()
            HStack {
                Spacer()
                Button(action: { showBreathing = true }) {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.obsidianNight)
                        .frame(width: 56, height: 56)
                        .background(Color.clarityTeal)
                        .clipShape(Circle())
                        .shadow(color: .clarityTeal.opacity(0.3), radius: 8, y: 4)
                }
                .padding(.trailing, SLSpacing.s4)
                .padding(.bottom, 90) // above tab bar
            }
        }
        .fullScreenCover(isPresented: $showBreathing) {
            BoxBreathingView()
        }
    }
}
