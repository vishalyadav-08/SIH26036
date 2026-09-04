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
        
        // --- 0. Start Inspection (to get inspectionId) ---
        String inspectionId = '';
        try {
          final startRes = await _dio.post('/inspections/', data: {
            'applicationId': task.appId,
            'startedAt': DateTime.now().toUtc().toIso8601String(),
            'clientOperationId': 'start_${task.id}',
          });
          inspectionId = startRes.data['id'] as String;
        } on DioException catch (e) {
          if (e.response?.statusCode == 409) {
            // Duplicate start: backend already has an inspection for this application.
            // Fetch it via GET /inspections/?applicationId=...
            try {
              final fetchRes = await _dio.get('/inspections/', queryParameters: {'applicationId': task.appId});
              final items = fetchRes.data['items'] as List?;
              if (items != null && items.isNotEmpty) {
                inspectionId = items[0]['id'] as String;
              } else {
                task.status = 'failed';
                await _repository.saveInspection(task);
                continue;
              }
            } catch (_) {
              task.status = 'failed';
              await _repository.saveInspection(task);
              continue;
            }
          } else {
            task.status = 'failed';
            await _repository.saveInspection(task);
            continue;
          }
        }

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
            await _dio.post('/inspections/$inspectionId/evidence/', data: formData);
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
            'clientOperationId': task.id, // Stable across retries
            'createdAt': DateTime.now().toUtc().toIso8601String(),
            'entityType': 'INSPECTION',
            'entityId': inspectionId,
            'operationType': 'RECORD_DECISION',
            'payload': {
              'applicationId': task.appId,
              'result': task.result ?? 'PASS',
              'notes': task.notes ?? '',
              'completedAt': DateTime.now().toUtc().toIso8601String(),
              'measurements': task.readings.map((r) => {
                 'testPoint': r.name,
                 'referenceValue': r.referenceWeight,
                 'indicatedValue': r.indicatedWeight,
                 'unit': r.unit
              }).toList(),
              if (task.gpsLatitude != null) 'gps': {
                'latitude': task.gpsLatitude,
                'longitude': task.gpsLongitude,
                'accuracyMeters': task.gpsAccuracy ?? 10.0,
                'capturedAt': task.capturedAt ?? DateTime.now().toUtc().toIso8601String(),
              }
            },
            'attemptCount': 1,
            'status': 'READY_TO_SYNC',
          }]
        };

        final response = await _dio.post('/sync/', data: payload);
        
        if (response.statusCode == 200 || response.statusCode == 201) {
          final results = response.data['results'] as List?;
          if (results != null && results.isNotEmpty) {
            final resultStatus = results[0]['status'];
            if (resultStatus == 'SYNCED') {
              task.status = 'synced';
            } else if (resultStatus == 'CONFLICT') {
              task.status = 'conflict';
            } else {
              task.status = 'failed';
            }
          } else {
            task.status = 'synced';
          }
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
        final List<dynamic> data = response.data['items'] ?? response.data['results'] ?? response.data ?? [];
        for (var json in data) {
          final existing = _repository.getAllInspections().where((t) => t.appId == json['id']).firstOrNull;
          if (existing != null && (existing.status == 'ready_to_sync' || existing.status == 'syncing')) {
            continue; // Keep local offline modifications
          }
          // Derive sector from jurisdiction/city in API response; never hardcode it
          final String sector = json['jurisdictionLabel'] ?? json['city'] ?? json['location'] ?? '';
          final task = InspectionTask(
            id: json['id'],
            appId: json['id'],
            title: json['instrumentType'] ?? 'Instrument Inspection',
            businessName: json['businessName'] ?? 'Unknown Business',
            sector: sector,
            status: 'scheduled',
            scheduledTime: json['scheduledDate'] ?? json['scheduledAt'] ?? '',
            urgency: 'normal',
            description: json['applicationNumber'] ?? '',
          );
          await _repository.saveInspection(task);
        }
      }
    } catch (e) {
      // Network fetch failed; existing Hive data remains available
    }
  }
}
