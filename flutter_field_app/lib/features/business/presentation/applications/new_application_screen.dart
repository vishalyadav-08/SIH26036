import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';
import 'package:flutter_field_app/providers/business_providers.dart';

class NewApplicationScreen extends ConsumerStatefulWidget {
  const NewApplicationScreen({super.key});

  @override
  ConsumerState<NewApplicationScreen> createState() => _NewApplicationScreenState();
}

class _NewApplicationScreenState extends ConsumerState<NewApplicationScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedInstrument;

  @override
  Widget build(BuildContext context) {
    final instruments = ref.watch(businessInstrumentsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('New Application')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.standard),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Select Instrument'),
                // ignore: deprecated_member_use
                value: _selectedInstrument,
                items: instruments.map((inst) {
                  return DropdownMenuItem(
                    value: inst.id,
                    child: Text('${inst.instrumentNumber} - ${inst.instrumentType}'),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _selectedInstrument = val),
                validator: (val) => val == null ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Reason for Application'),
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Application Submitted Successfully')));
                      context.pop();
                    }
                  },
                  child: const Text('Submit Application'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
