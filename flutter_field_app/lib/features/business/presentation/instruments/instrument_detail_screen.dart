import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';
import 'package:flutter_field_app/providers/business_providers.dart';

class InstrumentDetailScreen extends ConsumerWidget {
  final String instrumentId;
  const InstrumentDetailScreen({super.key, required this.instrumentId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final instruments = ref.watch(businessInstrumentsProvider);
    final instrument = instruments.firstWhere((i) => i.id == instrumentId, orElse: () => throw Exception('Not found'));

    final apps = ref.watch(businessApplicationsProvider).where((a) => a.instrumentId == instrumentId).toList();
    final certs = ref.watch(businessCertificatesProvider).where((c) => c.instrumentId == instrumentId).toList();

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: const Text('Instrument Details'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.standard),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                side: BorderSide(color: AppTheme.outlineVariant.withValues(alpha: 0.5)),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(instrument.instrumentNumber, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
                        Chip(label: Text(instrument.status)),
                      ],
                    ),
                    const Divider(),
                    _buildRow('Type', instrument.instrumentType),
                    _buildRow('Manufacturer', instrument.manufacturer),
                    _buildRow('Model', instrument.model),
                    _buildRow('Capacity', instrument.capacity),
                    _buildRow('S/N', instrument.serialNumber),
                    _buildRow('Location', instrument.location),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text('Certificates', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 8),
            if (certs.isEmpty) const Text('No certificates found')
            else ...certs.map((c) => ListTile(
              title: Text(c.id),
              subtitle: Text('Valid until: ${c.validUntil}'),
              trailing: Text(c.status),
            )),

            const SizedBox(height: 24),
            const Text('Applications', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 8),
            if (apps.isEmpty) const Text('No applications found')
            else ...apps.map((a) => ListTile(
              title: Text(a.id),
              subtitle: Text(a.reason),
              trailing: Text(a.status),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 100, child: Text(label, style: const TextStyle(color: AppTheme.onSurfaceVariant))),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }
}
