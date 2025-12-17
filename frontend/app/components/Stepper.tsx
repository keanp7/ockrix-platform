/**
 * Stepper Component
 * Displays multi-step progress indicator
 */

interface Step {
  number: number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export default function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <div className={`w-full ${className}`}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isUpcoming = step.number > currentStep;

          return (
            <li key={step.number} className="flex-1 flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1 relative">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                    isCompleted
                      ? 'bg-brand-success-500 border-brand-success-500 text-white'
                      : isActive
                      ? 'bg-brand-primary-500 border-brand-primary-500 text-white shadow-glow-md'
                      : 'bg-dark-bg-secondary border-dark-border-primary text-dark-text-tertiary'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <div
                    className={`text-sm font-semibold ${
                      isActive
                        ? 'text-brand-primary-500'
                        : isCompleted
                        ? 'text-brand-success-500'
                        : 'text-dark-text-tertiary'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-dark-text-tertiary mt-1 hidden sm:block">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`hidden md:block absolute top-6 left-[60%] w-full h-0.5 transition-colors duration-200 ${
                    isCompleted ? 'bg-brand-success-500' : 'bg-dark-border-primary'
                  }`}
                  style={{ width: 'calc(100% - 3rem)', left: 'calc(50% + 1.5rem)' }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
