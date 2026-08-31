import 'package:flutter/material.dart';
import 'package:flutter_field_app/theme/app_theme.dart';

class CustomTopAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String? subtitle;
  final bool isOnline;
  final VoidCallback? onToggleOnline;
  final VoidCallback? onProfileClick;
  final VoidCallback? onMenuClick;
  final VoidCallback? onBackClick;
  final VoidCallback? onCloseClick;

  const CustomTopAppBar({
    super.key,
    required this.title,
    this.subtitle,
    required this.isOnline,
    this.onToggleOnline,
    this.onProfileClick,
    this.onMenuClick,
    this.onBackClick,
    this.onCloseClick,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    Widget leadingIcon;
    if (onCloseClick != null) {
      leadingIcon = IconButton(
        icon: const Icon(Icons.close, size: 24, color: AppTheme.onSurfaceVariant),
        onPressed: onCloseClick,
        tooltip: 'Close',
      );
    } else if (onBackClick != null) {
      leadingIcon = IconButton(
        icon: const Icon(Icons.arrow_back, size: 24, color: AppTheme.onSurface),
        onPressed: onBackClick,
        tooltip: 'Back',
      );
    } else {
      leadingIcon = IconButton(
        icon: const Icon(Icons.menu, size: 24, color: AppTheme.onSurfaceVariant),
        onPressed: onMenuClick ?? () => Scaffold.of(context).openDrawer(),
        tooltip: 'Menu',
      );
    }

    return AppBar(
      backgroundColor: AppTheme.surface,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      leading: leadingIcon,
      centerTitle: false,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.primary,
              letterSpacing: -0.5,
            ),
          ),
          if (subtitle != null)
            Text(
              subtitle!,
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.secondary,
                fontWeight: FontWeight.w500,
              ),
            ),
        ],
      ),
      actions: [
        // Network Status Pill
        InkWell(
          onTap: onToggleOnline,
          borderRadius: BorderRadius.circular(AppTheme.radiusFull),
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
            decoration: BoxDecoration(
              color: isOnline
                  ? AppTheme.success.withValues(alpha: 0.12)
                  : AppTheme.error.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppTheme.radiusFull),
              border: Border.all(
                color: isOnline
                    ? AppTheme.success.withValues(alpha: 0.3)
                    : AppTheme.error.withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 7,
                  height: 7,
                  decoration: BoxDecoration(
                    color: isOnline ? AppTheme.success : AppTheme.error,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  isOnline ? 'ONLINE' : 'OFFLINE',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.6,
                    color: isOnline ? AppTheme.success : AppTheme.error,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 8),

        // Profile Avatar Button
        IconButton(
          icon: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppTheme.secondaryContainer,
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.outlineVariant.withValues(alpha: 0.5)),
            ),
            child: const Icon(Icons.person, size: 18, color: AppTheme.onSecondaryContainer),
          ),
          onPressed: onProfileClick,
          tooltip: 'Profile',
        ),
        const SizedBox(width: 8),
      ],
    );
  }
}
