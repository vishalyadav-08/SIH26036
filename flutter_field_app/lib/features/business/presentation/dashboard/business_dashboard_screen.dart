import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';
import 'package:flutter_field_app/providers/business_providers.dart';

class BusinessDashboardScreen extends ConsumerWidget {
  const BusinessDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(businessProfileProvider);
    final instrumentsAsync = ref.watch(businessInstrumentsProvider);
    final appsAsync = ref.watch(businessApplicationsProvider);
    final certsAsync = ref.watch(businessCertificatesProvider);

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: const Text('MapanSetu'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.go('/business/profile'),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () => context.go('/business/instruments/register'),
          ),
        ],
      ),
      body: profileAsync.when(
        data: (profile) {
          return _buildDashboardContent(context, profile, instrumentsAsync, appsAsync, certsAsync);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text('Failed to load dashboard\n$err', textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDashboardContent(
      BuildContext context,
      profile,
      AsyncValue<List<dynamic>> instrumentsAsync,
      AsyncValue<List<dynamic>> appsAsync,
      AsyncValue<List<dynamic>> certsAsync) {
        
    final instruments = instrumentsAsync.valueOrNull ?? [];
    final apps = appsAsync.valueOrNull ?? [];
    final certs = certsAsync.valueOrNull ?? [];
    
    final expiringCount = certs.where((c) => c.status == 'EXPIRING_SOON' || c.status == 'EXPIRED').length;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppTheme.standard),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Good morning, ${profile.tradeName.isEmpty ? profile.legalName : profile.tradeName}', 
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text('Manage your instruments and verification records.', 
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.onSurfaceVariant)),
          const SizedBox(height: 24),

          // Counters Grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 2.0,
            children: [
              InkWell(onTap: () => context.go('/business/instruments'), child: _buildCounterCard('Instruments', instrumentsAsync.isLoading ? '...' : instruments.length.toString(), Icons.scale)),
              _buildCounterCard('Applications', appsAsync.isLoading ? '...' : apps.length.toString(), Icons.assignment),
              _buildCounterCard('Certificates', certsAsync.isLoading ? '...' : certs.length.toString(), Icons.verified),
              _buildCounterCard('Expiring Soon', certsAsync.isLoading ? '...' : expiringCount.toString(), Icons.warning_amber, color: AppTheme.warning),
            ],
          ),
          const SizedBox(height: 24),

          Text('Quick Actions', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => context.go('/business/instruments/register'),
                  icon: const Icon(Icons.add),
                  label: const Text('Register Instrument'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => context.go('/business/applications/new'),
                  icon: const Icon(Icons.add),
                  label: const Text('Apply for Verification'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          Text('Recent Applications', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          if (appsAsync.isLoading) const Center(child: CircularProgressIndicator())
          else if (apps.isEmpty) const Text('No recent applications.')
          else ...apps.take(3).map((app) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              side: BorderSide(color: AppTheme.outlineVariant.withValues(alpha: 0.5)),
            ),
            child: ListTile(
              title: Text('Application', style: const TextStyle(fontWeight: FontWeight.bold)), // In case app.id is too long
              subtitle: Text(app.reason),
              trailing: Chip(label: Text(app.status, style: const TextStyle(fontSize: 10))),
            ),
          )),
          
          const SizedBox(height: 24),
          Text('Upcoming Expiry', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          if (certsAsync.isLoading) const Center(child: CircularProgressIndicator())
          else if (expiringCount == 0) const Text('No certificates expiring soon.')
          else ...certs.where((c) => c.status == 'EXPIRING_SOON').map((cert) {
            final inst = instruments.firstWhere((i) => i.id == cert.instrumentId, orElse: () => null);
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              elevation: 0,
              color: AppTheme.warning.withValues(alpha: 0.1),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                side: BorderSide(color: AppTheme.warning.withValues(alpha: 0.5)),
              ),
              child: ListTile(
                leading: const Icon(Icons.warning, color: AppTheme.warning),
                title: Text(inst?.instrumentNumber ?? 'Unknown Instrument', style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Certificate expires soon'),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildCounterCard(String title, String count, IconData icon, {Color? color}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: color?.withValues(alpha: 0.3) ?? AppTheme.outlineVariant.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color ?? AppTheme.onSurfaceVariant),
              const SizedBox(width: 8),
              Text(title, style: TextStyle(fontSize: 12, color: color ?? AppTheme.onSurfaceVariant)),
            ],
          ),
          const SizedBox(height: 4),
          Text(count, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color ?? AppTheme.onSurface)),
        ],
      ),
    );
  }
}
