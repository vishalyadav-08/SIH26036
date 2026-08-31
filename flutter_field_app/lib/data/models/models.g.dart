// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'models.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class InspectionTaskAdapter extends TypeAdapter<InspectionTask> {
  @override
  final int typeId = 0;

  @override
  InspectionTask read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return InspectionTask(
      id: fields[0] as String,
      appId: fields[1] as String,
      title: fields[2] as String,
      businessName: fields[3] as String,
      sector: fields[4] as String,
      status: fields[5] as String,
      scheduledTime: fields[6] as String,
      urgency: fields[7] as String,
      description: fields[8] as String,
      checklists: (fields[9] as List).cast<ChecklistItem>(),
      readings: (fields[10] as List).cast<MeasurementReading>(),
      evidence: (fields[11] as List).cast<EvidenceItem>(),
    );
  }

  @override
  void write(BinaryWriter writer, InspectionTask obj) {
    writer
      ..writeByte(12)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.appId)
      ..writeByte(2)
      ..write(obj.title)
      ..writeByte(3)
      ..write(obj.businessName)
      ..writeByte(4)
      ..write(obj.sector)
      ..writeByte(5)
      ..write(obj.status)
      ..writeByte(6)
      ..write(obj.scheduledTime)
      ..writeByte(7)
      ..write(obj.urgency)
      ..writeByte(8)
      ..write(obj.description)
      ..writeByte(9)
      ..write(obj.checklists)
      ..writeByte(10)
      ..write(obj.readings)
      ..writeByte(11)
      ..write(obj.evidence);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is InspectionTaskAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class ChecklistItemAdapter extends TypeAdapter<ChecklistItem> {
  @override
  final int typeId = 1;

  @override
  ChecklistItem read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return ChecklistItem(
      id: fields[0] as String,
      category: fields[1] as String,
      label: fields[2] as String,
      completed: fields[3] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, ChecklistItem obj) {
    writer
      ..writeByte(4)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.category)
      ..writeByte(2)
      ..write(obj.label)
      ..writeByte(3)
      ..write(obj.completed);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ChecklistItemAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class MeasurementReadingAdapter extends TypeAdapter<MeasurementReading> {
  @override
  final int typeId = 2;

  @override
  MeasurementReading read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return MeasurementReading(
      id: fields[0] as String,
      name: fields[1] as String,
      referenceWeight: fields[2] as double,
      maxPermissibleError: fields[3] as double,
      unit: fields[4] as String,
    );
  }

  @override
  void write(BinaryWriter writer, MeasurementReading obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.referenceWeight)
      ..writeByte(3)
      ..write(obj.maxPermissibleError)
      ..writeByte(4)
      ..write(obj.unit);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MeasurementReadingAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class EvidenceItemAdapter extends TypeAdapter<EvidenceItem> {
  @override
  final int typeId = 3;

  @override
  EvidenceItem read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return EvidenceItem(
      id: fields[0] as String,
      title: fields[1] as String,
      imagePath: fields[2] as String,
    );
  }

  @override
  void write(BinaryWriter writer, EvidenceItem obj) {
    writer
      ..writeByte(3)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.title)
      ..writeByte(2)
      ..write(obj.imagePath);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is EvidenceItemAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class InspectionTemplateAdapter extends TypeAdapter<InspectionTemplate> {
  @override
  final int typeId = 4;

  @override
  InspectionTemplate read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return InspectionTemplate(
      id: fields[0] as String,
      name: fields[1] as String,
      businessType: fields[2] as String,
      apparatusType: fields[3] as String,
      accuracyClass: fields[4] as String,
      description: fields[5] as String,
      isPredefined: fields[6] as bool,
      colorValue: fields[7] as int,
      iconCodePoint: fields[8] as int,
    );
  }

  @override
  void write(BinaryWriter writer, InspectionTemplate obj) {
    writer
      ..writeByte(9)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.businessType)
      ..writeByte(3)
      ..write(obj.apparatusType)
      ..writeByte(4)
      ..write(obj.accuracyClass)
      ..writeByte(5)
      ..write(obj.description)
      ..writeByte(6)
      ..write(obj.isPredefined)
      ..writeByte(7)
      ..write(obj.colorValue)
      ..writeByte(8)
      ..write(obj.iconCodePoint);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is InspectionTemplateAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
