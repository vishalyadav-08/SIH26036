import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_field_app/l10n/app_localizations.dart';
import 'package:flutter_field_app/theme/app_theme.dart';

import 'package:flutter_field_app/config/app_config.dart';
import 'package:flutter_field_app/providers/providers.dart';

class SyncScreen extends ConsumerStatefulWidget {
  const SyncScreen({super.key});

  @override
  ConsumerState<SyncScreen> createState() => _SyncScreenState();
}

class _SyncScreenState extends ConsumerState<SyncScreen> {
  bool _isSyncing = false;
  bool _isSimulatedOffline = false;

  final List<Map<String, dynamic>> _pendingOps = [
    {
      'id': 'APP-DEMO-001',
      'type': 'draft',
      'title': 'APP-DEMO-001',
      'subtitle': 'Local Draft',
      'status': 'pending',
    },
    {
      'id': 'EVD-042',
      'type': 'evidence',
      'title': 'Evidence Photo (2.1 MB)',
      'subtitle': 'Ready to Sync',
      'status': 'queue',
    },
    {
      'id': 'APP-DEMO-002',
      'type': 'failed',
      'title': 'APP-DEMO-002',
      'subtitle': 'Failed: Connection timeout during upload.',
      'status': 'failed',
    },
  ];

  Future<void> _handleSyncAll() async {
    setState(() => _isSyncing = true);

    if (!AppConfig.useMockBackend) {
      final syncEngine = ref.read(syncEngineProvider);
      await syncEngine.syncAll();
    } else {
      await Future.delayed(const Duration(seconds: 2));
    }

    if (mounted) {
      setState(() {
        _isSyncing = false;
        _pendingOps.removeWhere((item) => item['status'] != 'failed');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Synchronization complete! 2 items uploaded.'),
          backgroundColor: AppTheme.success,
        ),
      );
    }
  }

