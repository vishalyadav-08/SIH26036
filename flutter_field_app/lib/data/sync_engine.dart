import 'package:dio/dio.dart';
import 'package:uuid/uuid.dart';
import 'package:flutter_field_app/data/repositories/inspection_repository.dart';
import 'package:flutter_field_app/data/models/models.dart';

class SyncEngine {
  final Dio _dio;
  final InspectionRepository _repository;
  final Uuid _uuid = const Uuid();
  
  SyncEngine(this._dio, this._repository);
  
  Future<void> syncAll() async {
    final tasks = _repository.getAllInspections();
    final readyToSync = tasks.where((t) => t.status == 'ready_to_sync').toList();
    
    for (var task in readyToSync) {
      try {
        task.status = 'syncing';
        await _repository.saveInspection(task);
        
        final payload = {
          'clientOperationId': _uuid.v4(),
          'inspectionId': task.id,
          'type': 'DECISION',
          'payload': {
            'result': 'PASS',
            'completedAt': DateTime.now().toIso8601String(),
          }
        };

        final response = await _dio.post('/sync', data: payload);
        
        if (response.statusCode == 200 || response.statusCode == 201) {
          task.status = 'synced';
          await _repository.saveInspection(task);
        } else if (response.statusCode == 409) {
          task.status = 'conflict';
          await _repository.saveInspection(task);
        } else {
          task.status = 'failed';
          await _repository.saveInspection(task);
        }
      } catch (e) {
        task.status = 'failed';
        await _repository.saveInspection(task);
      }
    }
  }

  Future<void> fetchInspections() async {
    try {
      final response = await _dio.get('/inspections');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['inspections'] ?? [];
        for (var json in data) {
          final task = InspectionTask.fromJson(json as Map<String, dynamic>);
          await _repository.saveInspection(task);
        }
      }
    } catch (e) {
      // Handle download error
    }
  }
}
