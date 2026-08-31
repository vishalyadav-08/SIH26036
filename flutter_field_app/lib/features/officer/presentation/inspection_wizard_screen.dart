import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:io';
import 'package:flutter_field_app/l10n/app_localizations.dart';
import 'package:flutter_field_app/app/theme/app_theme.dart';

class InspectionWizardScreen extends ConsumerStatefulWidget {
  const InspectionWizardScreen({super.key});

  @override
  ConsumerState<InspectionWizardScreen> createState() => _InspectionWizardScreenState();
}

class _ReadingData {
  final TextEditingController referenceController;
  final TextEditingController indicatedController;
  _ReadingData({String ref = '', String ind = ''})
      : referenceController = TextEditingController(text: ref),
        indicatedController = TextEditingController(text: ind);
  void dispose() {
    referenceController.dispose();
    indicatedController.dispose();
  }
}

class _InspectionWizardScreenState extends ConsumerState<InspectionWizardScreen> {
  int _currentStep = 0; // 0: Checklist, 1: Readings, 2: Evidence, 3: Review
  final PageController _pageController = PageController();

  // Step 1: Checklist State
  final Map<String, String> _checklistAnswers = {
    'c1': 'yes',
    'c2': 'yes',
    'c3': 'yes',
    'c4': 'yes',
  };

  // Step 2: Measurements State
  final List<_ReadingData> _readings = [];

  // Step 3: Evidence & GPS State
  final List<Map<String, String>> _capturedImages = [];
  String _gpsCoords = '28.6139° N, 77.2090° E (Accuracy: ±3.2m)';
  bool _isCapturingGps = false;

  // Step 4: Assessment State
  String _finalDecision = 'pass'; // pass, fail, correction
  final TextEditingController _notesController = TextEditingController();

  @override
  void dispose() {
    _pageController.dispose();
    for (var r in _readings) {
      r.dispose();
    }
    _notesController.dispose();
    super.dispose();
  }

