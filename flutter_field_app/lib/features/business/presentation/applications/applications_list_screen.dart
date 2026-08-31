import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';
import 'package:flutter_field_app/providers/business_providers.dart';

class ApplicationsListScreen extends ConsumerWidget {
  const ApplicationsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final apps = ref.watch(businessApplicationsProvider);
    final instruments = ref.watch(businessInstrumentsProvider);

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: const Text('Applications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.go('/business/applications/new'),
          ),
        ],
      ),
      body: apps.isEmpty
        ? const Center(child: Text('No applications found'))
        : ListView.builder(
            padding: const EdgeInsets.all(AppTheme.standard),
            itemCount: apps.length,
            itemBuilder: (context, index) {
              final app = apps[index];
              final inst = instruments.firstWhere((i) => i.id == app.instrumentId);
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
                          Text(app.id, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          Chip(label: Text(app.status)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Instrument: ' + inst.instrumentNumber),
                      const SizedBox(height: 4),
                      Text('Reason: ' + app.reason),
                      const SizedBox(height: 4),
                      Text('Submitted: ' + app.dateSubmitted, style: const TextStyle(color: AppTheme.onSurfaceVariant, fontSize: 12)),
                    ],
                  ),
                ),
              );
            },
          ),
    );
  }
}
