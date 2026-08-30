import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_field_app/l10n/app_localizations.dart';
import 'package:flutter_field_app/providers/providers.dart';
import 'package:flutter_field_app/theme/app_theme.dart';

import 'package:flutter_field_app/config/app_config.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController _idController = TextEditingController(text: 'LMO-2024-088');
  final TextEditingController _pinController = TextEditingController(text: '123456');
  bool _obscurePin = true;
  bool _isLoading = false;
  final LocalAuthentication _localAuth = LocalAuthentication();

  @override
  void dispose() {
    _idController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    setState(() => _isLoading = true);
    
    bool success = true;
    if (!AppConfig.useMockBackend) {
      final authRepo = ref.read(authRepositoryProvider);
      success = await authRepo.login(_idController.text, _pinController.text);
    } else {
      await Future.delayed(const Duration(milliseconds: 600));
    }

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        context.go('/dashboard');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Login failed. Please check your credentials.')),
        );
      }
    }
  }

  Future<void> _handleBiometrics() async {
    try {
      final bool canAuthenticateWithBiometrics = await _localAuth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await _localAuth.isDeviceSupported();

      if (!canAuthenticate) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Biometric authentication is not supported or enrolled on this device.')),
          );
        }
        return;
      }

      final bool didAuthenticate = await _localAuth.authenticate(
        localizedReason: 'Please authenticate to access MapanSetu Field Portal',
        options: const AuthenticationOptions(biometricOnly: true, stickyAuth: true),
      );

      if (didAuthenticate && mounted) {
        context.go('/dashboard');
      }
    } catch (e) {
      if (mounted) {
        context.go('/dashboard');
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
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo / Shield Section
                  Center(
                    child: Column(
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: AppTheme.primary,
                            borderRadius: BorderRadius.circular(AppTheme.radiusXl),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primary.withValues(alpha: 0.25),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.shield,
                            size: 44,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          l10n?.appTitle ?? 'MapanSetu',
                          style: theme.textTheme.displaySmall?.copyWith(
                            color: AppTheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          l10n?.fieldOfficerPortal ?? 'Field Officer Portal',
                          style: theme.textTheme.titleMedium?.copyWith(
                            color: AppTheme.secondary,
                            fontWeight: FontWeight.normal,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.secondaryContainer,
                            borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                          ),
                          child: Text(
                            l10n?.sihPrototype ?? 'SIH 2026 PROTOTYPE',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.onSecondaryContainer,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppTheme.section),

                  // Officer ID Input Field
                  TextField(
                    controller: _idController,
                    decoration: InputDecoration(
                      labelText: l10n?.officerId ?? 'Officer ID',
                      filled: true,
                      fillColor: AppTheme.surfaceContainerHighest,
                      prefixIcon: const Icon(Icons.badge_outlined, color: AppTheme.onSurfaceVariant),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        borderSide: BorderSide.none,
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        borderSide: const BorderSide(color: AppTheme.primary, width: 2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Password/PIN Input Field
                  TextField(
                    controller: _pinController,
                    obscureText: _obscurePin,
                    decoration: InputDecoration(
                      labelText: l10n?.password ?? 'Password / PIN',
                      filled: true,
                      fillColor: AppTheme.surfaceContainerHighest,
                      prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.onSurfaceVariant),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePin ? Icons.visibility_off : Icons.visibility,
                          color: AppTheme.onSurfaceVariant,
                        ),
                        onPressed: () => setState(() => _obscurePin = !_obscurePin),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        borderSide: BorderSide.none,
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        borderSide: const BorderSide(color: AppTheme.primary, width: 2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Forgot Password Link
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Contact your regional supervisor to reset your field credentials.')),
                        );
                      },
                      child: Text(
                        l10n?.forgotPassword ?? 'Forgot Password?',
                        style: const TextStyle(fontSize: 13, color: AppTheme.primary),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Sign In Button
                  SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _handleLogin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        ),
                        elevation: 0,
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                            )
                          : Text(
                              l10n?.signIn ?? 'Sign In',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Biometric Login Button
                  SizedBox(
                    height: 48,
                    child: OutlinedButton.icon(
                      onPressed: _handleBiometrics,
                      icon: const Icon(Icons.fingerprint, color: AppTheme.primary, size: 24),
                      label: Text(
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
