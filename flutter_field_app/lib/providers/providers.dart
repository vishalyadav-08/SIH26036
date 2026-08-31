import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_field_app/data/models/models.dart';
import 'package:flutter_field_app/data/repositories/inspection_repository.dart';
import 'package:flutter_field_app/data/repositories/auth_repository.dart';
import 'package:flutter_field_app/data/sync_engine.dart';
import 'package:flutter_field_app/config/app_config.dart';

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
      // Handle 401 token refresh here if needed
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
  return InspectionsNotifier(ref.watch(repositoryProvider));
});

class InspectionsNotifier extends StateNotifier<List<InspectionTask>> {
  final InspectionRepository _repository;

  InspectionsNotifier(this._repository) : super([]) {
    _loadInspections();
  }

  void _loadInspections() {
    if (!AppConfig.useMockBackend) {
      // In a real app with backend, we would trigger a fetch here.
      // e.g. ref.read(syncEngineProvider).fetchInspections();
      // For now, load whatever is in Hive repository
      state = _repository.getAllInspections();
    } else {
      final data = _repository.getAllInspections();
      if (data.isEmpty) {
        // Seed with dummy data
        _seedDummyData();
      } else {
        state = data;
      }
    }
  }

  void _seedDummyData() {
    final dummy = [
      InspectionTask(
        id: 'task_001',
        appId: 'APP-2024-001',
        title: 'Routine Weights Check',
        businessName: 'Global Traders',
        sector: 'North Delhi Market',
        status: 'scheduled',
        scheduledTime: '10:00 AM Today',
        urgency: 'normal',
        description: 'Verify 50kg standard weights.',
      ),
      InspectionTask(
        id: 'task_002',
        appId: 'APP-2024-002',
        title: 'Unannounced Audit: Retail Scales',
        businessName: 'South Delhi Market',
        sector: 'South Delhi Market',
        status: 'urgent',
        scheduledTime: '11:30 AM Today',
        urgency: 'urgent',
        description: 'Surprise check of retail scales.',
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
    if (data.isEmpty) {
      _seedDummyData();
    } else {
      state = data;
    }
  }

  void _seedDummyData() {
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
