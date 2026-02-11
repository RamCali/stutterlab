import Foundation

enum SLConfig {
    #if DEBUG
    static let baseURL = URL(string: "http://localhost:3000")!
    #else
    static let baseURL = URL(string: "https://stutterlab.vercel.app")!
    #endif

    static let keychainService = "com.stutterlab.auth"
    static let tokenKey = "auth_token"
    static let userKey = "user_data"
    static let bundleID = Bundle.main.bundleIdentifier ?? "com.stutterlab.app"
}
