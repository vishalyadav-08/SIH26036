import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_field_app/data/models/business_models.dart';
import 'package:flutter_field_app/providers/providers.dart';

final businessProfileProvider = FutureProvider<BusinessProfile>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/businesses/me/');
  return BusinessProfile.fromJson(response.data);
});

final businessInstrumentsProvider = FutureProvider<List<Instrument>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/instruments/');
  final data = response.data['results'] ?? response.data['items'] ?? response.data;
  return (data as List).map((json) => Instrument.fromJson(json)).toList();
});

final businessApplicationsProvider = FutureProvider<List<VerificationApplication>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/applications/');
  final data = response.data['results'] ?? response.data['items'] ?? response.data;
  return (data as List).map((json) => VerificationApplication.fromJson(json)).toList();
});

final businessCertificatesProvider = FutureProvider<List<Certificate>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/certificates/');
  final data = response.data['results'] ?? response.data['items'] ?? response.data;
  return (data as List).map((json) => Certificate.fromJson(json)).toList();
});
