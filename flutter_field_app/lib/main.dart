import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_field_app/l10n/app_localizations.dart';
import 'package:flutter_field_app/theme/app_theme.dart';
import 'package:flutter_field_app/presentation/shared/top_app_bar.dart';
import 'package:flutter_field_app/presentation/shared/bottom_nav_bar.dart';
import 'package:flutter_field_app/presentation/shared/navigation_drawer.dart';
import 'package:flutter_field_app/providers/providers.dart';
import 'package:flutter_field_app/data/repositories/inspection_repository.dart';
import 'package:flutter_field_app/app/router/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Hive.initFlutter();
  final repo = InspectionRepository();
  await repo.init();
  
  runApp(ProviderScope(
    overrides: [
      repositoryProvider.overrideWithValue(repo),
    ],
    child: const MyApp(),
  ));
}

class ScaffoldShell extends StatefulWidget {
  final Widget child;
  final String currentRoute;
  const ScaffoldShell({super.key, required this.child, required this.currentRoute});

  @override
  State<ScaffoldShell> createState() => _ScaffoldShellState();
}

class _ScaffoldShellState extends State<ScaffoldShell> {
  bool isOnline = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomTopAppBar(
        title: 'MapanSetu',
        isOnline: isOnline,
        onToggleOnline: () => setState(() => isOnline = !isOnline),
        onProfileClick: () => context.go('/profile'),
      ),
      drawer: CustomNavigationDrawer(
        currentRoute: widget.currentRoute,
        isOnline: isOnline,
        onToggleOnline: () => setState(() => isOnline = !isOnline),
      ),
      body: widget.child,
      bottomNavigationBar: CustomBottomNavBar(
        currentRoute: widget.currentRoute,
        syncQueueCount: 3,
        onNavigate: (route) => context.go('/$route'),
      ),
    );
  }
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'MapanSetu',
      theme: AppTheme.lightTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
    );
  }
}
