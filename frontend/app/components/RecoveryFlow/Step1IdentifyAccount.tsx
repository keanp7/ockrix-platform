/**
 * Step 1: Identify Account
 * 
 * UX DECISIONS:
 * =============
 * 1. Email OR Phone (not both) - Simplifies UX, reduces cognitive load
 * 2. Clear label indicates "either/or" - Prevents confusion
 * 3. Real-time validation - Immediate feedback improves UX
 * 4. Security notice - Builds trust, explains privacy approach
 * 5. Prominent CTA - Single action reduces decision fatigue
 */

'use client';

import { useState } from 'react';
import Button from '../Button';
import Card from '../Card';
import VoiceRecovery from '../VoiceRecovery';
import { useLanguage } from '../../contexts/LanguageContext';
import { sanitizeEmail, sanitizePhone } from '../../lib/security/sanitization';

interface Step1IdentifyAccountProps {
  onNext: (identifier: string, method: 'email' | 'phone') => void;
  loading?: boolean;
}

export default function Step1IdentifyAccount({ onNext, loading = false }: Step1IdentifyAccountProps) {
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');

  const validateInput = (value: string, type: 'email' | 'phone'): boolean => {
    if (!value.trim()) {
      setError(t.errors.required);
      return false;
    }

    try {
      if (type === 'email') {
        // Sanitize email
        const sanitized = sanitizeEmail(value);
        // Update state with sanitized value
        if (sanitized !== value) {
          setIdentifier(sanitized);
        }
      } else {
        // Sanitize phone
        const sanitized = sanitizePhone(value);
        // Update state with sanitized value
        if (sanitized !== value) {
          setIdentifier(sanitized);
        }
      }
      setError('');
      return true;
    } catch (err) {
      // Sanitization failed
      setError(err instanceof Error ? err.message : (type === 'email' ? t.errors.invalidEmail : t.errors.invalidPhone));
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateInput(identifier, method)) {
      onNext(identifier.trim(), method);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-dark-text-primary">
          {t.recovery.identifyAccount}
        </h2>
        <p className="text-lg text-dark-text-secondary">
          {t.recovery.enterEmailOrPhone}
        </p>
      </div>

      {/* Security Notice */}
      <Card className="bg-brand-primary-500/10 border-brand-primary-500/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-brand-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-dark-text-primary mb-1">{t.security.privacyProtected}</h3>
              <p className="text-sm text-dark-text-secondary">
                {method === 'email' 
                  ? t.recovery.enterToken.replace('email', 'email')
                  : t.recovery.enterToken.replace('email', 'phone')
                }
              </p>
            </div>
        </div>
      </Card>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Method Selector */}
          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-3">
              Recovery Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setMethod('email');
                  setIdentifier('');
                  setError('');
                }}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  method === 'email'
                    ? 'border-brand-primary-500 bg-brand-primary-500/10 text-brand-primary-500'
                    : 'border-dark-border-primary bg-dark-bg-secondary text-dark-text-secondary hover:border-dark-border-accent'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{t.recovery.emailAddress}</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod('phone');
                  setIdentifier('');
                  setError('');
                }}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  method === 'phone'
                    ? 'border-brand-primary-500 bg-brand-primary-500/10 text-brand-primary-500'
                    : 'border-dark-border-primary bg-dark-bg-secondary text-dark-text-secondary hover:border-dark-border-accent'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-medium">{t.recovery.phoneNumber}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Input Field */}
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-dark-text-primary mb-2">
              {method === 'email' ? t.recovery.emailAddress : t.recovery.phoneNumber}
            </label>
            <input
              id="identifier"
              type={method === 'email' ? 'email' : 'tel'}
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError('');
              }}
              placeholder={method === 'email' ? 'your.email@example.com' : '+1234567890'}
              className={`w-full px-4 py-3 bg-dark-bg-tertiary border rounded-lg text-dark-text-primary placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition-all ${
                error ? 'border-brand-error-500' : 'border-dark-border-primary'
              }`}
              disabled={loading}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-brand-error-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!identifier.trim() || loading}
          >
            {t.recovery.continueToVerification}
          </Button>

          {/* Helper Text */}
          <p className="text-sm text-dark-text-tertiary text-center">
            Don't have access? Contact support for assistance
          </p>
        </form>
      </Card>
    </div>
  );
}
