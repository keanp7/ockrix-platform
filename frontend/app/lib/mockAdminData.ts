/**
 * Mock Admin Data Service
 * 
 * Provides mock data for admin dashboard
 * In production, replace with API calls to backend
 */

export interface RecoveryAttempt {
  id: string;
  identifier: string;
  method: 'email' | 'phone';
  status: 'pending' | 'success' | 'failed' | 'blocked';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  sessionId: string;
  blocked?: boolean;
  flagged?: boolean;
}

export interface DashboardStats {
  totalAttempts: number;
  successfulRecoveries: number;
  failedAttempts: number;
  blockedAttempts: number;
  successRate: number;
  flaggedRisks: number;
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
}

// Mock recovery attempts data
const mockRecoveryAttempts: RecoveryAttempt[] = [
  {
    id: 'attempt_001',
    identifier: 'user@example.com',
    method: 'email',
    status: 'success',
    riskLevel: 'LOW',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: new Date('2025-12-15T10:30:00'),
    sessionId: 'session_abc123',
    flagged: false,
  },
  {
    id: 'attempt_002',
    identifier: '+1234567890',
    method: 'phone',
    status: 'success',
    riskLevel: 'LOW',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    timestamp: new Date('2025-12-15T11:15:00'),
    sessionId: 'session_def456',
    flagged: false,
  },
  {
    id: 'attempt_003',
    identifier: 'admin@company.com',
    method: 'email',
    status: 'blocked',
    riskLevel: 'HIGH',
    ipAddress: '45.33.32.156',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    timestamp: new Date('2025-12-15T12:00:00'),
    sessionId: 'session_ghi789',
    blocked: true,
    flagged: true,
  },
  {
    id: 'attempt_004',
    identifier: 'user2@example.com',
    method: 'email',
    status: 'success',
    riskLevel: 'MEDIUM',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: new Date('2025-12-15T13:20:00'),
    sessionId: 'session_jkl012',
    flagged: false,
  },
  {
    id: 'attempt_005',
    identifier: '+9876543210',
    method: 'phone',
    status: 'failed',
    riskLevel: 'MEDIUM',
    ipAddress: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (Android 13; Mobile)',
    timestamp: new Date('2025-12-15T14:05:00'),
    sessionId: 'session_mno345',
    flagged: true,
  },
  {
    id: 'attempt_006',
    identifier: 'test@example.com',
    method: 'email',
    status: 'pending',
    riskLevel: 'LOW',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: new Date('2025-12-15T15:00:00'),
    sessionId: 'session_pqr678',
    flagged: false,
  },
  {
    id: 'attempt_007',
    identifier: 'suspicious@example.com',
    method: 'email',
    status: 'blocked',
    riskLevel: 'HIGH',
    ipAddress: '198.51.100.42',
    userAgent: 'Mozilla/5.0 (compatible; bot)',
    timestamp: new Date('2025-12-15T15:30:00'),
    sessionId: 'session_stu901',
    blocked: true,
    flagged: true,
  },
  {
    id: 'attempt_008',
    identifier: 'user3@example.com',
    method: 'email',
    status: 'success',
    riskLevel: 'LOW',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: new Date('2025-12-15T16:00:00'),
    sessionId: 'session_vwx234',
    flagged: false,
  },
];

/**
 * Get all recovery attempts
 */
export async function getRecoveryAttempts(): Promise<RecoveryAttempt[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In production: const response = await fetch('/api/admin/recovery-attempts');
  // return response.json();
  
  return [...mockRecoveryAttempts].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );
}

/**
 * Get flagged recovery attempts
 */
export async function getFlaggedAttempts(): Promise<RecoveryAttempt[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockRecoveryAttempts
    .filter(attempt => attempt.flagged || attempt.riskLevel === 'HIGH')
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const attempts = mockRecoveryAttempts;
  const totalAttempts = attempts.length;
  const successfulRecoveries = attempts.filter(a => a.status === 'success').length;
  const failedAttempts = attempts.filter(a => a.status === 'failed').length;
  const blockedAttempts = attempts.filter(a => a.status === 'blocked').length;
  const flaggedRisks = attempts.filter(a => a.flagged).length;
  
  const lowRisk = attempts.filter(a => a.riskLevel === 'LOW').length;
  const mediumRisk = attempts.filter(a => a.riskLevel === 'MEDIUM').length;
  const highRisk = attempts.filter(a => a.riskLevel === 'HIGH').length;
  
  const successRate = totalAttempts > 0 
    ? (successfulRecoveries / totalAttempts) * 100 
    : 0;

  return {
    totalAttempts,
    successfulRecoveries,
    failedAttempts,
    blockedAttempts,
    successRate: Math.round(successRate * 10) / 10,
    flaggedRisks,
    lowRisk,
    mediumRisk,
    highRisk,
  };
}
