import React, { useState } from 'react';
import { InspectionTemplate } from '../types';

interface TemplatePickerModalProps {
  templates: InspectionTemplate[];
  onSelectTemplate: (template: InspectionTemplate, mode: 'replace' | 'append') => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  allowAppend?: boolean;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  templates,
  onSelectTemplate,
  onClose,
  title = 'Apply Inspection Template',
  subtitle = 'Choose a pre-configured statutory checklist & test load configuration for this business type',
  allowAppend = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [applyMode, setApplyMode] = useState<'replace' | 'append'>('replace');

  const categories = ['All', ...Array.from(new Set(templates.map((t) => t.businessType)))];

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.businessType === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.businessType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.apparatusType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || filteredTemplates[0];

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate, applyMode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#c6c5d4]/80 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#e4e1ea] bg-[#f5f2fb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#000666] text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[22px]">auto_stories</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1b1b21]">{title}</h2>
              <p className="text-xs text-[#454652]">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[#eae7ef] text-[#454652] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-[#e4e1ea] bg-white space-y-3">
          <div className="relative">
            <span className="material-symbols-outlined text-[20px] text-[#767683] absolute left-3.5 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              placeholder="Search by business type, scale model, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f5f2fb] border border-[#c6c5d4]/70 text-sm text-[#1b1b21] focus:bg-white focus:ring-2 focus:ring-[#000666] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#767683] hover:text-[#1b1b21]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#000666] text-white shadow-xs'
                    : 'bg-[#f5f2fb] text-[#454652] hover:bg-[#eae7ef] border border-[#c6c5d4]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Body: 2 Columns on Desktop */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#e4e1ea]">
          {/* Templates List */}
          <div className="md:col-span-5 p-3 space-y-2 max-h-80 md:max-h-full overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-10 px-4">
                <span className="material-symbols-outlined text-[32px] text-[#767683]">search_off</span>
                <p className="text-xs text-[#454652] mt-1 font-medium">No templates match criteria.</p>
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#000666]/5 border-[#000666] shadow-xs'
                        : 'bg-white border-[#c6c5d4]/60 hover:bg-[#f5f2fb] hover:border-[#767683]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5"
                        style={{ backgroundColor: template.color || '#000666' }}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {template.icon || 'fact_check'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-[#1b1b21] truncate">
                            {template.name}
                          </h4>
                          {template.isPredefined ? (
                            <span className="text-[9px] font-bold bg-[#000666]/10 text-[#000666] px-1.5 py-0.5 rounded-md shrink-0">
                              Statutory
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold bg-[#2e7d32]/10 text-[#2e7d32] px-1.5 py-0.5 rounded-md shrink-0">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#454652] truncate mt-0.5">
                          {template.businessType}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-[#767683] mt-1.5 font-medium">
                          <span>{template.checklists.length} Checkpoints</span>
                          <span>•</span>
                          <span>{template.readings.length} Test Weights</span>
                          <span>•</span>
                          <span className="font-semibold text-[#000666]">{template.accuracyClass}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Template Preview Column */}
          <div className="md:col-span-7 p-4 md:p-5 space-y-4 bg-white overflow-y-auto">
            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-[#e4e1ea] pb-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#000666] bg-[#000666]/10 px-2.5 py-0.5 rounded-full mb-1">
                      <span className="material-symbols-outlined text-[14px]">category</span>
                      <span>{selectedTemplate.businessType}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#1b1b21]">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-xs text-[#454652] mt-0.5">
                      {selectedTemplate.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#171a2c] bg-[#dcdef7] px-2.5 py-1 rounded-lg">
                      {selectedTemplate.accuracyClass}
                    </span>
                  </div>
                </div>

                {selectedTemplate.applicableLaw && (
                  <div className="bg-[#f5f2fb] p-2.5 rounded-xl border border-[#c6c5d4]/40 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#000666] mt-0.5">
                      gavel
                    </span>
                    <p className="text-[11px] text-[#454652] font-medium leading-tight">
                      {selectedTemplate.applicableLaw}
                    </p>
                  </div>
                )}

                {/* Pre-configured Checkpoints */}
                <div>
                  <h4 className="text-xs font-bold text-[#767683] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Statutory Checkpoints ({selectedTemplate.checklists.length})</span>
                    <span className="text-[10px] font-normal lowercase text-[#767683]">Categorized</span>
                  </h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedTemplate.checklists.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-2 rounded-xl bg-[#f8f9fa] border border-[#e4e1ea] flex items-start gap-2 text-xs text-[#1b1b21]"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#000666]/10 text-[#000666] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-[#000666] text-[11px] mr-1">
                            [{item.category}]
                          </span>
                          <span className="text-[#454652]">{item.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pre-configured Test Readings */}
                <div>
                  <h4 className="text-xs font-bold text-[#767683] uppercase tracking-wider mb-2">
                    Standard Load Test Points ({selectedTemplate.readings.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {selectedTemplate.readings.map((r, idx) => (
                      <div
                        key={r.id || idx}
                        className="p-2.5 rounded-xl bg-[#f8f9fa] border border-[#e4e1ea] text-xs"
                      >
                        <p className="font-bold text-[#1b1b21] truncate">{r.name}</p>
                        <div className="flex items-center justify-between text-[11px] text-[#454652] mt-1">
                          <span>Ref: {r.referenceWeight} {r.unit}</span>
                          <span className="font-mono text-[#000666] font-semibold">
                            MPE ±{r.maxPermissibleError} {r.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mode Selector (if applicable) */}
                {allowAppend && (
                  <div className="p-3 bg-[#f5f2fb] rounded-2xl border border-[#c6c5d4]/60 space-y-2">
                    <p className="text-xs font-bold text-[#1b1b21]">Application Method:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setApplyMode('replace')}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          applyMode === 'replace'
                            ? 'bg-[#000666] text-white border-[#000666]'
                            : 'bg-white text-[#454652] border-[#c6c5d4]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                        <span>Replace Existing</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setApplyMode('append')}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          applyMode === 'append'
                            ? 'bg-[#000666] text-white border-[#000666]'
                            : 'bg-white text-[#454652] border-[#c6c5d4]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        <span>Merge & Append</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8 text-[#767683]">
                <p className="text-xs">Select a template on the left to review its configuration</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e4e1ea] bg-[#f8f9fa] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-[#c6c5d4] hover:bg-white text-xs font-semibold text-[#454652] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedTemplate}
            className="px-6 py-2.5 rounded-full bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">done</span>
            <span>Apply Selected Template</span>
          </button>
        </div>
      </div>
    </div>
  );
};
