import React from 'react';
import { ChecklistItem } from '../../types';

interface Step1ChecklistProps {
  checklists: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onCheckAll: () => void;
  onSaveAndContinue: () => void;
  onApplyTemplate?: () => void;
  onSaveAsTemplate?: () => void;
}

export const Step1Checklist: React.FC<Step1ChecklistProps> = ({
  checklists,
  onToggleItem,
  onCheckAll,
  onSaveAndContinue,
  onApplyTemplate,
  onSaveAsTemplate,
}) => {
  const completedCount = checklists.filter((c) => c.completed).length;
  const progressPercent = Math.round((completedCount / checklists.length) * 100);

  // Group by category
  const categories = Array.from(new Set(checklists.map((c) => c.category)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Template Actions Bar */}
      <div className="flex items-center justify-between gap-2 p-3 bg-[#f5f2fb] rounded-2xl border border-[#c6c5d4]/70">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1b1b21]">
          <span className="material-symbols-outlined text-[18px] text-[#000666]">auto_stories</span>
          <span>Inspection Templates:</span>
        </div>
        <div className="flex items-center gap-2">
          {onApplyTemplate && (
            <button
              onClick={onApplyTemplate}
              className="px-3 py-1.5 rounded-full bg-[#000666] text-white hover:bg-[#1a237e] text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">playlist_add</span>
              <span>Apply Template</span>
            </button>
          )}
          {onSaveAsTemplate && (
            <button
              onClick={onSaveAsTemplate}
              className="px-3 py-1.5 rounded-full bg-white text-[#000666] hover:bg-[#eae7ef] border border-[#c6c5d4] text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">bookmark_add</span>
              <span>Save As Template</span>
            </button>
          )}
        </div>
      </div>

      {/* Header & Progress Card */}
      <div className="bg-white rounded-2xl border border-[#c6c5d4]/60 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1b1b21]">Physical & Compliance Verification</h2>
          <p className="text-sm text-[#454652] mt-0.5">
            Verify all mandatory legal metrology check points.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-sm font-extrabold text-[#000666]">
              {completedCount}/{checklists.length}
            </span>
            <span className="text-xs text-[#454652] ml-1">Passed</span>
          </div>
          <button
            onClick={onCheckAll}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#dcdef7] text-[#171a2c] hover:bg-[#dcdef7]/80 active:scale-95 transition-all"
          >
            Mark All Completed
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#e4e1ea] rounded-full h-2 overflow-hidden">
        <div
          className="bg-[#2e7d32] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist items by category */}
      <div className="space-y-6">
        {categories.map((category) => {
          const items = checklists.filter((c) => c.category === category);
          return (
            <div key={category} className="space-y-2">
              <h3 className="text-xs font-bold text-[#767683] uppercase tracking-wider pl-1">
                {category} Verification
              </h3>
              <div className="bg-white rounded-2xl border border-[#c6c5d4]/60 divide-y divide-[#e4e1ea]/70 overflow-hidden shadow-xs">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3.5 p-4 hover:bg-[#f5f2fb] transition-colors cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => onToggleItem(item.id)}
                      className="mt-0.5 w-5 h-5 rounded-md border-[#767683] text-[#000666] focus:ring-[#000666] cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium leading-snug transition-colors ${
                          item.completed ? 'text-[#1b1b21]' : 'text-[#454652]'
                        }`}
                      >
                        {item.label}
                      </p>
                    </div>
                    {item.completed && (
                      <span className="material-symbols-outlined text-[18px] text-[#2e7d32] shrink-0">
                        check_circle
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Continue Action */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onSaveAndContinue}
          className="w-full sm:w-auto h-12 px-8 bg-[#000666] hover:bg-[#1a237e] text-white font-semibold text-sm rounded-full flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <span>Save & Continue</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
