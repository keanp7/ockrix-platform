/**
 * Step 3: Secure Recovery Confirmation
 * 
 * UX DECISIONS:
 * =============
 * 1. Token input with paste support - Makes entry easy, reduces errors
 * 2. Visual token format hints - Helps users understand what to enter
 * 3. Real-time validation - Immediate feedback prevents submission errors
 * 4. Security indicators - Shows system is secure, builds trust
 * 5. Success state with next steps - Clear guidance on what happens next
 * 6. Resend option - Allows users to request new token if needed
 */

'use client';

import { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import TrustIndicator from '../TrustIndicator';

interface Step3SecureConfirmationProps {
  identifier: string;
  method: 'email' | 'phone';
  onComplete: (confirmationId: string) => void;
  onBack: () => void;
  onResend?: () => void;
}

export default function Step3SecureConfirmation({
  identifier,
  method,
  onComplete,
  onBack,
  onResend,
}: Step3SecureConfirmationProps) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [confirmationId, setConfirmationId] = useState('');

  const validateToken = (value: string): boolean => {
    // Token should be base64-like (alphanumeric, +, /, =)
    if (!value.trim()) {
      setError('Please enter your recovery token');
      return false;
    }

    if (value.length < 20) {
      setError('Recovery token appears to be invalid');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateToken(token)) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Simulate API call - in production: await fetch('/api/recovery/complete', { ... })
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock response
      const mockConfirmationId = 'conf_' + Math.random().toString(36).substr(2, 16);
      setConfirmationId(mockConfirmationId);
      setCompleted(true);

      // Call completion handler
      setTimeout(() => {
        onComplete(mockConfirmationId);
      }, 2000);
    } catch (err) {
      setError('Recovery confirmation failed. Please check your token and try again.');
      setLoading(false);
    }
  };

  const maskedIdentifier = identifier.includes('@')
    ? `${identifier.slice(0, 3)}***@${identifier.split('@')[1]}`
    : `${identifier.slice(0, 3)}***${identifier.slice(-4)}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-dark-text-primary">
          Secure Recovery Confirmation
        </h2>
        <p className="text-lg text-dark-text-secondary">
          Enter the recovery token sent to your {method === 'email' ? 'email' : 'phone'}
        </p>
      </div>

      {/* Token Sent Notice */}
      <Card className="bg-brand-primary-500/10 border-brand-primary-500/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-brand-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <div className="flex-1">
            <h3 className="font-semibold text-dark-text-primary mb-1">
              Token Sent to {maskedIdentifier}
            </h3>
            <p className="text-sm text-dark-text-secondary">
              Check your {method === 'email' ? 'email inbox' : 'SMS messages'} for a recovery token. 
              Tokens expire in 10 minutes for security.
            </p>
          </div>
        </div>
      </Card>

      {/* Success State */}
      {completed ? (
        <Card className="bg-brand-success-500/10 border-brand-success-500/30">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-success-500/20">
              <svg className="w-8 h-8 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-brand-success-500 mb-2">
                Recovery Confirmed!
              </h3>
              <p className="text-dark-text-secondary">
                Your account recovery has been successfully confirmed. You can now proceed with resetting your password.
              </p>
            </div>
            <div className="pt-4 border-t border-dark-border-primary">
              <TrustIndicator variant="success" message="Secure Confirmation" className="mx-auto" />
            </div>
          </div>
        </Card>
      ) : (
        /* Token Input Form */
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Token Input */}
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-dark-text-primary mb-2">
                Recovery Token
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError('');
                }}
                placeholder="Enter your recovery token"
                className={`w-full px-4 py-3 bg-dark-bg-tertiary border rounded-lg text-dark-text-primary placeholder-dark-text-tertiary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition-all ${
                  error ? 'border-brand-error-500' : 'border-dark-border-primary'
                }`}
                disabled={loading}
                autoFocus
                autoComplete="off"
              />
              {error && (
                <p className="mt-2 text-sm text-brand-error-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              )}
              <p className="mt-2 text-xs text-dark-text-tertiary">
                Token format: Base64 string (alphanumeric characters, typically 32+ characters)
              </p>
            </div>

            {/* Security Indicators */}
            <div className="flex items-center justify-between py-4 border-y border-dark-border-primary">
              <div className="flex items-center gap-2 text-sm text-dark-text-secondary">
                <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Single-use token</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-text-secondary">
                <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Expires in 10 min</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-text-secondary">
                <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Zero-knowledge</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={!token.trim() || loading}
              >
                Confirm Recovery
              </Button>
              {onResend && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={onResend}
                  disabled={loading}
                >
                  Resend Token
                </Button>
              )}
            </div>

            {/* Back Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-brand-primary-500 hover:text-brand-accent-500 transition-colors"
              >
                ← Back to verification
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
