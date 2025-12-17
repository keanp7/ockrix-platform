'use client';

/**
 * Recovery Flow Page
 * 
 * Multi-step recovery flow:
 * 1. Identify Account (email/phone)
 * 2. AI Verification (risk scoring)
 * 3. Secure Recovery Confirmation (token validation)
 * 
 * UX DECISIONS SUMMARY:
 * =====================
 * 
 * 1. STEPPER COMPONENT
 *    - Visual progress indicator reduces anxiety
 *    - Shows user where they are in the process
 *    - Completed steps give sense of progress
 *    - Clear labels explain each step
 * 
 * 2. SINGLE STEP VISIBILITY
 *    - Only current step visible at a time
 *    - Reduces cognitive load
 *    - Prevents users from skipping ahead
 *    - Focuses attention on current action
 * 
 * 3. PROGRESSIVE DISCLOSURE
 *    - Information revealed as needed
 *    - Avoids overwhelming users upfront
 *    - Each step builds on previous
 * 
 * 4. CLEAR CALLS TO ACTION
 *    - Single primary action per step
 *    - Secondary actions for flexibility
 *    - Loading states show progress
 * 
 * 5. TRUST BUILDING
 *    - Security notices explain privacy
 *    - Visual indicators show security status
 *    - Transparent about process
 * 
 * 6. ERROR HANDLING
 *    - Clear error messages
 *    - Ability to retry
 *    - Back navigation for corrections
 * 
 * 7. SUCCESS STATES
 *    - Clear confirmation of completion
 *    - Auto-advance reduces friction
 *    - Next steps clearly communicated
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Stepper from '../../components/Stepper';
import Step1IdentifyAccount from '../../components/RecoveryFlow/Step1IdentifyAccount';
import Step2AIVerification from '../../components/RecoveryFlow/Step2AIVerification';
import Step3SecureConfirmation from '../../components/RecoveryFlow/Step3SecureConfirmation';
import Card from '../../components/Card';

type Step = 1 | 2 | 3;

interface RecoveryState {
  identifier: string;
  method: 'email' | 'phone';
  sessionId?: string;
  confirmationId?: string;
}

export default function RecoveryFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [recoveryState, setRecoveryState] = useState<RecoveryState>({
    identifier: '',
    method: 'email',
  });

  const steps = [
    {
      number: 1,
      label: 'Identify Account',
      description: 'Enter email or phone',
    },
    {
      number: 2,
      label: 'AI Verification',
      description: 'Security check',
    },
    {
      number: 3,
      label: 'Confirm Recovery',
      description: 'Enter token',
    },
  ];

  const handleStep1Complete = (identifier: string, method: 'email' | 'phone') => {
    // In production: Call /api/recovery/start
    const sessionId = 'session_' + Math.random().toString(36).substr(2, 16);
    
    setRecoveryState({
      identifier,
      method,
      sessionId,
    });
    setCurrentStep(2);
  };

  const handleStep2Complete = () => {
    setCurrentStep(3);
  };

  const handleStep3Complete = (confirmationId: string) => {
    setRecoveryState(prev => ({ ...prev, confirmationId }));
    
    // Redirect to success page or password reset
    setTimeout(() => {
      router.push(`/recovery/success?confirmationId=${confirmationId}`);
    }, 2000);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    } else {
      router.push('/recovery');
    }
  };

  const handleResendToken = () => {
    // In production: Call /api/recovery/start again
    console.log('Resending token to:', recoveryState.identifier);
    alert('Recovery token resent. Please check your ' + recoveryState.method);
  };

  return (
    <main className="min-h-screen bg-dark-bg-primary py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-dark-text-primary mb-4">
            Recover Access
          </h1>
          <p className="text-lg text-dark-text-secondary">
            Follow these steps to securely recover your account
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <Card className="p-8">
            <Stepper steps={steps} currentStep={currentStep} />
          </Card>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <Step1IdentifyAccount
              onNext={handleStep1Complete}
            />
          )}

          {currentStep === 2 && (
            <Step2AIVerification
              identifier={recoveryState.identifier}
              method={recoveryState.method}
              sessionId={recoveryState.sessionId}
              onNext={handleStep2Complete}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <Step3SecureConfirmation
              identifier={recoveryState.identifier}
              method={recoveryState.method}
              onComplete={handleStep3Complete}
              onBack={handleBack}
              onResend={handleResendToken}
            />
          )}
        </div>

        {/* Security Footer */}
        <div className="text-center">
          <Card className="bg-dark-bg-secondary/50 border-dark-border-primary/50">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-dark-text-tertiary">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Zero-Knowledge Architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" clipRule="evenodd" />
                </svg>
                <span>AI Fraud Protection</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
