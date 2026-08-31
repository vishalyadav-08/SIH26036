import 'package:flutter/material.dart';
import 'package:flutter_field_app/l10n/app_localizations.dart';
import 'package:flutter_field_app/theme/app_theme.dart';

class CustomBottomNavBar extends StatelessWidget {
  final String currentRoute;
  final int syncQueueCount;
  final Function(String) onNavigate;

  const CustomBottomNavBar({
    super.key,
    required this.currentRoute,
    required this.syncQueueCount,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final isHi = l10n?.localeName == 'hi';

    int currentIndex = 0;
    if (currentRoute == 'dashboard') currentIndex = 0;
    if (currentRoute == 'inspections') currentIndex = 1;
    if (currentRoute == 'sync') currentIndex = 2;
    if (currentRoute == 'profile') currentIndex = 3;

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLow,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 72,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                index: 0,
                route: 'dashboard',
                icon: Icons.dashboard_outlined,
                activeIcon: Icons.dashboard,
                label: l10n?.dashboard ?? 'Dashboard',
                isActive: currentIndex == 0,
              ),
              _buildNavItem(
                index: 1,
                route: 'inspections',
                icon: Icons.fact_check_outlined,
                activeIcon: Icons.fact_check,
                label: isHi ? 'निरीक्षण' : 'Inspections',
                isActive: currentIndex == 1,
              ),
              _buildNavItem(
                index: 2,
                route: 'sync',
                icon: Icons.sync_outlined,
                activeIcon: Icons.sync,
                label: isHi ? 'सिंक' : 'Sync',
                isActive: currentIndex == 2,
                badgeCount: syncQueueCount,
              ),
              _buildNavItem(
                index: 3,
                route: 'profile',
                icon: Icons.person_outline,
                activeIcon: Icons.person,
                label: l10n?.profile ?? 'Profile',
                isActive: currentIndex == 3,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required String route,
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required bool isActive,
    int? badgeCount,
  }) {
    return InkWell(
      onTap: () => onNavigate(route),
      borderRadius: BorderRadius.circular(AppTheme.radiusLg),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: isActive ? AppTheme.secondaryContainer : Colors.transparent,
                borderRadius: BorderRadius.circular(AppTheme.radiusLg),
              ),
              child: Badge(
                isLabelVisible: badgeCount != null && badgeCount > 0,
                label: Text('$badgeCount', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                backgroundColor: AppTheme.warning,
                textColor: AppTheme.onWarningContainer,
                child: Icon(
                  isActive ? activeIcon : icon,
                  color: isActive ? AppTheme.onSecondaryContainer : AppTheme.onSurfaceVariant,
                  size: 24,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                color: isActive ? AppTheme.primary : AppTheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
