import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_field_app/data/models/user.dart';

class AuthRepository {
  final Dio _dio;
  final FlutterSecureStorage _storage;
  
  static const String _accessTokenKey = 'access_token';
  static const String _userKey = 'user_data';

  AuthRepository(this._dio, this._storage);

  Future<User?> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login/', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final accessToken = response.data['accessToken'];
        final userData = response.data['user'];
        
        await _storage.write(key: _accessTokenKey, value: accessToken);
        
        if (userData != null) {
          return User.fromJson(userData as Map<String, dynamic>);
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _userKey);
  }

  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: _accessTokenKey);
    return token != null && token.isNotEmpty;
  }
}
