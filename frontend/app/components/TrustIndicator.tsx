/**
 * TrustIndicator Component
 * Trust-focused UI element that displays security and trust indicators
 */

interface TrustIndicatorProps {
  variant?: 'default' | 'success' | 'warning' | 'error';
  message?: string;
  className?: string;
}

export default function TrustIndicator({ 
  variant = 'default', 
  message,
  className = '' 
}: TrustIndicatorProps) {
  const variants = {
    default: 'border-brand-primary-500 text-brand-primary-500 bg-brand-primary-500/10',
    success: 'border-brand-success-500 text-brand-success-500 bg-brand-success-500/10',
    warning: 'border-brand-warning-500 text-brand-warning-500 bg-brand-warning-500/10',
    error: 'border-brand-error-500 text-brand-error-500 bg-brand-error-500/10',
  };

  return (
    <div 
      className={`trust-indicator inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${variants[variant]} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="w-2 h-2 rounded-full bg-current animate-pulse-slow" />
      {message && (
        <span className="text-sm font-medium">{message}</span>
      )}
    </div>
  );
}
