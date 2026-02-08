import SwiftUI

// MARK: - Pulsing Circle (Breathing Animation)

struct PulsingCircle: View {
    let color: Color
    let minSize: CGFloat
    let maxSize: CGFloat
    let duration: TimeInterval

    @State private var isExpanded = false

    init(
        color: Color = .clarityTeal,
        minSize: CGFloat = 100,
        maxSize: CGFloat = 200,
        duration: TimeInterval = 4
    ) {
        self.color = color
        self.minSize = minSize
        self.maxSize = maxSize
        self.duration = duration
    }

    var body: some View {
        ZStack {
            // Outer glow
            Circle()
                .fill(color.opacity(0.08))
                .frame(
                    width: isExpanded ? maxSize + 40 : minSize + 20,
                    height: isExpanded ? maxSize + 40 : minSize + 20
                )

            // Main circle
            Circle()
                .fill(color.opacity(isExpanded ? 0.25 : 0.15))
                .frame(
                    width: isExpanded ? maxSize : minSize,
                    height: isExpanded ? maxSize : minSize
                )

            // Inner ring
            Circle()
                .stroke(color.opacity(0.4), lineWidth: 2)
                .frame(
                    width: isExpanded ? maxSize - 20 : minSize - 10,
                    height: isExpanded ? maxSize - 20 : minSize - 10
                )
        }
        .animation(
            .easeInOut(duration: duration).repeatForever(autoreverses: true),
            value: isExpanded
        )
        .onAppear { isExpanded = true }
    }
}
