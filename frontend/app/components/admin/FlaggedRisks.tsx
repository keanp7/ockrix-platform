/**
 * Flagged Risks Component
 * 
 * Displays recovery attempts that have been flagged as high risk
 */

'use client';

import { useState, useEffect } from 'react';
import Card from '../Card';
import { RecoveryAttempt } from '../../lib/mockAdminData';
import { getFlaggedAttempts } from '../../lib/mockAdminData';

export default function FlaggedRisks() {
  const [attempts, setAttempts] = useState<RecoveryAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlaggedAttempts();
  }, []);

  const loadFlaggedAttempts = async () => {
    try {
      setLoading(true);
      const data = await getFlaggedAttempts();
      setAttempts(data);
    } catch (error) {
      console.error('Failed to load flagged attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-text-primary">Flagged Risks</h2>
            <p className="text-sm text-dark-text-secondary mt-1">
              Recovery attempts flagged as high risk or suspicious
            </p>
          </div>
          <button
            onClick={loadFlaggedAttempts}
            className="px-3 py-1.5 text-sm bg-dark-bg-tertiary hover:bg-dark-bg-hover border border-dark-border-primary rounded-lg text-dark-text-primary transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-500"></div>
            <p className="mt-2 text-dark-text-secondary">Loading flagged risks...</p>
          </div>
        )}

        {/* Flagged Attempts */}
        {!loading && (
          <div className="space-y-3">
            {attempts.length === 0 ? (
              <div className="text-center py-12 border border-dark-border-primary rounded-lg bg-dark-bg-secondary/50">
                <svg
                  className="w-12 h-12 text-brand-success-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-dark-text-secondary">No flagged risks</p>
                <p className="text-sm text-dark-text-tertiary mt-1">All recovery attempts are low risk</p>
              </div>
            ) : (
              attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 bg-brand-error-500/10 border-2 border-brand-error-500/30 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Main Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-md text-sm font-bold bg-brand-error-500/20 text-brand-error-500 border border-brand-error-500/30">
                          ⚠️ HIGH RISK
                        </span>
                        {attempt.blocked && (
                          <span className="px-3 py-1 rounded-md text-sm font-bold bg-brand-error-500 text-white">
                            BLOCKED
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-md text-sm font-medium bg-dark-bg-tertiary text-dark-text-primary border border-dark-border-primary">
                          {attempt.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <div className="text-lg font-semibold text-dark-text-primary mb-1">
                          {attempt.identifier}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-dark-text-secondary">
                          <span>{attempt.method === 'email' ? '📧 Email' : '📱 Phone'}</span>
                          <span>IP: {attempt.ipAddress}</span>
                          <span>{formatDate(attempt.timestamp)}</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-dark-text-tertiary font-mono bg-dark-bg-tertiary p-2 rounded border border-dark-border-primary">
                        User Agent: {attempt.userAgent}
                      </div>
                      
                      <div className="text-xs text-dark-text-tertiary font-mono">
                        Session ID: {attempt.sessionId}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2">
                      <button className="px-4 py-2 text-sm bg-brand-error-500 hover:bg-brand-error-600 text-white rounded-lg transition-colors">
                        Review
                      </button>
                      <button className="px-4 py-2 text-sm bg-dark-bg-tertiary hover:bg-dark-bg-hover border border-dark-border-primary text-dark-text-primary rounded-lg transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
