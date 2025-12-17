'use client';

import Card from './components/Card';
import Button from './components/Button';
import TrustIndicator from './components/TrustIndicator';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useLanguage } from './contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-dark-bg-primary via-dark-bg-secondary to-dark-bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(45,143,179,0.1),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center space-y-8">
            {/* Trust Indicator */}
            <div className="flex justify-center">
              <TrustIndicator variant="success" message="Zero-Knowledge • AI-Powered • Secure" />
            </div>

            {/* Hero Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-dark-text-primary tracking-tight">
              {t.landing.heroTitle.split('.')[0]}.{' '}
              <span className="bg-gradient-to-r from-brand-primary-500 to-brand-accent-500 bg-clip-text text-transparent">
                {t.landing.heroTitle.split('.')[1]}
              </span>
            </h1>

            {/* Hero Subheadline */}
            <p className="text-xl sm:text-2xl lg:text-3xl text-dark-text-secondary max-w-3xl mx-auto font-light">
              {t.landing.heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button variant="primary" size="lg" className="min-w-[200px]">
                {t.landing.recoverAccess}
              </Button>
              <Button variant="outline" size="lg" className="min-w-[200px]">
                {t.landing.howItWorks}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 pt-12 text-sm text-dark-text-tertiary">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Zero-Knowledge</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>AI Risk Scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>10-Minute Recovery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Recovery Explanation Section */}
      <section className="py-24 bg-dark-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-dark-text-primary mb-4">
              AI-Powered Recovery
            </h2>
            <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
              Advanced machine learning analyzes recovery attempts in real-time to detect fraud and protect your account
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Risk Assessment */}
            <Card hover glow className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-primary-500/20 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-brand-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-dark-text-primary">Real-Time Risk Scoring</h3>
              <p className="text-dark-text-secondary">
                Every recovery attempt is analyzed by AI models trained on millions of fraud patterns. Risk levels: LOW, MEDIUM, or HIGH.
              </p>
            </Card>

            {/* Fraud Detection */}
            <Card hover glow className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-accent-500/20 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-brand-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-dark-text-primary">Fraud Detection</h3>
              <p className="text-dark-text-secondary">
                AI analyzes IP reputation, request patterns, device fingerprints, and behavioral signals to identify suspicious activity instantly.
              </p>
            </Card>

            {/* Automatic Blocking */}
            <Card hover glow className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-success-500/20 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-brand-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-dark-text-primary">Automatic Protection</h3>
              <p className="text-dark-text-secondary">
                HIGH risk attempts are automatically blocked. Legitimate users proceed seamlessly with LOW or MEDIUM risk scores.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Zero-Knowledge Section */}
      <section className="py-24 bg-dark-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div>
                <TrustIndicator variant="success" message="Zero-Knowledge Architecture" className="mb-6" />
                <h2 className="text-4xl sm:text-5xl font-bold text-dark-text-primary mb-6">
                  Your Privacy is Protected
                </h2>
                <p className="text-lg text-dark-text-secondary mb-4">
                  OCKRIX uses zero-knowledge architecture. We never store your passwords or recovery tokens in plain text.
                </p>
                <p className="text-lg text-dark-text-secondary">
                  Even if our systems were compromised, attackers cannot access your recovery tokens. They're cryptographically hashed using bcrypt with unique salts.
                </p>
              </div>

              {/* Trust Features */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-success-500/20 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-text-primary mb-1">Cryptographically Secure Tokens</h4>
                    <p className="text-dark-text-secondary text-sm">
                      256-bit tokens generated using cryptographically secure random number generators. Impossible to predict or brute force.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-success-500/20 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-text-primary mb-1">Token Hashing Before Storage</h4>
                    <p className="text-dark-text-secondary text-sm">
                      Tokens are hashed with bcrypt (cost factor 12) before storage. Even database compromise doesn't reveal tokens.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-success-500/20 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-text-primary mb-1">Single-Use & Time-Limited</h4>
                    <p className="text-dark-text-secondary text-sm">
                      Each token can only be used once and expires after 10 minutes. Prevents replay attacks and limits exposure window.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-success-500/20 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-brand-success-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-text-primary mb-1">No Password Storage</h4>
                    <p className="text-dark-text-secondary text-sm">
                      We don't store passwords. Your authentication is handled by external services. We only manage recovery tokens.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Visual/Illustration */}
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-dark-bg-tertiary to-dark-bg-secondary border-brand-primary-500/20">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand-primary-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-brand-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-dark-text-primary">Zero-Knowledge</div>
                        <div className="text-sm text-dark-text-secondary">Active</div>
                      </div>
                    </div>
                    <TrustIndicator variant="success" />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-dark-border-primary">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-text-secondary">Token Storage</span>
                      <span className="text-brand-success-500 font-medium">Hashed</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-text-secondary">Password Storage</span>
                      <span className="text-brand-success-500 font-medium">None</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-text-secondary">Encryption</span>
                      <span className="text-brand-success-500 font-medium">Bcrypt</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-text-secondary">Token Expiry</span>
                      <span className="text-brand-success-500 font-medium">10 Minutes</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dark-border-primary">
                    <div className="text-xs text-dark-text-tertiary">
                      <div className="font-mono text-brand-primary-500 mb-2">Security Status:</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand-success-500"></div>
                          <span>All systems secure</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand-success-500"></div>
                          <span>Zero-knowledge verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand-success-500"></div>
                          <span>AI protection active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-dark-bg-primary to-dark-bg-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card glow className="p-12 bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary border-brand-primary-500/30">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-dark-text-primary mb-4">
                  Ready to Recover Your Access?
                </h2>
                <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
                  Experience secure, AI-powered account recovery with zero-knowledge architecture.
                  Your privacy is our priority.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" size="lg" className="min-w-[220px] text-lg">
                  Recover Access
                </Button>
                <Button variant="outline" size="lg" className="min-w-[220px] text-lg">
                  Learn More
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-dark-border-primary">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-success-500 mb-1">100%</div>
                  <div className="text-sm text-dark-text-secondary">Zero-Knowledge</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-success-500 mb-1">10min</div>
                  <div className="text-sm text-dark-text-secondary">Recovery Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-success-500 mb-1">AI</div>
                  <div className="text-sm text-dark-text-secondary">Fraud Detection</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-success-500 mb-1">256-bit</div>
                  <div className="text-sm text-dark-text-secondary">Encryption</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}