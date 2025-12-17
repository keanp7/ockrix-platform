'use client';

/**
 * Admin Dashboard
 * 
 * Overview of recovery attempts, success rates, and flagged risks
 */

import { useEffect, useState } from 'react';
import RecoveryAttemptsList from '../components/admin/RecoveryAttemptsList';
import SuccessRateMetrics from '../components/admin/SuccessRateMetrics';
import FlaggedRisks from '../components/admin/FlaggedRisks';
import Card from '../components/Card';
import { DashboardStats } from '../lib/mockAdminData';
import { getDashboardStats } from '../lib/mockAdminData';

export default function AdminDashboard() {
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
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-dark-bg-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-text-primary mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-dark-text-secondary">
            Monitor recovery attempts and system health
          </p>
        </div>

        {/* Stats Summary */}
        <div className="mb-8">
          <SuccessRateMetrics />
        </div>

        {/* Flagged Risks Section */}
        <div className="mb-8">
          <FlaggedRisks />
        </div>

        {/* Recovery Attempts Section */}
        <div>
          <RecoveryAttemptsList />
        </div>

        {/* Info Card */}
        <div className="mt-8">
          <Card className="bg-brand-primary-500/10 border-brand-primary-500/30">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-brand-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-dark-text-primary mb-1">
                  Dashboard Information
                </h3>
                <p className="text-sm text-dark-text-secondary">
                  This dashboard displays recovery attempt statistics and flagged risks. 
                  Advanced analytics and detailed reporting will be available in a future update.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
