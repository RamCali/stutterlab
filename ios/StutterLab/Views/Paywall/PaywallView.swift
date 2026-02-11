import StoreKit
import SwiftUI

// MARK: - Paywall View

struct PaywallView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var selectedProduct: Product?
    @State private var error: String?

    private var storeKit: StoreKitService { appViewModel.storeKitService }

    var body: some View {
        ZStack {
            Color.obsidianNight.ignoresSafeArea()

            ScrollView {
                VStack(spacing: SLSpacing.s6) {
                    // Header
                    VStack(spacing: SLSpacing.s3) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 48))
                            .foregroundColor(.sunsetAmber)

                        Text("Unlock Your Full Potential")
                            .font(.sl2XL)
                            .foregroundColor(.textPrimary)
                            .multilineTextAlignment(.center)

                        Text("Get access to all 90 days, AI practice, and speech analysis.")
                            .font(.slBase)
                            .foregroundColor(.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, SLSpacing.s4)
                    }
                    .padding(.top, SLSpacing.s8)

                    // Feature comparison
                    featureComparison

                    // Price options
                    VStack(spacing: SLSpacing.s3) {
                        ForEach(storeKit.products, id: \.id) { product in
                            priceOption(product)
                        }
                    }
                    .padding(.horizontal, SLSpacing.s4)

                    // CTA
                    if let product = selectedProduct ?? storeKit.products.last {
                        Button(action: {
                            Task {
                                do {
                                    let success = try await storeKit.purchase(product)
                                    if success { dismiss() }
                                } catch {
                                    self.error = error.localizedDescription
                                }
                            }
                        }) {
                            Text("Try 7 Days Free")
                        }
                        .buttonStyle(SLPrimaryButtonStyle())
                        .slHaptic(.heavy)
                        .padding(.horizontal, SLSpacing.s4)
                        .disabled(storeKit.purchaseInProgress)
                    }

                    if let error {
                        Text(error)
                            .font(.slXS)
                            .foregroundColor(.sunsetAmber)
                    }

                    // Restore
                    Button("Restore Purchases") {
                        Task { await storeKit.restore() }
                    }
                    .font(.slXS)
                    .foregroundColor(.textTertiary)

                    // Dismiss
                    Button("Not Now") { dismiss() }
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                        .padding(.bottom, SLSpacing.s8)
                }
            }
        }
        .task {
            await storeKit.loadProducts()
        }
    }

    // MARK: - Feature Comparison

    private var featureComparison: some View {
        VStack(spacing: SLSpacing.s3) {
            featureRow("Daily exercises (1/day)", free: true, pro: true)
            featureRow("All 90-day curriculum", free: false, pro: true)
            featureRow("AI Situation Simulators", free: false, pro: true)
            featureRow("Speech analysis & fluency score", free: false, pro: true)
            featureRow("Detailed progress charts", free: false, pro: true)
            featureRow("Panic Button (always free)", free: true, pro: true)
        }
        .slCard()
        .padding(.horizontal, SLSpacing.s4)
    }

    private func featureRow(_ feature: String, free: Bool, pro: Bool) -> some View {
        HStack {
            Text(feature)
                .font(.slSM)
                .foregroundColor(.textPrimary)
            Spacer()
            Image(systemName: free ? "checkmark" : "xmark")
                .foregroundColor(free ? .fluencyGreen : .textTertiary)
                .frame(width: 40)
            Image(systemName: pro ? "checkmark" : "xmark")
                .foregroundColor(.fluencyGreen)
                .frame(width: 40)
        }
    }

    // MARK: - Price Option

    private func priceOption(_ product: Product) -> some View {
        let isSelected = selectedProduct?.id == product.id
        let isAnnual = product.id == StoreKitService.annualID

        return Button(action: { selectedProduct = product }) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text(product.displayName)
                            .font(.slBase)
                            .fontWeight(.semibold)
                            .foregroundColor(.textPrimary)
                        if isAnnual {
                            Text("Best Value")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.obsidianNight)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.sunsetAmber)
                                .cornerRadius(4)
                        }
                    }
                    Text(product.displayPrice)
                        .font(.slSM)
                        .foregroundColor(.textSecondary)
                }
                Spacer()
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? .clarityTeal : .textTertiary)
            }
            .padding(0) // padding handled by card modifier
            .modifier(isSelected
                ? SLCardAccentModifier(accentColor: .clarityTeal)
                : SLCardAccentModifier(accentColor: .clear)
            )
        }
    }
}
