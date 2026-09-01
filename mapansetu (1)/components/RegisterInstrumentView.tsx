'use client';

import React, { useState } from 'react';
import { Instrument } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Scale, 
  MapPin, 
  Cpu, 
  Save, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Check
} from 'lucide-react';

interface RegisterInstrumentViewProps {
  language: Language;
  onCancel: () => void;
  onSubmitSuccess: (instrument: Instrument) => void;
}

export const RegisterInstrumentView: React.FC<RegisterInstrumentViewProps> = ({
  language,
  onCancel,
  onSubmitSuccess,
}) => {
  const t = translations[language];
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    id: 'INST-2026-98241',
    serialNumber: '',
    manufacturer: '',
    modelNumber: '',
    type: 'Electronic Weighing Scale (Class II)',
    accuracyClass: 'Class II (High Accuracy)',
    capacity: '15.000 kg',
    resolution: '0.005 kg',
    locationName: 'Demo Retail Store',
    locationAddress: 'G-Block Market, Sector 14, New Delhi - 110001',
    state: 'Delhi (NCT)',
    pincode: '110001',
  });

  const steps = [
    { num: 1, label: 'Identity' },
    { num: 2, label: 'Classification' },
    { num: 3, label: 'Capacity' },
    { num: 4, label: 'Location' },
    { num: 5, label: 'Review' },
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Create new instrument
      const newInst: Instrument = {
        id: formData.id,
        serialNumber: formData.serialNumber || 'SN-DEMO-991',
        type: formData.type,
        manufacturer: formData.manufacturer || 'Precision Tech Industries',
        modelNumber: formData.modelNumber || 'PT-Scale-XPro',
        accuracyClass: formData.accuracyClass,
        capacity: formData.capacity,
        resolution: formData.resolution,
        location: `${formData.locationName}, ${formData.locationAddress}`,
        status: 'PENDING',
        nextDue: 'Awaiting Initial Stamping',
        registeredDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        merchantName: formData.locationName,
        merchantAddress: formData.locationAddress,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2PrhbZ_pNKm7GywFCjjDbFGXiV13BbeC1WdgPojM-rqNQNBjLckN75yZqMs4P7K_o-ieKRN9nHWZ7HeOdfjpqCgNlFFUfFFyKSkEYlLt7E2Y9KXRNLMgV54qfjWPUfsSpJviATb6cAjUNQKblo-j5PcTKRqoRlfbX9aXG79YcJJDIORoMLSZcGJxwuB13TSIsGlsxjVOZIaSPJhZd9Gp8T3rmJvnu-nZYIhcqMqtCje0xAKPWCOtN',
        lifecycle: [
          {
            title: 'Registered',
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            description: 'Instrument onboarding application submitted by merchant.',
            type: 'registered',
          },
        ],
      };
      onSubmitSuccess(newInst);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.registerNewInstrument}
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">{t.registerNewInstSub}</p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <button
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className="flex flex-col sm:flex-row items-center gap-2 group cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    currentStep === step.num
                      ? 'bg-[#000666] text-white ring-4 ring-blue-100'
                      : currentStep > step.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    currentStep === step.num ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={`hidden sm:block flex-1 h-0.5 mx-2 ${
                    currentStep > step.num ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Wizard Step Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.section1Identity}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t.section1IdentityDesc}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.instRefNumber}
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Auto-assigned unique national metrology passport key.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.mfgSerialNum} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SN-88219-X"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.mfgName} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Precision Tech Industries"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Model Number / Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. PT-Scale-XPro"
                  value={formData.modelNumber}
                  onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Section 2: Classification & Metrology Standards</h2>
              <p className="text-xs text-slate-500 mt-0.5">Specify device category and accuracy class under Legal Metrology Rules.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Instrument Category
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
                >
                  <option value="Electronic Weighing Scale (Class II)">Electronic Weighing Scale (Class II)</option>
                  <option value="Commercial Counter Scale (Class III)">Commercial Counter Scale (Class III)</option>
                  <option value="Platform Scale (Class III)">Platform Scale (Class III)</option>
                  <option value="Weighbridge 50T (Class IV)">Weighbridge 50T (Class IV)</option>
                  <option value="Fuel Dispenser Pump (Class 0.5)">Fuel Dispenser Pump (Class 0.5)</option>
                  <option value="Flow Meter / Volumetric Container">Flow Meter / Volumetric Container</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Accuracy Class
                </label>
                <select
                  value={formData.accuracyClass}
                  onChange={(e) => setFormData({ ...formData, accuracyClass: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
                >
                  <option value="Class I (Special Accuracy)">Class I (Special Accuracy - Laboratory)</option>
                  <option value="Class II (High Accuracy)">Class II (High Accuracy - Jewelers / Pharma)</option>
                  <option value="Class III (Medium Accuracy)">Class III (Medium Accuracy - General Retail)</option>
                  <option value="Class IV (Ordinary Accuracy)">Class IV (Ordinary Accuracy - Industrial / Cargo)</option>
                  <option value="Class 0.5 (Liquids & Petroleum)">Class 0.5 (Liquids & Petroleum)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Section 3: Capacity & Verification Parameters</h2>
              <p className="text-xs text-slate-500 mt-0.5">Define measurement scale range and verification scale interval (e).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Max Capacity (Max)
                </label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Verification Interval (e) / Resolution
                </label>
                <input
                  type="text"
                  value={formData.resolution}
                  onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Section 4: Operating Premises & Location</h2>
              <p className="text-xs text-slate-500 mt-0.5">Physical location where the instrument will be installed and stamped.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Commercial Business / Store Name
                </label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Street Address
                </label>
                <input
                  type="text"
                  value={formData.locationAddress}
                  onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    State / UT Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Section 5: Review & Submit Registration</h2>
              <p className="text-xs text-slate-500 mt-0.5">Confirm device metadata before generating the digital instrument passport.</p>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Instrument Passport ID</span>
                <span className="font-mono font-bold text-blue-900">{formData.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Manufacturer & Serial No</span>
                <span className="font-semibold text-slate-900">{formData.manufacturer || 'Precision Tech Industries'} ({formData.serialNumber || 'SN-88219-X'})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Category & Accuracy Class</span>
                <span className="font-medium text-slate-900">{formData.type} • {formData.accuracyClass}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Capacity / Resolution</span>
                <span className="font-medium text-slate-900">{formData.capacity} / {formData.resolution}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Location</span>
                <span className="font-medium text-slate-900">{formData.locationName}, {formData.locationAddress}</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                By submitting, the instrument will be registered in the National Metrology Database. An initial stamping inspection will be scheduled.
              </span>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert('Draft saved successfully to your local dashboard session.')}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.saveDraft}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-950/20 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>{currentStep === 5 ? t.submit : t.nextStep}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
