import SwiftUI

// MARK: - Phase Unlock Celebration View

struct PhaseUnlockView: View {
    let phase: Int
    let phaseLabel: String
    let onContinue: () -> Void

    @State private var appear = false
    @State private var confettiActive = false

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            // Confetti particles
            if confettiActive {
                ConfettiView()
                    .ignoresSafeArea()
            }

            VStack(spacing: SLSpacing.s8) {
                Spacer()

                // Phase badge
                ZStack {
                    Circle()
                        .fill(Color.clarityTeal.opacity(0.2))
                        .frame(width: 140, height: 140)
                        .scaleEffect(appear ? 1 : 0)
                        .animation(.spring(response: 0.6, dampingFraction: 0.5), value: appear)

                    Circle()
                        .fill(Color.clarityTeal.opacity(0.4))
                        .frame(width: 100, height: 100)
                        .scaleEffect(appear ? 1 : 0)
                        .animation(.spring(response: 0.5, dampingFraction: 0.5).delay(0.1), value: appear)

                    Image(systemName: "star.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.sunsetAmber)
                        .scaleEffect(appear ? 1 : 0)
                        .animation(.spring(response: 0.4, dampingFraction: 0.4).delay(0.2), value: appear)
                }

                // Title
                VStack(spacing: SLSpacing.s3) {
                    Text("Phase \(phase) Unlocked!")
                        .font(.sl2XL)
                        .foregroundColor(.fluencyGreen)
                        .opacity(appear ? 1 : 0)
                        .animation(.easeIn(duration: 0.4).delay(0.4), value: appear)

                    Text(phaseLabel)
                        .font(.slXL)
                        .foregroundColor(.textPrimary)
                        .opacity(appear ? 1 : 0)
                        .animation(.easeIn(duration: 0.4).delay(0.5), value: appear)

                    Text(phaseDescription)
                        .font(.slBase)
                        .foregroundColor(.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, SLSpacing.s8)
                        .opacity(appear ? 1 : 0)
                        .animation(.easeIn(duration: 0.4).delay(0.6), value: appear)
                }

                Spacer()

                Button(action: onContinue) {
                    Text("Let's Go!")
                        .font(.slBase)
                        .fontWeight(.semibold)
                        .foregroundColor(.obsidianNight)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, SLSpacing.s3)
                        .background(Color.fluencyGreen)
                        .cornerRadius(SLRadius.md)
                }
                .padding(.horizontal, SLSpacing.s4)
                .padding(.bottom, SLSpacing.s8)
                .opacity(appear ? 1 : 0)
                .animation(.easeIn(duration: 0.4).delay(0.8), value: appear)
            }
        }
        .onAppear {
            appear = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                confettiActive = true
                // Triple haptic burst
                let generator = UINotificationFeedbackGenerator()
                generator.notificationOccurred(.success)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                    generator.notificationOccurred(.success)
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.30) {
                    generator.notificationOccurred(.success)
                }
            }
        }
    }

    private var phaseDescription: String {
        switch phase {
        case 2: return "You've mastered the basics. Now we combine techniques for stronger fluency."
        case 3: return "Time to integrate modification techniques. You'll learn to manage stuttering moments with confidence."
        case 4: return "Take your skills into the real world. AI simulators and live challenges await."
        case 5: return "The home stretch. Advanced scenarios, maintenance strategies, and celebrating how far you've come."
        default: return "Keep going — every phase brings you closer to fluency freedom."
        }
    }
}

// MARK: - Confetti View (SwiftUI Canvas)

struct ConfettiView: View {
    @State private var particles: [ConfettiParticle] = []
    @State private var animationOffset: CGFloat = 0

    struct ConfettiParticle: Identifiable {
        let id = UUID()
        let x: CGFloat
        let delay: Double
        let color: Color
        let size: CGFloat
        let rotation: Double
    }

    var body: some View {
        GeometryReader { geo in
            ZStack {
                ForEach(particles) { particle in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(particle.color)
                        .frame(width: particle.size, height: particle.size * 1.5)
                        .rotationEffect(.degrees(particle.rotation + Double(animationOffset) * 360))
                        .position(
                            x: particle.x,
                            y: -20 + animationOffset * (geo.size.height + 40)
                        )
                        .opacity(1 - Double(animationOffset) * 0.5)
                        .animation(
                            .linear(duration: 3).delay(particle.delay),
                            value: animationOffset
                        )
                }
            }
            .onAppear {
                let colors: [Color] = [.clarityTeal, .sunsetAmber, .fluencyGreen, .white]
                particles = (0..<40).map { _ in
                    ConfettiParticle(
                        x: CGFloat.random(in: 0...geo.size.width),
                        delay: Double.random(in: 0...0.5),
                        color: colors.randomElement()!,
                        size: CGFloat.random(in: 4...8),
                        rotation: Double.random(in: 0...360)
                    )
                }
                withAnimation {
                    animationOffset = 1
                }
            }
        }
        .allowsHitTesting(false)
    }
}
