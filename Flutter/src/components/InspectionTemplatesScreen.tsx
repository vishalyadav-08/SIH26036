import React, { useState } from 'react';
import { InspectionTemplate, ChecklistItem, MeasurementReading } from '../types';

interface InspectionTemplatesScreenProps {
  templates: InspectionTemplate[];
  onStartInspectionFromTemplate: (template: InspectionTemplate) => void;
  onSaveTemplate: (template: InspectionTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export const InspectionTemplatesScreen: React.FC<InspectionTemplatesScreenProps> = ({
  templates,
  onStartInspectionFromTemplate,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<InspectionTemplate | null>(null);
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<InspectionTemplate | null>(null);

  // Template Form State for Creator/Editor
  const [formName, setFormName] = useState('');
  const [formBusinessType, setFormBusinessType] = useState('');
  const [formApparatusType, setFormApparatusType] = useState('');
  const [formAccuracyClass, setFormAccuracyClass] = useState<'Class I' | 'Class II' | 'Class III' | 'Class IIII'>('Class III');
  const [formDescription, setFormDescription] = useState('');
  const [formLaw, setFormLaw] = useState('Legal Metrology Act 2009 & Enforcement Rules');
  const [formDefaultNotes, setFormDefaultNotes] = useState('');
  const [formIcon, setFormIcon] = useState('fact_check');
  const [formColor, setFormColor] = useState('#000666');
  const [formChecklists, setFormChecklists] = useState<{ category: string; label: string }[]>([
    { category: 'Physical Alignment', label: 'Spirit level bubble centered & stable feet locked' },
    { category: 'Security & Seals', label: 'Verification lead seal and anti-tamper stamp intact' },
    { category: 'Display & Zero', label: 'Zero tracking mechanism within ±0.25 e margin' },
  ]);
  const [formReadings, setFormReadings] = useState<{ name: string; ref: number; mpe: number; unit: string }[]>([
    { name: 'Standard Proof Load 1', ref: 5.0, mpe: 0.005, unit: 'kg' },
    { name: 'Standard Proof Load 2', ref: 15.0, mpe: 0.010, unit: 'kg' },
  ]);

  const categories = [
    'All',
    'Fuel Station & Energy Retail',
    'Retail Grocery & Supermarkets',
    'Industrial Freight & Logistics',
    'Jewellers & Precious Metals',
    'Agriculture & Grain Markets',
    'FMCG & Food Processing Units',
    'Custom Officer Templates',
  ];

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Custom Officer Templates'
        ? !t.isPredefined
        : t.businessType === selectedCategory;

    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.businessType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.apparatusType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleOpenCreateModal = (templateToClone?: InspectionTemplate) => {
    if (templateToClone) {
      setEditingTemplate(null);
      setFormName(`${templateToClone.name} (Copy)`);
      setFormBusinessType(templateToClone.businessType);
      setFormApparatusType(templateToClone.apparatusType);
      setFormAccuracyClass(templateToClone.accuracyClass);
      setFormDescription(templateToClone.description);
      setFormLaw(templateToClone.applicableLaw || 'Legal Metrology Rules');
      setFormDefaultNotes(templateToClone.defaultNotes || '');
      setFormIcon(templateToClone.icon || 'fact_check');
      setFormColor(templateToClone.color || '#000666');
      setFormChecklists(templateToClone.checklists.map((c) => ({ category: c.category, label: c.label })));
      setFormReadings(
        templateToClone.readings.map((r) => ({
          name: r.name,
          ref: r.referenceWeight,
          mpe: r.maxPermissibleError,
          unit: r.unit,
        }))
      );
    } else {
      setEditingTemplate(null);
      setFormName('');
      setFormBusinessType('');
      setFormApparatusType('');
      setFormAccuracyClass('Class III');
      setFormDescription('');
      setFormLaw('Legal Metrology Act 2009 & Enforcement Rules');
      setFormDefaultNotes('');
      setFormIcon('fact_check');
      setFormColor('#000666');
      setFormChecklists([
        { category: 'General', label: 'Physical inspection & nameplate verification' },
        { category: 'Technical', label: 'Zero setting and corner load test verification' },
        { category: 'Security', label: 'Lead verification seal embossed & affixed' },
      ]);
      setFormReadings([
        { name: 'Initial Load Test', ref: 5.0, mpe: 0.005, unit: 'kg' },
        { name: 'Full Span Proof Test', ref: 20.0, mpe: 0.02, unit: 'kg' },
      ]);
    }
    setIsCreatingModalOpen(true);
  };

  const handleOpenEditModal = (template: InspectionTemplate) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormBusinessType(template.businessType);
    setFormApparatusType(template.apparatusType);
    setFormAccuracyClass(template.accuracyClass);
    setFormDescription(template.description);
    setFormLaw(template.applicableLaw || 'Legal Metrology Rules');
    setFormDefaultNotes(template.defaultNotes || '');
    setFormIcon(template.icon || 'fact_check');
    setFormColor(template.color || '#000666');
    setFormChecklists(template.checklists.map((c) => ({ category: c.category, label: c.label })));
    setFormReadings(
      template.readings.map((r) => ({
        name: r.name,
        ref: r.referenceWeight,
        mpe: r.maxPermissibleError,
        unit: r.unit,
      }))
    );
    setIsCreatingModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBusinessType.trim()) return;

    const compiledChecklists: ChecklistItem[] = formChecklists
      .filter((c) => c.label.trim())
      .map((c, idx) => ({
        id: `c_gen_${Date.now()}_${idx}`,
        category: c.category.trim() || 'General',
        label: c.label.trim(),
        completed: false,
      }));

    const compiledReadings: MeasurementReading[] = formReadings
      .filter((r) => r.name.trim())
      .map((r, idx) => ({
        id: `r_gen_${Date.now()}_${idx}`,
        name: r.name.trim(),
        referenceWeight: Number(r.ref) || 0,
        maxPermissibleError: Number(r.mpe) || 0.01,
        unit: r.unit.trim() || 'kg',
        isRequired: true,
      }));

    const templateToSave: InspectionTemplate = {
      id: editingTemplate ? editingTemplate.id : `tmpl_custom_${Date.now()}`,
      name: formName.trim(),
      businessType: formBusinessType.trim(),
      apparatusType: formApparatusType.trim() || formName.trim(),
      accuracyClass: formAccuracyClass,
      description: formDescription.trim() || `Configured for ${formBusinessType.trim()} inspections`,
      applicableLaw: formLaw.trim(),
      defaultNotes: formDefaultNotes.trim(),
      icon: formIcon,
      color: formColor,
      createdAt: editingTemplate ? editingTemplate.createdAt : new Date().toISOString().split('T')[0],
      isPredefined: false,
      authorBadge: 'LMO-OFFICER',
      usageCount: editingTemplate?.usageCount || 0,
      checklists: compiledChecklists,
      readings: compiledReadings,
    };

    onSaveTemplate(templateToSave);
    setIsCreatingModalOpen(false);
  };

  const statutoryCount = templates.filter((t) => t.isPredefined).length;
  const customCount = templates.filter((t) => !t.isPredefined).length;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto animate-fade-in">
      {/* Top Banner & Stats */}
      <section className="bg-gradient-to-r from-[#000666] to-[#1a237e] text-white rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span>Recurring Verification Protocols</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Inspection Template Library
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Pre-populate new and scheduled field inspections with standardized statutory checkpoints, tolerance error margins, and specific apparatus protocols.
            </p>
          </div>

          <button
            onClick={() => handleOpenCreateModal()}
            className="px-6 py-3.5 rounded-2xl bg-white text-[#000666] font-bold text-sm shadow-lg hover:bg-[#f5f2fb] active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Create Custom Template</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <span className="text-[11px] uppercase tracking-wider text-white/70 block">Total Templates</span>
            <span className="text-xl font-extrabold">{templates.length}</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <span className="text-[11px] uppercase tracking-wider text-white/70 block">Statutory Acts</span>
            <span className="text-xl font-extrabold text-[#dcdef7]">{statutoryCount}</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <span className="text-[11px] uppercase tracking-wider text-white/70 block">Officer Custom</span>
            <span className="text-xl font-extrabold text-[#81c784]">{customCount}</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <span className="text-[11px] uppercase tracking-wider text-white/70 block">Time Saved</span>
            <span className="text-xl font-extrabold">~75% / Insp</span>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls */}
      <section className="bg-white rounded-2xl border border-[#c6c5d4]/70 p-4 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined text-[22px] text-[#767683] absolute left-3.5 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            placeholder="Search templates by business type (Fuel, Mandi, Jewellers, Retail), apparatus, or law..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/60 text-sm text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#767683] hover:text-[#1b1b21]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#000666] text-white shadow-xs'
                  : 'bg-[#f5f2fb] text-[#454652] hover:bg-[#eae7ef] border border-[#c6c5d4]/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Templates Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-[#c6c5d4]/70 p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-[48px] text-[#767683]">library_books</span>
            <h3 className="text-base font-bold text-[#1b1b21]">No Templates Found</h3>
            <p className="text-xs text-[#454652] max-w-md mx-auto">
              No inspection templates match your current filter or search keyword. You can clear filters or create a new custom template.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-full bg-[#000666] text-white text-xs font-bold hover:bg-[#1a237e]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-3xl border border-[#c6c5d4]/70 hover:border-[#000666]/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-5 space-y-3 border-b border-[#e4e1ea]">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: template.color || '#000666' }}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {template.icon || 'fact_check'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {template.isPredefined ? (
                      <span className="text-[10px] font-bold bg-[#000666]/10 text-[#000666] px-2 py-0.5 rounded-md">
                        Statutory Protocol
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-[#2e7d32]/10 text-[#2e7d32] px-2 py-0.5 rounded-md">
                        Officer Custom
                      </span>
                    )}
                    <span className="text-[10px] font-extrabold bg-[#dcdef7] text-[#171a2c] px-2 py-0.5 rounded-md">
                      {template.accuracyClass}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#000666] uppercase tracking-wider block">
                    {template.businessType}
                  </span>
                  <h3 className="text-base font-bold text-[#1b1b21] group-hover:text-[#000666] transition-colors line-clamp-1">
                    {template.name}
                  </h3>
                  <p className="text-xs text-[#454652] line-clamp-2 mt-1 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Card Body: Checkpoints & Test Readings Highlights */}
              <div className="p-5 space-y-3 bg-[#fbfafc] flex-1">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-[#e4e1ea] space-y-0.5">
                    <span className="text-[10px] text-[#767683] uppercase font-bold">Checkpoints</span>
                    <p className="font-extrabold text-[#1b1b21] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-[#2e7d32]">checklist</span>
                      <span>{template.checklists.length} Rules</span>
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-[#e4e1ea] space-y-0.5">
                    <span className="text-[10px] text-[#767683] uppercase font-bold">Standard Weights</span>
                    <p className="font-extrabold text-[#1b1b21] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-[#000666]">speed</span>
                      <span>{template.readings.length} Points</span>
                    </p>
                  </div>
                </div>

                {template.applicableLaw && (
                  <p className="text-[11px] text-[#767683] flex items-center gap-1 line-clamp-1">
                    <span className="material-symbols-outlined text-[14px] text-[#000666]">gavel</span>
                    <span>{template.applicableLaw}</span>
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-white border-t border-[#e4e1ea] space-y-2">
                <button
                  onClick={() => onStartInspectionFromTemplate(template)}
                  className="w-full py-2.5 rounded-xl bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  <span>Start Inspection with Template</span>
                </button>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => setSelectedTemplateForPreview(template)}
                    className="flex-1 py-1.5 rounded-lg border border-[#c6c5d4] hover:bg-[#f5f2fb] text-[11px] font-bold text-[#454652] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleOpenCreateModal(template)}
                    className="py-1.5 px-3 rounded-lg border border-[#c6c5d4] hover:bg-[#f5f2fb] text-[11px] font-bold text-[#454652] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Duplicate template"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>Clone</span>
                  </button>

                  {!template.isPredefined && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(template)}
                        className="p-1.5 rounded-lg border border-[#c6c5d4] hover:bg-[#f5f2fb] text-[#000666] transition-colors cursor-pointer"
                        title="Edit custom template"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteTemplate(template.id)}
                        className="p-1.5 rounded-lg border border-[#ffdad6] hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors cursor-pointer"
                        title="Delete custom template"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Preview Modal */}
      {selectedTemplateForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#c6c5d4]/80 flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-5 border-b border-[#e4e1ea] bg-[#f5f2fb] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: selectedTemplateForPreview.color || '#000666' }}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {selectedTemplateForPreview.icon || 'fact_check'}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1b1b21]">
                    {selectedTemplateForPreview.name}
                  </h3>
                  <p className="text-xs text-[#454652]">{selectedTemplateForPreview.businessType}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplateForPreview(null)}
                className="w-9 h-9 rounded-full hover:bg-[#eae7ef] text-[#454652] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <p className="text-sm text-[#454652] leading-relaxed">
                {selectedTemplateForPreview.description}
              </p>

              {/* Checkpoints list */}
              <div>
                <h4 className="font-bold text-[#000666] uppercase tracking-wider mb-2">
                  Predefined Checkpoints ({selectedTemplateForPreview.checklists.length})
                </h4>
                <div className="space-y-1.5">
                  {selectedTemplateForPreview.checklists.map((c, i) => (
                    <div
                      key={c.id || i}
                      className="p-2.5 rounded-xl bg-[#f8f9fa] border border-[#e4e1ea] flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#000666]/10 text-[#000666] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-[#1b1b21]">
                        <strong className="text-[#000666]">[{c.category}]</strong> {c.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test weights */}
              <div>
                <h4 className="font-bold text-[#000666] uppercase tracking-wider mb-2">
                  Standard Test Points ({selectedTemplateForPreview.readings.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTemplateForPreview.readings.map((r, i) => (
                    <div
                      key={r.id || i}
                      className="p-2.5 rounded-xl bg-[#f8f9fa] border border-[#e4e1ea]"
                    >
                      <p className="font-bold text-[#1b1b21]">{r.name}</p>
                      <p className="text-[11px] text-[#454652] mt-0.5">
                        Ref: {r.referenceWeight} {r.unit} • Tolerance: ±{r.maxPermissibleError} {r.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#e4e1ea] bg-[#f8f9fa] flex items-center justify-between">
              <button
                onClick={() => setSelectedTemplateForPreview(null)}
                className="px-5 py-2 rounded-full border border-[#c6c5d4] text-xs font-semibold text-[#454652]"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  const tmpl = selectedTemplateForPreview;
                  setSelectedTemplateForPreview(null);
                  onStartInspectionFromTemplate(tmpl);
                }}
                className="px-6 py-2 rounded-full bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-bold flex items-center gap-1 shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>Use this Template</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Template Modal Builder */}
      {isCreatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#c6c5d4]/80 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-[#e4e1ea] bg-[#f5f2fb] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#000666] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">
                    {editingTemplate ? 'edit_note' : 'add_box'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1b1b21]">
                    {editingTemplate ? 'Edit Custom Template' : 'Create Custom Inspection Template'}
                  </h3>
                  <p className="text-xs text-[#454652]">
                    Design custom verification checkpoints & standard weight protocols for your field region
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingModalOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-[#eae7ef] text-[#454652] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1b1b21]">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Milk Chilling Center Platform Scale"
                    className="w-full h-10 px-3 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-xs text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1b1b21]">Business Type *</label>
                  <input
                    type="text"
                    required
                    value={formBusinessType}
                    onChange={(e) => setFormBusinessType(e.target.value)}
                    placeholder="e.g. Dairy & Milk Processing"
                    className="w-full h-10 px-3 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-xs text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1b1b21]">Apparatus Type</label>
                  <input
                    type="text"
                    value={formApparatusType}
                    onChange={(e) => setFormApparatusType(e.target.value)}
                    placeholder="e.g. SS Platform Scale 100kg"
                    className="w-full h-10 px-3 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-xs text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1b1b21]">Accuracy Class</label>
                  <select
                    value={formAccuracyClass}
                    onChange={(e) =>
                      setFormAccuracyClass(e.target.value as 'Class I' | 'Class II' | 'Class III' | 'Class IIII')
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-xs text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none"
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
                    value={formLaw}
                    onChange={(e) => setFormLaw(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-xs text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1b1b21]">Protocol Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summary of statutory verification guidelines for this apparatus..."
                  className="w-full p-2.5 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-xs text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none resize-none"
                />
              </div>

              {/* Dynamic Checklists Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#000666] uppercase tracking-wider">
                    Statutory Checkpoints ({formChecklists.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFormChecklists([...formChecklists, { category: 'Technical', label: '' }])
                    }
                    className="text-xs font-bold text-[#000666] hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Checkpoint</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formChecklists.map((chk, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Category"
                        value={chk.category}
                        onChange={(e) => {
                          const copy = [...formChecklists];
                          copy[idx].category = e.target.value;
                          setFormChecklists(copy);
                        }}
                        className="w-28 h-9 px-2.5 rounded-lg bg-[#f5f2fb] border border-[#c6c5d4]/60 text-xs font-semibold text-[#000666]"
                      />
                      <input
                        type="text"
                        placeholder="Verification requirement..."
                        value={chk.label}
                        onChange={(e) => {
                          const copy = [...formChecklists];
                          copy[idx].label = e.target.value;
                          setFormChecklists(copy);
                        }}
                        className="flex-1 h-9 px-3 rounded-lg bg-[#f5f2fb] border border-[#c6c5d4]/60 text-xs text-[#1b1b21]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormChecklists(formChecklists.filter((_, i) => i !== idx));
                        }}
                        className="text-[#ba1a1a] hover:bg-[#ffdad6] p-1.5 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Readings Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#000666] uppercase tracking-wider">
                    Standard Load Test Weights ({formReadings.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFormReadings([
                        ...formReadings,
                        { name: 'New Test Load', ref: 10.0, mpe: 0.01, unit: 'kg' },
                      ])
                    }
                    className="text-xs font-bold text-[#000666] hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Test Weight</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formReadings.map((r, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Test Name"
                          value={r.name}
                          onChange={(e) => {
                            const copy = [...formReadings];
                            copy[idx].name = e.target.value;
                            setFormReadings(copy);
                          }}
                          className="w-full h-9 px-2.5 rounded-lg bg-[#f5f2fb] border border-[#c6c5d4]/60 text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="Ref"
                          value={r.ref}
                          onChange={(e) => {
                            const copy = [...formReadings];
                            copy[idx].ref = parseFloat(e.target.value) || 0;
                            setFormReadings(copy);
                          }}
                          className="w-full h-9 px-2 rounded-lg bg-[#f5f2fb] border border-[#c6c5d4]/60 text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="MPE"
                          value={r.mpe}
                          onChange={(e) => {
                            const copy = [...formReadings];
                            copy[idx].mpe = parseFloat(e.target.value) || 0;
                            setFormReadings(copy);
                          }}
                          className="w-full h-9 px-2 rounded-lg bg-[#f5f2fb] border border-[#c6c5d4]/60 text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setFormReadings(formReadings.filter((_, i) => i !== idx));
                          }}
                          className="text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded-lg"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-[#e4e1ea] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-[#c6c5d4] text-xs font-semibold text-[#454652]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-bold shadow-md"
                >
                  Save Template to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
