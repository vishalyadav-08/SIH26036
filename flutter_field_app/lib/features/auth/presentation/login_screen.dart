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
      final inputId = _idController.text.trim();
      final pin = _pinController.text.trim();
      if (pin == 'synthetic-password' || pin == '123456') {
        if (inputId.contains('lmo') || inputId.startsWith('LMO') || _selectedRole == 'OFFICER') {
          loggedInUser = User(id: inputId, role: 'LMO');
        } else {
          loggedInUser = User(id: inputId, role: 'BUSINESS');
        }
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
          ref.read(currentUserProvider.notifier).state = null;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Unauthorized role for mobile application.')),
          );
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
          // Fallback biometrics not handled without backend session, just showing login flow normally or need token.
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
              child: _selectedRole == null 
                  ? _buildRoleSelection(theme, l10n, currentLocale) 
                  : _buildLoginForm(theme, l10n, currentLocale),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoleSelection(ThemeData theme, AppLocalizations? l10n, Locale currentLocale) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
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
                'Select Your Role',
                style: theme.textTheme.titleMedium?.copyWith(
                  color: AppTheme.secondary,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 48),
        ElevatedButton(
          onPressed: () => setState(() {
            _selectedRole = 'OFFICER';
            _idController.text = '';
            _pinController.text = '';
          }),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.all(24),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
          ),
          child: const Column(
            children: [
              Icon(Icons.badge, size: 48),
              SizedBox(height: 16),
              Text('LMO Officer', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text('Field Inspector Portal', style: TextStyle(fontSize: 12)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: () => setState(() {
            _selectedRole = 'BUSINESS';
            _idController.text = '';
            _pinController.text = '';
          }),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.all(24),
            backgroundColor: AppTheme.secondaryContainer,
            foregroundColor: AppTheme.onSecondaryContainer,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
          ),
          child: const Column(
            children: [
              Icon(Icons.storefront, size: 48),
              SizedBox(height: 16),
              Text('Business Owner', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text('Manage Certificates & Applications', style: TextStyle(fontSize: 12)),
            ],
          ),
        ),
        const SizedBox(height: 32),
        _buildLanguageSelector(currentLocale),
      ],
    );
  }

  Widget _buildLoginForm(ThemeData theme, AppLocalizations? l10n, Locale currentLocale) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Back Button
        Align(
          alignment: Alignment.centerLeft,
          child: TextButton.icon(
            onPressed: () => setState(() {
              _selectedRole = null;
              _idController.clear();
              _pinController.clear();
            }),
            icon: const Icon(Icons.arrow_back),
            label: const Text('Change Role'),
          ),
        ),
        const SizedBox(height: 16),
        
        // Logo Section
        Center(
          child: Column(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  borderRadius: BorderRadius.circular(AppTheme.radiusXl),
                ),
                child: const Icon(Icons.shield, size: 44, color: Colors.white),
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
                _selectedRole == 'OFFICER' ? (l10n?.fieldOfficerPortal ?? 'LMO Portal') : 'Business Portal',
                style: theme.textTheme.titleMedium?.copyWith(
                  color: AppTheme.secondary,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),

        // Email / ID Input Field
        TextField(
          controller: _idController,
          decoration: InputDecoration(
            labelText: _selectedRole == 'OFFICER' ? (l10n?.officerId ?? 'LMO Email / ID') : 'Business Email',
            filled: true,
            fillColor: AppTheme.surfaceContainerHighest,
            prefixIcon: const Icon(Icons.badge_outlined, color: AppTheme.onSurfaceVariant),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd), borderSide: BorderSide.none),
          ),
        ),
        const SizedBox(height: 16),

        // Password Input Field
        TextField(
          controller: _pinController,
          obscureText: _obscurePin,
          decoration: InputDecoration(
            labelText: l10n?.password ?? 'Password / PIN',
            filled: true,
            fillColor: AppTheme.surfaceContainerHighest,
            prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.onSurfaceVariant),
            suffixIcon: IconButton(
              icon: Icon(_obscurePin ? Icons.visibility_off : Icons.visibility, color: AppTheme.onSurfaceVariant),
              onPressed: () => setState(() => _obscurePin = !_obscurePin),
            ),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd), borderSide: BorderSide.none),
          ),
        ),
        const SizedBox(height: 24),

        // Login Button
        SizedBox(
          height: 52,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleLogin,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
            ),
            child: _isLoading
                ? const CircularProgressIndicator(color: Colors.white)
                : Text(l10n?.signIn ?? 'Sign In', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(height: 24),

        // Biometrics Button
        SizedBox(
          height: 48,
          child: OutlinedButton.icon(
            onPressed: _handleBiometricAuth,
            icon: const Icon(Icons.fingerprint, color: AppTheme.primary, size: 24),
            label: Text(
              l10n?.biometricQuickSignIn ?? 'Quick Biometric Sign In',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primary),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppTheme.primary, width: 1.5),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
            ),
          ),
        ),
        const SizedBox(height: AppTheme.section),
        _buildLanguageSelector(currentLocale),
      ],
    );
  }

  Widget _buildLanguageSelector(Locale currentLocale) {
    return Center(
      child: SegmentedButton<String>(
        segments: const [
          ButtonSegment(value: 'en', label: Text('English')),
          ButtonSegment(value: 'hi', label: Text('हिन्दी')),
        ],
        selected: {currentLocale.languageCode},
        onSelectionChanged: (Set<String> newSelection) {
          ref.read(localeProvider.notifier).state = Locale(newSelection.first);
        },
        style: SegmentedButton.styleFrom(visualDensity: VisualDensity.compact),
      ),
    );
  }
}
