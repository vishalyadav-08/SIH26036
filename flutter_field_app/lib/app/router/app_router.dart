import 'package:flutter_field_app/features/business/presentation/applications/applications_list_screen.dart';
import 'package:flutter_field_app/features/business/presentation/applications/new_application_screen.dart';
import 'package:flutter_field_app/features/business/presentation/certificates/certificates_list_screen.dart';
import 'package:flutter_field_app/features/business/presentation/instruments/instruments_list_screen.dart';
import 'package:flutter_field_app/features/business/presentation/instruments/instrument_detail_screen.dart';
import 'package:flutter_field_app/features/business/presentation/instruments/register_instrument_screen.dart';
import 'package:flutter_field_app/features/business/presentation/profile/business_profile_screen.dart';

import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter_field_app/providers/providers.dart';
import 'package:flutter_field_app/features/auth/presentation/login_screen.dart';
import 'package:flutter_field_app/features/officer/presentation/dashboard_screen.dart';
import 'package:flutter_field_app/features/officer/presentation/inspections_list_screen.dart';
import 'package:flutter_field_app/features/officer/presentation/inspection_templates_screen.dart';
import 'package:flutter_field_app/features/officer/presentation/inspection_wizard_screen.dart';
import 'package:flutter_field_app/features/officer/presentation/sync_screen.dart';
import 'package:flutter_field_app/features/officer/presentation/profile_screen.dart';
import 'package:flutter_field_app/features/officer/presentation/conflict_resolution_screen.dart';
import 'package:flutter_field_app/features/business/presentation/dashboard/business_dashboard_screen.dart';
import 'package:flutter_field_app/main.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final user = ref.read(currentUserProvider);
      final isLoggedIn = user != null;
      final isLoggingIn = state.uri.path == '/login';

      if (!isLoggedIn && !isLoggingIn) return '/login';
      if (isLoggedIn && isLoggingIn) {
        if (user.role == 'BUSINESS') return '/business';
        return '/dashboard';
      }
      
      if (isLoggedIn) {
        if (user.role == 'BUSINESS' && state.uri.path.startsWith('/dashboard')) {
          return '/business';
        }
        if (user.role == 'OFFICER' && state.uri.path.startsWith('/business')) {
          return '/dashboard';
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/wizard',
        builder: (context, state) => const InspectionWizardScreen(),
      ),
      GoRoute(
        path: '/conflict',
        builder: (context, state) => const ConflictResolutionScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) {
          final path = state.uri.path;
          final currentRoute = path.startsWith('/') ? path.substring(1) : path;
          return ScaffoldShell(currentRoute: currentRoute, child: child);
        },
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/inspections',
            builder: (context, state) => const InspectionsListScreen(),
          ),
          GoRoute(
            path: '/templates',
            builder: (context, state) => const InspectionTemplatesScreen(),
          ),
          GoRoute(
            path: '/sync',
            builder: (context, state) => const SyncScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),

          GoRoute(
            path: '/business/instruments',
            builder: (context, state) => const InstrumentsListScreen(),
          ),
          GoRoute(
            path: '/business/instruments/register',
            builder: (context, state) => const RegisterInstrumentScreen(),
          ),
          GoRoute(
            path: '/business/instruments/:id',
            builder: (context, state) => InstrumentDetailScreen(instrumentId: state.pathParameters['id']!),
          ),

          GoRoute(
            path: '/business/applications',
            builder: (context, state) => const ApplicationsListScreen(),
          ),
          GoRoute(
            path: '/business/applications/new',
            builder: (context, state) => const NewApplicationScreen(),
          ),
          GoRoute(
            path: '/business/certificates',
            builder: (context, state) => const CertificatesListScreen(),
          ),
          GoRoute(
            path: '/business',
            builder: (context, state) => const BusinessDashboardScreen(),
          ),
          GoRoute(
            path: '/business/profile',
            builder: (context, state) => const BusinessProfileScreen(),
          ),

        ],
      ),
    ],
  );
});
