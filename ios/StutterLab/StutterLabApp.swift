import FirebaseCore
import SwiftUI

@main
struct StutterLabApp: App {

    @StateObject private var appViewModel = AppViewModel()

    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appViewModel)
                .preferredColorScheme(.dark)
        }
    }
}
