import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';
import 'package:flutter_field_app/providers/business_providers.dart';
import 'package:flutter_field_app/providers/providers.dart';

class BusinessProfileScreen extends ConsumerWidget {
  const BusinessProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(businessProfileProvider);

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: const Text('Business Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              ref.read(currentUserProvider.notifier).state = null;
              await ref.read(secureStorageProvider).delete(key: 'access_token');
              if (context.mounted) {
                ref.read(secureStorageProvider).delete(key: 'access_token'); context.go('/login');
              }
            },
          ),
        ],
      ),
      body: profileAsync.when(
        data: (profile) => _ProfileForm(profile: profile),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }
}

class _ProfileForm extends ConsumerStatefulWidget {
  final dynamic profile;
  const _ProfileForm({required this.profile});

  @override
  ConsumerState<_ProfileForm> createState() => _ProfileFormState();
}

class _ProfileFormState extends ConsumerState<_ProfileForm> {
  final _formKey = GlobalKey<FormState>();
  
  late TextEditingController _contactController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;

  @override
  void initState() {
    super.initState();
    _contactController = TextEditingController(text: widget.profile.contactName);
    _emailController = TextEditingController(text: widget.profile.email);
    _phoneController = TextEditingController(text: widget.profile.phone);
    _addressController = TextEditingController(text: widget.profile.address);
  }

  @override
  void dispose() {
    _contactController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  void _save() async {
    if (_formKey.currentState!.validate()) {
      // Typically we'd make a PUT request here to update the profile via dioProvider
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile update functionality not fully implemented on MVP')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = widget.profile;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppTheme.standard),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Business Information', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),

            // Read-only fields
            _buildReadOnlyField('Legal Name', profile.legalName),
            const SizedBox(height: 16),
            _buildReadOnlyField('Trade Name', profile.tradeName),
            const SizedBox(height: 16),
            _buildReadOnlyField('Jurisdiction', profile.jurisdictionLabel),
            const SizedBox(height: 24),

            const Divider(),
            const SizedBox(height: 24),

            // Editable fields
            TextFormField(
              controller: _contactController,
              decoration: InputDecoration(
                labelText: 'Contact Person',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
              ),
              validator: (val) => val == null || val.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            
            TextFormField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
              ),
              validator: (val) {
                if (val == null || val.isEmpty) return 'Required';
                if (!val.contains('@')) return 'Invalid email';
                return null;
              },
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _phoneController,
              decoration: InputDecoration(
                labelText: 'Phone',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
              ),
              validator: (val) => val == null || val.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _addressController,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Address',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
              ),
              validator: (val) => val == null || val.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                ),
                child: const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReadOnlyField(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant)),
        const SizedBox(height: 4),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
          decoration: BoxDecoration(
            color: AppTheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          ),
          child: Text(value.isEmpty ? 'N/A' : value, style: const TextStyle(fontSize: 16)),
        ),
      ],
    );
  }
}
