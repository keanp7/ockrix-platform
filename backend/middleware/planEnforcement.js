/**
 * Plan Enforcement Middleware
 * 
 * Enforces subscription plan limits and feature access
 */

const prisma = require('../prisma/client');
const { ValidationError, ForbiddenError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Check if user has access to a feature
 */
const checkFeatureAccess = async (userId, feature) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user || !user.subscription) {
    // Free plan defaults
    return checkFreePlanFeature(feature);
  }

  const sub = user.subscription;
  const planId = sub.planId || 'FREE';

  // Check feature based on plan
  switch (feature) {
    case 'email_recovery':
      return { allowed: true };
    
    case 'phone_recovery':
      return { allowed: planId !== 'FREE' };
    
    case 'voice_recovery':
      return { allowed: sub.aiVoiceEnabled || planId === 'PRO' || planId === 'BUSINESS' };
    
    case 'account_vault':
      return { 
        allowed: planId !== 'FREE',
        limit: sub.accountVaultLimit,
      };
    
    case 'recovery_history':
      return {
        allowed: planId !== 'FREE',
        limit: sub.recoveryHistoryDays,
      };
    
    case 'audit_logs':
      return { allowed: sub.auditLogsEnabled };
    
    case 'export_reports':
      return { allowed: sub.exportReportsEnabled };
    
    case 'priority_support':
      return { allowed: sub.prioritySupport };
    
    default:
      return { allowed: false };
  }
};

/**
 * Check FREE plan feature access
 */
const checkFreePlanFeature = (feature) => {
  // FREE plan only allows email recovery
  return {
    allowed: feature === 'email_recovery',
  };
};

/**
 * Check recovery limit for user
 */
const checkRecoveryLimit = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user || !user.subscription) {
    // FREE plan: Check lifetime limit
    const totalRecoveries = await prisma.recovery.count({
      where: {
        userId: userId,
        status: 'completed',
      },
    });
    
    if (totalRecoveries >= 2) {
      return {
        allowed: false,
        reason: 'FREE plan limit reached (2 lifetime recoveries)',
        limit: 2,
        used: totalRecoveries,
      };
    }
    
    return { allowed: true, limit: 2, used: totalRecoveries };
  }

  const sub = user.subscription;

  // Unlimited plans
  if (!sub.monthlyRecoveryLimit) {
    return { allowed: true, unlimited: true };
  }

  // Check monthly limit
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyRecoveries = await prisma.recovery.count({
    where: {
      userId: userId,
      status: 'completed',
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  if (monthlyRecoveries >= sub.monthlyRecoveryLimit) {
    return {
      allowed: false,
      reason: `Monthly recovery limit reached (${sub.monthlyRecoveryLimit} recoveries)`,
      limit: sub.monthlyRecoveryLimit,
      used: monthlyRecoveries,
    };
  }

  return {
    allowed: true,
    limit: sub.monthlyRecoveryLimit,
    used: monthlyRecoveries,
  };
};

/**
 * Check account vault limit
 */
const checkAccountVaultLimit = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user || !user.subscription || user.subscription.planId === 'FREE') {
    return {
      allowed: false,
      reason: 'Account vault not available on FREE plan',
    };
  }

  const sub = user.subscription;

  // Unlimited
  if (!sub.accountVaultLimit) {
    return { allowed: true, unlimited: true };
  }

  const accountCount = await prisma.account.count({
    where: { userId: userId },
  });

  if (accountCount >= sub.accountVaultLimit) {
    return {
      allowed: false,
      reason: `Account vault limit reached (${sub.accountVaultLimit} accounts)`,
      limit: sub.accountVaultLimit,
      used: accountCount,
    };
  }

  return {
    allowed: true,
    limit: sub.accountVaultLimit,
    used: accountCount,
  };
};

/**
 * Middleware to enforce feature access
 */
const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User authentication required');
      }

      const access = await checkFeatureAccess(userId, feature);
      if (!access.allowed) {
        throw new ForbiddenError(
          `Feature not available on your plan. ${access.reason || 'Upgrade to access this feature.'}`
        );
      }

      req.featureAccess = access;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check recovery limit before allowing recovery
 */
const checkRecoveryLimitMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('User authentication required');
    }

    const limitCheck = await checkRecoveryLimit(userId);
    if (!limitCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: limitCheck.reason,
        limit: limitCheck.limit,
        used: limitCheck.used,
        upgradeRequired: true,
      });
    }

    req.recoveryLimit = limitCheck;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkFeatureAccess,
  checkRecoveryLimit,
  checkAccountVaultLimit,
  requireFeature,
  checkRecoveryLimitMiddleware,
};

