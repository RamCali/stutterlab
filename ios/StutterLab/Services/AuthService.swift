import AuthenticationServices
import CryptoKit
import FirebaseAuth
import Foundation

// MARK: - Auth Service

@MainActor
final class AuthService: ObservableObject {

    @Published var currentUser: FirebaseAuth.User?
    @Published var isAuthenticated = false
    @Published var isLoading = true

    private var authStateListener: AuthStateDidChangeListenerHandle?
    private var currentNonce: String?

    init() {
        authStateListener = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                self?.currentUser = user
                self?.isAuthenticated = user != nil
                self?.isLoading = false
            }
        }
    }

    deinit {
        if let listener = authStateListener {
            Auth.auth().removeStateDidChangeListener(listener)
        }
    }

    // MARK: - Apple Sign-In

    /// Prepare a nonce for Apple Sign-In.
    func prepareAppleSignIn() -> String {
        let nonce = randomNonceString()
        currentNonce = nonce
        return sha256(nonce)
    }

    /// Complete Apple Sign-In with the ASAuthorization credential.
    func signInWithApple(authorization: ASAuthorization) async throws {
        guard let appleCredential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityToken = appleCredential.identityToken,
              let tokenString = String(data: identityToken, encoding: .utf8),
              let nonce = currentNonce
        else {
            throw AuthError.invalidCredential
        }

        let credential = OAuthProvider.appleCredential(
            withIDToken: tokenString,
            rawNonce: nonce,
            fullName: appleCredential.fullName
        )

        let result = try await Auth.auth().signIn(with: credential)
        currentUser = result.user
    }

    // MARK: - Sign Out

    func signOut() throws {
        try Auth.auth().signOut()
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
            switch self {
            case .invalidCredential:
                return "Invalid Apple Sign-In credential."
            }
        }
    }
}
