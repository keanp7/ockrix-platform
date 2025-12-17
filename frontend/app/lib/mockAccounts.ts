/**
 * Mock Account Data Service
 * Provides sample account metadata for the Recovery Hub
 * 
 * NOTE: This is mock data for development. In production, replace with
 * API calls to fetch real account metadata from the backend.
 */

import { AccountMetadata } from '../components/AccountCard';

/**
 * Mock account data
 * Contains ONLY metadata - NO PASSWORDS are stored
 */
export const mockAccounts: AccountMetadata[] = [
  {
    accountId: 'user_abc123def456',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    lastAccessed: new Date('2025-12-10'),
    healthStatus: 'healthy',
    recoveryMethods: ['email', 'phone'],
    createdAt: new Date('2024-01-15'),
  },
  {
    accountId: 'user_xyz789ghi012',
    email: 'jane.smith@example.com',
    phone: '+1234567890',
    displayName: 'Jane Smith',
    lastAccessed: new Date('2025-12-05'),
    healthStatus: 'warning',
    recoveryMethods: ['email', 'sms'],
    createdAt: new Date('2024-03-20'),
  },
  {
    accountId: 'user_mno345pqr678',
    email: 'admin@company.com',
    displayName: 'Admin Account',
    lastAccessed: new Date('2025-11-28'),
    healthStatus: 'critical',
    recoveryMethods: ['email', 'totp'],
    createdAt: new Date('2023-06-10'),
  },
  {
    accountId: 'user_stu901vwx234',
    phone: '+9876543210',
    displayName: 'Mobile User',
    lastAccessed: new Date('2025-12-12'),
    healthStatus: 'healthy',
    recoveryMethods: ['phone', 'sms'],
    createdAt: new Date('2024-08-05'),
  },
  {
    accountId: 'user_yza567bcd890',
    email: 'unknown@example.com',
    lastAccessed: new Date('2025-10-15'),
    healthStatus: 'unknown',
    recoveryMethods: ['email'],
    createdAt: new Date('2024-11-30'),
  },
];

/**
 * Get all accounts
 * 
 * @returns Promise<AccountMetadata[]>
 */
export async function getAllAccounts(): Promise<AccountMetadata[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In production, this would be:
  // const response = await fetch('/api/accounts');
  // return response.json();
  
  return mockAccounts;
}

/**
 * Get account by ID
 * 
 * @param accountId - Account identifier
 * @returns Promise<AccountMetadata | null>
 */
export async function getAccountById(accountId: string): Promise<AccountMetadata | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const account = mockAccounts.find(acc => acc.accountId === accountId);
  return account || null;
}

/**
 * Filter accounts by health status
 * 
 * @param status - Health status filter
 * @returns Promise<AccountMetadata[]>
 */
export async function getAccountsByHealthStatus(
  status: AccountMetadata['healthStatus']
): Promise<AccountMetadata[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockAccounts.filter(acc => acc.healthStatus === status);
}
