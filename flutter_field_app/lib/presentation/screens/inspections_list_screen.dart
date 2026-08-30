import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_field_app/l10n/app_localizations.dart';
import 'package:flutter_field_app/theme/app_theme.dart';

class InspectionsListScreen extends ConsumerStatefulWidget {
  const InspectionsListScreen({super.key});

  @override
  ConsumerState<InspectionsListScreen> createState() => _InspectionsListScreenState();
}

class _InspectionsListScreenState extends ConsumerState<InspectionsListScreen> {
  String _searchQuery = '';
  String _selectedFilter = 'all';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);
    final isHi = l10n?.localeName == 'hi';

    final allInspections = [
      {
        'id': 'APP-DEMO-001',
        'title': isHi ? 'काउंटर स्केल' : 'Counter Scale',
        'subtitle': isHi ? 'डेमो मापन...' : 'Demo Measurement...',
        'status': 'scheduled',
        'time': isHi ? 'आज 10:00 AM' : 'Today 10:00 AM',
        'timeIcon': Icons.calendar_today,
      },
      {
        'id': 'APP-DEMO-042',
        'title': isHi ? 'ईंधन डिस्पेंसर' : 'Fuel Dispenser',
        'subtitle': isHi ? 'सिटी गैस स्टेशन #4' : 'City Gas Station #4',
        'status': 'draft',
        'time': isHi ? 'आज 11:30 AM' : 'Today 11:30 AM',
        'timeIcon': Icons.calendar_today,
      },
      {
        'id': 'APP-DEMO-088',
        'title': isHi ? 'प्लेटफॉर्म स्केल' : 'Platform Scale',
        'subtitle': isHi ? 'औद्योगिक रसद' : 'Industrial Logistics',
        'status': 'ready_to_sync',
        'time': isHi ? 'कल 14:00 PM' : 'Yesterday 14:00 PM',
        'timeIcon': Icons.event_available,
      },
      {
        'id': 'APP-DEMO-105',
        'title': isHi ? 'टैक्सी मीटर' : 'Taxi Meter',
        'subtitle': isHi ? 'मेट्रो कैब्स मुख्यालय' : 'Metro Cabs HQ',
        'status': 'completed',
        'time': isHi ? 'कल 09:00 AM' : 'Yesterday 09:00 AM',
        'timeIcon': Icons.event_available,
      },
    ];

    final filteredInspections = allInspections.where((item) {
      final idStr = item['id'] as String;
      final titleStr = item['title'] as String;
      final subtitleStr = item['subtitle'] as String;
      final statusStr = item['status'] as String;

      final matchesSearch = idStr.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          titleStr.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          subtitleStr.toLowerCase().contains(_searchQuery.toLowerCase());
      if (_selectedFilter == 'all') return matchesSearch;
      return matchesSearch && statusStr == _selectedFilter;
    }).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppTheme.standard),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1000),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header & Title
              Text(
                l10n?.assignedInspections ?? 'Assigned Inspections',
                style: theme.textTheme.displaySmall?.copyWith(
                  color: AppTheme.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppTheme.standard),

              // Search and Filter Bar
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 42,
                      child: TextField(
                        onChanged: (val) => setState(() => _searchQuery = val),
                        decoration: InputDecoration(
                          hintText: l10n?.searchPlaceholder ?? 'Search App-ID or Business...',
                          hintStyle: const TextStyle(fontSize: 13, color: AppTheme.onSurfaceVariant),
                          prefixIcon: const Icon(Icons.search, size: 20, color: AppTheme.onSurfaceVariant),
                          filled: true,
                          fillColor: AppTheme.surfaceContainerLow,
                          contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                            borderSide: const BorderSide(color: AppTheme.outline),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                            borderSide: BorderSide(color: AppTheme.outlineVariant.withValues(alpha: 0.8)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                            borderSide: const BorderSide(color: AppTheme.primary, width: 1.5),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    height: 42,
                    child: OutlinedButton.icon(
                      onPressed: () => _showFilterDialog(context),
                      icon: const Icon(Icons.filter_list, size: 18, color: AppTheme.onSurface),
                      label: Text(
                        l10n?.filter ?? 'Filter',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.onSurface),
                      ),
                      style: OutlinedButton.styleFrom(
                        backgroundColor: AppTheme.surfaceContainerHigh,
                        side: const BorderSide(color: AppTheme.outlineVariant),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.card),

              // Bento Grid of Inspection Cards
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 650;
                  return GridView.builder(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: isWide ? 2 : 1,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: isWide ? 1.9 : 1.75,
                    ),
                    itemCount: filteredInspections.length,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemBuilder: (context, index) {
                      final item = filteredInspections[index];
                      return _buildInspectionCard(
                        context: context,
                        id: item['id'] as String,
                        title: item['title'] as String,
                        subtitle: item['subtitle'] as String,
                        status: item['status'] as String,
                        time: item['time'] as String,
                        timeIcon: item['timeIcon'] as IconData,
                      );
                    },
                  );
                },
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInspectionCard({
    required BuildContext context,
    required String id,
    required String title,
    required String subtitle,
    required String status,
    required String time,
    required IconData timeIcon,
  }) {
    final l10n = AppLocalizations.of(context);
    final isHi = l10n?.localeName == 'hi';

    Color badgeBg;
    Color badgeTextColor;
    String badgeText;
    IconData badgeIcon;

    switch (status) {
      case 'scheduled':
        badgeBg = AppTheme.secondaryContainer;
        badgeTextColor = AppTheme.onSecondaryContainer;
        badgeText = isHi ? 'निर्धारित' : 'Scheduled';
        badgeIcon = Icons.schedule;
        break;
      case 'draft':
        badgeBg = AppTheme.warning.withValues(alpha: 0.15);
        badgeTextColor = AppTheme.warning;
        badgeText = isHi ? 'स्थानीय ड्राफ्ट' : 'Local Draft';
        badgeIcon = Icons.drafts;
        break;
      case 'ready_to_sync':
        badgeBg = AppTheme.primaryContainer.withValues(alpha: 0.15);
        badgeTextColor = AppTheme.primary;
        badgeText = isHi ? 'सिंक के लिए तैयार' : 'Ready to Sync';
        badgeIcon = Icons.cloud_sync;
        break;
      case 'completed':
      default:
        badgeBg = AppTheme.success.withValues(alpha: 0.15);
        badgeTextColor = AppTheme.success;
        badgeText = isHi ? 'पूर्ण हुआ' : 'Completed';
        badgeIcon = Icons.check_circle;
        break;
    }

    return InkWell(
      onTap: () => context.go('/wizard'),
      borderRadius: BorderRadius.circular(AppTheme.radiusLg),
      child: Container(
        padding: const EdgeInsets.all(AppTheme.standard),
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        id,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.onSurface,
                        ),
                      ),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppTheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(badgeIcon, size: 14, color: badgeTextColor),
                      const SizedBox(width: 4),
                      Text(
                        badgeText,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: badgeTextColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.only(top: 10),
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: AppTheme.surfaceContainerHighest,
                  ),
                ),
              ),
              child: Row(
                children: [
                  Icon(timeIcon, size: 16, color: AppTheme.onSurfaceVariant),
                  const SizedBox(width: 6),
                  Text(
                    time,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.onSurfaceVariant,
                      fontWeight: FontWeight.w500,
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

  void _showFilterDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surfaceContainerLowest,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Filter by Status', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              _buildFilterOption(ctx, 'all', 'All Inspections'),
              _buildFilterOption(ctx, 'scheduled', 'Scheduled'),
              _buildFilterOption(ctx, 'draft', 'Local Drafts'),
              _buildFilterOption(ctx, 'ready_to_sync', 'Ready to Sync'),
              _buildFilterOption(ctx, 'completed', 'Completed'),
            ],
          ),
        );
      },
    );
  }

  Widget _buildFilterOption(BuildContext ctx, String value, String label) {
    final isSelected = _selectedFilter == value;
    return ListTile(
      title: Text(label, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
      leading: Icon(
        isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
        color: isSelected ? AppTheme.primary : AppTheme.outline,
      ),
      onTap: () {
        setState(() => _selectedFilter = value);
        Navigator.pop(ctx);
      },
    );
  }
}
