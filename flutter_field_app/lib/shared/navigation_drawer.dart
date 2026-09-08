import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_field_app/l10n/app_localizations.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_field_app/providers/providers.dart';
import 'package:flutter_field_app/config/app_config.dart';

class CustomNavigationDrawer extends ConsumerWidget {
  final String currentRoute;
  final bool isOnline;
  final VoidCallback onToggleOnline;

  const CustomNavigationDrawer({
    super.key,
    required this.currentRoute,
    required this.isOnline,
    required this.onToggleOnline,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final isHi = l10n?.localeName == 'hi';
    final currentUser = ref.watch(currentUserProvider);

    return Drawer(
      backgroundColor: AppTheme.surface,
      child: SafeArea(
        child: Column(
          children: [
            // Drawer Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: AppTheme.primaryContainer,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        ),
                        child: const Icon(Icons.shield, size: 22, color: AppTheme.primary),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                        ),
                        child: Text(
                          l10n?.sihPrototype ?? 'SIH 2026',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    l10n?.appTitle ?? 'MapanSetu',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    l10n?.fieldOfficerPortal ?? 'LMO Portal',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withValues(alpha: 0.8),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Divider(color: Colors.white.withValues(alpha: 0.2)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                          border: Border.all(color: AppTheme.outlineVariant),
                        ),
                        child: const Icon(Icons.person, size: 20, color: AppTheme.primary),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              currentUser?.displayName ?? (isHi ? 'अज्ञात अधिकारी' : 'Unknown Officer'),
                              style: const TextStyle(
                                color: AppTheme.onSurface,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              currentUser?.id ?? 'N/A',
                              style: const TextStyle(
                                color: AppTheme.secondary,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Network Simulator Box
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLow,
                  border: Border.all(color: AppTheme.outlineVariant.withValues(alpha: 0.5)),
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                ),
                child: Row(
                  children: [
                    Icon(
                      isOnline ? Icons.wifi : Icons.wifi_off,
                      color: isOnline ? AppTheme.success : AppTheme.error,
                      size: 22,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isHi ? 'नेटवर्क सिम्युलेटर' : 'Network Simulator',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                          ),
                          Text(
                            isOnline
                                ? (isHi ? 'ऑनलाइन' : 'Online')
                                : (isHi ? 'ऑफ़लाइन' : 'Offline'),
                            style: const TextStyle(fontSize: 10, color: AppTheme.onSurfaceVariant),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isOnline ? AppTheme.success : AppTheme.error,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                        minimumSize: const Size(0, 28),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusSm)),
                      ),
                      onPressed: onToggleOnline,
                      child: Text(
                        isOnline
                            ? (isHi ? 'ऑफ़लाइन' : 'Go Offline')
                            : (isHi ? 'ऑनलाइन' : 'Go Online'),
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Navigation List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                children: [
                  _buildNavItem(
                    context: context,
                    title: l10n?.dashboard ?? 'Dashboard',
                    icon: Icons.dashboard_outlined,
                    route: 'dashboard',
                  ),
                  _buildNavItem(
                    context: context,
                    title: l10n?.assignedInspections ?? 'Assigned Inspections',
                    icon: Icons.assignment_outlined,
                    route: 'inspections',
                  ),
                  _buildNavItem(
                    context: context,
                    title: l10n?.syncCenter ?? 'Sync Center',
                    icon: Icons.sync_outlined,
                    route: 'sync',
                    badge: '3',
                  ),
                  _buildNavItem(
                    context: context,
                    title: isHi ? 'टकराव समाधान' : 'Conflict Resolution',
                    icon: Icons.warning_amber_rounded,
                    route: 'conflict',
                    badge: '1',
                  ),
                  _buildNavItem(
                    context: context,
                    title: l10n?.profile ?? 'Profile',
                    icon: Icons.person_outline,
                    route: 'profile',
                  ),
                  if (AppConfig.useMockBackend) ...[
                    const Divider(height: 32),
                    ListTile(
                      dense: true,
                      leading: const Icon(Icons.restore, color: AppTheme.primary, size: 20),
                      title: const Text('Reset Demo Data', style: TextStyle(color: AppTheme.primary, fontSize: 13, fontWeight: FontWeight.bold)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                      onTap: () async {
                        Navigator.pop(context);
                        await ref.read(inspectionsProvider.notifier).resetDemoData();
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Demo data has been reset')));
                          context.go('/dashboard');
                        }
                      },
                    ),
                  ],
                ],
              ),
            ),

            // App Footer
            Container(
              padding: const EdgeInsets.all(12),
              color: AppTheme.surfaceContainerLow,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('v3.2.1', style: TextStyle(fontSize: 10, color: AppTheme.onSurfaceVariant)),
                      Text('SIH-2026', style: TextStyle(fontSize: 10, fontFamily: 'monospace', color: AppTheme.onSurfaceVariant)),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isHi ? 'उपभोक्ता मामले मंत्रालय' : 'Ministry of Consumer Affairs',
                    style: const TextStyle(fontSize: 10, color: AppTheme.onSurfaceVariant),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      context.go('/login');
                    },
                    icon: const Icon(Icons.logout, size: 16),
                    label: Text(l10n?.logOut ?? 'Log Out', style: const TextStyle(fontSize: 12)),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size.fromHeight(36),
                      foregroundColor: AppTheme.error,
                      side: BorderSide(color: AppTheme.error.withValues(alpha: 0.5)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required BuildContext context,
    required String title,
    required IconData icon,
    required String route,
    String? badge,
  }) {
    final isActive = currentRoute == route;

    return ListTile(
      dense: true,
      leading: Icon(
        icon,
        color: isActive ? AppTheme.primary : AppTheme.onSurfaceVariant,
        size: 20,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isActive ? AppTheme.primary : AppTheme.onSurface,
          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          fontSize: 13,
        ),
      ),
      trailing: badge != null
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(
                color: isActive ? AppTheme.primary : AppTheme.secondaryContainer,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                badge,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isActive ? Colors.white : AppTheme.onSecondaryContainer,
                ),
              ),
            )
          : null,
      selected: isActive,
      selectedTileColor: AppTheme.secondaryContainer.withValues(alpha: 0.6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
      onTap: () {
        Navigator.pop(context);
        context.go('/$route');
      },
    );
  }
}