  void _retryItem(int index) {
    setState(() {
      _pendingOps[index]['subtitle'] = 'Retrying upload...';
      _pendingOps[index]['status'] = 'queue';
    });
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          _pendingOps[index]['subtitle'] = 'Synced successfully.';
          _pendingOps[index]['status'] = 'synced';
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);
    final isHi = l10n?.localeName == 'hi';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppTheme.standard),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Page Header
              Text(
                l10n?.syncCenter ?? 'Sync Center',
                style: theme.textTheme.displaySmall?.copyWith(
                  color: AppTheme.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                l10n?.manageDataSync ?? 'Manage your data synchronization.',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: AppTheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: AppTheme.card),

              // Connectivity Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: _isSimulatedOffline
                      ? AppTheme.errorContainer
                      : AppTheme.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  border: Border.all(
                    color: _isSimulatedOffline
                        ? AppTheme.error.withValues(alpha: 0.3)
                        : AppTheme.success.withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      _isSimulatedOffline ? Icons.wifi_off : Icons.wifi,
                      color: _isSimulatedOffline ? AppTheme.error : AppTheme.success,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isSimulatedOffline
                                ? (l10n?.offlineMode ?? 'Offline Mode')
                                : (l10n?.onlineAndSynchronized ?? 'Online & Synchronized'),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: _isSimulatedOffline ? AppTheme.onErrorContainer : AppTheme.success,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _isSimulatedOffline
                                ? (l10n?.offlineSyncNotice ?? 'Syncing will resume when connectivity returns.')
                                : (l10n?.connectedToSecureNetwork ?? 'Connected to secure network.'),
                            style: TextStyle(
                              fontSize: 12,
                              color: _isSimulatedOffline ? AppTheme.onErrorContainer : AppTheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: () => setState(() => _isSimulatedOffline = !_isSimulatedOffline),
                      child: Text(
                        _isSimulatedOffline ? 'Simulate Online' : 'Simulate Offline',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: _isSimulatedOffline ? AppTheme.onErrorContainer : AppTheme.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Sync Status Card
              Container(
                padding: const EdgeInsets.all(AppTheme.card),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  border: Border.all(color: AppTheme.outlineVariant.withValues(alpha: 0.6)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final isWide = constraints.maxWidth > 550;
                    final info = Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: const BoxDecoration(
                            color: AppTheme.secondaryContainer,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.cloud_upload, color: AppTheme.onSecondaryContainer, size: 24),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${_pendingOps.length} ${l10n?.itemsReady ?? 'Items Ready'}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              Text(
                                _isSimulatedOffline
                                    ? (l10n?.waitingForConnection ?? 'Waiting for connection to sync.')
                                    : 'Ready to synchronize with server.',
                                style: const TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant),
                              ),
                            ],
                          ),
                        ),
                      ],
                    );

                    final button = SizedBox(
                      height: 42,
                      child: ElevatedButton.icon(
                        onPressed: (_isSimulatedOffline || _pendingOps.isEmpty || _isSyncing)
                            ? null
                            : _handleSyncAll,
                        icon: _isSyncing
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : const Icon(Icons.sync, size: 18),
                        label: Text(
                          _isSyncing
                              ? (isHi ? 'सिंक हो रहा है...' : 'Syncing Data...')
                              : (l10n?.syncAllData ?? 'Sync All Data'),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          foregroundColor: Colors.white,
                          disabledBackgroundColor: AppTheme.surfaceContainerHigh,
                          disabledForegroundColor: AppTheme.onSurfaceVariant.withValues(alpha: 0.5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                        ),
                      ),
                    );

                    if (isWide) {
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(child: info),
                          const SizedBox(width: 16),
                          button,
                        ],
                      );
                    } else {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          info,
                          const SizedBox(height: 16),
                          button,
                        ],
                      );
                    }
                  },
                ),
              ),
              const SizedBox(height: AppTheme.section),

              // Pending Operations Section
              Text(
                l10n?.pendingOperations ?? 'Pending Operations',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              if (_pendingOps.isEmpty)
                Container(
                  padding: const EdgeInsets.all(32),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceContainerLowest,
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    border: Border.all(color: AppTheme.outlineVariant.withValues(alpha: 0.5)),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.check_circle_outline, color: AppTheme.success, size: 48),
                      const SizedBox(height: 8),
                      Text(
                        isHi ? 'सभी रिकॉर्ड पूरी तरह से सिंक हैं!' : 'All records are fully synchronized!',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ],
                  ),
                )
              else
                ...List.generate(_pendingOps.length, (index) {
                  final item = _pendingOps[index];
                  final isFailed = item['status'] == 'failed';
                  final isQueue = item['status'] == 'queue';

                  IconData iconData;
                  Color iconColor;
                  if (item['type'] == 'draft') {
                    iconData = Icons.drafts_outlined;
                    iconColor = AppTheme.secondary;
                  } else if (item['type'] == 'evidence') {
                    iconData = Icons.image_outlined;
                    iconColor = AppTheme.primary;
                  } else {
                    iconData = Icons.error_outline;
                    iconColor = AppTheme.error;
                  }

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isFailed
                          ? AppTheme.errorContainer.withValues(alpha: 0.2)
                          : AppTheme.surfaceContainerLowest,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      border: Border.all(
                        color: isFailed
                            ? AppTheme.error.withValues(alpha: 0.4)
                            : AppTheme.outlineVariant.withValues(alpha: 0.6),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              Icon(iconData, color: iconColor, size: 24),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item['title'] as String,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                    ),
                                    Text(
                                      item['subtitle'] as String,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: isFailed ? AppTheme.error : AppTheme.onSurfaceVariant,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (isFailed)
                          OutlinedButton.icon(
                            onPressed: () => _retryItem(index),
                            icon: const Icon(Icons.refresh, size: 14, color: AppTheme.error),
                            label: Text(
                              l10n?.retry ?? 'Retry',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.error),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: AppTheme.error),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                              minimumSize: const Size(0, 32),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusSm)),
                            ),
                          )
                        else if (isQueue)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryContainer.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.cloud_queue, size: 12, color: AppTheme.primary),
                                const SizedBox(width: 4),
                                Text(
                                  l10n?.queue ?? 'Queue',
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primary),
                                ),
                              ],
                            ),
                          )
                        else
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceContainerHighest,
                              borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                            ),
                            child: Text(
                              l10n?.pending ?? 'Pending',
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.onSurfaceVariant),
                            ),
                          ),
                      ],
                    ),
                  );
                }),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
