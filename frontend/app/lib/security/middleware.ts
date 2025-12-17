/**
 * Security Middleware Utilities
 * 
 * Client-side security checks and validation
 */

import { isProduction } from './environment';
import { performSecurityChecks } from './environment';

/**
 * Initialize security checks
 * Should be called on app startup
 */
export function initializeSecurity(): void {
  // Security checks are handled by SecurityInitializer component
  // This function can be used for additional initialization
}

/**
 * Rate limiting helper (client-side)
 * Prevents rapid repeated requests
 */
export class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside window
    const recentRequests = requests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

/**
 * CSRF token helper
 * Generate and validate CSRF tokens (client-side helper)
 */
export class CSRFTokenHelper {
  /**
   * Generate a simple CSRF token
   * In production, use server-generated tokens
   */
  static generateToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    }
    // Fallback for non-crypto environments
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Store token in session storage
   */
  static storeToken(token: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('csrf_token', token);
    }
  }

  /**
   * Get stored token
   */
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('csrf_token');
    }
    return null;
  }
}

/**
 * Validate origin for requests
 * Prevents CSRF attacks
 */
export function validateOrigin(allowedOrigins: string[]): boolean {
  if (typeof window === 'undefined') return true;
  
  const origin = window.location.origin;
  return allowedOrigins.includes(origin);
}
