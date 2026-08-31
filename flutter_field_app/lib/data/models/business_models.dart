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
}
