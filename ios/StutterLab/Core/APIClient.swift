import Foundation

// MARK: - API Error

enum APIError: LocalizedError {
    case unauthorized
    case serverError(Int, String?)
    case networkError(Error)
    case decodingError(Error)
    case noData

    var errorDescription: String? {
        switch self {
        case .unauthorized:
            return "Please sign in again."
        case .serverError(let code, let message):
            return message ?? "Server error (\(code))"
        case .networkError(let error):
            return error.localizedDescription
        case .decodingError(let error):
            return "Data error: \(error.localizedDescription)"
        case .noData:
            return "No data received."
        }
    }
}

// MARK: - API Client

/// Central HTTP client for all Vercel backend communication.
/// Uses Bearer token auth stored in Keychain.
final class APIClient: Sendable {

    static let shared = APIClient()

    private let baseURL = SLConfig.baseURL
    private let session: URLSession

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .iso8601
        return d
    }()

    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.dateEncodingStrategy = .iso8601
        return e
    }()

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        session = URLSession(configuration: config)
    }

    // MARK: - Token (Keychain-backed)

    var token: String? {
        get { KeychainService.loadString(forKey: SLConfig.tokenKey) }
        set {
            if let newValue {
                KeychainService.saveString(newValue, forKey: SLConfig.tokenKey)
            } else {
                KeychainService.delete(key: SLConfig.tokenKey)
            }
        }
    }

    var isAuthenticated: Bool {
        token != nil
    }

    func clearAuth() {
        token = nil
        KeychainService.delete(key: SLConfig.userKey)
    }

    // MARK: - HTTP Methods

    func get<T: Decodable>(_ path: String, queryItems: [URLQueryItem]? = nil) async throws -> T {
        let request = try buildRequest(method: "GET", path: path, queryItems: queryItems)
        return try await execute(request)
    }

    func post<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        var request = try buildRequest(method: "POST", path: path)
        request.httpBody = try encoder.encode(body)
        return try await execute(request)
    }

    func postVoid<B: Encodable>(_ path: String, body: B) async throws {
        var request = try buildRequest(method: "POST", path: path)
        request.httpBody = try encoder.encode(body)
        try await executeVoid(request)
    }

    func put<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        var request = try buildRequest(method: "PUT", path: path)
        request.httpBody = try encoder.encode(body)
        return try await execute(request)
    }

    func putVoid<B: Encodable>(_ path: String, body: B) async throws {
        var request = try buildRequest(method: "PUT", path: path)
        request.httpBody = try encoder.encode(body)
        try await executeVoid(request)
    }

    // MARK: - Request Building

    private func buildRequest(
        method: String,
        path: String,
        queryItems: [URLQueryItem]? = nil
    ) throws -> URLRequest {
        var components = URLComponents(
            url: baseURL.appendingPathComponent(path),
            resolvingAgainstBaseURL: false
        )!
        if let queryItems, !queryItems.isEmpty {
            components.queryItems = queryItems
        }

        guard let url = components.url else {
            throw APIError.networkError(URLError(.badURL))
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        return request
    }

    // MARK: - Execution

    private func execute<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await performRequest(request)

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    private func executeVoid(_ request: URLRequest) async throws {
        _ = try await performRequest(request)
    }

    private func performRequest(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        let data: Data
        let response: URLResponse

        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.noData
        }

        if httpResponse.statusCode == 401 {
            throw APIError.unauthorized
        }

        if httpResponse.statusCode >= 400 {
            let errorMessage = try? decoder.decode(ErrorResponse.self, from: data)
            throw APIError.serverError(httpResponse.statusCode, errorMessage?.error)
        }

        return (data, httpResponse)
    }
}

// MARK: - Error Response

private struct ErrorResponse: Decodable {
    let error: String
}
