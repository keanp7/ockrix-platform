'use client';

import { useState, useEffect } from 'react';
import AccountCard, { AccountMetadata } from '../components/AccountCard';
import Button from '../components/Button';
import TrustIndicator from '../components/TrustIndicator';
import { getAllAccounts } from '../lib/mockAccounts';

/**
 * Account Recovery Hub
 * 
 * Displays user accounts with metadata only (NO PASSWORDS).
 * Provides recovery access buttons and health indicators.
 */

export default function RecoveryHub() {
  const [accounts, setAccounts] = useState<AccountMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'warning' | 'critical' | 'unknown'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = (accountId: string) => {
    // Navigate to recovery flow
    // In production: router.push(`/recovery/start?accountId=${accountId}`);
    console.log('Recovering account:', accountId);
    alert(`Initiating recovery for account: ${accountId}`);
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    // Status filter
    if (filter !== 'all' && account.healthStatus !== filter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        account.email,
        account.phone,
        account.displayName,
        account.accountId,
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableText.includes(query);
    }

    return true;
  });

  // Count accounts by status
  const statusCounts = {
    all: accounts.length,
    healthy: accounts.filter(a => a.healthStatus === 'healthy').length,
    warning: accounts.filter(a => a.healthStatus === 'warning').length,
    critical: accounts.filter(a => a.healthStatus === 'critical').length,
    unknown: accounts.filter(a => a.healthStatus === 'unknown').length,
  };

  return (
    <main className="min-h-screen bg-dark-bg-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-dark-text-primary mb-2">
                Account Recovery Hub
              </h1>
              <p className="text-lg text-dark-text-secondary">
                Manage and recover access to your accounts
              </p>
            </div>
            <TrustIndicator variant="success" message="Secure Hub" />
          </div>

          {/* Security Notice */}
          <div className="bg-brand-primary-500/10 border border-brand-primary-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-brand-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-dark-text-primary mb-1">Security Notice</h3>
                <p className="text-sm text-dark-text-secondary">
                  This hub displays account metadata only. Passwords are never stored or displayed.
                  All recovery operations use zero-knowledge architecture for maximum security.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search accounts by email, phone, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-11 bg-dark-bg-secondary border border-dark-border-primary rounded-lg text-dark-text-primary placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-brand-primary-500 text-white'
                  : 'bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-tertiary border border-dark-border-primary'
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilter('healthy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'healthy'
                  ? 'bg-brand-success-500 text-white'
                  : 'bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-tertiary border border-dark-border-primary'
              }`}
            >
              Healthy ({statusCounts.healthy})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'warning'
                  ? 'bg-brand-warning-500 text-white'
                  : 'bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-tertiary border border-dark-border-primary'
              }`}
            >
              Warning ({statusCounts.warning})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'critical'
                  ? 'bg-brand-error-500 text-white'
                  : 'bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-tertiary border border-dark-border-primary'
              }`}
            >
              Critical ({statusCounts.critical})
            </button>
            <button
              onClick={() => setFilter('unknown')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unknown'
                  ? 'bg-dark-text-tertiary text-white'
                  : 'bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-tertiary border border-dark-border-primary'
              }`}
            >
              Unknown ({statusCounts.unknown})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-500 mb-4"></div>
            <p className="text-dark-text-secondary">Loading accounts...</p>
          </div>
        )}

        {/* Accounts List */}
        {!loading && (
          <>
            {filteredAccounts.length === 0 ? (
              <div className="text-center py-12 bg-dark-bg-secondary rounded-xl border border-dark-border-primary">
                <svg
                  className="w-12 h-12 text-dark-text-tertiary mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-2">
                  No accounts found
                </h3>
                <p className="text-dark-text-secondary">
                  {searchQuery
                    ? 'Try adjusting your search or filter criteria'
                    : 'No accounts match the selected filter'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAccounts.map((account) => (
                  <AccountCard
                    key={account.accountId}
                    account={account}
                    onRecover={handleRecover}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty State (No Accounts) */}
        {!loading && accounts.length === 0 && (
          <div className="text-center py-12 bg-dark-bg-secondary rounded-xl border border-dark-border-primary">
            <svg
              className="w-16 h-16 text-dark-text-tertiary mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2">
              No accounts available
            </h3>
            <p className="text-dark-text-secondary mb-6">
              Accounts will appear here once they are registered
            </p>
            <Button variant="primary">
              Add Account
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
