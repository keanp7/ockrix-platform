/**
 * Step 2: AI Verification
 * 
 * UX DECISIONS:
 * =============
 * 1. Loading state with progress - Reduces anxiety, shows system is working
 * 2. Risk level visualization - Clear visual feedback builds trust
 * 3. Explain risk factors - Transparency increases user confidence
 * 4. Success states clearly marked - Immediate positive feedback
 * 5. Blocked state with explanation - User understands why access was denied
 * 6. Auto-advance on success - Reduces friction, smooth flow
 * 7. Adaptive questions for MEDIUM risk - Additional verification when needed
 */

'use client';

import { useEffect, useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import TrustIndicator from '../TrustIndicator';
import AdaptiveQuestions from './AdaptiveQuestions';
import {
  analyzeRiskFactors,
  assessRisk,
  verifyAnswers,
  RiskAssessment,
} from '../../lib/aiVerification';

interface Step2AIVerificationProps {
  identifier: string;
  method: 'email' | 'phone';
  sessionId?: string;
  onNext: () => void;
  onBack: () => void;
}

type VerificationStage = 'analyzing' | 'questions' | 'completed' | 'blocked' | 'error';

export default function Step2AIVerification({
  identifier,
  method,
  sessionId,
  onNext,
  onBack,
}: Step2AIVerificationProps) {
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<VerificationStage>('analyzing');
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simulate AI risk scoring API call
    const performVerification = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay (2-3 seconds for realistic feel)
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Mock API call - in production: await fetch('/api/recovery/verify', { ... })
        const mockAssessment: RiskAssessment = {
          riskLevel: 'LOW', // Could be LOW, MEDIUM, or HIGH
          score: 25,
          factors: [],
          blocked: false,
          confidence: 0.92,
        };

        setAssessment(mockAssessment);
        setLoading(false);

        // Auto-advance on success (LOW/MEDIUM risk)
        if (!mockAssessment.blocked) {
          setTimeout(() => {
            onNext();
          }, 2000);
        }
      } catch (err) {
        setError('Verification failed. Please try again.');
        setLoading(false);
      }
    };

    performVerification();
  }, [identifier, method, sessionId, onNext]);

  const riskLevelConfig = {
    LOW: {
      color: 'text-brand-success-500',
      bg: 'bg-brand-success-500/20',
      border: 'border-brand-success-500/30',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      message: 'Verification Successful',
      description: 'Your recovery request has been verified. Proceeding to secure recovery...',
    },
    MEDIUM: {
      color: 'text-brand-warning-500',
      bg: 'bg-brand-warning-500/20',
      border: 'border-brand-warning-500/30',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      message: 'Verification Complete',
      description: 'Additional verification may be required. Proceeding to recovery...',
    },
    HIGH: {
      color: 'text-brand-error-500',
      bg: 'bg-brand-error-500/20',
      border: 'border-brand-error-500/30',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      message: 'Recovery Blocked',
      description: 'This recovery attempt was flagged as high risk and has been blocked for security.',
    },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-dark-text-primary">
          AI Risk Verification
        </h2>
        <p className="text-lg text-dark-text-secondary">
          Analyzing recovery attempt for security risks
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="text-center py-12">
          <div className="space-y-6">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-brand-primary-500 border-t-transparent"></div>
            <div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-2">
                Running Security Analysis
              </h3>
              <p className="text-dark-text-secondary">
                Our AI is analyzing your recovery request...
              </p>
            </div>
            <div className="space-y-2 text-sm text-dark-text-tertiary">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Checking IP reputation</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Analyzing request patterns</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Verifying device fingerprint</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Questions Stage */}
      {stage === 'questions' && assessment && assessment.questions && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-dark-text-primary mb-2">
              Additional Verification Required
            </h3>
            <p className="text-dark-text-secondary">
              To help verify your identity, please answer a few security questions
            </p>
          </div>

          <AdaptiveQuestions
            questions={assessment.questions}
            onSubmit={async (answers) => {
              try {
                setLoading(true);
                
                // Verify answers and re-assess risk
                const updatedAssessment = await verifyAnswers(
                  assessment.questions!,
                  answers,
                  assessment
                );

                setAssessment(updatedAssessment);
                setLoading(false);

                if (updatedAssessment.blocked) {
                  setStage('blocked');
                } else {
                  setStage('completed');
                  // Auto-advance after questions answered
                  setTimeout(() => {
                    onNext();
                  }, 2000);
                }
              } catch (err) {
                setError('Failed to verify answers. Please try again.');
                setLoading(false);
              }
            }}
            loading={loading}
          />
        </div>
      )}

      {/* Results State */}
      {!loading && assessment && stage !== 'questions' && (
        <>
          {/* Risk Assessment Result */}
          <Card className={`border-2 ${riskLevelConfig[assessment.riskLevel].border}`}>
            <div className="text-center space-y-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${riskLevelConfig[assessment.riskLevel].bg} ${riskLevelConfig[assessment.riskLevel].color}`}>
                {riskLevelConfig[assessment.riskLevel].icon}
              </div>

              <div>
                <h3 className={`text-2xl font-bold mb-2 ${riskLevelConfig[assessment.riskLevel].color}`}>
                  {riskLevelConfig[assessment.riskLevel].message}
                </h3>
                <p className="text-dark-text-secondary">
                  {riskLevelConfig[assessment.riskLevel].description}
                </p>
              </div>

              {/* Risk Score */}
              <div className="pt-4 border-t border-dark-border-primary">
                <div className="text-sm text-dark-text-tertiary mb-2">Risk Score</div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 bg-dark-bg-tertiary rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        assessment.riskLevel === 'LOW'
                          ? 'bg-brand-success-500'
                          : assessment.riskLevel === 'MEDIUM'
                          ? 'bg-brand-warning-500'
                          : 'bg-brand-error-500'
                      }`}
                      style={{ width: `${assessment.score}%` }}
                    />
                  </div>
                  <span className={`text-lg font-semibold ${riskLevelConfig[assessment.riskLevel].color}`}>
                    {assessment.score}/100
                  </span>
                </div>
                <div className="text-xs text-dark-text-tertiary mt-2">
                  Confidence: {Math.round(assessment.confidence * 100)}%
                </div>
              </div>

              {/* Risk Factors */}
              <div className="pt-4 border-t border-dark-border-primary text-left">
                <div className="text-sm font-medium text-dark-text-primary mb-3">
                  Risk Factors Analyzed:
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-text-secondary">IP Reputation</span>
                    <span className={`font-semibold ${
                      assessment.factors.ipReputation >= 70 ? 'text-brand-success-500' :
                      assessment.factors.ipReputation >= 50 ? 'text-brand-warning-500' :
                      'text-brand-error-500'
                    }`}>
                      {assessment.factors.ipReputation}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-text-secondary">Device</span>
                    <span className={`font-semibold ${
                      assessment.factors.deviceFingerprint >= 70 ? 'text-brand-success-500' :
                      assessment.factors.deviceFingerprint >= 50 ? 'text-brand-warning-500' :
                      'text-brand-error-500'
                    }`}>
                      {assessment.factors.deviceFingerprint}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-text-secondary">Velocity</span>
                    <span className={`font-semibold ${
                      assessment.factors.velocityCheck >= 70 ? 'text-brand-success-500' :
                      assessment.factors.velocityCheck >= 50 ? 'text-brand-warning-500' :
                      'text-brand-error-500'
                    }`}>
                      {assessment.factors.velocityCheck}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-text-secondary">Location</span>
                    <span className={`font-semibold ${
                      assessment.factors.locationAnomaly >= 70 ? 'text-brand-success-500' :
                      assessment.factors.locationAnomaly >= 50 ? 'text-brand-warning-500' :
                      'text-brand-error-500'
                    }`}>
                      {assessment.factors.locationAnomaly}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {assessment.recommendations && assessment.recommendations.length > 0 && (
                <div className="pt-4 border-t border-dark-border-primary">
                  <div className="text-sm font-medium text-dark-text-primary mb-2">
                    Recommendations:
                  </div>
                  <ul className="space-y-1 text-sm text-dark-text-secondary">
                    {assessment.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-brand-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Blocked State */}
          {assessment.blocked && (
            <Card className="bg-brand-error-500/10 border-brand-error-500/30">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-error-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-dark-text-primary mb-1">
                    Recovery Blocked for Security
                  </h3>
                  <p className="text-sm text-dark-text-secondary mb-4">
                    This recovery attempt was flagged as high risk. If this was you, please contact support or try again from a trusted device.
                  </p>
                  <Button variant="outline" size="sm" onClick={onBack}>
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Success State - Auto-advancing */}
          {!assessment.blocked && stage === 'completed' && (
            <Card className="bg-brand-success-500/10 border-brand-success-500/30">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-brand-success-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-dark-text-secondary">
                    Proceeding to secure recovery confirmation...
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-brand-error-500/10 border-brand-error-500/30">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-brand-error-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-dark-text-primary mb-1">Verification Failed</h3>
              <p className="text-sm text-dark-text-secondary mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={onBack}>
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
