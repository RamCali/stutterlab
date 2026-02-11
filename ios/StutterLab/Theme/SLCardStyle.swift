import SwiftUI

// MARK: - Standard Glassmorphic Card

struct SLCardModifier: ViewModifier {
    var radius: CGFloat = SLRadius.md
    var padding: CGFloat = SLPadding.cardInner

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: radius)
                    .fill(.ultraThinMaterial)
                    .environment(\.colorScheme, .dark)
            )
            .background(
                RoundedRectangle(cornerRadius: radius)
                    .fill(Color.cardSurface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: radius)
                    .stroke(Color.border, lineWidth: 1)
            )
            .shadow(color: Color.shadowColor.opacity(0.3), radius: 8, y: 4)
    }
}

// MARK: - Elevated Card

struct SLCardElevatedModifier: ViewModifier {
    var radius: CGFloat = SLRadius.md

    func body(content: Content) -> some View {
        content
            .padding(SLPadding.cardInner)
            .background(
                RoundedRectangle(cornerRadius: radius)
                    .fill(.thinMaterial)
                    .environment(\.colorScheme, .dark)
            )
            .background(
                RoundedRectangle(cornerRadius: radius)
                    .fill(Color.cardSurfaceElevated)
            )
            .overlay(
                RoundedRectangle(cornerRadius: radius)
                    .stroke(Color.borderAccent, lineWidth: 1)
            )
            .shadow(color: Color.shadowColor, radius: 16, y: 8)
    }
}

// MARK: - Accent Tinted Card

struct SLCardAccentModifier: ViewModifier {
    let accentColor: Color
    var radius: CGFloat = SLRadius.md

    func body(content: Content) -> some View {
        content
            .padding(SLPadding.cardInner)
            .background(
                RoundedRectangle(cornerRadius: radius)
                    .fill(accentColor.opacity(0.08))
            )
            .background(
                RoundedRectangle(cornerRadius: radius)
                    .fill(Color.cardSurface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: radius)
                    .stroke(accentColor.opacity(0.25), lineWidth: 1)
            )
            .shadow(color: accentColor.opacity(0.15), radius: 12, y: 4)
    }
}

// MARK: - Gradient Background Card

struct SLCardGradientModifier: ViewModifier {
    let colors: [Color]
    var radius: CGFloat = SLRadius.lg

    func body(content: Content) -> some View {
        content
            .padding(SLPadding.cardInnerLarge)
            .background(
                RoundedRectangle(cornerRadius: radius)
                    .fill(
                        LinearGradient(
                            colors: colors,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: radius)
                    .stroke(Color.white.opacity(0.12), lineWidth: 1)
            )
            .shadow(color: (colors.first ?? .clear).opacity(0.25), radius: 16, y: 6)
    }
}

// MARK: - Primary Button Style

struct SLPrimaryButtonStyle: ButtonStyle {
    var color: Color = .clarityTeal

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.slBase)
            .fontWeight(.semibold)
            .foregroundColor(.obsidianNight)
            .frame(maxWidth: .infinity)
            .padding(.vertical, SLSpacing.s4)
            .background(
                LinearGradient(
                    colors: [color, color.opacity(0.8)],
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
            .cornerRadius(SLRadius.md)
            .shadow(color: color.opacity(0.4), radius: 8, y: 4)
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(response: 0.2), value: configuration.isPressed)
            .onChange(of: configuration.isPressed) { pressed in
                if pressed {
                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                }
            }
    }
}

// MARK: - Secondary Button Style

struct SLSecondaryButtonStyle: ButtonStyle {
    var color: Color = .clarityTeal

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.slBase)
            .fontWeight(.semibold)
            .foregroundColor(color)
            .frame(maxWidth: .infinity)
            .padding(.vertical, SLSpacing.s3)
            .background(color.opacity(0.1))
            .cornerRadius(SLRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: SLRadius.md)
                    .stroke(color.opacity(0.3), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(response: 0.2), value: configuration.isPressed)
    }
}

// MARK: - Haptic Feedback Modifier

struct SLHapticModifier: ViewModifier {
    let style: UIImpactFeedbackGenerator.FeedbackStyle

    func body(content: Content) -> some View {
        content.simultaneousGesture(
            TapGesture().onEnded {
                UIImpactFeedbackGenerator(style: style).impactOccurred()
            }
        )
    }
}

// MARK: - Staggered Entrance Animation

struct SLEntranceModifier: ViewModifier {
    let delay: Double
    @State private var appeared = false

    func body(content: Content) -> some View {
        content
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 20)
            .scaleEffect(appeared ? 1 : 0.96)
            .onAppear {
                withAnimation(.spring(response: 0.5, dampingFraction: 0.8).delay(delay)) {
                    appeared = true
                }
            }
    }
}

// MARK: - Animated Number Countup

struct AnimatedNumber: View, Animatable {
    var value: Double
    let color: Color
    let font: Font
    var format: String = "%.0f"

    var animatableData: Double {
        get { value }
        set { value = newValue }
    }

    var body: some View {
        Text(String(format: format, value))
            .font(font)
            .fontWeight(.bold)
            .foregroundColor(color)
            .monospacedDigit()
    }
}

// MARK: - Glow Circle (Reusable ambient glow behind icons/logos)

struct GlowCircle: View {
    let color: Color
    var size: CGFloat = 120
    var blur: CGFloat = 30
    @State private var pulsing = false

    var body: some View {
        Circle()
            .fill(color.opacity(0.15))
            .frame(width: size, height: size)
            .blur(radius: blur)
            .scaleEffect(pulsing ? 1.15 : 0.9)
            .animation(.easeInOut(duration: 3).repeatForever(autoreverses: true), value: pulsing)
            .onAppear { pulsing = true }
    }
}

// MARK: - View Extensions

extension View {
    func slCard(radius: CGFloat = SLRadius.md, padding: CGFloat = SLPadding.cardInner) -> some View {
        modifier(SLCardModifier(radius: radius, padding: padding))
    }

    func slCardElevated(radius: CGFloat = SLRadius.md) -> some View {
        modifier(SLCardElevatedModifier(radius: radius))
    }

    func slCardAccent(_ color: Color, radius: CGFloat = SLRadius.md) -> some View {
        modifier(SLCardAccentModifier(accentColor: color, radius: radius))
    }

    func slCardGradient(_ colors: [Color], radius: CGFloat = SLRadius.lg) -> some View {
        modifier(SLCardGradientModifier(colors: colors, radius: radius))
    }

    func slHaptic(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) -> some View {
        modifier(SLHapticModifier(style: style))
    }

    func slEntrance(delay: Double = 0) -> some View {
        modifier(SLEntranceModifier(delay: delay))
    }
}
