import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold gradient-text">OCKRIX</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-text-secondary hover:text-text-primary">
                {t('common.pricing')}
              </Link>
              <Link href="/faq" className="text-text-secondary hover:text-text-primary">
                {t('common.faq')}
              </Link>
              <Link
                href="/login"
                className="text-text-secondary hover:text-text-primary"
              >
                {t('common.signIn')}
              </Link>
              <Link
                href="/signup"
                className="bg-brand-blue-500 text-white px-4 py-2 rounded-lg hover:bg-brand-blue-600 transition-colors"
              >
                {t('common.signUp')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
            {/* Fallback gradient if video doesn't load */}
          </video>
          <div className="absolute inset-0 bg-gradient-brand-subtle" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Info Card - Static informational overlay */}
          {/* NOTE: Avatars and AI presenters are intentionally excluded from early-stage OCKRIX 
               for trust and performance reasons. OCKRIX prioritizes trust, speed, and security 
               over visual AI gimmicks. */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔒</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Access. Recovered.
                  </h3>
                  <p className="text-text-secondary">
                    Our AI-powered recovery system helps you regain access to your accounts
                    securely and quickly, without ever storing your passwords.
                  </p>
                </div>
                <button className="text-text-tertiary hover:text-text-primary">
                  <span className="sr-only">Dismiss</span>
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-gradient-brand text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all"
            >
              {t('hero.cta')}
            </Link>
            <Link
              href="/pricing"
              className="bg-white border-2 border-brand-blue-500 text-brand-blue-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-blue-50 transition-colors"
            >
              {t('common.learnMore')}
            </Link>
          </div>

          {/* Trust Indicator */}
          <p className="mt-8 text-text-tertiary text-sm">
            {t('hero.trusted')}
          </p>
        </div>
      </section>

      {/* Info Section with Transparent Panels */}
      <section className="py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Background Video (muted, looping) */}
          <div className="absolute inset-0 opacity-5">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/info-video.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                Recover access. Securely. Globally.
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                Trusted by users worldwide for secure, fast account recovery
              </p>
            </div>

            {/* Feature Cards (Transparent Panels) */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Zero-Knowledge Card */}
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 border border-border shadow-lg">
                <div className="w-12 h-12 rounded-lg bg-brand-teal-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {t('features.zeroKnowledge.title')}
                </h3>
                <p className="text-text-secondary">
                  {t('features.zeroKnowledge.description')}
                </p>
              </div>

              {/* AI-Powered Card */}
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 border border-border shadow-lg">
                <div className="w-12 h-12 rounded-lg bg-brand-blue-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {t('features.aiPowered.title')}
                </h3>
                <p className="text-text-secondary">
                  {t('features.aiPowered.description')}
                </p>
              </div>

              {/* Global Card */}
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 border border-border shadow-lg">
                <div className="w-12 h-12 rounded-lg bg-brand-purple-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {t('features.global.title')}
                </h3>
                <p className="text-text-secondary">
                  {t('features.global.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold gradient-text">OCKRIX</span>
            </div>
            <div className="flex gap-6 text-text-secondary">
              <Link href="/security" className="hover:text-text-primary">
                Security
              </Link>
              <Link href="/faq" className="hover:text-text-primary">
                FAQ
              </Link>
              <Link href="/contact" className="hover:text-text-primary">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
