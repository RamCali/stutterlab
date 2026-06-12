import StoreKit
import SwiftUI

// MARK: - Trial Reminder View
// Shown after user taps "Try 7 Days Free" — confirms trial timeline before purchase.

struct TrialReminderView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @Environment(\.dismiss) private var dismiss

    let product: Product

    @State private var purchaseInProgress = false
    @State private var error: String?

    private var storeKit: StoreKitService { appViewModel.storeKitService }

    // MARK: - Timeline Data

    private struct TimelineItem {
        let icon: String
        let iconColor: Color
        let circleFill: Color
        let circleBorder: Color
        let title: String
        let description: String
    }

    private let items: [TimelineItem] = [
        TimelineItem(
            icon: "checkmark",
            iconColor: .fluencyGreen,
            circleFill: .fluencyGreen.opacity(0.15),
            circleBorder: .fluencyGreen,
            title: "Today",
            description: "Enjoy unlimited access in your Pro plan!"
        ),
        TimelineItem(
            icon: "bell.fill",
            iconColor: .textSecondary,
            circleFill: Color.white.opacity(0.05),
            circleBorder: Color.white.opacity(0.25),
            title: "On Day 5",
            description: "You'll be reminded before your trial ends."
        ),
        TimelineItem(
            icon: "suit.diamond.fill",
            iconColor: .clarityTeal,
            circleFill: Color.white.opacity(0.05),
            circleBorder: Color.white.opacity(0.25),
            title: "On Day 7",
            description: "You'll be charged. Cancel at any time."
        ),
    ]

    // Layout constants
    private let circleSize: CGFloat = 48
    private let connectorHeight: CGFloat = 52

    // MARK: - Body

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            VStack(spacing: 0) {
                backButton
                Spacer()
                titleBlock
                Spacer()
                timeline
                    .padding(.horizontal, SLSpacing.s8)
                Spacer()
                Spacer()
                ctaSection
            }
        }
    }

    // MARK: - Sub-views

    private var backButton: some View {
        HStack {
            Button(action: { dismiss() }) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.textPrimary)
                    .padding(SLSpacing.s3)
            }
            Spacer()
        }
        .padding(.horizontal, SLSpacing.s4)
        .padding(.top, SLSpacing.s3)
    }

    private var titleBlock: some View {
        Text("We'll Remind You 2 Days\nBefore Your Trial Ends")
            .font(.sl2XL)
            .foregroundColor(.textPrimary)
            .multilineTextAlignment(.center)
            .padding(.horizontal, SLSpacing.s5)
    }

    private var timeline: some View {
        HStack(alignment: .top, spacing: SLSpacing.s5) {
            iconColumn
            textColumn
        }
    }

    private var iconColumn: some View {
        VStack(spacing: 0) {
            ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                ZStack {
                    Circle().fill(item.circleFill)
                    Circle().stroke(item.circleBorder, lineWidth: 2)
                    Image(systemName: item.icon)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(item.iconColor)
                }
                .frame(width: circleSize, height: circleSize)

                if index < items.count - 1 {
                    Rectangle()
                        .fill(Color.white.opacity(0.18))
                        .frame(width: 2, height: connectorHeight)
                }
            }
        }
        .frame(width: circleSize)
    }

    private var textColumn: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                VStack(alignment: .leading, spacing: SLSpacing.s1) {
                    Text(item.title)
                        .font(.slLG)
                        .foregroundColor(.textPrimary)
                    Text(item.description)
                        .font(.slBase)
                        .foregroundColor(.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .frame(
                    height: index < items.count - 1 ? circleSize + connectorHeight : circleSize,
                    alignment: .top
                )
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var ctaSection: some View {
        VStack(spacing: SLSpacing.s3) {
            if let error {
                Text(error)
                    .font(.slXS)
                    .foregroundColor(.sunsetAmber)
                    .multilineTextAlignment(.center)
            }

            Button(action: startTrial) {
                if purchaseInProgress {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .obsidianNight))
                        .frame(height: 20)
                } else {
                    Text("Start Free Trial")
                }
            }
            .buttonStyle(SLPrimaryButtonStyle())
            .slHaptic(.heavy)
            .disabled(purchaseInProgress)
        }
        .padding(.horizontal, SLSpacing.s5)
        .padding(.bottom, SLSpacing.s8)
    }

    // MARK: - Actions

    private func startTrial() {
        purchaseInProgress = true
        Task {
            do {
                let success = try await storeKit.purchase(product)
                if success { dismiss() }
            } catch {
                self.error = error.localizedDescription
            }
            purchaseInProgress = false
        }
    }
}
