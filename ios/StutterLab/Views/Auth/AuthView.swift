import AuthenticationServices
import SwiftUI

// MARK: - Auth View (Sign In Screen)

struct AuthView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @State private var error: String?
    @State private var glowPulse = false

    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                colors: [Color(hex: "0F2027"), Color.obsidianNight],
                startPoint: .top,
                endPoint: .bottom
            ).ignoresSafeArea()

            VStack(spacing: SLSpacing.s8) {
                Spacer()

                // Logo with glow
                VStack(spacing: SLSpacing.s4) {
                    ZStack {
                        GlowCircle(color: .clarityTeal, size: 140, blur: 40)

                        Image(systemName: "waveform.path")
                            .font(.system(size: 64))
                            .foregroundStyle(Color.tealGradient)
                    }

                    Text("StutterLab")
                        .font(.sl3XL)
                        .foregroundColor(.textPrimary)
                        .tracking(SLLetterSpacing.tight)

                    Text("The Science of Happy Talking.")
                        .font(.system(size: 16, weight: .light, design: .serif))
                        .italic()
                        .foregroundColor(.textSecondary)
                }
                .slEntrance(delay: 0.2)

                Spacer()

                // Sign-in section
                VStack(spacing: SLSpacing.s5) {
                    // Evidence callout
                    VStack(spacing: SLSpacing.s2) {
                        Text("Evidence-based stuttering treatment")
                            .font(.slSM)
                            .foregroundColor(.textSecondary)
                        Text("Effect sizes d = 0.75–1.63")
                            .font(.slXS)
                            .fontWeight(.medium)
                            .foregroundColor(.clarityTeal)
                    }

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
                    .frame(height: 54)
                    .cornerRadius(SLRadius.md)

                    if let error {
                        Text(error)
                            .font(.slXS)
                            .foregroundColor(.sunsetAmber)
                    }

                    #if DEBUG
                    Button {
                        Task {
                            do {
                                try await appViewModel.authService.devLogin()
                            } catch {
                                self.error = error.localizedDescription
                            }
                        }
                    } label: {
                        Text("Dev Login (Debug Only)")
                    }
                    .buttonStyle(SLSecondaryButtonStyle(color: .clarityTeal))
                    .slHaptic(.light)
                    #endif
                }
                .slCardElevated(radius: SLRadius.lg)
                .padding(.horizontal, SLSpacing.s4)
                .slEntrance(delay: 0.5)

                // Disclaimer
                Text("By signing in, you agree to our Terms of Service and Privacy Policy.")
                    .font(.slXS)
                    .foregroundColor(.textTertiary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, SLSpacing.s8)
                    .padding(.bottom, SLSpacing.s8)
                    .slEntrance(delay: 0.7)
            }
        }
    }
}
