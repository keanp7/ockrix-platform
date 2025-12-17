'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Account {
  id: string;
  accountName: string;
  accountType: string;
  identifier: string;
  lastRecoveredAt: string | null;
  recoveryCount: number;
}

interface Recovery {
  id: string;
  identifier: string;
  method: string;
  status: string;
  riskLevel: string | null;
  createdAt: string;
  completedAt: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recoveries, setRecoveries] = useState<Recovery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user data
    fetchUserData(token);
  }, [router]);

  const fetchUserData = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      // Fetch user
      const userRes = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      // Fetch accounts (if vault is enabled)
      // TODO: Implement account vault API
      // const accountsRes = await fetch('/api/accounts', {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // if (accountsRes.ok) {
      //   const accountsData = await accountsRes.json();
      //   setAccounts(accountsData.accounts);
      // }

      // Fetch recent recoveries
      // TODO: Implement recovery history API
      // const recoveriesRes = await fetch('/api/recoveries', {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // if (recoveriesRes.ok) {
      //   const recoveriesData = await recoveriesRes.json();
      //   setRecoveries(recoveriesData.recoveries);
      // }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Navigation */}
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              OCKRIX
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/vault"
                className="text-text-secondary hover:text-text-primary"
              >
                Vault
              </Link>
              <Link
                href="/dashboard/billing"
                className="text-text-secondary hover:text-text-primary"
              >
                Billing
              </Link>
              <Link
                href="/dashboard/settings"
                className="text-text-secondary hover:text-text-primary"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('accessToken');
                  router.push('/login');
                }}
                className="text-text-secondary hover:text-text-primary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-text-secondary">
            {user?.subscription?.planName || 'Free'} Plan
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/dashboard/recovery/start"
            className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Start Recovery
            </h2>
            <p className="text-text-secondary">
              Recover access to a forgotten account
            </p>
          </Link>
          <Link
            href="/dashboard/vault"
            className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Account Vault
            </h2>
            <p className="text-text-secondary">
              Manage your saved accounts
            </p>
          </Link>
        </div>

        {/* Account List */}
        <div className="bg-white rounded-xl border border-border shadow-sm mb-8">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-text-primary">Your Accounts</h2>
          </div>
          <div className="p-6">
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary mb-4">No accounts in your vault yet</p>
                <Link
                  href="/dashboard/vault/add"
                  className="text-brand-blue-500 hover:text-brand-blue-600 font-semibold"
                >
                  Add your first account
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-background-secondary transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-text-primary">{account.accountName}</h3>
                      <p className="text-sm text-text-secondary">{account.identifier}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text-secondary">
                        {account.recoveryCount} recoveries
                      </p>
                      {account.lastRecoveredAt && (
                        <p className="text-xs text-text-tertiary">
                          Last: {new Date(account.lastRecoveredAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recovery Status */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-text-primary">Recent Recoveries</h2>
          </div>
          <div className="p-6">
            {recoveries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary mb-4">No recoveries yet</p>
                <Link
                  href="/dashboard/recovery/start"
                  className="text-brand-blue-500 hover:text-brand-blue-600 font-semibold"
                >
                  Start your first recovery
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recoveries.map((recovery) => (
                  <div
                    key={recovery.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-text-primary">
                          {recovery.identifier}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            recovery.status === 'completed'
                              ? 'bg-brand-success-100 text-brand-success-700'
                              : recovery.status === 'failed'
                              ? 'bg-brand-error-100 text-brand-error-700'
                              : 'bg-brand-warning-100 text-brand-warning-700'
                          }`}
                        >
                          {recovery.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {recovery.method} • {new Date(recovery.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {recovery.riskLevel && (
                      <span className="text-sm text-text-secondary">
                        Risk: {recovery.riskLevel}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

