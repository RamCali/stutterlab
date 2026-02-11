import SwiftUI

// MARK: - StutterLab Typography

/// Font families: Inter (headers), Roboto (body), Montserrat (tagline)
/// These are Google Fonts — bundle via asset catalog or use system fallbacks.
/// Type scale based on 4px base grid.

enum SLFont {
    // MARK: Headers (Inter Bold 700)

    static func heading(_ size: CGFloat) -> Font {
        .custom("Inter-Bold", size: size, relativeTo: .title)
    }

    // MARK: Body (Roboto Regular 400)

    static func body(_ size: CGFloat) -> Font {
        .custom("Roboto-Regular", size: size, relativeTo: .body)
    }

    // MARK: Tagline (Montserrat Light Italic)

    static func tagline(_ size: CGFloat) -> Font {
        .custom("Montserrat-LightItalic", size: size, relativeTo: .caption)
    }
}

// MARK: - Type Scale (4px base)

extension Font {
    /// 12px — Captions, timestamps, helper text
    static let slXS: Font = SLFont.body(12)
    /// 14px — Labels, secondary text, metadata
    static let slSM: Font = SLFont.body(14)
    /// 16px — Body text, exercise instructions
    static let slBase: Font = SLFont.body(16)
    /// 20px — Subheadings, card titles
    static let slLG: Font = SLFont.heading(20)
    /// 24px — Section headings
    static let slXL: Font = SLFont.heading(24)
    /// 32px — Page titles
    static let sl2XL: Font = SLFont.heading(32)
    /// 40px — Hero headlines, marketing display
    static let sl3XL: Font = SLFont.heading(40)
}

// MARK: - Spacing Scale (4px base)

enum SLSpacing {
    static let xs: CGFloat = 2    // 0.5 — borders, fine adjustments
    static let s1: CGFloat = 4    // 1 — tight inner padding
    static let s2: CGFloat = 8    // 2 — default inner padding
    static let s3: CGFloat = 12   // 3 — compact card padding
    static let s4: CGFloat = 16   // 4 — standard card padding
    static let s5: CGFloat = 20   // 5 — comfortable content padding
    static let s6: CGFloat = 24   // 6 — section padding
    static let s8: CGFloat = 32   // 8 — large section gaps
    static let s10: CGFloat = 40  // 10 — major section breaks
    static let s12: CGFloat = 48  // 12 — page-level vertical spacing
    static let s16: CGFloat = 64  // 16 — hero sections
}

// MARK: - Border Radius

enum SLRadius {
    static let sm: CGFloat = 6    // Subtle — pills, inner elements
    static let md: CGFloat = 16   // Standard cards, buttons
    static let lg: CGFloat = 20   // Hero cards, modals
    static let xl: CGFloat = 24   // Large hero sections
    static let full: CGFloat = 999 // Pills, circles
}

// MARK: - Card Padding

enum SLPadding {
    static let cardInner: CGFloat = 20    // Standard card content padding
    static let cardInnerLarge: CGFloat = 24 // Hero card content padding
    static let sectionGap: CGFloat = 28   // Gap between major sections
}

// MARK: - Letter Spacing

enum SLLetterSpacing {
    static let tight: CGFloat = -0.3   // Large headings
    static let normal: CGFloat = 0     // Body text
    static let wide: CGFloat = 1.2     // Uppercase labels / badges
    static let wider: CGFloat = 2.0    // Section headers uppercase
}
