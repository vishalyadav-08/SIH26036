import React from 'react';

interface WizardHeaderProps {
  currentStep: number; // 1, 2, 3, 4
  onStepClick: (step: number) => void;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  currentStep,
  onStepClick,
}) => {
  const steps = [
    { num: 1, label: 'Checklist' },
    { num: 2, label: 'Readings' },
    { num: 3, label: 'Evidence' },
    { num: 4, label: 'Review' },
  ];

  return (
    <section aria-label="Progress Stepper" className="w-full max-w-xl mx-auto mb-6">
      <div className="flex justify-between items-center relative z-10 w-full px-2 sm:px-6">
        {/* Step Connecting Progress Bars */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#e4e1ea] -z-10" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-[#000666] -z-10 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / 3) * 88}%`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.num;
          const isActive = currentStep === step.num;

          return (
            <button
              key={step.num}
              onClick={() => onStepClick(step.num)}
              className="flex flex-col items-center flex-1 relative group cursor-pointer focus:outline-none"
            >
              {/* Circle Badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                  isCompleted
                    ? 'bg-[#000666] text-white shadow-xs'
                    : isActive
                    ? 'bg-[#1a237e] text-white ring-4 ring-[#dcdef7] shadow-xs'
                    : 'bg-[#e4e1ea] text-[#454652] hover:bg-[#c6c5d4]'
                }`}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[18px]">check</span>
                ) : (
                  step.num
                )}
              </div>

              {/* Step Label */}
              <span
                className={`text-xs tracking-tight text-center transition-colors ${
                  isActive
                    ? 'font-extrabold text-[#000666] uppercase'
                    : isCompleted
                    ? 'font-semibold text-[#1b1b21]'
                    : 'font-medium text-[#767683]'
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
