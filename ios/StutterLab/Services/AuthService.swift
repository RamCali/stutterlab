import AuthenticationServices
import CryptoKit
import Foundation

// MARK: - Auth Service (BFF — no Firebase)

@MainActor
final class AuthService: ObservableObject {

    @Published var currentUser: AuthUser?
    @Published var isAuthenticated = false
    @Published var isLoading = true

    private var currentNonce: String?

    // MARK: - Auth User

    struct AuthUser: Codable {
        let id: String
        let name: String?
        let email: String?
        let image: String?
    }

    // MARK: - Init

    init() {
        Task {
            await checkExistingSession()
            isLoading = false
        }
    }

    // MARK: - Check Existing Session

    private func checkExistingSession() async {
        guard APIClient.shared.isAuthenticated else { return }

        // Load cached user while we validate the token
        if let cached: AuthUser = KeychainService.loadCodable(forKey: SLConfig.userKey) {
            currentUser = cached
            isAuthenticated = true
        }

        // Validate token by fetching profile
        do {
            let profile: ProfileResponse = try await APIClient.shared.get("/api/mobile/profile")
            let user = AuthUser(
                id: profile.id,
                name: profile.name,
                email: profile.email,
                image: profile.image
            )
            currentUser = user
            isAuthenticated = true
            KeychainService.saveCodable(user, forKey: SLConfig.userKey)
        } catch {
            #if DEBUG
            // In debug, keep cached session if server is unreachable (offline dev mode)
            if currentUser != nil {
                print("⚠️ Server unreachable — keeping cached dev session")
                return
            }
            #endif
            // Token expired or invalid — clear session
            APIClient.shared.clearAuth()
            currentUser = nil
            isAuthenticated = false
        }
    }

    // MARK: - Apple Sign-In

    /// Prepare a SHA256 nonce for Apple Sign-In.
    func prepareAppleSignIn() -> String {
        let nonce = randomNonceString()
        currentNonce = nonce
        return sha256(nonce)
    }

    /// Complete Apple Sign-In by sending the identity token to our backend.
    func signInWithApple(authorization: ASAuthorization) async throws {
        guard let appleCredential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityToken = appleCredential.identityToken,
              let tokenString = String(data: identityToken, encoding: .utf8)
        else {
            throw AuthError.invalidCredential
        }

        // Apple only provides the name on FIRST sign-in
        let fullName = appleCredential.fullName
        let name = [fullName?.givenName, fullName?.familyName]
            .compactMap { $0 }
            .joined(separator: " ")

        try await authenticateWithBackend(
            provider: "apple",
            identityToken: tokenString,
            name: name.isEmpty ? nil : name
        )
    }

    // MARK: - Dev Login (DEBUG only)

    #if DEBUG
    func devLogin() async throws {
        // Try server first; fall back to offline mock if unreachable
        do {
            let response: AuthResponse = try await APIClient.shared.post(
                "/api/mobile/auth",
                body: DevAuthRequest(provider: "dev", identityToken: "dev", name: "Dev Tester", email: "tester@stutterlab.dev")
            )
            APIClient.shared.token = response.token
            currentUser = response.user
            isAuthenticated = true
            KeychainService.saveCodable(response.user, forKey: SLConfig.userKey)
        } catch {
            print("⚠️ Server unreachable — using offline dev login")
            let mockUser = AuthUser(
                id: "dev-\(UUID().uuidString.prefix(8))",
                name: "Dev Tester",
                email: "tester@stutterlab.dev",
                image: nil
            )
            // Use a stable offline token so APIClient.isAuthenticated returns true
            APIClient.shared.token = "offline-dev-token"
            currentUser = mockUser
            isAuthenticated = true
            KeychainService.saveCodable(mockUser, forKey: SLConfig.userKey)
        }
    }
    #endif

    // MARK: - Google Sign-In (future)

    func signInWithGoogle(identityToken: String, name: String? = nil) async throws {
        try await authenticateWithBackend(
            provider: "google",
            identityToken: identityToken,
            name: name
        )
    }

    // MARK: - Backend Authentication

    private func authenticateWithBackend(
        provider: String,
        identityToken: String,
        name: String?
    ) async throws {
        let response: AuthResponse = try await APIClient.shared.post(
            "/api/mobile/auth",
            body: AuthRequest(provider: provider, identityToken: identityToken, name: name)
        )

        // Store JWT token
        APIClient.shared.token = response.token

        // Update state
        currentUser = response.user
        isAuthenticated = true
        KeychainService.saveCodable(response.user, forKey: SLConfig.userKey)
    }

    // MARK: - Sign Out

    func signOut() {
        APIClient.shared.clearAuth()
        currentUser = nil
        isAuthenticated = false
    }

    // MARK: - Helpers

    private func randomNonceString(length: Int = 32) -> String {
        precondition(length > 0)
        var randomBytes = [UInt8](repeating: 0, count: length)
        let errorCode = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
        guard errorCode == errSecSuccess else {
            fatalError("Unable to generate nonce. SecRandomCopyBytes failed with OSStatus \(errorCode)")
        }
        let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        return String(randomBytes.map { charset[Int($0) % charset.count] })
    }

    private func sha256(_ input: String) -> String {
        let data = Data(input.utf8)
        let hash = SHA256.hash(data: data)
        return hash.compactMap { String(format: "%02x", $0) }.joined()
    }

    enum AuthError: LocalizedError {
        case invalidCredential

        var errorDescription: String? {
            "Invalid Apple Sign-In credential."
        }
    }
}

// MARK: - API DTOs

struct AuthRequest: Encodable {
    let provider: String
    let identityToken: String
    let name: String?
}

#if DEBUG
struct DevAuthRequest: Encodable {
    let provider: String
    let identityToken: String
    let name: String
    let email: String
}
#endif

struct AuthResponse: Decodable {
    let token: String
    let expiresAt: String
    let user: AuthService.AuthUser
}

struct ProfileResponse: Decodable {
    let id: String
    let name: String?
    let email: String?
    let image: String?
    let onboardingCompleted: Bool
    let severity: String?
    let goals: [String]?
    let currentDay: Int
    let currentStreak: Int
    let longestStreak: Int
    let totalXp: Int
    let level: Int
    let totalPracticeSeconds: Int
    let totalExercisesCompleted: Int
    let subscriptionPlan: String
    let subscriptionStatus: String
    let lastPracticeDate: String?
    let northStarGoal: String?
    let speechChallenges: [String]?
}
