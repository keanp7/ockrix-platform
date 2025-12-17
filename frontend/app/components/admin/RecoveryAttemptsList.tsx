/**
 * Recovery Attempts List Component
 * 
 * Displays list of all recovery attempts with filters
 */

'use client';

import { useState, useEffect } from 'react';
import Card from '../Card';
import { RecoveryAttempt } from '../../lib/mockAdminData';
import { getRecoveryAttempts } from '../../lib/mockAdminData';

export default function RecoveryAttemptsList() {
  const [attempts, setAttempts] = useState<RecoveryAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'blocked' | 'pending'>('all');

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const data = await getRecoveryAttempts();
      setAttempts(data);
    } catch (error) {
      console.error('Failed to load recovery attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttempts = attempts.filter(attempt => {
    if (filter === 'all') return true;
    return attempt.status === filter;
  });

  const getStatusColor = (status: RecoveryAttempt['status']) => {
    switch (status) {
      case 'success':
        return 'text-brand-success-500 bg-brand-success-500/20 border-brand-success-500/30';
      case 'failed':
        return 'text-brand-error-500 bg-brand-error-500/20 border-brand-error-500/30';
      case 'blocked':
        return 'text-brand-error-500 bg-brand-error-500/20 border-brand-error-500/30';
      case 'pending':
        return 'text-brand-warning-500 bg-brand-warning-500/20 border-brand-warning-500/30';
      default:
        return 'text-dark-text-tertiary bg-dark-bg-tertiary border-dark-border-primary';
    }
  };

  const getRiskColor = (risk: RecoveryAttempt['riskLevel']) => {
    switch (risk) {
      case 'LOW':
        return 'text-brand-success-500';
      case 'MEDIUM':
        return 'text-brand-warning-500';
      case 'HIGH':
        return 'text-brand-error-500';
      default:
        return 'text-dark-text-tertiary';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-dark-text-primary">Recovery Attempts</h2>
          <button
            onClick={loadAttempts}
            className="px-3 py-1.5 text-sm bg-dark-bg-tertiary hover:bg-dark-bg-hover border border-dark-border-primary rounded-lg text-dark-text-primary transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'success', 'failed', 'blocked', 'pending'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-brand-primary-500 text-white'
                  : 'bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-tertiary border border-dark-border-primary'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-500"></div>
            <p className="mt-2 text-dark-text-secondary">Loading attempts...</p>
          </div>
        )}

        {/* Attempts List */}
        {!loading && (
          <div className="space-y-3">
            {filteredAttempts.length === 0 ? (
              <div className="text-center py-12 text-dark-text-tertiary">
                No recovery attempts found
              </div>
            ) : (
              filteredAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 bg-dark-bg-secondary border border-dark-border-primary rounded-lg hover:border-dark-border-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Main Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(attempt.status)}`}>
                          {attempt.status.toUpperCase()}
                        </span>
                        {attempt.flagged && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-brand-warning-500/20 text-brand-warning-500 border border-brand-warning-500/30">
                            FLAGGED
                          </span>
                        )}
                        <span className={`text-sm font-semibold ${getRiskColor(attempt.riskLevel)}`}>
                          {attempt.riskLevel} RISK
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-dark-text-secondary">
                        <span className="font-medium text-dark-text-primary">
                          {attempt.identifier}
                        </span>
                        <span className="text-dark-text-tertiary">
                          {attempt.method === 'email' ? '📧' : '📱'} {attempt.method}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-dark-text-tertiary">
                        <span>IP: {attempt.ipAddress}</span>
                        <span>{formatDate(attempt.timestamp)}</span>
                        <span className="font-mono text-xs">Session: {attempt.sessionId.slice(0, 12)}...</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2">
                      <button className="px-3 py-1.5 text-xs bg-dark-bg-tertiary hover:bg-dark-bg-hover border border-dark-border-primary rounded-lg text-dark-text-primary transition-colors">
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
