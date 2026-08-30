"use client";

import Link from "next/link";
import { CheckSquare, Gauge, Camera, Award } from "lucide-react";

interface StepperProps {
  applicationId: string;
  currentStep: "checklist" | "readings" | "evidence" | "review";
}

const STEPS = [
  { id: "checklist", label: "1. Checklist", icon: CheckSquare, path: "checklist" },
  { id: "readings", label: "2. Readings", icon: Gauge, path: "readings" },
  { id: "evidence", label: "3. Evidence", icon: Camera, path: "evidence" },
  { id: "review", label: "4. Review & Decision", icon: Award, path: "review" },
];

export function InspectionStepper({ applicationId, currentStep }: StepperProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs overflow-x-auto">
      <nav aria-label="Inspection Progress" className="flex items-center gap-1 min-w-max">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCurrent = step.id === currentStep;

          return (
            <Link
              key={step.id}
              href={`/field/inspections/${applicationId}/${step.path}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                isCurrent
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{step.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
