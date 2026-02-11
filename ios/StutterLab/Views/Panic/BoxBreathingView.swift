import SwiftUI

// MARK: - Phase Colors (matching web: sky-400, amber-400, emerald-400)

private let phaseColors: [Color] = [
    Color(red: 56 / 255, green: 189 / 255, blue: 248 / 255),   // Inhale  — sky-400
    Color(red: 251 / 255, green: 191 / 255, blue: 36 / 255),   // Hold In — amber-400
    Color(red: 52 / 255, green: 211 / 255, blue: 153 / 255),   // Exhale  — emerald-400
    Color(red: 251 / 255, green: 191 / 255, blue: 36 / 255),   // Hold Out — amber-400
]

private let phaseLabels = ["Breathe In", "Hold", "Breathe Out", "Hold"]

// MARK: - Box Breathing View (Web-aligned multi-color square path)

struct BoxBreathingView: View {
    @StateObject private var viewModel = PanicViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            Color.obsidianNight.opacity(0.95).ignoresSafeArea()

            if viewModel.showGentleOnset {
                gentleOnsetOffer
            } else if viewModel.isActive {
                breathingContent
            } else {
                startContent
            }
        }
    }

    // MARK: - Start

    private var startContent: some View {
        VStack(spacing: SLSpacing.s8) {
            Spacer()

            Image(systemName: "heart.fill")
                .font(.system(size: 48))
                .foregroundColor(.clarityTeal)

            Text("Quick Calm")
                .font(.sl2XL)
                .foregroundColor(.textPrimary)

            Text("Box breathing helps calm your nervous system.\n4 seconds each: breathe in, hold, breathe out, rest.")
                .font(.slBase)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, SLSpacing.s8)

            Spacer()

            Button(action: { viewModel.start() }) {
                Text("Begin Breathing")
            }
            .buttonStyle(SLPrimaryButtonStyle())
            .padding(.horizontal, SLSpacing.s4)

            Button("Dismiss") { dismiss() }
                .font(.slSM)
                .foregroundColor(.textSecondary)
                .padding(.bottom, SLSpacing.s8)
        }
    }

    // MARK: - Breathing Content

    private var breathingContent: some View {
        VStack(spacing: SLSpacing.s5) {
            // Title
            Text("Quick Calm")
                .font(.slLG)
                .fontWeight(.bold)
                .foregroundColor(.textPrimary)
                .padding(.top, SLSpacing.s8)

            Text("Box Breathing")
                .font(.slSM)
                .foregroundColor(.textSecondary)

            Spacer()

            // Box path with traveling dot
            boxPathView
                .frame(width: 300, height: 300)

            Spacer()

            // Cycle indicator
            Text("Cycle \(viewModel.cycleCount + 1) of \(viewModel.totalCycles)")
                .font(.slSM)
                .foregroundColor(.textSecondary)

            // Cycle progress dots
            HStack(spacing: SLSpacing.s2) {
                ForEach(0..<viewModel.totalCycles, id: \.self) { i in
                    RoundedRectangle(cornerRadius: 3)
                        .fill(i <= viewModel.cycleCount ? Color.clarityTeal : Color.elevation2)
                        .frame(width: 28, height: 6)
                }
            }

            // Pause button
            Button(action: {
                viewModel.stop()
                dismiss()
            }) {
                HStack(spacing: SLSpacing.s2) {
                    Image(systemName: "pause.fill")
                    Text("Pause")
                }
                .font(.slSM)
                .foregroundColor(.textSecondary)
            }
            .padding(.bottom, SLSpacing.s8)
        }
    }

    // MARK: - Box Path

    private var boxPathView: some View {
        let boxSize: CGFloat = 220
        let cr: CGFloat = 32

        return ZStack {
            // Corner labels (positioned outside box, colored per-phase)
            boxLabels(boxSize: boxSize)

            // Background rounded rect (dim gray)
            RoundedRectangle(cornerRadius: cr)
                .stroke(Color.textTertiary.opacity(0.2), lineWidth: 3)
                .frame(width: boxSize, height: boxSize)

            // Colored path segments (completed + active)
            coloredPathSegments(boxSize: boxSize, cr: cr)

            // Center content
            VStack(spacing: SLSpacing.s1) {
                Text(secondsRemaining)
                    .font(.system(size: 48, weight: .bold, design: .monospaced))
                    .foregroundColor(.clarityTeal)
                Text(phaseLabels[currentPhaseIndex])
                    .font(.slSM)
                    .fontWeight(.semibold)
                    .foregroundColor(phaseColors[currentPhaseIndex])
            }

            // Traveling dot
            travelingDot(boxSize: boxSize, cr: cr)
        }
    }

    // MARK: - Colored Path Segments

    private func coloredPathSegments(boxSize: CGFloat, cr: CGFloat) -> some View {
        let phase = currentPhaseIndex
        let progress = CGFloat(viewModel.progress)

        return ZStack {
            ForEach(0..<4, id: \.self) { side in
                if side < phase {
                    // Completed side — full color
                    BoxPerimeter(cornerRadius: cr)
                        .trim(from: CGFloat(side) * 0.25, to: CGFloat(side + 1) * 0.25)
                        .stroke(phaseColors[side], style: StrokeStyle(lineWidth: 4, lineCap: .round))
                        .shadow(color: phaseColors[side].opacity(0.5), radius: 6)
                        .frame(width: boxSize, height: boxSize)
                } else if side == phase {
                    // Active side — partial color
                    BoxPerimeter(cornerRadius: cr)
                        .trim(from: CGFloat(side) * 0.25, to: CGFloat(side) * 0.25 + progress * 0.25)
                        .stroke(phaseColors[side], style: StrokeStyle(lineWidth: 4, lineCap: .round))
                        .shadow(color: phaseColors[side].opacity(0.5), radius: 6)
                        .frame(width: boxSize, height: boxSize)
                }
                // Future sides: no overlay (gray background shows through)
            }
        }
    }

    // MARK: - Corner Labels

    private func boxLabels(boxSize: CGFloat) -> some View {
        let phase = currentPhaseIndex

        return ZStack {
            // Top: Breathe In
            Text("Breathe In")
                .font(.system(size: 13, weight: phase == 0 ? .bold : .regular))
                .foregroundColor(phase == 0 ? phaseColors[0] : .textTertiary.opacity(0.4))
                .offset(y: -(boxSize / 2 + 18))

            // Right: Hold
            Text("Hold")
                .font(.system(size: 13, weight: phase == 1 ? .bold : .regular))
                .foregroundColor(phase == 1 ? phaseColors[1] : .textTertiary.opacity(0.4))
                .rotationEffect(.degrees(90))
                .offset(x: boxSize / 2 + 18)

            // Bottom: Breathe Out
            Text("Breathe Out")
                .font(.system(size: 13, weight: phase == 2 ? .bold : .regular))
                .foregroundColor(phase == 2 ? phaseColors[2] : .textTertiary.opacity(0.4))
                .offset(y: boxSize / 2 + 18)

            // Left: Hold
            Text("Hold")
                .font(.system(size: 13, weight: phase == 3 ? .bold : .regular))
                .foregroundColor(phase == 3 ? phaseColors[3] : .textTertiary.opacity(0.4))
                .rotationEffect(.degrees(-90))
                .offset(x: -(boxSize / 2 + 18))
        }
        .animation(.easeInOut(duration: 0.3), value: phase)
    }

    // MARK: - Traveling Dot

    private func travelingDot(boxSize: CGFloat, cr: CGFloat) -> some View {
        let half = boxSize / 2
        let progress = CGFloat(viewModel.progress)
        let phase = currentPhaseIndex
        let color = phaseColors[phase]

        let pos = perimeterPoint(side: phase, progress: progress, half: half, cr: cr)

        return ZStack {
            // Outer glow
            Circle()
                .fill(color.opacity(0.3))
                .frame(width: 30, height: 30)
                .blur(radius: 5)
            // Dot body
            Circle()
                .fill(color)
                .frame(width: 18, height: 18)
            // Inner highlight
            Circle()
                .fill(Color.white.opacity(0.5))
                .frame(width: 7, height: 7)
        }
        .offset(x: pos.x, y: pos.y)
    }

    // MARK: - Gentle Onset Offer

    private var gentleOnsetOffer: some View {
        VStack(spacing: SLSpacing.s8) {
            Spacer()

            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 64))
                .foregroundColor(.fluencyGreen)

            Text("Nice work.")
                .font(.sl2XL)
                .foregroundColor(.textPrimary)

            Text("Feeling calmer? Try a quick gentle onset exercise.")
                .font(.slBase)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, SLSpacing.s8)

            Spacer()

            VStack(spacing: SLSpacing.s3) {
                Button(action: {
                    dismiss()
                }) {
                    Text("Gentle Onset Quick Practice")
                }
                .buttonStyle(SLPrimaryButtonStyle())

                Button("I'm Good, Thanks") {
                    viewModel.stop()
                    dismiss()
                }
                .font(.slSM)
                .foregroundColor(.textSecondary)
            }
            .padding(.horizontal, SLSpacing.s4)
            .padding(.bottom, SLSpacing.s8)
        }
    }

    // MARK: - Helpers

    private var currentPhaseIndex: Int {
        switch viewModel.currentPhase {
        case .inhale: return 0
        case .holdIn: return 1
        case .exhale: return 2
        case .holdOut: return 3
        }
    }

    private var secondsRemaining: String {
        let remaining = Int(ceil(viewModel.currentPhase.duration * (1 - viewModel.progress)))
        return "\(max(remaining, 0))"
    }

    /// Compute the XY position on the rounded-rect perimeter for a given side and progress.
    private func perimeterPoint(side: Int, progress: CGFloat, half: CGFloat, cr: CGFloat) -> CGPoint {
        let straight = 2 * half - 2 * cr
        let arcLen = CGFloat.pi / 2 * cr
        let sideLen = straight + arcLen
        let straightFrac = straight / sideLen
        let p = progress

        switch side {
        case 0: // Top: left → right, then top-right arc
            if p <= straightFrac {
                let t = p / straightFrac
                return CGPoint(x: -half + cr + t * straight, y: -half)
            } else {
                let t = (p - straightFrac) / (1 - straightFrac)
                let angle = -CGFloat.pi / 2 + t * CGFloat.pi / 2
                return CGPoint(
                    x: half - cr + cr * cos(angle),
                    y: -half + cr + cr * sin(angle)
                )
            }

        case 1: // Right: top → bottom, then bottom-right arc
            if p <= straightFrac {
                let t = p / straightFrac
                return CGPoint(x: half, y: -half + cr + t * straight)
            } else {
                let t = (p - straightFrac) / (1 - straightFrac)
                let angle = t * CGFloat.pi / 2
                return CGPoint(
                    x: half - cr + cr * cos(angle),
                    y: half - cr + cr * sin(angle)
                )
            }

        case 2: // Bottom: right → left, then bottom-left arc
            if p <= straightFrac {
                let t = p / straightFrac
                return CGPoint(x: half - cr - t * straight, y: half)
            } else {
                let t = (p - straightFrac) / (1 - straightFrac)
                let angle = CGFloat.pi / 2 + t * CGFloat.pi / 2
                return CGPoint(
                    x: -half + cr + cr * cos(angle),
                    y: half - cr + cr * sin(angle)
                )
            }

        case 3: // Left: bottom → top, then top-left arc
            if p <= straightFrac {
                let t = p / straightFrac
                return CGPoint(x: -half, y: half - cr - t * straight)
            } else {
                let t = (p - straightFrac) / (1 - straightFrac)
                let angle = CGFloat.pi + t * CGFloat.pi / 2
                return CGPoint(
                    x: -half + cr + cr * cos(angle),
                    y: -half + cr + cr * sin(angle)
                )
            }

        default:
            return .zero
        }
    }
}

