import SwiftUI

// MARK: - Fluency Gauge

/// Circular gauge displaying a 0-100 fluency score with color zones.
struct FluencyGauge: View {
    let score: Double
    let label: String
    var size: CGFloat = 120

    @State private var animatedScore: Double = 0

    private var color: Color {
        if animatedScore >= 80 { return .fluencyGreen }
        if animatedScore >= 60 { return .clarityTeal }
        if animatedScore >= 40 { return .sunsetAmber }
        return Color(hex: "FF6B6B")
    }

    private var severity: String {
        if score >= 80 { return "Excellent" }
        if score >= 60 { return "Good" }
        if score >= 40 { return "Fair" }
        return "Needs Work"
    }

    var body: some View {
        VStack(spacing: SLSpacing.s2) {
            ZStack {
                // Ambient glow behind gauge
                GlowCircle(color: color, size: size * 1.2, blur: size * 0.3)

                // Background ring
                Circle()
                    .stroke(Color.elevation2, lineWidth: 8)
                    .frame(width: size, height: size)

                // Score ring
                Circle()
                    .trim(from: 0, to: animatedScore / 100)
                    .stroke(
                        color,
                        style: StrokeStyle(lineWidth: 8, lineCap: .round)
                    )
                    .frame(width: size, height: size)
                    .rotationEffect(.degrees(-90))

                // Score text
                VStack(spacing: 2) {
                    Text("\(Int(animatedScore))")
                        .font(.system(size: size * 0.3, weight: .bold, design: .rounded))
                        .foregroundColor(color)
                    Text(severity)
                        .font(.system(size: size * 0.1))
                        .foregroundColor(.textSecondary)
                }
            }

            Text(label)
                .font(.slXS)
                .foregroundColor(.textTertiary)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 1.0)) {
                animatedScore = score
            }
        }
    }
}

// MARK: - Metric Card

/// Reusable card for displaying a single speech metric.
struct MetricCard: View {
    let icon: String
    let title: String
    let value: String
    let subtitle: String
    var color: Color = .clarityTeal
    var trend: MetricTrend? = nil

    enum MetricTrend {
        case up, down, stable
        var icon: String {
            switch self {
            case .up: return "arrow.up.right"
            case .down: return "arrow.down.right"
            case .stable: return "arrow.right"
            }
        }
        var color: Color {
            switch self {
            case .up: return .fluencyGreen
            case .down: return Color(hex: "FF6B6B")
            case .stable: return .textTertiary
            }
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: SLSpacing.s2) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundColor(color)
                Spacer()
                if let trend {
                    Image(systemName: trend.icon)
                        .font(.system(size: 10))
                        .foregroundColor(trend.color)
                }
            }

            Text(value)
                .font(.sl2XL)
                .foregroundColor(color)

            Text(title)
                .font(.slXS)
                .fontWeight(.medium)
                .foregroundColor(.textPrimary)

            Text(subtitle)
                .font(.system(size: 10))
                .foregroundColor(.textTertiary)
                .lineLimit(2)
        }
        .slCard(padding: SLSpacing.s3)
    }
}

// MARK: - XP Progress Bar

struct XPProgressBar: View {
    let currentXP: Int
    let levelXP: Int
    let nextLevelXP: Int
    let level: Int
    let levelTitle: String

    private var progress: Double {
        guard nextLevelXP > levelXP else { return 1.0 }
        return Double(currentXP - levelXP) / Double(nextLevelXP - levelXP)
    }

    var body: some View {
        VStack(spacing: SLSpacing.s2) {
            HStack {
                Text("Level \(level)")
                    .font(.slXS)
                    .fontWeight(.semibold)
                    .foregroundColor(.sunsetAmber)
                Text(levelTitle)
                    .font(.slXS)
                    .foregroundColor(.textSecondary)
                Spacer()
                Text("\(currentXP - levelXP) / \(nextLevelXP - levelXP) XP")
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
            }

            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.elevation2)
                        .frame(height: 6)

                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.sunsetAmber)
                        .frame(width: geometry.size.width * progress, height: 6)
                }
            }
            .frame(height: 6)
        }
    }
}
