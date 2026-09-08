import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_field_app/data/models/business_models.dart';

final businessProfileProvider = StateProvider<BusinessProfile>((ref) {
  return BusinessProfile(
    id: '', legalName: '', tradeName: '', contactName: '',
    email: '', phone: '', address: '', jurisdictionLabel: '', status: ''
  );
});

final businessInstrumentsProvider = StateProvider<List<Instrument>>((ref) {
  return [];
});

final businessApplicationsProvider = StateProvider<List<VerificationApplication>>((ref) {
  return [];
});

final businessCertificatesProvider = StateProvider<List<Certificate>>((ref) {
  return [];
});
