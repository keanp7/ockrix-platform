/**
 * Success Rate Metrics Component
 * 
 * Displays success rate and recovery statistics
 */

'use client';

import { useState, useEffect } from 'react';
import Card from '../Card';
import { DashboardStats } from '../../lib/mockAdminData';
import { getDashboardStats } from '../../lib/mockAdminData';

export default function SuccessRateMetrics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-500"></div>
          <p className="mt-2 text-dark-text-secondary">Loading metrics...</p>
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Success Rate */}
      <Card className="bg-gradient-to-br from-brand-success-500/10 to-brand-success-500/5 border-brand-success-500/30">
        <div className="space-y-2">
          <div className="text-sm text-dark-text-tertiary">Success Rate</div>
          <div className="text-3xl font-bold text-brand-success-500">
            {stats.successRate}%
          </div>
          <div className="text-xs text-dark-text-secondary">
            {stats.successfulRecoveries} of {stats.totalAttempts} attempts
          </div>
        </div>
      </Card>

      {/* Total Attempts */}
      <Card>
        <div className="space-y-2">
          <div className="text-sm text-dark-text-tertiary">Total Attempts</div>
          <div className="text-3xl font-bold text-dark-text-primary">
            {stats.totalAttempts}
          </div>
          <div className="text-xs text-dark-text-secondary">
            All time
          </div>
        </div>
      </Card>

      {/* Successful Recoveries */}
      <Card className="bg-brand-success-500/10 border-brand-success-500/30">
        <div className="space-y-2">
          <div className="text-sm text-dark-text-tertiary">Successful</div>
          <div className="text-3xl font-bold text-brand-success-500">
            {stats.successfulRecoveries}
          </div>
          <div className="text-xs text-dark-text-secondary">
            Recoveries completed
          </div>
        </div>
      </Card>

      {/* Blocked Attempts */}
      <Card className="bg-brand-error-500/10 border-brand-error-500/30">
        <div className="space-y-2">
          <div className="text-sm text-dark-text-tertiary">Blocked</div>
          <div className="text-3xl font-bold text-brand-error-500">
            {stats.blockedAttempts}
          </div>
          <div className="text-xs text-dark-text-secondary">
            High-risk attempts
          </div>
        </div>
      </Card>

      {/* Risk Distribution */}
      <Card className="lg:col-span-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-dark-text-primary">Risk Level Distribution</h3>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Low Risk */}
            <div className="text-center p-4 bg-brand-success-500/10 border border-brand-success-500/30 rounded-lg">
              <div className="text-2xl font-bold text-brand-success-500 mb-1">
                {stats.lowRisk}
              </div>
              <div className="text-sm text-dark-text-secondary">Low Risk</div>
              <div className="text-xs text-dark-text-tertiary mt-1">
                {stats.totalAttempts > 0 
                  ? Math.round((stats.lowRisk / stats.totalAttempts) * 100) 
                  : 0}%
              </div>
            </div>

            {/* Medium Risk */}
            <div className="text-center p-4 bg-brand-warning-500/10 border border-brand-warning-500/30 rounded-lg">
              <div className="text-2xl font-bold text-brand-warning-500 mb-1">
                {stats.mediumRisk}
              </div>
              <div className="text-sm text-dark-text-secondary">Medium Risk</div>
              <div className="text-xs text-dark-text-tertiary mt-1">
                {stats.totalAttempts > 0 
                  ? Math.round((stats.mediumRisk / stats.totalAttempts) * 100) 
                  : 0}%
              </div>
            </div>

            {/* High Risk */}
            <div className="text-center p-4 bg-brand-error-500/10 border border-brand-error-500/30 rounded-lg">
              <div className="text-2xl font-bold text-brand-error-500 mb-1">
                {stats.highRisk}
              </div>
              <div className="text-sm text-dark-text-secondary">High Risk</div>
              <div className="text-xs text-dark-text-tertiary mt-1">
                {stats.totalAttempts > 0 
                  ? Math.round((stats.highRisk / stats.totalAttempts) * 100) 
                  : 0}%
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-dark-text-secondary mb-1">
                <span>Low Risk</span>
                <span>{stats.lowRisk}</span>
              </div>
              <div className="w-full bg-dark-bg-tertiary rounded-full h-2">
                <div
                  className="bg-brand-success-500 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.lowRisk / stats.totalAttempts) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-dark-text-secondary mb-1">
                <span>Medium Risk</span>
                <span>{stats.mediumRisk}</span>
              </div>
              <div className="w-full bg-dark-bg-tertiary rounded-full h-2">
                <div
                  className="bg-brand-warning-500 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.mediumRisk / stats.totalAttempts) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-dark-text-secondary mb-1">
                <span>High Risk</span>
                <span>{stats.highRisk}</span>
              </div>
              <div className="w-full bg-dark-bg-tertiary rounded-full h-2">
                <div
                  className="bg-brand-error-500 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.highRisk / stats.totalAttempts) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
