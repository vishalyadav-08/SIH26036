import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';
import 'package:flutter_field_app/providers/business_providers.dart';

class CertificatesListScreen extends ConsumerWidget {
  const CertificatesListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final certs = ref.watch(businessCertificatesProvider);
    final instruments = ref.watch(businessInstrumentsProvider);

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: const Text('Certificates'),
      ),
      body: certs.isEmpty
        ? const Center(child: Text('No certificates found'))
        : ListView.builder(
            padding: const EdgeInsets.all(AppTheme.standard),
            itemCount: certs.length,
            itemBuilder: (context, index) {
              final cert = certs[index];
              final inst = instruments.firstWhere((i) => i.id == cert.instrumentId);
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
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
                          Text(cert.id, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          Chip(label: Text(cert.status)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Instrument: ${inst.instrumentNumber}'),
                      const SizedBox(height: 4),
                      Text('Valid Until: ${cert.validUntil}', style: const TextStyle(color: AppTheme.onSurfaceVariant, fontSize: 12)),
                    ],
                  ),
                ),
              );
            },
          ),
    );
  }
}