// MARK: - Box Perimeter Shape (for trim-based segment rendering)

/// A rounded rectangle perimeter path starting from the top-left tangent point,
/// going clockwise. Each quarter (0–0.25, 0.25–0.5, etc.) maps to one side.
private struct BoxPerimeter: Shape {
    var cornerRadius: CGFloat

    func path(in rect: CGRect) -> Path {
        let cr = cornerRadius
        var p = Path()

        // Start at top-left tangent (beginning of top straight edge)
        p.move(to: CGPoint(x: rect.minX + cr, y: rect.minY))

        // Top straight → top-right arc
        p.addLine(to: CGPoint(x: rect.maxX - cr, y: rect.minY))
        p.addArc(
            center: CGPoint(x: rect.maxX - cr, y: rect.minY + cr),
            radius: cr, startAngle: .degrees(-90), endAngle: .degrees(0), clockwise: false
        )

        // Right straight → bottom-right arc
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - cr))
        p.addArc(
            center: CGPoint(x: rect.maxX - cr, y: rect.maxY - cr),
            radius: cr, startAngle: .degrees(0), endAngle: .degrees(90), clockwise: false
        )

        // Bottom straight → bottom-left arc
        p.addLine(to: CGPoint(x: rect.minX + cr, y: rect.maxY))
        p.addArc(
            center: CGPoint(x: rect.minX + cr, y: rect.maxY - cr),
            radius: cr, startAngle: .degrees(90), endAngle: .degrees(180), clockwise: false
        )

        // Left straight → top-left arc
        p.addLine(to: CGPoint(x: rect.minX, y: rect.minY + cr))
        p.addArc(
            center: CGPoint(x: rect.minX + cr, y: rect.minY + cr),
            radius: cr, startAngle: .degrees(180), endAngle: .degrees(270), clockwise: false
        )

        return p
    }
}
