import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

export default function PricingPage() {
  const t = useTranslations('pricing');

  const plans = [
    {
      id: 'FREE',
      name: t('free.name'),
      price: t('free.price'),
      period: t('free.period'),
      description: t('free.description'),
      features: t.raw('free.features'),
      cta: t('free.cta'),
      popular: false,
      gradient: 'from-gray-500 to-gray-600',
    },
    {
      id: 'BASIC',
      name: t('basic.name'),
      price: t('basic.price'),
      period: t('basic.period'),
      description: t('basic.description'),
      badge: t('basic.badge'),
      features: t.raw('basic.features'),
      cta: t('basic.cta'),
      popular: true,
      gradient: 'from-brand-teal-500 to-brand-blue-500',
    },
    {
      id: 'PRO',
      name: t('pro.name'),
      price: t('pro.price'),
      period: t('pro.period'),
      description: t('pro.description'),
      features: t.raw('pro.features'),
      cta: t('pro.cta'),
      popular: false,
      gradient: 'from-brand-blue-500 to-brand-purple-500',
    },
    {
      id: 'BUSINESS',
      name: t('business.name'),
      price: t('business.price'),
      period: t('business.period'),
      description: t('business.description'),
      features: t.raw('business.features'),
      cta: t('business.cta'),
      popular: false,
      gradient: 'from-brand-purple-500 to-brand-purple-700',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              OCKRIX
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-text-secondary hover:text-text-primary">
                Home
              </Link>
              <Link href="/login" className="text-text-secondary hover:text-text-primary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-text-primary mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-text-secondary">
              Choose the plan that fits your recovery needs
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 shadow-lg overflow-hidden ${
                  plan.popular
                    ? 'border-brand-blue-500 scale-105 shadow-xl'
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-brand-teal-500 to-brand-blue-500 text-white text-center py-2 text-sm font-semibold">
                    {plan.badge}
                  </div>
                )}

                <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-text-primary mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-bold text-text-primary">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-text-secondary ml-2">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary text-sm">{plan.description}</p>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature: string, index: number) => {
                      const hasFeature = !feature.startsWith('No ') && !feature.toLowerCase().includes('no ');
                      return (
                        <li key={index} className="flex items-start gap-2">
                          {hasFeature ? (
                            <Check className="w-5 h-5 text-brand-success-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-text-tertiary flex-shrink-0 mt-0.5" />
                          )}
                          <span
                            className={`text-sm ${
                              hasFeature ? 'text-text-primary' : 'text-text-tertiary'
                            }`}
                          >
                            {feature}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={plan.id === 'BUSINESS' ? '/contact' : '/signup'}
                    className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-brand-teal-500 to-brand-blue-500 text-white hover:shadow-lg'
                        : plan.id === 'FREE'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-brand-blue-500 text-white hover:bg-brand-blue-600'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

