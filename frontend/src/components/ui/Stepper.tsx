import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, idx) => {
        const isDone = step.id < currentStep;
        const isActive = step.id === currentStep;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${isDone ? 'bg-brand-600 text-white' : isActive ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-slate-200 text-slate-500'}
                `}
              >
                {isDone ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium hidden sm:block ${
                  isActive ? 'text-brand-700' : isDone ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${isDone ? 'bg-brand-600' : 'bg-slate-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
