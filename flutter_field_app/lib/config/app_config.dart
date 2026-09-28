const String apiBaseUrl = 'https://sih26036.onrender.com/api/v1/';

class AppConfig {
  static const String apiMode = String.fromEnvironment('API_MODE', defaultValue: 'live');
  static bool get useMockBackend => apiMode == 'mock' || const bool.fromEnvironment('USE_MOCK_BACKEND', defaultValue: false);
  static const String apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'https://sih26036.onrender.com/api/v1/');
}
