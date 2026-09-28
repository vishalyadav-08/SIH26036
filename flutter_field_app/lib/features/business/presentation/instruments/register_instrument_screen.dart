import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';
import 'package:flutter_field_app/providers/providers.dart';
import 'package:flutter_field_app/providers/business_providers.dart';

class RegisterInstrumentScreen extends ConsumerStatefulWidget {
  const RegisterInstrumentScreen({super.key});

  @override
  ConsumerState<RegisterInstrumentScreen> createState() => _RegisterInstrumentScreenState();
}

class _RegisterInstrumentScreenState extends ConsumerState<RegisterInstrumentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _typeCtrl = TextEditingController();
  final _manufacturerCtrl = TextEditingController();
  final _modelCtrl = TextEditingController();
  final _serialCtrl = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _typeCtrl.dispose();
    _manufacturerCtrl.dispose();
    _modelCtrl.dispose();
    _serialCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);
    
    try {
      final dio = ref.read(dioProvider);
      await dio.post('/instruments/', data: {
        'instrumentType': _typeCtrl.text,
        'manufacturer': _manufacturerCtrl.text,
        'modelNumber': _modelCtrl.text,
        'serialNumber': _serialCtrl.text,
      });
      ref.invalidate(businessInstrumentsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Instrument Registered Successfully')));
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register Instrument')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.standard),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _typeCtrl,
                decoration: const InputDecoration(labelText: 'Instrument Type'),
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _manufacturerCtrl,
                decoration: const InputDecoration(labelText: 'Manufacturer'),
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _modelCtrl,
                decoration: const InputDecoration(labelText: 'Model Number'),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _serialCtrl,
                decoration: const InputDecoration(labelText: 'Serial Number'),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  child: _isSubmitting ? const CircularProgressIndicator() : const Text('Submit'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
