import Foundation
import Security

/// Thread-safe Keychain wrapper for storing auth tokens and user data.
enum KeychainService {

    private static let service = SLConfig.keychainService

    // MARK: - Data

    static func save(key: String, data: Data) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
        ]
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    static func load(key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess else { return nil }
        return result as? Data
    }

    static func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(query as CFDictionary)
    }

    // MARK: - String Convenience

    static func saveString(_ value: String, forKey key: String) {
        guard let data = value.data(using: .utf8) else { return }
        save(key: key, data: data)
    }

    static func loadString(forKey key: String) -> String? {
        guard let data = load(key: key) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    // MARK: - Codable Convenience

    static func saveCodable<T: Encodable>(_ value: T, forKey key: String) {
        guard let data = try? JSONEncoder().encode(value) else { return }
        save(key: key, data: data)
    }

    static func loadCodable<T: Decodable>(forKey key: String) -> T? {
        guard let data = load(key: key) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }
}
