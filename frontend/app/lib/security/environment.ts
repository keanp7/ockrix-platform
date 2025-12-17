/**
 * Environment Security Checks
 * 
 * Validates production environment configuration and security settings
 */

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // In production, check for required env vars
  if (isProduction()) {
    // Add production-specific checks here
    // For example:
    // if (!process.env.NEXT_PUBLIC_API_URL) {
    //   errors.push('NEXT_PUBLIC_API_URL is required in production');
    // }
  }

  // Check for HTTPS in production (client-side check)
  if (typeof window !== 'undefined' && isProduction()) {
    if (window.location.protocol !== 'https:') {
      errors.push('HTTPS is required in production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Security configuration checks
 */
export function performSecurityChecks(): {
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check if running in development with sensitive data
  if (isDevelopment()) {
    warnings.push('Running in development mode - security features may be relaxed');
  }

  // Check HTTPS in production (server-side)
  if (isProduction() && typeof window === 'undefined') {
    // Server-side check - will be validated client-side
    warnings.push('Ensure HTTPS is enabled in production');
  }

  // Check for debug flags in production
  if (isProduction() && process.env.NEXT_PUBLIC_DEBUG === 'true') {
    errors.push('Debug mode should not be enabled in production');
  }

  return { warnings, errors };
}

/**
 * Get security headers status
 */
export function getSecurityHeadersStatus(): Record<string, boolean> {
  // This would check actual headers in production
  // For now, return expected values
  return {
    'X-Frame-Options': true,
    'X-Content-Type-Options': true,
    'X-XSS-Protection': true,
    'Content-Security-Policy': true,
    'Strict-Transport-Security': isProduction(),
  };
}

/**
 * Log security warnings (only in development)
 */
export function logSecurityWarnings(): void {
  if (!isDevelopment()) return;

  const { warnings, errors } = performSecurityChecks();

  if (warnings.length > 0) {
    console.warn('Security Warnings:', warnings);
  }

  if (errors.length > 0) {
    console.error('Security Errors:', errors);
  }
}

/**
 * Validate API endpoint URL
 */
export function validateAPIUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // In production, only allow HTTPS
    if (isProduction() && parsed.protocol !== 'https:') {
      return false;
    }
    
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
