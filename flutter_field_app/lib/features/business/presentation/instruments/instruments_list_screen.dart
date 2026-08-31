import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';
import 'package:flutter_field_app/providers/business_providers.dart';

class InstrumentsListScreen extends ConsumerStatefulWidget {
  const InstrumentsListScreen({super.key});

  @override
  ConsumerState<InstrumentsListScreen> createState() => _InstrumentsListScreenState();
}

class _InstrumentsListScreenState extends ConsumerState<InstrumentsListScreen> {
  String _searchQuery = '';
  String _statusFilter = 'All';

  @override
  Widget build(BuildContext context) {
    final instruments = ref.watch(businessInstrumentsProvider);

    final filtered = instruments.where((inst) {
      final matchesSearch = inst.instrumentNumber.toLowerCase().contains(_searchQuery.toLowerCase()) || 
                            inst.instrumentType.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesStatus = _statusFilter == 'All' || inst.status == _statusFilter;
      return matchesSearch && matchesStatus;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: const Text('My Instruments'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.go('/business/instruments/register'),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(AppTheme.standard),
            color: AppTheme.surfaceContainerLowest,
            child: Column(
              children: [
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Search instruments...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                  ),
                  onChanged: (val) => setState(() => _searchQuery = val),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: ['All', 'VERIFIED', 'EXPIRED', 'PENDING'].map((status) => Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: FilterChip(
                        label: Text(status),
                        selected: _statusFilter == status,
                        onSelected: (selected) {
                          if (selected) setState(() => _statusFilter = status);
                        },
                      ),
                    )).toList(),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: filtered.isEmpty
              ? const Center(child: Text('No instruments found'))
              : ListView.builder(
                  padding: const EdgeInsets.all(AppTheme.standard),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final inst = filtered[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        side: BorderSide(color: AppTheme.outlineVariant.withValues(alpha: 0.5)),
                      ),
                      child: InkWell(
                        onTap: () => context.go('/business/instruments/' + inst.id),
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(inst.instrumentNumber, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  _buildStatusChip(inst.status),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(inst.instrumentType + ' - ' + inst.manufacturer),
                              const SizedBox(height: 4),
                              Text('Location: ' + inst.location, style: const TextStyle(color: AppTheme.onSurfaceVariant, fontSize: 12)),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    switch (status) {
      case 'VERIFIED': color = AppTheme.success; break;
      case 'EXPIRED': color = AppTheme.error; break;
      case 'PENDING': color = AppTheme.warning; break;
      default: color = AppTheme.onSurfaceVariant;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppTheme.radiusFull),
        border: Border.all(color: color),
      ),
      child: Text(status, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color)),
    );
  }
}
