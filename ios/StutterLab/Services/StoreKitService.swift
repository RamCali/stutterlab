import StoreKit
import Foundation

// MARK: - StoreKit 2 Service

@MainActor
final class StoreKitService: ObservableObject {

    @Published var products: [Product] = []
    @Published var isPremium = false
    @Published var purchaseInProgress = false

    // Product identifiers
    static let weeklyID = "com.stutterlab.pro.weekly"
    static let monthlyID = "com.stutterlab.pro.monthly"
    static let annualID = "com.stutterlab.pro.annual"

    private var transactionListener: Task<Void, Error>?

    init() {
        transactionListener = listenForTransactions()
        Task { await checkEntitlements() }
    }

    deinit {
        transactionListener?.cancel()
    }

    // MARK: - Load Products

    func loadProducts() async {
        do {
            let ids: Set<String> = [Self.weeklyID, Self.monthlyID, Self.annualID]
            products = try await Product.products(for: ids)
                .sorted { $0.price < $1.price }
        } catch {
            print("Failed to load products: \(error)")
        }
    }

    // MARK: - Purchase

    func purchase(_ product: Product) async throws -> Bool {
        purchaseInProgress = true
        defer { purchaseInProgress = false }

        let result = try await product.purchase()

        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            await checkEntitlements()
            return true
        case .userCancelled:
            return false
        case .pending:
            return false
        @unknown default:
            return false
        }
    }

    // MARK: - Restore

    func restore() async {
        try? await AppStore.sync()
        await checkEntitlements()
    }

    // MARK: - Entitlements

    func checkEntitlements() async {
        for await result in Transaction.currentEntitlements {
            if let transaction = try? checkVerified(result) {
                if transaction.productID == Self.weeklyID ||
                   transaction.productID == Self.monthlyID ||
                   transaction.productID == Self.annualID {
                    isPremium = true
                    return
                }
            }
        }
        isPremium = false
    }

    // MARK: - Transaction Listener

    private func listenForTransactions() -> Task<Void, Error> {
        Task.detached {
            for await result in Transaction.updates {
                if let transaction = try? self.checkVerified(result) {
                    await transaction.finish()
                    await self.checkEntitlements()
                }
            }
        }
    }

    nonisolated private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw StoreError.failedVerification
        case .verified(let value):
            return value
        }
    }

    enum StoreError: LocalizedError {
        case failedVerification

        var errorDescription: String? {
            "Transaction verification failed."
        }
    }
}
