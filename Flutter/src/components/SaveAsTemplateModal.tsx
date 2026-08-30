import React, { useState } from 'react';
import { InspectionTask, InspectionTemplate } from '../types';

interface SaveAsTemplateModalProps {
  task: InspectionTask;
  onSaveTemplate: (template: InspectionTemplate) => void;
  onClose: () => void;
}

export const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({
  task,
  onSaveTemplate,
  onClose,
}) => {
  const [templateName, setTemplateName] = useState(`${task.title} Standard Protocol`);
  const [businessType, setBusinessType] = useState(
    task.businessName.includes('Petrol') || task.businessName.includes('Fuel')
      ? 'Fuel Station & Energy Retail'
      : task.businessName.includes('Grain') || task.businessName.includes('Mandi')
      ? 'Agriculture & Grain Markets'
      : task.businessName.includes('Jewel') || task.businessName.includes('Gold')
      ? 'Jewellers & Precious Metals'
      : task.businessName.includes('Freight') || task.businessName.includes('Logistics')
      ? 'Industrial Freight & Logistics'
      : 'Retail Grocery & Supermarkets'
  );
  const [apparatusType, setApparatusType] = useState(task.title || 'Electronic Weighing Instrument');
  const [accuracyClass, setAccuracyClass] = useState<'Class I' | 'Class II' | 'Class III' | 'Class IIII'>(
    task.accuracyClass || 'Class III'
  );
  const [description, setDescription] = useState(
    `Custom statutory checklist configuration containing ${task.checklists.length} verification items and ${task.readings.length} load test measurement points.`
  );
  const [applicableLaw, setApplicableLaw] = useState('Legal Metrology Act 2009 & Enforcement Rules');
  const [selectedIcon, setSelectedIcon] = useState('fact_check');
  const [selectedColor, setSelectedColor] = useState('#000666');

  const icons = [
    { icon: 'fact_check', label: 'Check' },
    { icon: 'storefront', label: 'Retail' },
    { icon: 'local_gas_station', label: 'Fuel' },
    { icon: 'local_shipping', label: 'Heavy' },
    { icon: 'diamond', label: 'Jewellery' },
    { icon: 'agriculture', label: 'Agri' },
    { icon: 'inventory_2', label: 'Packaged' },
  ];

  const colors = [
    { code: '#000666', label: 'Navy' },
    { code: '#1a237e', label: 'Indigo' },
    { code: '#004d40', label: 'Teal' },
    { code: '#2e7d32', label: 'Green' },
    { code: '#b78103', label: 'Amber' },
    { code: '#d84315', label: 'Deep Orange' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;

    // Build reusable template with uncompleted copies of checklist items
    const newTemplate: InspectionTemplate = {
      id: `tmpl_custom_${Date.now()}`,
      name: templateName.trim(),
      businessType: businessType.trim(),
      apparatusType: apparatusType.trim(),
      accuracyClass,
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
      applicableLaw: applicableLaw.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      isPredefined: false,
      authorBadge: 'LMO-FIELD',
      usageCount: 1,
      defaultNotes: task.finalAssessment?.officerNotes || 'Routine statutory verification completed.',
      checklists: task.checklists.map((c, i) => ({
        ...c,
        id: `c_cust_${Date.now()}_${i}`,
        completed: false, // Reset completed flag for future fresh runs
      })),
      readings: task.readings.map((r, i) => ({
        ...r,
        id: `r_cust_${Date.now()}_${i}`,
        indicatedWeight: undefined, // Clear readings so fresh measurements are recorded
      })),
    };

    onSaveTemplate(newTemplate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#c6c5d4]/80 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#e4e1ea] bg-[#f5f2fb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#000666] text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[22px]">bookmark_add</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1b1b21]">Save as Inspection Template</h2>
              <p className="text-xs text-[#454652]">
                Save this configuration for recurring inspections of similar establishments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[#eae7ef] text-[#454652] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Template Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1b1b21]">Template Name *</label>
            <input
              type="text"
              required
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Retail Counter Scale 30kg Protocol"
              className="w-full h-11 px-3.5 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-sm text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none transition-all"
            />
          </div>

          {/* Business Type & Apparatus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1b1b21]">Target Business Type *</label>
              <input
                type="text"
                required
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g. Fuel Stations, Supermarkets"
                className="w-full h-11 px-3.5 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-sm text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1b1b21]">Apparatus Type *</label>
              <input
                type="text"
                required
                value={apparatusType}
                onChange={(e) => setApparatusType(e.target.value)}
                placeholder="e.g. Price Computing Scale"
                className="w-full h-11 px-3.5 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-sm text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none transition-all"
              />
            </div>
          </div>

          {/* Accuracy Class & Statutory Rule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1b1b21]">Accuracy Classification</label>
              <select
                value={accuracyClass}
                onChange={(e) =>
                  setAccuracyClass(e.target.value as 'Class I' | 'Class II' | 'Class III' | 'Class IIII')
                }
                className="w-full h-11 px-3 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-sm text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none cursor-pointer"
              >
                <option value="Class I">Class I (Special / Analytical)</option>
                <option value="Class II">Class II (High Precision / Gold)</option>
                <option value="Class III">Class III (Medium / Commercial)</option>
                <option value="Class IIII">Class IIII (Ordinary / Weighbridge)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1b1b21]">Applicable Metrology Act</label>
              <input
                type="text"
                value={applicableLaw}
                onChange={(e) => setApplicableLaw(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-sm text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1b1b21]">Description / Instructions</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-sm text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none transition-all resize-none"
            />
          </div>

          {/* Icon & Theme Color Selector */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1b1b21]">Icon Representation</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {icons.map((ic) => (
                  <button
                    key={ic.icon}
                    type="button"
                    onClick={() => setSelectedIcon(ic.icon)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      selectedIcon === ic.icon
                        ? 'bg-[#000666] text-white ring-2 ring-[#000666]/30'
                        : 'bg-[#f5f2fb] text-[#454652] hover:bg-[#eae7ef]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{ic.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1b1b21]">Color Accent</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {colors.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedColor(c.code)}
                    style={{ backgroundColor: c.code }}
                    className={`w-8 h-8 rounded-xl transition-all cursor-pointer ${
                      selectedColor === c.code ? 'ring-3 ring-offset-1 ring-[#000666]' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Captured Data Summary Card */}
          <div className="bg-[#f5f2fb] p-3.5 rounded-2xl border border-[#c6c5d4]/60 space-y-1 text-xs">
            <div className="flex items-center justify-between font-semibold text-[#1b1b21]">
              <span>Items in this Template:</span>
              <span className="text-[#000666] font-bold">
                {task.checklists.length} Checklist Points • {task.readings.length} Test Weights
              </span>
            </div>
            <p className="text-[11px] text-[#767683]">
              All items will be packaged into your personal template library and can be used on any new or scheduled inspection.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#c6c5d4] hover:bg-[#f5f2fb] text-xs font-semibold text-[#454652] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save to Library</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
