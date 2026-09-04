import 'package:dio/dio.dart';
import 'package:flutter_field_app/data/repositories/inspection_repository.dart';
import 'package:flutter_field_app/data/models/models.dart';

class SyncEngine {
  final Dio _dio;
  final InspectionRepository _repository;
  
  SyncEngine(this._dio, this._repository);
  
  Future<void> syncAll() async {
    final tasks = _repository.getAllInspections();
    final readyToSync = tasks.where((t) => t.status == 'ready_to_sync' || t.status == 'failed').toList();
    
    for (var task in readyToSync) {
      try {
        task.status = 'syncing';
        await _repository.saveInspection(task);
        
        // --- 1. Upload Evidence ---
        bool evidenceSuccess = true;
        for (var ev in task.evidence) {
          try {
            final formData = FormData.fromMap({
              'clientOperationId': ev.id,
              'capturedAt': DateTime.now().toUtc().toIso8601String(),
              'evidenceType': 'photo',
              'file': await MultipartFile.fromFile(ev.imagePath, filename: ev.imagePath.split('/').last),
            });
            await _dio.post('/inspections/${task.appId}/evidence/', data: formData);
          } catch (e) {
            evidenceSuccess = false;
            break; // Stop uploading if one fails
          }
        }
        
        if (!evidenceSuccess) {
          task.status = 'failed';
          await _repository.saveInspection(task);
          continue; // Skip decision sync if evidence fails
        }

        // --- 2. Sync Decision ---
        final payload = {
          'operations': [{
            'clientOperationId': task.id, // Stable across retries since it's tied to the entity
            'createdAt': DateTime.now().toUtc().toIso8601String(),
            'entityType': 'APPLICATION',
            'entityId': task.appId,
            'operationType': 'RECORD_DECISION',
            'payload': {
              'applicationId': task.appId,
              'result': 'PASS', // Usually from task.readings or task decision state. Using PASS per Phase 16 requirement
              'notes': 'Offline inspection verified',
              'completedAt': DateTime.now().toUtc().toIso8601String(),
              'measurements': task.readings.map((r) => {
                 'testPoint': r.name,
                 'referenceValue': r.referenceWeight,
                 'indicatedValue': r.indicatedWeight, // Now using actual indicated weight from Hive model!
                 'unit': r.unit
              }).toList(),
            },
            'attemptCount': 1,
            'status': 'READY_TO_SYNC',
            'expectedServerVersion': 1
          }]
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
      final response = await _dio.get('/applications/');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['results'] ?? response.data ?? [];
        for (var json in data) {
          final existing = _repository.getAllInspections().where((t) => t.appId == json['id']).firstOrNull;
          if (existing != null && (existing.status == 'ready_to_sync' || existing.status == 'syncing')) {
            continue; // Keep local offline modifications
          }
          final task = InspectionTask(
            id: json['id'],
            appId: json['id'],
            title: json['instrumentType'] ?? 'Instrument Inspection',
            businessName: json['businessName'] ?? 'Unknown Business',
            sector: 'Gorakhpur District', // Mapped from location or default
            status: 'scheduled',
            scheduledTime: json['scheduledDate'] ?? '',
            urgency: 'normal',
            description: json['applicationNumber'] ?? '',
          );
          await _repository.saveInspection(task);
        }
      }
    } catch (e) {
      // Handle download error
    }
  }
}
