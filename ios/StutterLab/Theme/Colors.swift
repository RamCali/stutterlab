import SwiftUI

// MARK: - StutterLab Brand Colors ("The Fluency Flow")

extension Color {
    // Primary Background — High-end tech feel; reduces eye strain
    static let obsidianNight = Color(hex: "0B0E14")
    // Surface / Card — Creates depth for UI elements
    static let deepSlate = Color(hex: "1A1F26")
    // Primary Accent — Calmness, healing, medical precision
    static let clarityTeal = Color(hex: "48C6B3")
    // Secondary Accent — Warmth, happiness, human connection
    static let sunsetAmber = Color(hex: "FFB347")
    // Success / Action — Progress, growth, "go" signals
    static let fluencyGreen = Color(hex: "00E676")

    // MARK: Elevation Overlays (white on #0B0E14)

    static let elevation1 = Color.white.opacity(0.05)  // 1dp — cards at rest
    static let elevation2 = Color.white.opacity(0.07)  // 2dp — raised cards
    static let elevation3 = Color.white.opacity(0.08)  // 3dp — snackbars
    static let elevation4 = Color.white.opacity(0.09)  // 4dp — app bar
    static let elevation6 = Color.white.opacity(0.11)  // 6dp — FAB, bottom nav
    static let elevation8 = Color.white.opacity(0.12)  // 8dp — sheets, menus
    static let elevation12 = Color.white.opacity(0.14) // 12dp — FAB pressed
    static let elevation16 = Color.white.opacity(0.15) // 16dp — modal sheets
    static let elevation24 = Color.white.opacity(0.16) // 24dp — dialogs

    // MARK: Semantic Colors

    static let textPrimary = Color.white
    static let textSecondary = Color.white.opacity(0.6)
    static let textTertiary = Color.white.opacity(0.4)
    static let border = Color.white.opacity(0.06)
}

// MARK: - Hex Initializer

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
