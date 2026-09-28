class BusinessProfile {
  final String id;
  final String legalName;
  final String tradeName;
  final String contactName;
  final String email;
  final String phone;
  final String address;
  final String jurisdictionLabel;
  final String status;

  BusinessProfile({
    required this.id,
    required this.legalName,
    required this.tradeName,
    required this.contactName,
    required this.email,
    required this.phone,
    required this.address,
    required this.jurisdictionLabel,
    required this.status,
  });

  factory BusinessProfile.fromJson(Map<String, dynamic> json) {
    return BusinessProfile(
      id: json['id'] ?? '',
      legalName: json['legalName'] ?? '',
      tradeName: json['tradeName'] ?? '',
      contactName: json['contactName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
      jurisdictionLabel: json['jurisdictionLabel'] ?? '',
      status: json['status'] ?? '',
    );
  }

  BusinessProfile copyWith({
    String? contactName,
    String? email,
    String? phone,
    String? address,
  }) {
    return BusinessProfile(
      id: id,
      legalName: legalName,
      tradeName: tradeName,
      contactName: contactName ?? this.contactName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      jurisdictionLabel: jurisdictionLabel,
      status: status,
    );
  }
}

class Instrument {
  final String id;
  final String instrumentNumber;
  final String serialNumber;
  final String instrumentType;
  final String manufacturer;
  final String model;
  final String capacity;
  final String location;
  final String status;
  final String nextDueDate;

  Instrument({
    required this.id,
    required this.instrumentNumber,
    required this.serialNumber,
    required this.instrumentType,
    required this.manufacturer,
    required this.model,
    required this.capacity,
    required this.location,
    required this.status,
    required this.nextDueDate,
  });

  factory Instrument.fromJson(Map<String, dynamic> json) {
    return Instrument(
      id: json['id'] ?? '',
      instrumentNumber: json['instrumentNumber'] ?? '',
      serialNumber: json['serialNumber'] ?? '',
      instrumentType: json['instrumentType'] ?? '',
      manufacturer: json['manufacturer'] ?? '',
      model: json['modelNumber'] ?? '',
      capacity: json['capacity'] ?? '',
      location: json['location'] ?? '',
      status: json['status'] ?? '',
      nextDueDate: json['nextDueDate'] ?? '',
    );
  }
}

class VerificationApplication {
  final String id;
  final String instrumentId;
  final String reason;
  final String status;
  final String dateSubmitted;

  VerificationApplication({
    required this.id,
    required this.instrumentId,
    required this.reason,
    required this.status,
    required this.dateSubmitted,
  });

  factory VerificationApplication.fromJson(Map<String, dynamic> json) {
    return VerificationApplication(
      id: json['id'] ?? '',
      instrumentId: json['instrumentId'] ?? '',
      reason: json['reason'] ?? '',
      status: json['status'] ?? '',
      dateSubmitted: json['requestedAt'] ?? json['dateSubmitted'] ?? '',
    );
  }
}

class Certificate {
  final String id;
  final String instrumentId;
  final String status;
  final String validUntil;

  Certificate({
    required this.id,
    required this.instrumentId,
    required this.status,
    required this.validUntil,
  });

  factory Certificate.fromJson(Map<String, dynamic> json) {
    return Certificate(
      id: json['id'] ?? '',
      instrumentId: json['instrumentId'] ?? '',
      status: json['status'] ?? '',
      validUntil: json['validUntil'] ?? '',
    );
  }
}
