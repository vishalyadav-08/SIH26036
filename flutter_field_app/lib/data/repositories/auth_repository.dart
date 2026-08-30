import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthRepository {
  final Dio _dio;
  final FlutterSecureStorage _storage;
  
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';

  AuthRepository(this._dio, this._storage);

  Future<bool> login(String username, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'username': username,
        'password': password,
      });

      if (response.statusCode == 200) {
        final accessToken = response.data['access'];
        final refreshToken = response.data['refresh'];
        
        await _storage.write(key: _accessTokenKey, value: accessToken);
        await _storage.write(key: _refreshTokenKey, value: refreshToken);
        return true;
      }
      return false;
    } catch (e) {
      // In a real scenario, handle specific DioExceptions
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }

  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: _accessTokenKey);
    return token != null && token.isNotEmpty;
  }
}
