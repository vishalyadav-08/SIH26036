import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_field_app/l10n/app_localizations.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';
import 'package:flutter_field_app/providers/providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  void _showLogoutDialog(BuildContext context, AppLocalizations? l10n) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surfaceContainerLowest,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusLg)),
        icon: Container(
          width: 48,
          height: 48,
          decoration: const BoxDecoration(
            color: AppTheme.errorContainer,
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.warning, color: AppTheme.onErrorContainer, size: 28),
        ),
        title: Text(
          l10n?.unsyncedWorkTitle ?? 'Unsynced Work',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          textAlign: TextAlign.center,
        ),
        content: Text(
          l10n?.unsyncedWorkMessage ??
              'You have 3 unsynced inspections. Logging out will keep them on this device, but they won\'t be available on the server until you log back in and sync. Are you sure you want to log out?',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 13, color: AppTheme.onSurfaceVariant),
        ),
        actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        actions: [
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text(
                  l10n?.cancel ?? 'Cancel',
                  style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  context.go('/login');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.error,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                ),
                child: Text(l10n?.logOutAnyway ?? 'Log Out Anyway', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);
    final isHi = l10n?.localeName == 'hi';
    
    final inspections = ref.watch(inspectionsProvider);
    final completedCount = inspections.where((i) => i.status == 'synced' || i.status == 'ready_to_sync').length;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppTheme.standard),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Officer Details Card
              Material(
                color: AppTheme.surfaceContainerLowest,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  side: BorderSide(color: AppTheme.outlineVariant.withValues(alpha: 0.6)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(AppTheme.card),
                  child: Row(
                    children: [
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppTheme.secondaryContainer,
                          border: Border.all(color: AppTheme.surfaceContainerHighest, width: 3),
                        ),
                        child: const Icon(Icons.person, size: 40, color: AppTheme.onSecondaryContainer),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isHi ? 'अधिकारी शर्मा' : 'Officer Sharma',
                              style: theme.textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: AppTheme.onSurface,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              l10n?.legalMetrologyOfficer ?? 'Legal Metrology Officer',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: AppTheme.secondary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppTheme.secondaryContainer,
                                borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.badge, size: 14, color: AppTheme.onSecondaryContainer),
                                  SizedBox(width: 4),
                                  Text(
                                    'LMO-2024-088',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.onSecondaryContainer,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppTheme.section),

              // Operational Stats & Account Security
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 550;

                  final statsWidget = Material(
                    color: AppTheme.surfaceContainerLowest,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                      side: BorderSide(color: AppTheme.outlineVariant.withValues(alpha: 0.6)),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(AppTheme.standard),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.analytics_outlined, color: AppTheme.primary, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                l10n?.operationalStats ?? 'Operational Stats',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Inspections Done', style: TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant)),
                              Text('$completedCount', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(l10n?.lastSync ?? 'Last Sync', style: const TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant)),
                              const Row(
                                children: [
                                  Icon(Icons.cloud_done, color: AppTheme.success, size: 14),
                                  SizedBox(width: 4),
                                  Text('10:42 AM', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(l10n?.localStorage ?? 'Local Storage', style: const TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant)),
                              const Text('124MB / 500MB', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          LinearProgressIndicator(
                            value: 0.25,
                            backgroundColor: AppTheme.surfaceContainerHighest,
                            color: AppTheme.primary,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ],
                      ),
                    ),
                  );

                  final securityWidget = Material(
                    color: AppTheme.surfaceContainerLowest,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                      side: BorderSide(color: AppTheme.outlineVariant.withValues(alpha: 0.6)),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(AppTheme.standard),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.security, color: AppTheme.primary, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                l10n?.accountSecurity ?? 'Account Security',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          InkWell(
                            onTap: () {
                              showDialog(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  title: Text(l10n?.changePassword ?? 'Change Password', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                  content: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      TextField(obscureText: true, decoration: InputDecoration(labelText: 'Current Password', filled: true, fillColor: AppTheme.surfaceContainerHighest, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none))),
                                      const SizedBox(height: 12),
                                      TextField(obscureText: true, decoration: InputDecoration(labelText: 'New Password', filled: true, fillColor: AppTheme.surfaceContainerHighest, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none))),
                                    ],
                                  ),
                                  actions: [
                                    TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                                    ElevatedButton(onPressed: () {
                                      Navigator.pop(ctx);
                                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password updated successfully.')));
                                    }, child: const Text('Update')),
                                  ],
                                ),
                              );
                            },
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(l10n?.changePassword ?? 'Change Password', style: const TextStyle(fontSize: 13)),
                                  const Icon(Icons.chevron_right, size: 18, color: AppTheme.onSurfaceVariant),
                                ],
                              ),
                            ),
                          ),
                          const Divider(height: 12),
                          InkWell(
                            onTap: () {
                              showDialog(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  title: Text(l10n?.activeSessions ?? 'Active Sessions', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                  content: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const ListTile(
                                        contentPadding: EdgeInsets.zero,
                                        leading: Icon(Icons.phone_android, color: AppTheme.primary),
                                        title: Text('Moto G34 5G', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                                        subtitle: Text('Current Device • Online', style: TextStyle(fontSize: 12, color: AppTheme.success)),
                                      ),
                                      ListTile(
                                        contentPadding: EdgeInsets.zero,
                                        leading: const Icon(Icons.computer, color: AppTheme.onSurfaceVariant),
                                        title: const Text('Windows Chrome', style: TextStyle(fontSize: 14)),
                                        subtitle: const Text('Last seen 2 days ago', style: TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant)),
                                        trailing: IconButton(icon: const Icon(Icons.close, color: AppTheme.error, size: 18), onPressed: () {}),
                                      ),
                                    ],
                                  ),
                                  actions: [
                                    TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
                                  ],
                                ),
                              );
                            },
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(l10n?.activeSessions ?? 'Active Sessions', style: const TextStyle(fontSize: 13)),
                                      Text(l10n?.devicesConnected ?? '2 devices connected', style: const TextStyle(fontSize: 11, color: AppTheme.secondary)),
                                    ],
                                  ),
                                  const Icon(Icons.chevron_right, size: 18, color: AppTheme.onSurfaceVariant),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );

                  if (isWide) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: statsWidget),
                        const SizedBox(width: 12),
                        Expanded(child: securityWidget),
                      ],
                    );
                  } else {
                    return Column(
                      children: [
                        statsWidget,
                        const SizedBox(height: 12),
                        securityWidget,
                      ],
                    );
                  }
                },
              ),
              const SizedBox(height: AppTheme.section),

              // App Settings Card
              Material(
                color: AppTheme.surfaceContainerLowest,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  side: BorderSide(color: AppTheme.outlineVariant.withValues(alpha: 0.6)),
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainerLow.withValues(alpha: 0.6),
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTheme.radiusLg)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.settings_outlined, color: AppTheme.primary, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            l10n?.appSettings ?? 'App Settings',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ],
                      ),
                    ),

                    // Language Selector Row
                    ListTile(
                      leading: const Icon(Icons.translate, color: AppTheme.onSurfaceVariant),
                      title: Text(l10n?.language ?? 'Language', style: const TextStyle(fontSize: 14)),
                      subtitle: Text(isHi ? 'हिन्दी (Hindi)' : 'English (US)', style: const TextStyle(fontSize: 12, color: AppTheme.secondary)),
                      trailing: SizedBox(
                        width: 90,
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            isExpanded: true,
                            value: isHi ? 'hi' : 'en',
                            icon: const Icon(Icons.arrow_drop_down, color: AppTheme.onSurfaceVariant),
                            items: const [
                              DropdownMenuItem(value: 'en', child: Text('English', style: TextStyle(fontSize: 13))),
                              DropdownMenuItem(value: 'hi', child: Text('हिन्दी', style: TextStyle(fontSize: 13))),
                            ],
                            onChanged: (val) {
                              if (val != null) {
                                ref.read(localeProvider.notifier).state = Locale(val);
                              }
                            },
                          ),
                        ),
                      ),
                    ),
                    const Divider(height: 1, indent: 16, endIndent: 16),

                    // Offline Mode Settings
                    ListTile(
                      leading: const Icon(Icons.wifi_off, color: AppTheme.onSurfaceVariant),
                      title: Text(l10n?.offlineModeSettings ?? 'Offline Mode Settings', style: const TextStyle(fontSize: 14)),
                      subtitle: Text(l10n?.manageDownloadedRegions ?? 'Manage downloaded regions', style: const TextStyle(fontSize: 12, color: AppTheme.secondary)),
                      trailing: const Icon(Icons.chevron_right, size: 20, color: AppTheme.onSurfaceVariant),
                      onTap: () {},
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Log Out Action
              Center(
                child: OutlinedButton.icon(
                  onPressed: () => _showLogoutDialog(context, l10n),
                  icon: const Icon(Icons.logout, size: 20),
                  label: Text(
                    l10n?.logOut ?? 'Log Out',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.error,
                    side: const BorderSide(color: AppTheme.error),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusFull)),
                    padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
                  ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
