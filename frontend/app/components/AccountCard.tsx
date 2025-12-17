/**
 * Account Card Component
 * Displays account metadata (NO PASSWORDS) with recovery options
 */

import { ReactNode } from 'react';
import Button from './Button';
import AccountHealthIndicator from './AccountHealthIndicator';

export interface AccountMetadata {
  accountId: string;
  email?: string;
  phone?: string;
  displayName?: string;
  lastAccessed?: Date | string;
  healthStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  recoveryMethods?: string[];
  createdAt?: Date | string;
}

interface AccountCardProps {
  account: AccountMetadata;
  onRecover?: (accountId: string) => void;
  className?: string;
}

export default function AccountCard({ account, onRecover, className = '' }: AccountCardProps) {
  const formatDate = (date?: Date | string) => {
    if (!date) return 'Never';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getAccountIdentifier = () => {
    if (account.displayName) return account.displayName;
    if (account.email) return account.email;
    if (account.phone) return account.phone;
    return `Account ${account.accountId.slice(0, 8)}`;
  };

  const handleRecover = () => {
    if (onRecover) {
      onRecover(account.accountId);
    }
  };

  return (
    <div className={`bg-dark-bg-secondary border border-dark-border-primary rounded-xl p-6 hover:border-dark-border-accent hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: Account Info */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-dark-text-primary mb-1">
                {getAccountIdentifier()}
              </h3>
              {account.accountId && (
                <p className="text-sm text-dark-text-tertiary font-mono">
                  ID: {account.accountId.slice(0, 12)}...
                </p>
              )}
            </div>
            <AccountHealthIndicator status={account.healthStatus} />
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {account.email && (
              <div>
                <div className="text-dark-text-tertiary mb-1">Email</div>
                <div className="text-dark-text-secondary font-medium">{account.email}</div>
              </div>
            )}
            {account.phone && (
              <div>
                <div className="text-dark-text-tertiary mb-1">Phone</div>
                <div className="text-dark-text-secondary font-medium">{account.phone}</div>
              </div>
            )}
            {account.lastAccessed && (
              <div>
                <div className="text-dark-text-tertiary mb-1">Last Accessed</div>
                <div className="text-dark-text-secondary">{formatDate(account.lastAccessed)}</div>
              </div>
            )}
            {account.createdAt && (
              <div>
                <div className="text-dark-text-tertiary mb-1">Created</div>
                <div className="text-dark-text-secondary">{formatDate(account.createdAt)}</div>
              </div>
            )}
          </div>

          {/* Recovery Methods */}
          {account.recoveryMethods && account.recoveryMethods.length > 0 && (
            <div>
              <div className="text-dark-text-tertiary text-sm mb-2">Recovery Methods</div>
              <div className="flex flex-wrap gap-2">
                {account.recoveryMethods.map((method) => (
                  <span
                    key={method}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand-primary-500/10 text-brand-primary-500 border border-brand-primary-500/20"
                  >
                    {method === 'email' && (
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    {method === 'phone' && (
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                    {method === 'sms' && (
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )}
                    {method === 'totp' && (
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Action */}
        <div className="flex sm:flex-col sm:items-end gap-3">
          <Button
            variant="primary"
            onClick={handleRecover}
            className="w-full sm:w-auto min-w-[140px]"
          >
            Recover Access
          </Button>
        </div>
      </div>
    </div>
  );
}
