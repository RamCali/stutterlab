import AppIntents
import SwiftUI

@available(iOS 16.0, *)
struct QuickCalmIntent: AppIntent {
    static var title: LocalizedStringResource = "Quick Calm"
    static var description = IntentDescription("Open StutterLab box breathing before you speak.")
    static var openAppWhenRun: Bool = true

    func perform() async throws -> some IntentResult {
        .result()
    }
}

@available(iOS 16.0, *)
struct StutterLabShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: QuickCalmIntent(),
            phrases: [
                "Quick Calm in \(.applicationName)",
                "I'm about to speak with \(.applicationName)",
            ],
            shortTitle: "Quick Calm",
            systemImageName: "wind"
        )
    }
}
