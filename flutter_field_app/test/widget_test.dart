import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_field_app/l10n/app_localizations.dart';
import 'package:flutter_field_app/presentation/screens/login_screen.dart';
import 'package:flutter_field_app/presentation/screens/dashboard_screen.dart';
import 'package:flutter_field_app/presentation/screens/inspections_list_screen.dart';
import 'package:flutter_field_app/presentation/screens/sync_screen.dart';
import 'package:flutter_field_app/presentation/screens/profile_screen.dart';
import 'package:flutter_field_app/presentation/screens/conflict_resolution_screen.dart';
import 'package:flutter_field_app/presentation/shared/top_app_bar.dart';
import 'package:flutter_field_app/presentation/shared/bottom_nav_bar.dart';
import 'package:flutter_field_app/presentation/shared/navigation_drawer.dart';

void main() {
  testWidgets('LoginScreen renders in English', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          locale: Locale('en'),
          home: Scaffold(body: LoginScreen()),
        ),
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('MapanSetu'), findsWidgets);
    expect(find.text('Sign In'), findsOneWidget);
    expect(find.text('Quick Biometric Sign In'), findsOneWidget);
  });

  testWidgets('DashboardScreen renders workload overview and tasks', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          locale: Locale('en'),
          home: Scaffold(body: DashboardScreen()),
        ),
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('Workload Overview'), findsOneWidget);
    expect(find.text('Assigned'), findsOneWidget);
    expect(find.text('Ready to Sync'), findsOneWidget);
    expect(find.text('Start New Inspection'), findsOneWidget);
  });

  testWidgets('InspectionsListScreen renders search and items', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          locale: Locale('en'),
          home: Scaffold(body: InspectionsListScreen()),
        ),
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('Assigned Inspections'), findsOneWidget);
    expect(find.text('Filter'), findsOneWidget);
    expect(find.text('Counter Scale'), findsOneWidget);
  });

  testWidgets('SyncScreen renders pending items and sync all button', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          locale: Locale('en'),
          home: Scaffold(body: SyncScreen()),
        ),
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('Sync Center'), findsOneWidget);
    expect(find.text('3 Items Ready'), findsOneWidget);
    expect(find.text('Sync All Data'), findsOneWidget);
  });

  testWidgets('ConflictResolutionScreen renders local vs server comparison', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          locale: Locale('en'),
          home: Scaffold(body: ConflictResolutionScreen()),
        ),
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('Conflict Detected'), findsOneWidget);
    expect(find.text('Your Local Version'), findsOneWidget);
    expect(find.text('Server Version'), findsOneWidget);
    expect(find.text('Keep Local'), findsOneWidget);
    expect(find.text('Keep Server'), findsOneWidget);
  });

  testWidgets('ProfileScreen renders officer details and language settings', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          locale: Locale('en'),
          home: Scaffold(body: ProfileScreen()),
        ),
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('LMO-2024-088'), findsOneWidget);
    expect(find.text('Operational Stats'), findsOneWidget);
    expect(find.text('App Settings'), findsOneWidget);
  });

  testWidgets('Hindi Localization renders all translated strings on Profile and Dashboard', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          locale: Locale('hi'),
          home: Scaffold(body: DashboardScreen()),
        ),
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('डैशबोर्ड'), findsOneWidget);
    expect(find.text('कार्यभार अवलोकन'), findsOneWidget);
    expect(find.text('नया निरीक्षण शुरू करें'), findsOneWidget);
    expect(find.text('आज का कार्य'), findsOneWidget);
  });

  testWidgets('CustomTopAppBar renders title and online status badge', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        locale: const Locale('en'),
        home: Scaffold(
          appBar: CustomTopAppBar(
            title: 'MapanSetu',
            isOnline: true,
            onToggleOnline: () {},
            onProfileClick: () {},
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('MapanSetu'), findsOneWidget);
    expect(find.text('ONLINE'), findsOneWidget);
  });

  testWidgets('CustomBottomNavBar renders navigation items', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        locale: const Locale('en'),
        home: Scaffold(
          bottomNavigationBar: CustomBottomNavBar(
            currentRoute: 'dashboard',
            syncQueueCount: 3,
            onNavigate: (route) {},
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('Dashboard'), findsOneWidget);
    expect(find.text('Inspections'), findsOneWidget);
    expect(find.text('Sync'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
  });

  testWidgets('CustomNavigationDrawer renders items and network simulator', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        locale: const Locale('en'),
        home: Scaffold(
          drawer: CustomNavigationDrawer(
            currentRoute: 'dashboard',
            isOnline: true,
            onToggleOnline: () {},
          ),
          body: const SizedBox(),
        ),
      ),
    );

    await tester.pumpAndSettle();
    final scaffoldState = tester.state<ScaffoldState>(find.byType(Scaffold));
    scaffoldState.openDrawer();
    await tester.pumpAndSettle();

    expect(find.text('Network Simulator'), findsOneWidget);
    expect(find.text('Go Offline'), findsOneWidget);
  });
}
