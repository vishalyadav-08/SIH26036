import 'package:hive/hive.dart';

part 'models.g.dart';

@HiveType(typeId: 0)
class InspectionTask extends HiveObject {
  @HiveField(0)
  String id;
  @HiveField(1)
  String appId;
  @HiveField(2)
  String title;
  @HiveField(3)
  String businessName;
  @HiveField(4)
  String sector;
  @HiveField(5)
  String status;
  @HiveField(6)
  String scheduledTime;
  @HiveField(7)
  String urgency;
  @HiveField(8)
  String description;
  @HiveField(9)
  List<ChecklistItem> checklists;
  @HiveField(10)
  List<MeasurementReading> readings;
  @HiveField(11)
  List<EvidenceItem> evidence;
  @HiveField(12)
  double? gpsLatitude;
  @HiveField(13)
  double? gpsLongitude;
  @HiveField(14)
  double? gpsAccuracy;
  @HiveField(15)
  String? capturedAt;
  @HiveField(16)
  String? notes;
  @HiveField(17)
  String? result;

  InspectionTask({
    required this.id,
    required this.appId,
    required this.title,
    required this.businessName,
    required this.sector,
    required this.status,
    required this.scheduledTime,
    required this.urgency,
    required this.description,
    this.checklists = const [],
    this.readings = const [],
    this.evidence = const [],
    this.gpsLatitude,
    this.gpsLongitude,
    this.gpsAccuracy,
    this.capturedAt,
    this.notes,
    this.result,
  });

  factory InspectionTask.fromJson(Map<String, dynamic> json) {
    return InspectionTask(
      id: json['id'] as String? ?? '',
      appId: json['appId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      businessName: json['businessName'] as String? ?? '',
      sector: json['sector'] as String? ?? '',
      status: json['status'] as String? ?? '',
      scheduledTime: json['scheduledTime'] as String? ?? '',
      urgency: json['urgency'] as String? ?? '',
      description: json['description'] as String? ?? '',
      notes: json['notes'] as String?,
      result: json['result'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'appId': appId,
      'title': title,
      'businessName': businessName,
      'sector': sector,
      'status': status,
      'scheduledTime': scheduledTime,
      'urgency': urgency,
      'description': description,
    };
  }
}

@HiveType(typeId: 1)
class ChecklistItem {
  @HiveField(0)
  String id;
  @HiveField(1)
  String category;
  @HiveField(2)
  String label;
  @HiveField(3)
  bool completed;

  ChecklistItem({
    required this.id,
    required this.category,
    required this.label,
    this.completed = false,
  });
}

@HiveType(typeId: 2)
class MeasurementReading {
  @HiveField(0)
  String id;
  @HiveField(1)
  String name;
  @HiveField(2)
  double referenceWeight;
  @HiveField(3)
  double maxPermissibleError;
  @HiveField(4)
  String unit;
  @HiveField(5)
  double indicatedWeight;

  MeasurementReading({
    required this.id,
    required this.name,
    required this.referenceWeight,
    required this.maxPermissibleError,
    required this.unit,
    this.indicatedWeight = 0.0,
  });
}

@HiveType(typeId: 3)
class EvidenceItem {
  @HiveField(0)
  String id;
  @HiveField(1)
  String title;
  @HiveField(2)
  String imagePath;

  EvidenceItem({
    required this.id,
    required this.title,
    required this.imagePath,
  });
}

@HiveType(typeId: 4)
class InspectionTemplate extends HiveObject {
  @HiveField(0)
  String id;
  @HiveField(1)
  String name;
  @HiveField(2)
  String businessType;
  @HiveField(3)
  String apparatusType;
  @HiveField(4)
  String accuracyClass;
  @HiveField(5)
  String description;
  @HiveField(6)
  bool isPredefined;
  @HiveField(7)
  int colorValue;
  @HiveField(8)
  int iconCodePoint;

  InspectionTemplate({
    required this.id,
    required this.name,
    required this.businessType,
    required this.apparatusType,
    required this.accuracyClass,
    required this.description,
    required this.isPredefined,
    required this.colorValue,
    required this.iconCodePoint,
  });
}
