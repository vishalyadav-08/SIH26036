import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_field_app/data/models/models.dart';

class InspectionRepository {
  static const String _inspectionsBoxName = 'inspectionsBox';
  static const String _templatesBoxName = 'templatesBox';

  Future<void> init() async {
    Hive.registerAdapter(InspectionTaskAdapter());
    Hive.registerAdapter(ChecklistItemAdapter());
    Hive.registerAdapter(MeasurementReadingAdapter());
    Hive.registerAdapter(EvidenceItemAdapter());
    Hive.registerAdapter(InspectionTemplateAdapter());
    
    await Hive.openBox<InspectionTask>(_inspectionsBoxName);
    await Hive.openBox<InspectionTemplate>(_templatesBoxName);
  }

  Box<InspectionTask> get _box => Hive.box<InspectionTask>(_inspectionsBoxName);
  Box<InspectionTemplate> get _templatesBox => Hive.box<InspectionTemplate>(_templatesBoxName);

  List<InspectionTask> getAllInspections() {
    return _box.values.toList();
  }

  Future<void> saveInspection(InspectionTask task) async {
    await _box.put(task.id, task);
  }

  Future<void> deleteInspection(String id) async {
    await _box.delete(id);
  }

  List<InspectionTemplate> getAllTemplates() {
    return _templatesBox.values.toList();
  }

  Future<void> saveTemplate(InspectionTemplate template) async {
    await _templatesBox.put(template.id, template);
  }
}
