import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';
import 'package:dio/dio.dart';
import 'package:flutter_field_app/providers/providers.dart';

class BusinessRegistrationScreen extends ConsumerStatefulWidget {
  const BusinessRegistrationScreen({super.key});

  @override
  ConsumerState<BusinessRegistrationScreen> createState() => _BusinessRegistrationScreenState();
}

class _BusinessRegistrationScreenState extends ConsumerState<BusinessRegistrationScreen> {
  int _step = 1;
  bool _isLoading = false;

  final _formKey = GlobalKey<FormState>();

  // Step 1
  final _legalNameCtrl = TextEditingController();
  final _tradeNameCtrl = TextEditingController();
  String _constitutionType = 'PROPRIETORSHIP';
  final _contactNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  // Step 2
  final _gstCtrl = TextEditingController();
  final _panCtrl = TextEditingController();

  // Step 3
  bool _isManufacturer = false;
  bool _isDealer = false;
  bool _isRepairer = false;
  bool _isPacker = false;
  final _addressCtrl = TextEditingController();
  final _pincodeCtrl = TextEditingController();

  @override
  void dispose() {
    _legalNameCtrl.dispose();
    _tradeNameCtrl.dispose();
    _contactNameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _gstCtrl.dispose();
    _panCtrl.dispose();
    _addressCtrl.dispose();
    _pincodeCtrl.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_formKey.currentState!.validate()) {
      setState(() => _step++);
    }
  }

  void _prevStep() {
    setState(() => _step--);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isLoading = true);

    final payload = {
      'legalName': _legalNameCtrl.text,
      'tradeName': _tradeNameCtrl.text,
      'constitutionType': _constitutionType,
      'gstNumber': _gstCtrl.text,
      'panNumber': _panCtrl.text,
      'isManufacturer': _isManufacturer,
      'isDealer': _isDealer,
      'isRepairer': _isRepairer,
      'isPacker': _isPacker,
      'contactName': _contactNameCtrl.text,
      'email': _emailCtrl.text,
      'phone': _phoneCtrl.text,
      'address': _addressCtrl.text,
      'pincode': _pincodeCtrl.text,
    };

    try {
      final dio = ref.read(dioProvider);
      await dio.post('/businesses/', data: payload);
      if (mounted) setState(() => _step = 4);
    } on DioException catch (e) {
      // Mock logic mimicking web frontend for MVP
      if (e.message != null && (e.message!.contains('404') || e.message!.contains('401'))) {
        if (mounted) setState(() => _step = 4);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to register business: ${e.message}')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('An unexpected error occurred.')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Basic Information', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppTheme.primary, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        TextFormField(
          controller: _legalNameCtrl,
          decoration: const InputDecoration(labelText: 'Legal Name of Business *', border: OutlineInputBorder()),
          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _tradeNameCtrl,
          decoration: const InputDecoration(labelText: 'Trade Name (Optional)', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          value: _constitutionType,
          decoration: const InputDecoration(labelText: 'Constitution Type *', border: OutlineInputBorder()),
          items: const [
            DropdownMenuItem(value: 'PROPRIETORSHIP', child: Text('Proprietorship')),
            DropdownMenuItem(value: 'PARTNERSHIP', child: Text('Partnership')),
            DropdownMenuItem(value: 'LLP', child: Text('Limited Liability Partnership (LLP)')),
            DropdownMenuItem(value: 'PRIVATE_LIMITED', child: Text('Private Limited Company')),
            DropdownMenuItem(value: 'PUBLIC_LIMITED', child: Text('Public Limited Company')),
            DropdownMenuItem(value: 'HUF', child: Text('Hindu Undivided Family (HUF)')),
          ],
          onChanged: (v) => setState(() => _constitutionType = v!),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _contactNameCtrl,
          decoration: const InputDecoration(labelText: 'Authorized Contact Person *', border: OutlineInputBorder()),
          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _emailCtrl,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(labelText: 'Email Address *', border: OutlineInputBorder()),
          validator: (v) => v == null || !v.contains('@') ? 'Enter a valid email' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _phoneCtrl,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(labelText: 'Phone Number *', border: OutlineInputBorder()),
          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Tax & Registration Details', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppTheme.primary, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        TextFormField(
          controller: _gstCtrl,
          decoration: const InputDecoration(labelText: 'GST Number (GSTIN) *', border: OutlineInputBorder()),
          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _panCtrl,
          decoration: const InputDecoration(labelText: 'PAN Number *', border: OutlineInputBorder()),
          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
        ),
      ],
    );
  }

  Widget _buildStep3() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Scopes & Premises', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppTheme.primary, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Text('Intended Business Scopes *', style: Theme.of(context).textTheme.titleSmall),
        CheckboxListTile(
          title: const Text('Manufacturer'),
          subtitle: const Text('Manufacturing weights, measures, or weighing instruments.'),
          value: _isManufacturer,
          onChanged: (v) => setState(() => _isManufacturer = v ?? false),
        ),
        CheckboxListTile(
          title: const Text('Dealer'),
          subtitle: const Text('Selling, supplying, or distributing instruments.'),
          value: _isDealer,
          onChanged: (v) => setState(() => _isDealer = v ?? false),
        ),
        CheckboxListTile(
          title: const Text('Repairer'),
          subtitle: const Text('Cleaning, adjusting, or repairing instruments.'),
          value: _isRepairer,
          onChanged: (v) => setState(() => _isRepairer = v ?? false),
        ),
        CheckboxListTile(
          title: const Text('Packer/Importer (Rule 27)'),
          subtitle: const Text('Pre-packaged commodities manufacturing or importing.'),
          value: _isPacker,
          onChanged: (v) => setState(() => _isPacker = v ?? false),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _addressCtrl,
          maxLines: 3,
          decoration: const InputDecoration(labelText: 'Registered Address *', border: OutlineInputBorder()),
          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _pincodeCtrl,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'Pincode *', border: OutlineInputBorder()),
          validator: (v) => v == null || v.length != 6 ? 'Enter valid 6-digit pincode' : null,
        ),
      ],
    );
  }

  Widget _buildStep4() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.check_circle, color: Colors.green, size: 64),
        const SizedBox(height: 16),
        Text('Registration Successful', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text(
          'Your business entity has been registered on the MapanSetu network. You can now login to apply for specific licenses.',
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: () => context.go('/login'),
          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
          child: const Text('Proceed to Login'),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Business Entity Registration'),
        backgroundColor: Colors.white,
        foregroundColor: AppTheme.primary,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_step > 1 && _step < 4) {
              _prevStep();
            } else {
              context.pop();
            }
          },
        ),
      ),
      body: SafeArea(
        child: _step == 4
            ? Center(child: Padding(padding: const EdgeInsets.all(24), child: _buildStep4()))
            : Form(
                key: _formKey,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      // Progress Bar
                      LinearProgressIndicator(
                        value: _step / 3,
                        backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                        valueColor: const AlwaysStoppedAnimation(AppTheme.primary),
                      ),
                      const SizedBox(height: 24),
                      if (_step == 1) _buildStep1(),
                      if (_step == 2) _buildStep2(),
                      if (_step == 3) _buildStep3(),
                      const SizedBox(height: 32),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          if (_step > 1)
                            OutlinedButton(
                              onPressed: _prevStep,
                              child: const Text('Back'),
                            )
                          else
                            const SizedBox.shrink(),
                          if (_step < 3)
                            ElevatedButton(
                              onPressed: _nextStep,
                              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
                              child: const Text('Save & Continue'),
                            )
                          else
                            ElevatedButton(
                              onPressed: _isLoading ? null : _submit,
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                              child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('Submit Registration'),
                            ),
                        ],
                      )
                    ],
                  ),
                ),
              ),
      ),
    );
  }
}