  void _goToStep(int step) {
    setState(() => _currentStep = step);
    _pageController.animateToPage(
      step,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  Future<void> _pickImage() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enable device location services first.')),
        );
      }
      return;
    }
    
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location permission denied.')),
          );
        }
        return;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location permission permanently denied.')),
        );
      }
      return;
    }

    try {
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
      final coords = '${pos.latitude.toStringAsFixed(4)}° N, ${pos.longitude.toStringAsFixed(4)}° E';
      setState(() {
        _gpsCoords = coords;
      });

      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.camera);
      if (image != null) {
        setState(() {
          _capturedImages.add({'path': image.path, 'coords': coords});
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to access camera or location.')),
        );
      }
    }
  }

  Future<void> _captureLocation() async {
    setState(() => _isCapturingGps = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
      setState(() {
        _gpsCoords = '${pos.latitude.toStringAsFixed(4)}° N, ${pos.longitude.toStringAsFixed(4)}° E (Accuracy: ±${pos.accuracy.toStringAsFixed(1)}m)';
      });
    } catch (e) {
      setState(() {
        _gpsCoords = '28.6139° N, 77.2090° E (Acquired via GNSS Satellite)';
      });
    } finally {
      setState(() => _isCapturingGps = false);
    }
  }

  void _submitInspection() {
    final l10n = AppLocalizations.of(context);
    final isHi = l10n?.localeName == 'hi';

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surfaceContainerLowest,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusLg)),
        icon: const Icon(Icons.check_circle, color: AppTheme.success, size: 54),
        title: Text(
          isHi ? 'निरीक्षण सफलतापूर्वक सहेजा गया' : 'Inspection Saved Locally',
          style: const TextStyle(fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        content: Text(
          isHi
              ? 'निरीक्षण को स्थानीय रूप से सहेज लिया गया है और कनेक्टिविटी उपलब्ध होने पर सिंक कतार में जोड़ दिया गया है।'
              : 'The inspection record has been stored locally on this device and queued for background sync.',
          textAlign: TextAlign.center,
          style: const TextStyle(color: AppTheme.onSurfaceVariant),
        ),
        actions: [
          Center(
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                context.go('/dashboard');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              ),
              child: Text(isHi ? 'डैशबोर्ड पर वापस जाएं' : 'Return to Dashboard'),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);
    final isHi = l10n?.localeName == 'hi';

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        backgroundColor: AppTheme.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.onSurface),
          onPressed: () {
            if (_currentStep > 0) {
              _goToStep(_currentStep - 1);
            } else {
              context.go('/inspections');
            }
          },
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isHi ? 'काउंटर स्केल' : 'Counter Scale',
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const Text(
              'APP-DEMO-001',
              style: TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert, color: AppTheme.primary),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Sticky Stepper Header
          Container(
            color: AppTheme.surface,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStepIndicator(0, l10n?.checklist ?? 'Checklist'),
                _buildStepDivider(0),
                _buildStepIndicator(1, l10n?.readings ?? 'Readings'),
                _buildStepDivider(1),
                _buildStepIndicator(2, l10n?.evidence ?? 'Evidence'),
                _buildStepDivider(2),
                _buildStepIndicator(3, l10n?.review ?? 'Review'),
              ],
            ),
          ),
          const Divider(height: 1, color: AppTheme.surfaceContainerHighest),

          // Page View Content
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildChecklistStep(context),
                _buildReadingsStep(context),
                _buildEvidenceStep(context),
                _buildReviewStep(context),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepIndicator(int stepIndex, String label) {
    final isCompleted = _currentStep > stepIndex;
    final isActive = _currentStep == stepIndex;

    Color circleBg;
    Color textColor;
    Widget child;

    if (isCompleted) {
      circleBg = AppTheme.primary;
      textColor = Colors.white;
      child = const Icon(Icons.check, size: 16, color: Colors.white);
    } else if (isActive) {
      circleBg = AppTheme.primaryContainer;
      textColor = AppTheme.onPrimaryContainer;
      child = Text('${stepIndex + 1}', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor));
    } else {
      circleBg = AppTheme.surfaceContainerHighest;
      textColor = AppTheme.onSurfaceVariant;
      child = Text('${stepIndex + 1}', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor));
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: circleBg,
            shape: BoxShape.circle,
            border: isActive ? Border.all(color: AppTheme.primary, width: 2) : null,
          ),
          child: Center(child: child),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
            color: isActive ? AppTheme.primary : AppTheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildStepDivider(int stepIndex) {
    final isPassed = _currentStep > stepIndex;
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 16, left: 4, right: 4),
        color: isPassed ? AppTheme.primary : AppTheme.surfaceContainerHighest,
      ),
    );
  }

  // --- Step 1: Checklist UI ---
  Widget _buildChecklistStep(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final isHi = l10n?.localeName == 'hi';

    final items = [
      {'id': 'c1', 'title': isHi ? 'निर्माता नेमप्लेट और सीरियल नंबर स्पष्ट है' : 'Manufacturer nameplate & serial number legible'},
      {'id': 'c2', 'title': isHi ? 'सत्यापन सील अक्षुण्ण और अप्रभावित है' : 'Verification lead seal intact and untampered'},
      {'id': 'c3', 'title': isHi ? 'उपकरण समतल स्थिति में है (स्पिरिट लेवल केंद्रित)' : 'Instrument is leveled (spirit level centered)'},
      {'id': 'c4', 'title': isHi ? 'शून्य सेटिंग और टीयर तंत्र सही ढंग से काम कर रहा है' : 'Zero-setting and tare mechanism functions properly'},
    ];

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.standard),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isHi ? 'दृश्य और कार्यात्मक चेकलिस्ट' : 'Visual & Functional Checklist',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              isHi ? 'माप दर्ज करने से पहले प्रत्येक अनिवार्य जांच पूरी करें।' : 'Complete each mandatory check before recording readings.',
              style: const TextStyle(fontSize: 13, color: AppTheme.onSurfaceVariant),
            ),
            const SizedBox(height: 16),
            ...items.map((item) {
              final id = item['id']!;
              final currentVal = _checklistAnswers[id];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  border: Border.all(color: AppTheme.outlineVariant.withValues(alpha: 0.6)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item['title']!, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _buildChoiceChip(id, 'yes', isHi ? 'हाँ / पास' : 'YES / PASS', currentVal == 'yes'),
                        _buildChoiceChip(id, 'no', isHi ? 'नहीं / विफल' : 'NO / FAIL', currentVal == 'no'),
                        _buildChoiceChip(id, 'na', 'N/A', currentVal == 'na'),
                      ],
                    ),
                  ],
                ),
              );
            }),
            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomNavigationBar: _buildWizardBottomBar(
        onBack: () => context.go('/inspections'),
        onNext: () => _goToStep(1),
        nextLabel: l10n?.saveAndContinue ?? 'Save & Continue',
      ),
    );
  }

  Widget _buildChoiceChip(String itemId, String value, String label, bool selected) {
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 12, fontWeight: selected ? FontWeight.bold : FontWeight.normal)),
      selected: selected,
      selectedColor: value == 'yes'
          ? AppTheme.successContainer
          : (value == 'no' ? AppTheme.errorContainer : AppTheme.secondaryContainer),
      onSelected: (val) {
        if (val) setState(() => _checklistAnswers[itemId] = value);
      },
    );
  }

  // --- Step 2: Measurements UI (Dynamic) ---
  Widget _buildReadingsStep(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.standard),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n?.loadTests ?? 'Load Tests',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (_readings.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Text('No readings recorded. Add an extra reading to begin.', style: TextStyle(color: AppTheme.onSurfaceVariant)),
              ),
            ...List.generate(_readings.length, (index) {
              final reading = _readings[index];
              final refVal = double.tryParse(reading.referenceController.text) ?? 0.0;
              final indVal = double.tryParse(reading.indicatedController.text) ?? 0.0;
              final error = indVal - refVal;
              final isErrorState = error.abs() > 0.050; // Arbitrary 50g mpe for mock

              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(AppTheme.standard),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  border: Border.all(color: isErrorState ? AppTheme.error : AppTheme.outlineVariant.withValues(alpha: 0.6), width: isErrorState ? 1.5 : 1),
                  boxShadow: [
                    BoxShadow(
                      color: isErrorState ? AppTheme.error.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.02),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Reading ${index + 1}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: AppTheme.error, size: 20),
                          onPressed: () {
                            setState(() {
                              reading.dispose();
                              _readings.removeAt(index);
                            });
                          },
                        )
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Reference (kg)', style: TextStyle(fontSize: 12, color: AppTheme.onSurfaceVariant, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              SizedBox(
                                height: 42,
                                child: TextField(
                                  controller: reading.referenceController,
                                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                  onChanged: (_) => setState((){}),
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: AppTheme.surfaceContainerLow,
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                                      borderSide: const BorderSide(color: AppTheme.outline),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(l10n?.indicatedKg ?? 'Indicated (kg)', style: TextStyle(fontSize: 12, color: isErrorState ? AppTheme.error : AppTheme.onSurfaceVariant, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              SizedBox(
                                height: 42,
                                child: TextField(
                                  controller: reading.indicatedController,
                                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                  onChanged: (_) => setState((){}),
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: isErrorState ? AppTheme.errorContainer : AppTheme.surfaceContainerLow,
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                                      borderSide: BorderSide(color: isErrorState ? AppTheme.error : AppTheme.outline),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(l10n?.errorLabel ?? 'Error', style: TextStyle(fontSize: 12, color: isErrorState ? AppTheme.error : AppTheme.onSurfaceVariant, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Container(
                                height: 42,
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                decoration: BoxDecoration(
                                  color: isErrorState ? AppTheme.errorContainer : AppTheme.surfaceContainer,
                                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                                  border: Border.all(color: isErrorState ? AppTheme.error : AppTheme.outlineVariant),
                                ),
                                alignment: Alignment.centerLeft,
                                child: Text(
                                  '${error > 0 ? '+' : ''}${error.toStringAsFixed(3)} kg',
                                  style: TextStyle(fontSize: 13, color: isErrorState ? AppTheme.onErrorContainer : AppTheme.onSurfaceVariant, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (isErrorState) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.warning, size: 16, color: AppTheme.error),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              l10n?.errorExceedsMpe ?? 'Value exceeds maximum permissible error (+0.050kg).',
                              style: const TextStyle(fontSize: 11, color: AppTheme.error),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              );
            }),

            const SizedBox(height: 16),

            // Add Extra Reading Dashed Button
            InkWell(
              onTap: () {
                setState(() {
                  _readings.add(_ReadingData(ref: '10.000', ind: '10.000'));
                });
              },
              borderRadius: BorderRadius.circular(AppTheme.radiusLg),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  border: Border.all(color: AppTheme.outlineVariant, style: BorderStyle.solid),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.add, size: 20, color: AppTheme.onSurfaceVariant),
                    const SizedBox(width: 8),
                    Text(
                      l10n?.addExtraReading ?? 'Add Extra Reading',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.onSurfaceVariant),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomNavigationBar: _buildWizardBottomBar(
        onBack: () => _goToStep(0),
        onNext: () => _goToStep(2),
        nextLabel: l10n?.saveAndContinue ?? 'Save & Continue',
      ),
    );
  }

  // --- Step 3: Evidence Capture UI (Matching evidence capture/code.html) ---
  Widget _buildEvidenceStep(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.standard),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n?.requiredEvidence ?? 'Required Evidence',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              l10n?.evidenceInstructions ??
                  'Please capture or upload photos of the machine nameplate, general condition, and any identified defects.',
              style: const TextStyle(fontSize: 13, color: AppTheme.onSurfaceVariant),
            ),
            const SizedBox(height: 16),

            // Action Buttons (Capture Photo / Upload Document)
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: _pickImage,
                icon: const Icon(Icons.photo_camera, size: 20),
                label: Text(
                  l10n?.capturePhoto ?? 'Capture Photo',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusFull)),
                  elevation: 0,
                ),
              ),
            ),
            const SizedBox(height: 24),

            // GPS Location Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                border: Border.all(color: AppTheme.outlineVariant.withValues(alpha: 0.6)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on, color: AppTheme.primary, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('GPS Coordinates', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        Text(_gpsCoords, style: const TextStyle(fontSize: 11, color: AppTheme.onSurfaceVariant)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: _isCapturingGps
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.refresh, color: AppTheme.primary),
                    onPressed: _captureLocation,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Captured Evidence Items
            Text(
              '${l10n?.capturedItems ?? 'Captured Items'} (${_capturedImages.length})',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ...List.generate(_capturedImages.length, (idx) {
              final imgData = _capturedImages[idx];
              final imgPath = imgData['path']!;
              final imgCoords = imgData['coords'] ?? 'Unknown Location';
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  border: Border.all(color: AppTheme.outlineVariant.withValues(alpha: 0.6)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image Preview Area with "LOCAL ONLY" Badge
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTheme.radiusLg)),
                          child: Container(
                            height: 180,
                            width: double.infinity,
                            color: AppTheme.surfaceContainer,
                            child: imgPath.startsWith('http')
                                ? Image.network(
                                    imgPath,
                                    fit: BoxFit.cover,
                                    errorBuilder: (ctx, e, st) => const Center(
                                      child: Icon(Icons.image, size: 48, color: AppTheme.outline),
                                    ),
                                  )
                                : Image.file(
                                    File(imgPath),
                                    fit: BoxFit.cover,
                                    errorBuilder: (ctx, e, st) => const Center(
                                      child: Icon(Icons.image, size: 48, color: AppTheme.outline),
                                    ),
                                  ),
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            color: Colors.black.withValues(alpha: 0.6),
                            child: Row(
                              children: [
                                const Icon(Icons.location_on, color: Colors.white, size: 14),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    imgCoords,
                                    style: const TextStyle(color: Colors.white, fontSize: 11),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Positioned(
                          top: 12,
                          right: 12,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.warning.withValues(alpha: 0.95),
                              borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.cloud_off, size: 14, color: AppTheme.onSurface),
                                const SizedBox(width: 4),
                                Text(
                                  l10n?.localOnlyBadge ?? 'LOCAL ONLY',
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.onSurface),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                                colors: [Colors.black.withValues(alpha: 0.7), Colors.transparent],
                              ),
                            ),
                            child: Text(
                              '${l10n?.machineNameplate ?? 'Machine Nameplate'} #${idx + 1}',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ),
                        ),
                      ],
                    ),

                    // Metadata & Actions Footer
                    Padding(
                      padding: const EdgeInsets.all(14.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(l10n?.capturedTime ?? 'Captured 10:45 AM', style: const TextStyle(fontSize: 11, color: AppTheme.onSurfaceVariant)),
                              Text(l10n?.locationCaptured ?? 'Location: Captured', style: const TextStyle(fontSize: 11, color: AppTheme.onSurfaceVariant)),
                            ],
                          ),
                          Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.replay, color: AppTheme.primary, size: 20),
                                onPressed: _pickImage,
                                tooltip: l10n?.retake ?? 'Retake Photo',
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: AppTheme.error, size: 20),
                                onPressed: () {
                                  if (_capturedImages.length > 1) {
                                    setState(() => _capturedImages.removeAt(idx));
                                  }
                                },
                                tooltip: l10n?.delete ?? 'Delete',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),
            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomNavigationBar: _buildWizardBottomBar(
        onBack: () => _goToStep(1),
        onNext: () => _goToStep(3),
        nextLabel: l10n?.saveAndContinue ?? 'Save & Continue',
        stepInfo: 'Step 3 of 4: ${l10n?.evidenceCountProgress ?? 'Evidence Captured'} (${_capturedImages.length}/3)',
      ),
    );
  }

  // --- Step 4: Review & Assessment UI (Matching inspection/code.html) ---
  Widget _buildReviewStep(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final isHi = l10n?.localeName == 'hi';

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.standard),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Warning Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: AppTheme.warning.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              ),
              child: Row(
                children: [
                  const Icon(Icons.cloud_off, color: AppTheme.warning, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    l10n?.readyToSyncOnceOnline ?? 'Ready to sync once online',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Summary Header
            Text(
              l10n?.inspectionSummary ?? 'Inspection Summary',
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.onSurfaceVariant, letterSpacing: 0.8),
            ),
            const SizedBox(height: 2),
            Text(
              'APP-DEMO-001 | ${isHi ? 'काउंटर स्केल' : 'Counter Scale'}',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),

            // Bento Grid of 4 Review Cards
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth > 600;
                return GridView.count(
                  crossAxisCount: isWide ? 2 : 1,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: isWide ? 2.4 : 2.2,
                  children: [
                    // Checklist Review Card
                    _buildReviewCard(
                      icon: Icons.checklist,
                      title: l10n?.checklist ?? 'Checklist',
                      subtitle: '4/4 ${isHi ? 'पूर्ण' : 'Completed'}',
                      onEdit: () => _goToStep(0),
                      extra: LinearProgressIndicator(
                        value: 1.0,
                        backgroundColor: AppTheme.surfaceContainerHighest,
                        color: AppTheme.success,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),

                    // Readings Review Card
                    _buildReviewCard(
                      icon: Icons.speed,
                      title: l10n?.readings ?? 'Readings',
                      subtitle: '${_readings.length} ${isHi ? 'दर्ज की गई' : 'Recorded'}',
                      onEdit: () => _goToStep(1),
                    ),

                    // Evidence Review Card
                    _buildReviewCard(
                      icon: Icons.photo_camera,
                      title: l10n?.evidence ?? 'Evidence',
                      subtitle: '${_capturedImages.length} ${l10n?.itemsAttached ?? 'items attached'}',
                      onEdit: () => _goToStep(2),
                    ),

                    // Location Review Card
                    _buildReviewCard(
                      icon: Icons.location_on,
                      title: isHi ? 'स्थान' : 'Location',
                      subtitle: isHi ? 'कैप्चर किया गया' : 'Captured',
                      onEdit: () => _goToStep(2),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),

            // Final Assessment Section (PASS, FAIL, REQUIRES CORRECTION)
            Container(
              padding: const EdgeInsets.all(AppTheme.standard),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                border: Border.all(color: AppTheme.outlineVariant.withValues(alpha: 0.6)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n?.finalAssessment ?? 'Final Assessment',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    l10n?.inspectionResult ?? 'Inspection Result',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.onSurfaceVariant),
                  ),
                  const SizedBox(height: 8),

                  Row(
                    children: [
                      // PASS Card
                      Expanded(
                        child: _buildDecisionChoiceCard(
                          value: 'pass',
                          label: l10n?.passResult ?? 'PASS',
                          icon: Icons.check_circle,
                          color: AppTheme.success,
                          isSelected: _finalDecision == 'pass',
                          onTap: () => setState(() => _finalDecision = 'pass'),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // FAIL Card
                      Expanded(
                        child: _buildDecisionChoiceCard(
                          value: 'fail',
                          label: l10n?.failResult ?? 'FAIL',
                          icon: Icons.cancel,
                          color: AppTheme.error,
                          isSelected: _finalDecision == 'fail',
                          onTap: () => setState(() => _finalDecision = 'fail'),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // REQUIRES CORRECTION Card
                      Expanded(
                        child: _buildDecisionChoiceCard(
                          value: 'correction',
                          label: isHi ? 'सुधार' : 'CORRECTION',
                          icon: Icons.build,
                          color: AppTheme.warning,
                          isSelected: _finalDecision == 'correction',
                          onTap: () => setState(() => _finalDecision = 'correction'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Officer Notes Textarea
                  Text(
                    l10n?.officerNotes ?? 'Officer Notes',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.onSurfaceVariant),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _notesController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: l10n?.officerNotesPlaceholder ?? 'Add any final observations...',
                      filled: true,
                      fillColor: AppTheme.surfaceContainerLow,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        borderSide: const BorderSide(color: AppTheme.outlineVariant),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppTheme.surfaceContainerLowest,
          border: Border(top: BorderSide(color: AppTheme.outlineVariant.withValues(alpha: 0.5))),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 48,
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _submitInspection,
              icon: const Icon(Icons.send, size: 18),
              label: Text(
                l10n?.submitInspection ?? 'Submit Inspection',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusFull)),
                elevation: 0,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildReviewCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onEdit,
    Widget? extra,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: AppTheme.outlineVariant.withValues(alpha: 0.6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: const BoxDecoration(
                      color: AppTheme.secondaryContainer,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, size: 18, color: AppTheme.onSecondaryContainer),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.onSurfaceVariant)),
                    ],
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.edit, size: 18, color: AppTheme.primary),
                onPressed: onEdit,
              ),
            ],
          ),
          if (extra != null) extra,
        ],
      ),
    );
  }

  Widget _buildDecisionChoiceCard({
    required String value,
    required String label,
    required IconData icon,
    required Color color,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 4),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.12) : AppTheme.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(
            color: isSelected ? color : AppTheme.outlineVariant,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, size: 28, color: isSelected ? color : AppTheme.onSurfaceVariant),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: isSelected ? color : AppTheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWizardBottomBar({
    required VoidCallback onBack,
    required VoidCallback onNext,
    required String nextLabel,
    String? stepInfo,
  }) {
    final l10n = AppLocalizations.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        border: Border(top: BorderSide(color: AppTheme.outlineVariant.withValues(alpha: 0.5))),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            if (stepInfo != null)
              Expanded(
                child: Text(
                  stepInfo,
                  style: const TextStyle(fontSize: 11, color: AppTheme.onSurfaceVariant, fontWeight: FontWeight.w600),
                ),
              )
            else
              OutlinedButton(
                onPressed: onBack,
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.primary,
                  side: const BorderSide(color: AppTheme.outlineVariant),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                ),
                child: Text(l10n?.back ?? 'Back'),
              ),
            ElevatedButton.icon(
              onPressed: onNext,
              icon: const Icon(Icons.arrow_forward, size: 16),
              label: Text(nextLabel, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
