import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_field_app/l10n/app_localizations.dart';
import 'package:flutter_field_app/providers/providers.dart';
import 'package:flutter_field_app/data/models/user.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';

import 'package:flutter_field_app/config/app_config.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController _idController = TextEditingController();
  final TextEditingController _pinController = TextEditingController();
  bool _obscurePin = true;
  bool _isLoading = false;
  final LocalAuthentication _localAuth = LocalAuthentication();
  String? _selectedRole; // null means asking for role

  @override
  void dispose() {
    _idController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    setState(() => _isLoading = true);
    
    User? loggedInUser;
    
    if (!AppConfig.useMockBackend) {
      final authRepo = ref.read(authRepositoryProvider);
      loggedInUser = await authRepo.login(_idController.text.trim(), _pinController.text);
    } else {
      await Future.delayed(const Duration(milliseconds: 600));
      if (_idController.text == 'LMO-2024-088' && _pinController.text == '123456') {
        loggedInUser = User(id: _idController.text, role: 'OFFICER');
      } else if (_idController.text == 'BIZ-2024-001' && _pinController.text == '123456') {
        loggedInUser = User(id: _idController.text, role: 'BUSINESS');
      }
    }

    if (mounted) {
      setState(() => _isLoading = false);
      if (loggedInUser != null) {
        ref.read(currentUserProvider.notifier).state = loggedInUser;
        if (loggedInUser.role == 'OFFICER' || loggedInUser.role == 'LMO') {
          context.go('/dashboard');
        } else if (loggedInUser.role == 'BUSINESS') {
          context.go('/business');
        } else {
          // Default for demo if role is unmapped
          context.go('/dashboard');
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Login failed. Please check your credentials.')),
        );
      }
    }
  }

  Future<void> _handleBiometricAuth() async {
    try {
      final bool canAuthenticateWithBiometrics = await _localAuth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await _localAuth.isDeviceSupported();

      if (canAuthenticate) {
        final bool didAuthenticate = await _localAuth.authenticate(
          localizedReason: 'Please authenticate to access your field officer dashboard',
          options: const AuthenticationOptions(stickyAuth: true, biometricOnly: false),
        );

        if (didAuthenticate && mounted) {
          _idController.text = _selectedRole == 'OFFICER' ? 'vinod.sharma@lmo.up.gov.demo' : 'info@shreebalaji.demo';
          _pinController.text = 'synthetic-password';
          _handleLogin();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Biometric auth failed: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);
    final currentLocale = ref.watch(localeProvider);

    return Scaffold(
      backgroundColor: AppTheme.surface,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: AppTheme.card, vertical: 24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
                        l10n?.biometricQuickSignIn ?? 'Quick Biometric Sign In',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primary,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.primary, width: 1.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppTheme.section),

                  // Language Switcher Dropdown
                  Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainerLow,
                        borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                        border: Border.all(color: AppTheme.outlineVariant.withValues(alpha: 0.6)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.language, size: 18, color: AppTheme.onSurfaceVariant),
                          const SizedBox(width: 8),
                          DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: ['en', 'hi'].contains(currentLocale.languageCode) ? currentLocale.languageCode : 'en',
                              dropdownColor: AppTheme.surfaceContainerLowest,
                              icon: const Icon(Icons.arrow_drop_down, color: AppTheme.onSurfaceVariant),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.onSurface,
                              ),
                              items: const [
                                DropdownMenuItem(value: 'en', child: Text('English (US)')),
                                DropdownMenuItem(value: 'hi', child: Text('हिन्दी (Hindi)')),
                              ],
                              onChanged: (String? newLang) {
                                if (newLang != null) {
                                  ref.read(localeProvider.notifier).state = Locale(newLang);
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Legal Metrology Footer
                  const Text(
                    'Legal Metrology Division • Department of Consumer Affairs',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 11, color: AppTheme.onSurfaceVariant),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
