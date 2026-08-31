import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_field_app/l10n/app_localizations.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);
    final isHi = l10n?.localeName == 'hi';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppTheme.standard),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1000),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Dashboard Header & Connectivity
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 600;
                  final headerText = Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n?.dashboard ?? 'Dashboard',
                        style: theme.textTheme.displaySmall?.copyWith(
                          color: AppTheme.onBackground,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        l10n?.welcomeBack ?? 'Welcome back to the field.',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: AppTheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  );

                  final syncCard = Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      border: Border.all(
                        color: AppTheme.outlineVariant.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.wifi, color: AppTheme.success, size: 22),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n?.onlineAndSynchronized ?? 'Online & Synchronized',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            Text(
                              l10n?.connectedToSecureNetwork ?? 'Connected to secure network',
                              style: const TextStyle(fontSize: 10, color: AppTheme.onSurfaceVariant),
                            ),
                          ],
                        ),
                        Container(
                          height: 28,
                          width: 1,
                          color: AppTheme.outlineVariant,
                          margin: const EdgeInsets.symmetric(horizontal: 12),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n?.lastSync ?? 'Last Sync',
                              style: const TextStyle(fontSize: 10, color: AppTheme.onSurfaceVariant),
                            ),
                            const Text(
                              '10:42 AM',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );

                  if (isWide) {
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(child: headerText),
                        const SizedBox(width: 16),
                        syncCard,
                      ],
                    );
                  } else {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        headerText,
                        const SizedBox(height: 16),
                        syncCard,
                      ],
                    );
                  }
                },
              ),
              const SizedBox(height: AppTheme.card),

              // Quick Actions
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 44,
                      child: ElevatedButton.icon(
                        onPressed: () => context.go('/inspections'),
                        icon: const Icon(Icons.add, size: 18),
                        label: Text(
                          l10n?.startNewInspection ?? 'Start New Inspection',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                          ),
                          elevation: 0,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: SizedBox(
                      height: 44,
                      child: OutlinedButton.icon(
                        onPressed: () => context.go('/sync'),
                        icon: const Icon(Icons.sync, size: 18, color: AppTheme.primary),
                        label: Text(
                          l10n?.goToSyncCenter ?? 'Go to Sync Center',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.primary,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          backgroundColor: AppTheme.secondaryContainer.withValues(alpha: 0.6),
                          side: BorderSide(color: AppTheme.outlineVariant.withValues(alpha: 0.5)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.section),

              // Workload Overview
              Text(
                l10n?.workloadOverview ?? 'Workload Overview',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 650;
                  return GridView.count(
                    crossAxisCount: isWide ? 4 : 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: isWide ? 1.35 : 1.25,
                    children: [
                      _buildWorkloadCard(
                        icon: Icons.assignment_outlined,
                        iconColor: AppTheme.primary,
                        count: '4',
                        countColor: AppTheme.primary,
                        title: l10n?.assigned ?? 'Assigned',
                        subtitle: l10n?.pendingAction ?? 'Pending action',
                      ),
                      _buildWorkloadCard(
                        icon: Icons.pending_actions,
                        iconColor: AppTheme.warning,
                        count: '1',
                        countColor: AppTheme.onSurface,
                        title: l10n?.inProgress ?? 'In Progress',
                        subtitle: l10n?.currentlyActive ?? 'Currently active',
                      ),
                      _buildWorkloadCard(
                        icon: Icons.drafts_outlined,
                        iconColor: AppTheme.secondary,
                        count: '2',
                        countColor: AppTheme.onSurface,
                        title: l10n?.localDrafts ?? 'Local Drafts',
                        subtitle: l10n?.savedOnDevice ?? 'Saved on device',
                      ),
                      _buildWorkloadCard(
                        icon: Icons.cloud_upload_outlined,
                        iconColor: AppTheme.success,
                        count: '3',
                        countColor: AppTheme.success,
                        title: l10n?.readyToSync ?? 'Ready to Sync',
                        subtitle: l10n?.requiresConnection ?? 'Requires connection',
                        hasAccent: true,
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: AppTheme.section),

              // Today's Work Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    l10n?.todaysWork ?? "Today's Work",
                    style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: () => context.go('/inspections'),
                    child: Text(
                      l10n?.viewAll ?? 'View All',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Task Card 1: Urgent
              _buildTaskCard(
                context: context,
                isUrgent: true,
                badgeText: l10n?.urgent ?? 'URGENT',
                badgeBg: AppTheme.errorContainer,
                badgeTextColor: AppTheme.onErrorContainer,
                metaIcon: Icons.location_on,
                metaText: 'Sector 7G',
                title: isHi ? 'साइट अल्फा संरचनात्मक जांच' : 'Site Alpha Structural Check',
                description: isHi
                    ? 'हालिया भूकंपीय गतिविधि रिपोर्ट के बाद पूर्ण संरचनात्मक समीक्षा आवश्यक है।'
                    : 'Full structural integrity review required following recent seismic activity report.',
                primaryBtnText: l10n?.begin ?? 'Begin',
                onPrimaryAction: () => context.go('/wizard'),
                secondaryBtnText: l10n?.details ?? 'Details',
                onSecondaryAction: () => context.go('/inspections'),
              ),
              const SizedBox(height: 12),

              // Task Card 2: Scheduled
              _buildTaskCard(
                context: context,
                isUrgent: false,
                badgeText: l10n?.scheduled ?? 'SCHEDULED',
                badgeBg: AppTheme.secondaryContainer,
                badgeTextColor: AppTheme.onSecondaryContainer,
                metaIcon: Icons.schedule,
                metaText: '2:00 PM',
                title: isHi ? 'परिधि बाड़ समीक्षा' : 'Perimeter Fence Review',
                description: isHi
                    ? 'उत्तरी सीमा बाड़ और सुरक्षा फाटकों की नियमित मासिक जांच।'
                    : 'Routine monthly check of northern boundary fencing and security gates.',
                primaryBtnText: l10n?.startSoon ?? 'Start Soon',
                onPrimaryAction: () => context.go('/wizard'),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWorkloadCard({
    required IconData icon,
    required Color iconColor,
    required String count,
    required Color countColor,
    required String title,
    required String subtitle,
    bool hasAccent = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        border: Border.all(color: AppTheme.outlineVariant.withValues(alpha: 0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: iconColor, size: 24),
              Text(
                count,
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: countColor,
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 11, color: AppTheme.onSurfaceVariant),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTaskCard({
    required BuildContext context,
    required bool isUrgent,
    required String badgeText,
    required Color badgeBg,
    required Color badgeTextColor,
    required IconData metaIcon,
    required String metaText,
    required String title,
    required String description,
    required String primaryBtnText,
    required VoidCallback onPrimaryAction,
    String? secondaryBtnText,
    VoidCallback? onSecondaryAction,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        border: Border.all(
          color: isUrgent ? AppTheme.error : AppTheme.outlineVariant.withValues(alpha: 0.5),
          width: isUrgent ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(AppTheme.standard),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeBg,
                  borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                ),
                child: Text(
                  badgeText.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: badgeTextColor,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Icon(metaIcon, size: 14, color: AppTheme.onSurfaceVariant),
              const SizedBox(width: 4),
              Text(
                metaText,
                style: const TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 4),
          Text(
            description,
            style: const TextStyle(fontSize: 13, color: AppTheme.onSurfaceVariant),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              if (secondaryBtnText != null) ...[
                OutlinedButton(
                  onPressed: onSecondaryAction,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.onSurface,
                    side: const BorderSide(color: AppTheme.outlineVariant),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  child: Text(secondaryBtnText, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 8),
              ],
              ElevatedButton(
                onPressed: onPrimaryAction,
                style: ElevatedButton.styleFrom(
                  backgroundColor: isUrgent ? AppTheme.primary : AppTheme.surfaceContainerHighest,
                  foregroundColor: isUrgent ? Colors.white : AppTheme.onSurface,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  elevation: 0,
                ),
                child: Text(primaryBtnText, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
