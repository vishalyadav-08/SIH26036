import React from 'react';
import { MeasurementReading } from '../../types';

interface Step2ReadingsProps {
  readings: MeasurementReading[];
  onUpdateReading: (id: string, indicatedVal: number | undefined) => void;
  onAddReading: () => void;
  onBack: () => void;
  onSaveAndContinue: () => void;
  onApplyTemplate?: () => void;
}

export const Step2Readings: React.FC<Step2ReadingsProps> = ({
  readings,
  onUpdateReading,
  onAddReading,
  onBack,
  onSaveAndContinue,
  onApplyTemplate,
}) => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1b1b21]">Load Tests</h2>
          <p className="text-sm text-[#454652] mt-0.5">
            Record indicated weights using calibrated reference standard weights.
          </p>
        </div>
        {onApplyTemplate && (
          <button
            onClick={onApplyTemplate}
            className="px-3.5 py-1.5 rounded-full bg-[#f5f2fb] hover:bg-[#eae7ef] text-[#000666] border border-[#c6c5d4] text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">auto_stories</span>
            <span>Load Weights Template</span>
          </button>
        )}
      </div>

      {/* Measurement Cards List */}
      <div className="space-y-4">
        {readings.map((reading) => {
          const hasInput = reading.indicatedWeight !== undefined && !isNaN(reading.indicatedWeight);
          const errorValue = hasInput
            ? Number((reading.indicatedWeight! - reading.referenceWeight).toFixed(3))
            : null;
          const exceedsTolerance =
            errorValue !== null && Math.abs(errorValue) > reading.maxPermissibleError;

          const errorSign = errorValue !== null && errorValue > 0 ? '+' : '';
          const formattedError =
            errorValue !== null
              ? `${errorSign}${errorValue.toFixed(3)} ${reading.unit}`
              : '--';

          return (
            <div
              key={reading.id}
              className={`rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden ${
                exceedsTolerance
                  ? 'bg-white border-2 border-[#ba1a1a]'
                  : 'bg-white border border-[#c6c5d4]/70'
              }`}
            >
              {/* Red left accent indicator if exceeds */}
              {exceedsTolerance && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ba1a1a]" />
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#1b1b21]">
                    {reading.name}
                  </h3>
                  {reading.isRequired && (
                    <span className="text-xs text-[#454652] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">
                        error_outline
                      </span>
                      <span>Required</span>
                    </span>
                  )}
                </div>

                <div className="bg-[#eeeeef] text-[#454652] font-semibold text-xs rounded-md px-2.5 py-1">
                  Ref: {reading.referenceWeight.toFixed(3)} {reading.unit}
                </div>
              </div>

              {/* Input & Computed Error Grid */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1">
                  <label
                    htmlFor={`input-${reading.id}`}
                    className={`text-xs font-semibold block ${
                      exceedsTolerance ? 'text-[#ba1a1a]' : 'text-[#454652]'
                    }`}
                  >
                    Indicated ({reading.unit})
                  </label>
                  <input
                    id={`input-${reading.id}`}
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={reading.indicatedWeight ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      onUpdateReading(reading.id, val);
                    }}
                    className={`w-full h-11 px-3.5 rounded-lg font-mono text-base font-medium outline-none transition-all ${
                      exceedsTolerance
                        ? 'bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] focus:ring-2 focus:ring-[#ba1a1a]'
                        : 'bg-[#f5f2fb] border border-[#767683]/60 text-[#1b1b21] focus:bg-white focus:border-[#000666] focus:ring-1 focus:ring-[#000666]'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label
                    className={`text-xs font-semibold block ${
                      exceedsTolerance ? 'text-[#ba1a1a]' : 'text-[#454652]'
                    }`}
                  >
                    Error
                  </label>
                  <div
                    className={`w-full h-11 px-3.5 rounded-lg font-mono text-base flex items-center ${
                      exceedsTolerance
                        ? 'bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] font-bold'
                        : hasInput
                        ? 'bg-[#f5f2fb] border border-[#c6c5d4] text-[#1b1b21] font-semibold'
                        : 'bg-[#eeeeef] border border-dashed border-[#c6c5d4] text-[#767683]'
                    }`}
                  >
                    {formattedError}
                  </div>
                </div>
              </div>

              {/* Warning Alert if exceeded */}
              {exceedsTolerance && (
                <div className="mt-3.5 flex items-start gap-2 text-xs text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                    warning
                  </span>
                  <p className="font-medium leading-tight">
                    Value exceeds maximum permissible error (+{reading.maxPermissibleError.toFixed(3)}{reading.unit}).
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Extra Reading Action */}
        <button
          onClick={onAddReading}
          className="w-full py-3.5 border-2 border-dashed border-[#c6c5d4] rounded-2xl text-[#454652] font-semibold text-xs hover:text-[#000666] hover:border-[#000666] hover:bg-[#f5f2fb] transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add Extra Reading</span>
        </button>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 flex justify-between items-center gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-full font-semibold text-sm text-[#000666] hover:bg-[#dcdef7] active:scale-95 transition-all"
        >
          Back
        </button>
        <button
          onClick={onSaveAndContinue}
          className="h-12 px-8 bg-[#000666] hover:bg-[#1a237e] text-white font-semibold text-sm rounded-full flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <span>Save & Continue</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
