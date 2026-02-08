import SwiftUI

// MARK: - Root Navigation (Auth Gate)

struct ContentView: View {
    @EnvironmentObject var appViewModel: AppViewModel

    var body: some View {
        Group {
            if appViewModel.isLoading {
                loadingView
            } else if !appViewModel.isAuthenticated {
                AuthView()
            } else if !appViewModel.onboardingCompleted {
                OnboardingFlow()
            } else {
                MainTabView()
            }
        }
        .background(Color.obsidianNight)
    }

    private var loadingView: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()
            VStack(spacing: SLSpacing.s4) {
                Text("StutterLab")
                    .font(.sl2XL)
                    .foregroundColor(.clarityTeal)
                Text("The Science of Happy Talking.")
                    .font(.system(size: 14, weight: .light, design: .serif))
                    .italic()
                    .foregroundColor(.textSecondary)
            }
        }
    }
}

// MARK: - Main Tab View

struct MainTabView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @State private var selectedTab = 0
    @State private var showPanicButton = false

    var body: some View {
        ZStack {
            TabView(selection: $selectedTab) {
                HomeView()
                    .tabItem {
                        Image(systemName: "house.fill")
                        Text("Home")
                    }
                    .tag(0)

                ScenarioPickerView()
                    .tabItem {
                        Image(systemName: "bubble.left.and.text.bubble.right.fill")
                        Text("Practice")
                    }
                    .tag(1)

                StutterLabProgressView()
                    .tabItem {
                        Image(systemName: "chart.line.uptrend.xyaxis")
                        Text("Progress")
                    }
                    .tag(2)

                ProfileView()
                    .tabItem {
                        Image(systemName: "person.fill")
                        Text("Profile")
                    }
                    .tag(3)
            }
            .tint(.fluencyGreen)

            // Panic Button FAB — always visible
            PanicButtonView()
        }
    }
}

// MARK: - Profile View (placeholder)

struct ProfileView: View {
    @EnvironmentObject var appViewModel: AppViewModel

    var body: some View {
        NavigationStack {
            ZStack {
                Color.obsidianNight.ignoresSafeArea()
                VStack(spacing: SLSpacing.s6) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.clarityTeal)

                    Text(appViewModel.userProfile?.name ?? "User")
                        .font(.slXL)
                        .foregroundColor(.textPrimary)

                    Text("Day \(appViewModel.userProfile?.currentDay ?? 1) of 90")
                        .font(.slSM)
                        .foregroundColor(.textSecondary)

                    Spacer()

                    Button(action: {
                        try? appViewModel.authService.signOut()
                    }) {
                        Text("Sign Out")
                            .font(.slBase)
                            .foregroundColor(.sunsetAmber)
                            .padding(.horizontal, SLSpacing.s6)
                            .padding(.vertical, SLSpacing.s3)
                            .background(Color.sunsetAmber.opacity(0.1))
                            .cornerRadius(SLRadius.md)
                    }

                    Spacer()
                }
                .padding(SLSpacing.s6)
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
