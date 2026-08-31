import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_field_app/data/models/business_models.dart';

final businessProfileProvider = StateProvider<BusinessProfile>((ref) {
  return BusinessProfile(
    id: 'BIZ-2024-001',
    legalName: 'Synthetic Retail Ltd',
    tradeName: 'Demo Store',
    contactName: 'Demo Owner',
    email: 'owner@example.test',
    phone: '0000000000',
    address: 'Synthetic Address, Block A',
    jurisdictionLabel: 'DEMO',
    status: 'ACTIVE',
  );
});

final businessInstrumentsProvider = StateProvider<List<Instrument>>((ref) {
  return [
    Instrument(
      id: 'inst_1',
      instrumentNumber: 'INS-DEMO-001',
      serialNumber: 'SN-DEMO-001',
      instrumentType: 'Electronic Scale',
      manufacturer: 'Synthetic Manufacturer',
      model: 'Demo-100',
      capacity: '100 kg',
      location: 'Demo Store Main Counter',
      status: 'VERIFIED',
      nextDueDate: '12 Mar 2027',
    ),
    Instrument(
      id: 'inst_2',
      instrumentNumber: 'INS-DEMO-002',
      serialNumber: 'SN-DEMO-002',
      instrumentType: 'Fuel Dispenser',
      manufacturer: 'PetroTech',
      model: 'PT-5000',
      capacity: '50 L/min',
      location: 'Pump Station 1',
      status: 'EXPIRED',
      nextDueDate: '01 Jan 2026',
    ),
  ];
});

final businessApplicationsProvider = StateProvider<List<VerificationApplication>>((ref) {
  return [
    VerificationApplication(
      id: 'APP-001',
      instrumentId: 'inst_1',
      reason: 'Periodic Verification',
      status: 'COMPLETED',
      dateSubmitted: '02 Mar 2026',
    ),
    VerificationApplication(
      id: 'APP-002',
      instrumentId: 'inst_2',
      reason: 'Re-verification after repair',
      status: 'SCHEDULED',
      dateSubmitted: '15 Aug 2026',
    ),
  ];
});

final businessCertificatesProvider = StateProvider<List<Certificate>>((ref) {
  return [
    Certificate(
      id: 'CERT-DEMO-001',
      instrumentId: 'inst_1',
      status: 'ACTIVE',
      validUntil: '12 Mar 2027',
    ),
    Certificate(
      id: 'CERT-DEMO-002',
      instrumentId: 'inst_2',
      status: 'EXPIRING_SOON',
      validUntil: '15 Sep 2026',
    ),
  ];
});
