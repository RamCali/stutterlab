import AuthenticationServices
import SwiftUI

// MARK: - Auth View (Sign In Screen)

struct AuthView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @State private var error: String?

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            VStack(spacing: SLSpacing.s8) {
                Spacer()

                // Logo
                VStack(spacing: SLSpacing.s3) {
                    Image(systemName: "waveform.path")
                        .font(.system(size: 64))
                        .foregroundColor(.clarityTeal)

                    Text("StutterLab")
                        .font(.sl3XL)
                        .foregroundColor(.textPrimary)

                    Text("The Science of Happy Talking.")
                        .font(.system(size: 16, weight: .light, design: .serif))
                        .italic()
                        .foregroundColor(.textSecondary)
                }

                Spacer()

                // Evidence callout
                VStack(spacing: SLSpacing.s2) {
                    Text("Evidence-based stuttering treatment")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                    Text("Effect sizes d = 0.75–1.63")
                        .font(.slXS)
                        .foregroundColor(.clarityTeal)
                }

                Spacer()

                // Sign In with Apple
                SignInWithAppleButton(.signIn) { request in
                    request.requestedScopes = [.fullName, .email]
                    let nonce = appViewModel.authService.prepareAppleSignIn()
                    request.nonce = nonce
                } onCompletion: { result in
                    switch result {
                    case .success(let authorization):
                        Task {
                            do {
                                try await appViewModel.authService.signInWithApple(authorization: authorization)
                            } catch {
                                self.error = error.localizedDescription
                            }
                        }
                    case .failure(let err):
                        self.error = err.localizedDescription
                    }
                }
                .signInWithAppleButtonStyle(.white)
                .frame(height: 50)
                .cornerRadius(SLRadius.md)
                .padding(.horizontal, SLSpacing.s4)

                if let error {
                    Text(error)
                        .font(.slXS)
                        .foregroundColor(.sunsetAmber)
                        .padding(.horizontal, SLSpacing.s4)
                }

                // Disclaimer
                Text("By signing in, you agree to our Terms of Service and Privacy Policy.")
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, SLSpacing.s8)
                    .padding(.bottom, SLSpacing.s8)
            }
        }
    }
}
