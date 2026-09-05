import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_field_app/data/models/models.dart';
import 'package:flutter_field_app/data/models/user.dart';
import 'package:flutter_field_app/data/repositories/inspection_repository.dart';
import 'package:flutter_field_app/data/repositories/auth_repository.dart';
import 'package:flutter_field_app/data/sync_engine.dart';
import 'package:flutter_field_app/config/app_config.dart';

final currentUserProvider = StateProvider<User?>((ref) => null);

final localeProvider = StateProvider<Locale>((ref) {
  return const Locale('en');
});

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));
  final storage = ref.watch(secureStorageProvider);
  
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await storage.read(key: 'access_token');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
    onError: (error, handler) async {
      if (error.response?.statusCode == 401) {
        // Token expired or invalid — clear it so the next launch forces re-login
        await storage.delete(key: 'access_token');
      }
      return handler.next(error);
    }
  ));
  return dio;
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(dioProvider), ref.watch(secureStorageProvider));
});

final repositoryProvider = Provider<InspectionRepository>((ref) {
  return InspectionRepository();
});

final syncEngineProvider = Provider<SyncEngine>((ref) {
  return SyncEngine(ref.watch(dioProvider), ref.watch(repositoryProvider));
});

final inspectionsProvider = StateNotifierProvider<InspectionsNotifier, List<InspectionTask>>((ref) {
  return InspectionsNotifier(ref.watch(repositoryProvider), ref.watch(syncEngineProvider));
});

class InspectionsNotifier extends StateNotifier<List<InspectionTask>> {
  final InspectionRepository _repository;
  final SyncEngine _syncEngine;

  InspectionsNotifier(this._repository, this._syncEngine) : super([]) {
    _loadInspections();
  }

  void _loadInspections() async {
    if (!AppConfig.useMockBackend) {
      await _syncEngine.fetchInspections();
      state = _repository.getAllInspections();
    } else {
      final data = _repository.getAllInspections();
      if (data.isEmpty) {
        _seedDummyData();
      } else {
        state = data;
      }
    }
  }

  void _seedDummyData() {
    if (!AppConfig.useMockBackend) return; // double-check
    final dummy = [
      InspectionTask(
        id: 'demo_task_001',
        appId: 'APP-DEMO-2026-001',
        title: 'Class III Electronic Weighing Scale',
        businessName: 'Demo Retail Grocery (Synthetic)',
        sector: 'Demo District Sector 4',
        status: 'scheduled',
        scheduledTime: 'Today, 10:00 AM',
        urgency: 'normal',
        description: 'Demo Application Ref: DEMO-APP-001. Verification of 30kg commercial retail scale.',
      ),
      InspectionTask(
        id: 'demo_task_002',
        appId: 'APP-DEMO-2026-002',
        title: 'Fuel Dispenser Volumetric Verification',
        businessName: 'Demo Energy Station (Synthetic)',
        sector: 'Demo District Highway',
        status: 'urgent',
        scheduledTime: 'Today, 11:30 AM',
        urgency: 'urgent',
        description: 'Demo Application Ref: DEMO-APP-002. Surprise check of liquid petroleum dispensers.',
      ),
    ];
    for (var task in dummy) {
      _repository.saveInspection(task);
    }
    state = _repository.getAllInspections();
  }

  void addOrUpdateTask(InspectionTask task) {
    _repository.saveInspection(task);
    state = _repository.getAllInspections();
  }

  Future<void> resetDemoData() async {
    if (!AppConfig.useMockBackend) return;
    await _repository.clearAll();
    _seedDummyData();
  }
}

final templatesProvider = StateNotifierProvider<TemplatesNotifier, List<InspectionTemplate>>((ref) {
  return TemplatesNotifier(ref.watch(repositoryProvider));
});

class TemplatesNotifier extends StateNotifier<List<InspectionTemplate>> {
  final InspectionRepository _repository;

  TemplatesNotifier(this._repository) : super([]) {
    _loadTemplates();
  }

  void _loadTemplates() {
    final data = _repository.getAllTemplates();
    if (data.isEmpty && AppConfig.useMockBackend) {
      _seedDummyData();
    } else {
      state = data;
    }
  }

  void _seedDummyData() {
    if (!AppConfig.useMockBackend) return; // double-check
    final dummy = [
      InspectionTemplate(
        id: 'tmpl_1',
        name: 'Fuel Dispenser Volumetric Verification',
        businessType: 'Fuel Station & Energy Retail',
        apparatusType: 'Fuel Dispenser (5L/10L/20L)',
        accuracyClass: 'Class II',
        description: 'Statutory verification protocol for liquid petroleum dispensers.',
        isPredefined: true,
        colorValue: 0xFF0D47A1, // Colors.blue.shade900
        iconCodePoint: 0xe3a4, // Icons.local_gas_station
      ),
      InspectionTemplate(
        id: 'tmpl_2',
        name: 'Class III Electronic Weighing Scale',
        businessType: 'Retail Grocery & Supermarkets',
        apparatusType: 'Platform/Tabletop Scale (up to 30kg)',
        accuracyClass: 'Class III',
        description: 'Standard protocol for commercial retail scales used in grocery stores.',
        isPredefined: true,
        colorValue: 0xFF2E7D32, // Colors.green.shade800
        iconCodePoint: 0xe556, // Icons.scale
      ),
    ];
    for (var tmpl in dummy) {
      _repository.saveTemplate(tmpl);
    }
    state = _repository.getAllTemplates();
  }

  void saveTemplate(InspectionTemplate template) {
    _repository.saveTemplate(template);
    state = _repository.getAllTemplates();
  }
}
