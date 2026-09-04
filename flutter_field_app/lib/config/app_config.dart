const String apiBaseUrl = 'http://127.0.0.1:8000/api/v1/';

class AppConfig {
  static const bool useMockBackend = bool.fromEnvironment('USE_MOCK_BACKEND', defaultValue: false);
  static const String apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'http://127.0.0.1:8000/api/v1/');
}
